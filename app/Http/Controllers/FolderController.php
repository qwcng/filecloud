<?php

namespace App\Http\Controllers;

use App\Models\Folder;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;

class FolderController extends Controller
{
    public function createFolder(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $userId = $request->user()->id;
        $parentId = $request->parent ?? null;

        $folder = Folder::create([
            'user_id' => $userId,
            'name' => $request->name,
            'parent_id' => $parentId,
        ]);

        // Usuń cache listy folderów rodzica
        Cache::store('redis')->forget("folders:user:{$userId}:parent:" . ($parentId ?? 'null'));

        return response()->json([
            'message' => 'Folder został utworzony',
            'folder' => $folder
        ]);
    }

    public function listFolders(Request $request, $parent = null)
    {
        $userId = $request->user()->id;
        $parentId = ($parent === 'dashboard' || $parent === null) ? null : $parent;

        $cacheKey = "folders:user:{$userId}:parent:" . ($parentId ?? 'null');

        $folders = Cache::store('redis')->remember($cacheKey, 60, function () use ($userId, $parentId) {
            $foldersQuery = Folder::where('user_id', $userId)
                ->where('parent_id', $parentId)
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

    private function deleteFolderRecursively(Folder $folder)
    {
        foreach ($folder->files as $file) {
            try {
                if (Storage::disk('private')->exists($file->path)) {
                    Storage::disk('private')->delete($file->path);
                }

                if (!empty($file->thumbnail) && Storage::disk('private')->exists($file->thumbnail)) {
                    Storage::disk('private')->delete($file->thumbnail);
                }
            } catch (\Throwable $e) {
                Log::error("Błąd usuwania pliku: {$file->path} — {$e->getMessage()}");
            }

            try {
                $file->delete();
            } catch (\Throwable $e) {
                Log::error("Błąd usuwania rekordu pliku id {$file->id}: {$e->getMessage()}");
            }
        }

        foreach ($folder->children as $childFolder) {
            $this->deleteFolderRecursively($childFolder);
        }

        $folder->delete();
    }

    public function deleteFolder(Request $request, $folderId)
    {
        $folder = Folder::findOrFail($folderId);

        if ($folder->user_id !== $request->user()->id) {
            abort(403, 'Brak uprawnień do usunięcia tego folderu.');
        }

        $this->clearFolderCacheRecursively($folder);
        $this->deleteFolderRecursively($folder);

        return response()->json(['message' => 'Folder został usunięty.']);
    }

    private function clearFolderCacheRecursively(Folder $folder)
    {
        Cache::store('redis')->forget("folders:user:{$folder->user_id}:parent:" . ($folder->parent_id ?? 'null'));
        Cache::store('redis')->forget("folder:{$folder->id}:files_count");
        Cache::store('redis')->forget("folder_path:{$folder->id}:user:{$folder->user_id}");

        foreach ($folder->children as $child) {
            $this->clearFolderCacheRecursively($child);
        }
    }

    public function changeFolderName(Request $request, $folderId)
    {
        $folder = Folder::findOrFail($folderId);

        if ($folder->user_id !== $request->user()->id) {
            abort(403, 'Brak uprawnień do zmiany nazwy folderu.');
        }

        $request->validate([
            'foldername' => 'required|string|max:255',
        ]);

        $folder->name = $request->foldername;
        $folder->save();

        // Usuń cache związany z tym folderem
        Cache::store('redis')->forget("folders:user:{$folder->user_id}:parent:" . ($folder->parent_id ?? 'null'));
        Cache::store('redis')->forget("folder:{$folder->id}:files_count");
        Cache::store('redis')->forget("folder_path:{$folder->id}:user:{$folder->user_id}");

        return response()->json(['message' => 'Folder został zaktualizowany.']);
    }
}