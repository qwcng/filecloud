<?php

    namespace App\Http\Controllers;

    use App\Models\UserFile;
    use App\Models\Folder;
    use Illuminate\Http\Request;
    use Illuminate\Support\Facades\Storage;
    use Inertia\Inertia;
    use App\Models\SharedFile;
    use Carbon\Carbon;
    use Illuminate\Support\Facades\Cache;
    use Illuminate\Support\Str;
    use Intervention\Image\Laravel\Facades\Image;
    
    class FileController extends Controller
    {
        // use \Illuminate\Foundation\Auth\Access\AuthorizesRequests;
        
public function index(Request $request)
{
    $userId = $request->user()->id;
    $cacheKey = "files:user:{$userId}:folder:null"; // folder null = root

    $files = Cache::store('redis')->remember($cacheKey, 60, function () use ($userId) {
        return UserFile::where('user_id', $userId)
            ->where('folder_id', null)
            ->orderBy('created_at', 'desc')
            ->get(['id', 'original_name', 'path', 'mime_type', 'size', 'created_at'])
            ->map(function ($file) {
                return [
                    'id' => $file->id,
                    'name' => $file->original_name,
                    'size' => $file->size,
                    'date' => $file->created_at->format('Y-m-d'),
                    'url' => route('downloadFile', $file->id),
                    'type' => $file->type,
                    'mime_type' => $file->mime_type,
                    'thumbnail' => $file->thumbnail ? Storage::url($file->thumbnail) : null,
                ];
            });
    });

    return response()->json([
        'files' => $files
    ]);
}

public function folder(Request $request, $folderId)
{
    $userId = $request->user()->id;
    $folderId = $folderId === 'dashboard' ? null : $folderId;
    $cacheKey = "files:user:{$userId}:folder:" . ($folderId ?? 'null');

    $files = Cache::store('redis')->remember($cacheKey, 60, function () use ($userId, $folderId) {
        return UserFile::where('user_id', $userId)
            ->where('folder_id', $folderId)
            ->orderBy('created_at', 'desc')
            ->get(['id', 'original_name', 'path', 'mime_type', 'size', 'created_at'])
            ->map(function ($file) {
                return [
                    'id' => $file->id,
                    'name' => $file->original_name,
                    'size' => $file->size,
                    'date' => $file->created_at->format('Y-m-d'),
                    'url' => route('downloadFile', $file->id),
                    'type' => $file->type,
                    'mime_type' => $file->mime_type,
                    'thumbnail' => $file->thumbnail ? Storage::url($file->thumbnail) : null,
                ];
            });
    });

    return response()->json(['files' => $files]);
}


        public function uploadFile(Request $request)
    {
        // $request->validate([
        //     'files' => 'required|array',
        //     'files.*' => 'file|max:1231240', 
        // ]);

        $uploadedFiles = [];

foreach ($request->file('files') as $file) {
    $filename = time() . '_' . $file->getClientOriginalName();
    // $path = $file->storeAs('uploads', $filename, 'private');
    $mime = $file->getMimeType();
     $path = $file->store('uploads', 'private');
    

    $type = match (true) {
        str_starts_with($mime, 'image/') => 'image',
        str_starts_with($mime, 'audio/') => 'audio',
        str_starts_with($mime, 'video/') => 'video',
        str_contains($mime, 'pdf') => 'document',
        str_contains($mime, 'word') => 'document',
        str_contains($mime, 'excel') => 'document',
        str_contains($mime, 'text') => 'text',
        default => 'other',
    };

    // folder_id
    $folderId = $request->input('folder') === 'root' ? null : $request->input('folder');
    if($type == "image"){
 $image = Image::read($file)
                ->resize(300, 200);
         Storage::put(
                "private/uploads/thumbs/{$filename}",
                $image->encodeByExtension($file->getClientOriginalExtension(), quality: 70)
            );
        }
    // generowanie miniaturki tylko dla obrazów
   

    


    $userFile = UserFile::create([
        'user_id' => $request->user()->id,
        'original_name' => $file->getClientOriginalName(),
        'path' => $path,
        'mime_type' => $mime,
        'size' => $file->getSize(),
        'type' => $type,
        'folder_id' => $folderId,
        'thumbnail' => $type === 'image' ? "uploads/thumbs/$filename" : null // zapis miniaturki w bazie
    ]);

    // $uploadedFiles[] = [
    //     'id' => $userFile->id,
    //     'folder_id' => $userFile->folder_id,
    //     'name' => $userFile->original_name,
    //     'size' => number_format($userFile->size / 1024 / 1024, 2),
    //     'date' => $userFile->created_at->format('Y-m-d'),
    //     'url' => route('downloadFile', $userFile->id),
    //     'type' => $userFile->type,
    //     'thumbnail' => $userFile->thumbnail ? Storage::url($userFile->thumbnail) : null,
    // ];
}
}

        // return response()->json([
        //     'message' => 'Pliki dodane',
        //     'files' => $uploadedFiles,
            
        // ]);
        //delete all retrun json
        
        public function deleteFile(UserFile $file)
        {
            if ($file->user_id !== auth()->id()) {
                abort(403);
            }

            // Usuwanie pliku z dysku
            Storage::disk('private')->delete($file->path);
            if (!empty($file->thumbnail) && Storage::disk('private')->exists($file->thumbnail)) {
                Storage::disk('private')->delete($file->thumbnail);
            }

            // Usuwanie rekordu z bazy danych
            $file->delete();

            // return response()->json(['message' => 'Plik usunięty']);
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

            return Storage::disk('private')->download($file->path, $file->original_name);
        }
        public function showFile(UserFile $file)
    {
        if ($file->user_id !== auth()->id()) {
            abort(403);
        }

        $path = Storage::disk('private')->path($file->path);
        return response()->file($path, [
        // 'Content-Type' => 'application/epub+zip',
        'Content-Disposition' => 'inline', // <- kluczowe
        'Cache-Control' => 'public, max-age=31536000, immutable',
    ]);
         // 👈 zwróci obrazek inline
    }
    public function showThumbnail(UserFile $file)
    {
        if ($file->user_id !== auth()->id()) {
            abort(403);
        }
        if($file->thumbnail == null){
            return null;
        }
        

        $path = Storage::disk('private')->path($file->thumbnail);
         return response()->file($path, [
            'Cache-Control' => 'public, max-age=31536000, immutable',
        ]);
    
    }
    public function showTextFile($fileId)
    {
        // pobieramy rekord po ID
        $file = UserFile::findOrFail($fileId);

        // sprawdzamy, czy aktualny użytkownik ma dostęp
        if ($file->user_id !== auth()->id()) {
            abort(403);
        }

        // wczytujemy zawartość pliku z private storage
        $path = Storage::disk('private')->path($file->path);
        $content = file_get_contents($path);

        // przesyłamy do Inertia jako string
        return Inertia::render('TextFile', [
            'fileContent' => $content,
            'fileId' => $file->id,
            'fileName' => $file->original_name,
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

    $path = Storage::disk('private')->path($file->path);
    $content = file_get_contents($path);

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
    // $request->validate([
    //     'content' => '',
    //     'filename' => 'required|string|max:255',
    // ]);
    $path = Storage::disk('private')->path($file->path);
    file_put_contents($path, $request->input('content'));
    $file->original_name = $request->filename;
    $file->save();

    // return response()->json(['message' => 'File updated successfully']);
}
public function filesByType(Request $request, $type)
{
    $validTypes = ['image', 'audio', 'video', 'document', 'text', 'other'];
    if (!in_array($type, $validTypes)) {
        abort(400, 'Invalid file type');
    }
    // if image is mime type
    if ($type === 'image') {
        $newType = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
        $files = UserFile::where('user_id', $request->user()->id)
        ->whereIn('mime_type', $newType)
        ->orderBy('created_at', 'desc')
        ->get();
    }
    // $files = UserFile::where('user_id', $request->user()->id)
    //     ->where('mime_type', $type)
    //     ->orderBy('created_at', 'desc')
    //     ->get();

    return response()->json($files);
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
    }