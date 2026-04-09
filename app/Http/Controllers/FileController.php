<?php
    namespace App\Http\Controllers;
    use App\Models\UserFile;
    use App\Models\Folder;
    use App\Models\SavedFolder;
    use Illuminate\Http\Request;
    use Illuminate\Support\Facades\Storage;
    use Inertia\Inertia;
    use App\Models\SharedFile;
    use Carbon\Carbon;
    use Defuse\Crypto\Crypto;
    use Illuminate\Support\Facades\Cache;
    use Illuminate\Support\Facades\Crypt;
    use Illuminate\Support\Str;
    use Intervention\Image\Laravel\Facades\Image;
    use Ercsctt\FileEncryption\Facades\FileEncrypter;
    use Illuminate\Support\Facades\Log;
use App\Services\FileUploadService;
use App\Services\FileService;

class FileController extends Controller
    {
      
        
        public function index(Request $request)
        {
            $files = UserFile::where('user_id', $request->user()->id)
            ->where('folder_id', null)
                ->orderBy('created_at', 'desc')
                ->get(['id', 'original_name', 'path', 'mime_type', 'size', 'created_at', 'is_favorite']);

            return response()->json([
                'files' => $files
            ]);
        }

        public function folder(Request $request, $folder)
{   
    // 1. Ustalenie ID folderu (standardowo u Ciebie)
    $folderId = ($folder === 'dashboard') ? null : $folder;

    // 2. Sprawdzenie dostępu, jeśli to nie jest root (null)
    if ($folderId !== null) {
        $isOwner = Folder::where('id', $folderId)
            ->where('user_id', $request->user()->id)
            ->exists();

        $isSaved = SavedFolder::where('folder_id', $folderId)
            ->where('user_id', $request->user()->id)
            ->where('active', true)
            ->exists();

        // Jeśli nie mój i nie zapisany -> brak dostępu
        if (!$isOwner && !$isSaved) {
            return response()->json(['message' => 'Nie masz uprawnień do tego folderu'], 403);
        }
    }

    // 3. Pobieranie plików 
    // UWAGA: Musimy pobrać pliki z tego folderu, niezależnie od tego, kto jest ich właścicielem
    // (bo w zapisanym folderze pliki należą do twórcy folderu, a nie do Ciebie)
    $files = UserFile::where('folder_id', $folderId)
        ->when($folderId === null, function ($query) use ($request) {
            // Jeśli root (null), pokazujemy tylko MOJE pliki
            return $query->where('user_id', $request->user()->id);
        })
        
        ->with('folder')
        ->orderBy('created_at', 'desc')
        ->get(['id', 'original_name', 'path', 'mime_type', 'size', 'created_at', 'folder_id'])
        ->filter(function (UserFile $file) {
            return !$file->isHidden();
        })->values()->makeHidden('folder');

    return response()->json([
        'files' => $files
    ]);
}


        public function uploadFile(Request $request, FileUploadService $uploadService)
    {
        // $request->validate([
        //     'files' => 'required|array',
        //     'files.*' => 'file|max:1231240', 
        // ]);

        $uploadedFiles = [];
        $userId = $request->user()->id;
        $folderId = $request->input('folder') === 'root' ? null : $request->input('folder');

        foreach ($request->file('files') as $file) {
            
            // Cała potężna logika wgrania, FFMpeg, FileEncrypter ląduje w Serwisie
            $userFile = $uploadService->handleUpload($file, $folderId, $userId);

            $uploadedFiles[] = [
                'id' => $userFile->id,
                'folder_id' => $userFile->folder_id,
                'name' => $userFile->original_name,
                'size' => number_format($userFile->size / 1024 / 1024, 2),
                'date' => $userFile->created_at->format('Y-m-d'),
                'type' => $userFile->type,
                // 'thumbnail' => $userFile->thumbnail ? Storage::url($userFile->thumbnail) : null,
            ];
        }
    
        return response()->json([
            'message' => 'Pliki dodane',
            'files' => $uploadedFiles,
        ]);
    }
        
        public function deleteFile(UserFile $file)
        {
            if ($file->user_id !== auth()->id()) {
                abort(403);
            }    
            $file->delete();
        }
        // 2️⃣ Pobranie listy plików użytkownika
        public function moveFile(Request $request, UserFile $file)
        {
            if ($file->user_id !== auth()->id()) {
                abort(403);
            }

            $request->validate([
                'folder_id' => 'nullable|exists:folders,id',
            ]);

            $file->folder_id = $request->folder_id;
            $file->save();

            // return response()->json(['message' => 'Plik przeniesiony']);
        }

        public function filesByType(Request $request, $type)
        {
            $validTypes = ['image', 'audio', 'video', 'document', 'text', 'other'];
            if (!in_array($type, $validTypes)) {
                abort(400, 'Invalid file type');
            }

            $allFolders = \App\Models\Folder::where('user_id', $request->user()->id)->get(['id', 'parent_id', 'hidden']);
            $foldersById = $allFolders->keyBy('id');
            $hiddenFolderIds = [];

            foreach ($foldersById as $id => $folder) {
                $curr = $folder;
                while ($curr) {
                    if ($curr->hidden) {
                        $hiddenFolderIds[] = $id;
                        break;
                    }
                    $curr = $curr->parent_id ? $foldersById->get($curr->parent_id) : null;
                }
            }

            $query = UserFile::where('user_id', $request->user()->id)
                ->when(count($hiddenFolderIds) > 0, function($q) use ($hiddenFolderIds) {
                    $q->where(function($sub) use ($hiddenFolderIds) {
                        $sub->whereNull('folder_id')
                            ->orWhereNotIn('folder_id', $hiddenFolderIds);
                    });
                })
                ->orderBy('created_at', 'desc');

            if ($type === 'image') {
                $mimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'video/mp4', 'video/quicktime'];
                $query->whereIn('mime_type', $mimes);
            } elseif ($type === 'document') {
                $mimes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/plain'];
                $query->whereIn('mime_type', $mimes);
            }

            // Używamy simplePaginate zamiast get
            $files = $query->simplePaginate($request->input('limit', 20));

            // Transformacja danych zachowując strukturę paginacji
            $files->getCollection()->transform(function ($file) {
                return [
                    'id'          => $file->id,
                    'name'        => $file->original_name,
                    'path'        => $file->folder_id,
                    'mime_type'   => $file->mime_type,
                    'size'        => number_format($file->size / 1024 / 1024, 2) . ' MB',
                    'created_at'  => $file->created_at->toDateTimeString(),
                    'is_favorite' => (bool)$file->is_favorite,
                ];
            });

            return response()->json($files);
        }
        public function files(Request $request)
        {
            $userFiles = UserFile::where('user_id', $request->user()->id)
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($file) {
                    return [
                        'id' => $file->id,
                        'name' => $file->original_name,
                        'size' => number_format($file->size / 1024 / 1024, 2),
                        'date' => $file->created_at->format('Y-m-d'),
                        'url' => route('downloadFile', $file->id),
                        'type' => $file->type,
                    ];
                });

            return response()->json($userFiles);
        }

        // 3️⃣ Pobranie pliku (download)
        public function downloadFile(UserFile $file)
        {
            if ($file->user_id !== auth()->id()) {
                abort(403);
            }
            if(FileEncrypter::isEncrypted(storage_path("app/private/".$file->path))){
                $decrypted = FileEncrypter::decryptedContents(storage_path('app/private/' . $file->path));
        
       
            } else if(!$file->encrypted){ 
                $decrypted = Storage::disk('private')->get($file->path);
            }
            else if($file->encrypted){  
                $encrypted = Storage::disk('private')->get($file->path);
                $decrypted = Crypt::decrypt($encrypted);
            }
            return response($decrypted)
                ->header('Content-Type', $file->mime_type)
                ->header('Content-Disposition', 'attachment; filename="' . $file->original_name . '"');
        }
    public function showFile(UserFile $file, FileService $fileService)
    {
        // Używamy nowej metody z modelu - autoryzacja zostaje w kontrolerze
        if (!$file->hasAccessTo(auth()->user())) {
            abort(403, 'Brak dostępu do pliku.');
        }
        return $fileService->getInlineFileResponse($file);
    }
    public function showThumbnail(UserFile $file, FileService $fileService)
    {
        if (!$file->hasAccessTo(auth()->user())) abort(403);
        return $fileService->getThumbnailResponse($file);
    }
    public function showTextFile($fileId)
    {
        $file = UserFile::findOrFail($fileId);

        if ($file->user_id !== auth()->id()) {
            abort(403);
        }

        $path = Storage::disk('private')->path($file->path);
        $content = file_get_contents($path);

        return Inertia::render('TextFile', [
            'fileContent' => $content,
            'fileId' => $file->id,
            'fileName' => $file->original_name,
        ]);
    }
    public function showPdfViewer($fileId)
    {
        $file = UserFile::findOrFail($fileId);
        if ($file->user_id !== auth()->id()) {
            abort(403);
        }

        return Inertia::render('PdfFile', [
            'id' => $file->id,
            'name' => $file->original_name,
        ]);
    }
    
    
