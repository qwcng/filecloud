<?php

namespace App\Http\Controllers;

use App\Models\Folder;
// use Illuminate\Container\Attributes\Storage;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Jobs\DeleteFolderJob;
use App\Models\SavedFolder;
use Illuminate\Support\Facades\DB;
use ZipArchive;

class FolderController extends Controller
{
    public function createFolder(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        // Zakładam, że masz model Folder i odpowiednią tabelę w bazie danych
        $folder = Folder::create([
            'user_id' => $request->user()->id,
            'name' => $request->name,
            'parent_id' => $request->parent ? $request->parent : null,
        ]);

        // return response()->json([
        //     'message' => 'true',
        //     'folder' => $folder,
        // ]);
    }
   public function listFolders(Request $request, $parent = null)
{
    $user = $request->user();

    // 1. Obsługa zakładki "Udostępnione dla mnie"
    if ($parent === 'sahar') {
        $savedFolders = SavedFolder::where('user_id', $user->id)
            ->where('active', true)
            ->with('folder') // ładujemy relację do oryginalnego folderu
            ->get()
            ->map(function ($saved) {
                $folder = $saved->folder;
                return [
                    'id' => $folder->id,
                    'name' => $folder->name,
                    'created_at' => $saved->created_at, // data zapisu
                    'files_count' => $folder->recursiveFilesCount(),
                    'is_shared' => true // flaga dla UI
                ];
            });

        return response()->json($savedFolders);
    }

    // 2. Normalizacja parent_id
    if ($parent === 'dashboard' || $parent === null) {
        $parentId = null;
    } else {
        $parentId = $parent;
    }

    // 3. Sprawdzenie dostępu do podfolderów
    // Jeśli nie jesteśmy w root (null), sprawdzamy czy mamy prawo widzieć dzieci tego folderu
    if ($parentId !== null) {
        $isOwner = Folder::where('id', $parentId)->where('user_id', $user->id)->exists();
        $isSaved = SavedFolder::where('folder_id', $parentId)->where('user_id', $user->id)->exists();

        if (!$isOwner && !$isSaved) {
            return response()->json(['message' => 'Brak dostępu'], 403);
        }
    }

    // 4. Pobieranie folderów
    $query = Folder::where('parent_id', $parentId);

    if ($parentId === null) {
        // W głównym widoku pokazujemy tylko MOJE foldery
        $query->where('user_id', $user->id);
    } else {
        // Wewnątrz konkretnego folderu pokazujemy wszystkie jego dzieci 
        // (niezależnie od ownera, bo dostęp sprawdziliśmy wyżej)
    }

    $folders = $query->orderBy('created_at', 'desc')->get();

    // 5. Mapowanie danych
    $result = $folders->map(function ($folder) {
        return [
            'id' => $folder->id,
            'name' => $folder->name,
            'created_at' => $folder->created_at,
            'files_count' => $folder->recursiveFilesCount()
        ];
    });

    return response()->json($result);
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
        abort(403, 'Brak uprawnień.');
    }

    // Opcjonalnie: oznacz folder jako "w trakcie usuwania" w bazie, 
    // aby użytkownik nie widział go na liście, zanim Job się skończy.
    
    // Wysyłamy do kolejki
    DeleteFolderJob::dispatch($folder);

    return response()->json([
        'status' => 'success',
        'message' => 'Folder został dodany do kolejki usuwania. Może to potrwać kilka minut.'
    ]);
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
    $folder->name = $request->foldername;
    $folder->save();
    // return response()->json(['123']);
    // return response()->json(['message' => 'File name updated successfully']);
    

}
    public function downloadFolder($folderId)
{
    $folder = Folder::with(['files', 'children'])->findOrFail($folderId);

    // Sprawdzamy dostęp (Twoja nowa metoda!)
    if (!$folder->user_id === auth()->id() && !SavedFolder::where('folder_id', $folderId)->where('user_id', auth()->id())->exists()) {
        abort(403);
    }

    $zip = new ZipArchive;
    $zipFileName = $folder->name . '.zip';
    $zipPath = storage_path('app/private/zip' . $zipFileName);

    // Upewnij się, że katalog temp istnieje
    if (!file_exists(storage_path('app/private/zip'))) {
        mkdir(storage_path('app/private/zip'), 0755, true);
    }

    if ($zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) === TRUE) {
        $this->addFolderToZip($folder, $zip, "");
        $zip->close();
    }

    return response()->download($zipPath)->deleteFileAfterSend(true);
}

/**
 * Funkcja pomocnicza do rekurencyjnego dodawania plików
 */
    private function addFolderToZip($folder, $zip, $zipPath)
    {
        $currentPath = $zipPath . $folder->name . "/";
        
        // Dodaj pusty katalog do ZIP
        $zip->addEmptyDir($currentPath);

        // Dodaj pliki z tego folderu
        foreach ($folder->files as $file) {
            $fullPath = Storage::disk('private')->path($file->path);
            if (file_exists($fullPath)) {
                $zip->addFile($fullPath, $currentPath . $file->original_name);
            }
        }

        // Rekurencja dla podfolderów
        foreach ($folder->children as $child) {
            $this->addFolderToZip($child, $zip, $currentPath);
        }
    }
}