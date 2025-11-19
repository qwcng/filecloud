<?php

namespace App\Http\Controllers;

use App\Models\Folder;
use Illuminate\Container\Attributes\Storage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class FolderController extends Controller
{
    public function createFolder(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);
        $userId = $request->user()->id;
        // Zakładam, że masz model Folder i odpowiednią tabelę w bazie danych
        $folder = Folder::create([
            'user_id' => $request->user()->id,
            'name' => $request->name,
            'parent_id' => $request->parent ? $request->parent : null,
        ]);
        Cache::forget("folders:user:{$userId}:parent:" . ($parentId ?? 'null'));

        // return response()->json([
        //     'message' => 'true',
        //     'folder' => $folder,
        // ]);
    }
   public function listFolders(Request $request, $parent = null)
{
    $userId = $request->user()->id;

    if ($parent === 'dashboard' || $parent === null) {
        $parent = null;
    }

    // Tworzymy unikalny klucz dla Redis
    $cacheKey = "folders:user:{$userId}:parent:" . ($parent ?? 'null');

    // Próba pobrania z cache
    $folders = Cache::remember($cacheKey, 60, function () use ($userId, $parent) {
        $foldersQuery = Folder::where('user_id', $userId)
            ->where('parent_id', $parent)
            ->with(['children.children.children', 'children.files', 'files'])
            ->orderBy('created_at', 'desc')
            ->get();

        return $foldersQuery->map(function ($folder) {
            return [
                'id' => $folder->id,
                'name' => $folder->name,
                'created_at' => $folder->created_at,
                'filesCount' => $folder->files()->count(),
                'files_count' => $folder->recursiveFilesCount()
            ];
        });
    });

    return response()->json($folders);
}
    private function deleteFolderRecursively(Folder $folder){
    // Usuń wszystkie pliki w tym folderze
    foreach ($folder->files as $file) {
        try {
            // jeśli path w DB to 'uploads/...' -> użyj disk('private')
            if (Storage::disk('private')->exists($file->path)) {
                Storage::disk('private')->delete($file->path);
            } else {
                Log::warning("Plik nie istnieje na dysku private: {$file->path} (DB id: {$file->id})");
            }

            // jeśli masz miniaturkę zapisaną w $file->thumbnail - usuń ją też
            if (!empty($file->thumbnail) && Storage::disk('private')->exists($file->thumbnail)) {
                Storage::disk('private')->delete($file->thumbnail);
            }
        } catch (\Throwable $e) {
            // Zaloguj błąd, kontynuuj usuwanie rekordów z bazy
            Log::error("Błąd usuwania pliku z dysku: {$file->path} — {$e->getMessage()}");
        }

        // usuń rekord z bazy
        try {
            $file->delete();
        } catch (\Throwable $e) {
            Log::error("Błąd usuwania rekordu pliku id {$file->id}: {$e->getMessage()}");
        }
    }

    // Usuń podfoldery (rekurencja)
    foreach ($folder->children as $childFolder) {
        $this->deleteFolderRecursively($childFolder);
    }

    // Usuń sam folder
    $folder->delete();
}

public function deleteFolder(Request $request, $folderId)
{
    $folder = Folder::findOrFail($folderId);

    if ($folder->user_id !== $request->user()->id) {
        abort(403, 'Brak uprawnień do usunięcia tego folderu.');
    }

    // 🔹 Najpierw usuń cache rekurencyjnie
    $this->clearFolderCacheRecursively($folder);

    // 🧹 Potem usuń foldery i pliki
    $this->deleteFolderRecursively($folder);

    return response()->json(['message' => 'Folder został usunięty.']);
}
private function clearFolderCacheRecursively(Folder $folder)
{
    // Cache listy dzieci rodzica (zgodny format z listFolders)
    Cache::forget("folders:user:{$folder->user_id}:parent:" . ($folder->parent_id ?? 'null'));
    Cache::forget("folder:{$folder->id}:files_count");
    Cache::forget("folder_path:{$folder->id}:user:{$folder->user_id}");

    foreach ($folder->children as $child) {
        $this->clearFolderCacheRecursively($child);
    }
}
public function changeFolderName(Request $request, $folderId){
     $folder = Folder::findOrFail($folderId);
    
    //  $request->validate(["foldername"=>"string|required"]);
     if ($folder->user_id !== $request->user()->id) {
        abort(403, 'Brak uprawnień do usunięcia tego folderu.');
    }
    $request->validate([
        'foldername' => 'required|string|max:255',
    ]);
    Cache::forget("folders:user:{$folder->user_id}:parent:" . ($folder->parent_id ?? 'null'));
    Cache::forget("folder:{$folder->id}:files_count");
    Cache::forget("folder_path:{$folder->id}:user:{$folder->user_id}");

    $folder->name = $request->foldername;
    $folder->save();
    // return response()->json(['123']);
    // return response()->json(['message' => 'File name updated successfully']);
    

}
}