public function pathTo(Request $request, $folderId = null)
{
    if (!$folderId) {
        return response()->json([]);
    }

    $path = [];
    $currentFolder = Folder::find($folderId);

    while ($currentFolder) {
        $path[] = [
            'id' => $currentFolder->id,
            'name' => $currentFolder->name,
        ];
        // id rodzica null = root
        $currentFolder = $currentFolder->parent_id ? Folder::find($currentFolder->parent_id) : null;
    }

    // odwracamy żeby root był pierwszy
    $path = array_reverse($path);

    return response()->json($path);
}
public function editFile($fileId)
{
    $file = UserFile::findOrFail($fileId);

    if ($file->user_id !== auth()->id()) {
        abort(403);
    }

    $realPath = storage_path("app/private/" . $file->path);
    
    if (FileEncrypter::isEncrypted($realPath)) {
        $content = FileEncrypter::decryptedContents($realPath);
    } else if (!$file->encrypted) {
        $content = Storage::disk('private')->get($file->path);
    } else {
        $encrypted = Storage::disk('private')->get($file->path);
        $content = Crypt::decrypt($encrypted);
    }

    return Inertia::render('Word', [
        'fileContent' => $content,
        'fileId' => $file->id,
        'fileName' => $file->original_name,
    ]);
}
public function changeFileName(Request $request, $fileId)
{
    $file = UserFile::findOrFail($fileId);
    if ($file->user_id !== auth()->id()) {
        abort(403);
    }  
    $request->validate([
        'filename' => 'required|string|max:255',
    ]);
    $file->original_name = $request->filename;
    $file->save();

    // return response()->json(['message' => 'File name updated successfully']);
}
public function saveEditedFile(Request $request, $fileId)
{
    $file = UserFile::findOrFail($fileId);
    if ($file->user_id !== auth()->id()) {
        abort(403);
    }  

    $content = $request->input('content');
    $realPath = storage_path("app/private/" . $file->path);
    
    // Tworzymy tymczasowy plik aby użyć FileEncrypter
    $tempFile = storage_path("app/tmp_" . Str::random(10) . ".txt");
    file_put_contents($tempFile, $content);
    
    // Nadpisujemy stary plik nową wersją zaszyfrowaną
    FileEncrypter::encryptFile($tempFile, $realPath);
    
    // Czyścimy plik tymczasowy
    unlink($tempFile);

    $file->original_name = $request->filename;
    $file->encrypted = true; // Upewniamy się że flaga jest ustawiona
    $file->save();

    return back();
}

    public function createFile(Request $request)
{
    $request->validate([
        'filename' => 'required|string|max:255',
        'folder' => 'nullable|',
    ]);

    // Generujemy unikalną nazwę pliku
    $filename = time() . '_' . $request->filename;
    $path = 'uploads/' . $filename;

    // Tworzymy pusty plik w storage/private
    Storage::disk('private')->put($path, '');

    // Tworzymy rekord w bazie danych
    $file = UserFile::create([
        'user_id' => $request->user()->id,
        'original_name' => $request->filename,
        'path' => $path,
        'mime_type' => 'text/plain',
        'size' => Storage::disk('private')->size($path), // ✅ teraz poprawnie
        'type' => 'text',
        'folder_id' => $request->input('folder') === 'root' ? null : $request->input('folder'),
    ]);

    return Inertia::location(route('editFile', $file->id));
}

    public function searchFiles(Request $request, $query)
    {
        // $request->validate([
        //     'query' => 'required|string|max:255',
        // ]);

        $files = UserFile::where('user_id', $request->user()->id)
            ->where('original_name', 'like', '%' . $query . '%')
            ->orderBy('created_at', 'desc')
            ->get(['id', 'original_name', 'path', 'mime_type', 'size', 'created_at', 'is_favorite']);
            // ->get();

        return response()->json($files);
    

    }
    public function showTrash(Request $request)
    {
        $files = UserFile::onlyTrashed()
            ->where('user_id', $request->user()->id)
            ->orderBy('deleted_at', 'desc')
            ->get(['id', 'original_name', 'path', 'mime_type', 'size', 'created_at', 'deleted_at']);

        return response()->json([
            'files' => $files
        ]);
    }
    public function restoreFile($fileId)
    {
        $file = UserFile::onlyTrashed()->findOrFail($fileId);

        if ($file->user_id !== auth()->id()) {
            abort(403);
        }

        $file->restore();

        // return response()->json(['message' => 'Plik przywrócony']);
    }
    public function permanentlyDeleteFile($fileId)
    {
        $file = UserFile::onlyTrashed()->findOrFail($fileId);

        if ($file->user_id !== auth()->id()) {
            abort(403);
        }

        // Usuwanie pliku z dysku
        Storage::disk('private')->delete($file->path);
        if (!empty($file->thumbnail) && Storage::disk('private')->exists($file->thumbnail)) {
            Storage::disk('private')->delete($file->thumbnail);
        }

        // Usuwanie rekordu z bazy danych
        $file->forceDelete();
    }
   public function getCapacity(Request $request){
    $userId = $request->user()->id;

    $capacity = Cache::remember("user:{$userId}:capacity_detailed", 60, function() use ($userId) {
        $files = UserFile::where('user_id', $userId)
                         ->whereNull('deleted_at')
                         ->get(['size', 'type']);
                         
        $used = $files->sum('size');
        $total = 1 * 1024 * 1024 * 1024; // 1GB (Możesz tu uaktualnić na 15GB z .env)

        $breakdown = $files->groupBy('type')->map(function ($group) {
            return round($group->sum('size') / (1024 * 1024), 2); // Zwracamy w megabajtach dla czytelności
        });

        return [
            'used' => round($used / (1024*1024*1024), 3),
            'used_bytes' => $used,
            'total' => round($total / (1024*1024*1024), 2),
            'total_bytes' => $total,
            'breakdown' => $breakdown
        ];
    });

    return response()->json($capacity);
}
        // return response()->json(['message' => 'Plik trwale usunięty']);}
    }