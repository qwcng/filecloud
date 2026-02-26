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

    class FileController extends Controller
    {
        // use \Illuminate\Foundation\Auth\Access\AuthorizesRequests;
        
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
        ->orderBy('created_at', 'desc')
        ->get(['id', 'original_name', 'path', 'mime_type', 'size', 'created_at']);

    return response()->json([
        'files' => $files
    ]);
}


        public function uploadFile(Request $request)
    {
        // $request->validate([
        //     'files' => 'required|array',
        //     'files.*' => 'file|max:1231240', 
        // ]);

        $uploadedFiles = [];

foreach ($request->file('files') as $file) {
    $filename = time().'_'.Str::random(16).'.enc';
    // $path = $file->storeAs('uploads', $filename, 'private');
    $mime = $file->getMimeType();

    //  $path = $file->store('uploads', 'private');
    FileEncrypter::encryptFile($file->getRealPath(), storage_path("app/private/uploads/".auth()->id()."/{$filename}"));
     $encryptedContent = Crypt::encrypt(file_get_contents($file->getRealPath()));
    //  Storage::disk('private')->put("uploads/".auth()->id()."/{$filename}", $encryptedContent);
    

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
    ->cover(300, 200); 
         Storage::put(
                "private/uploads/thumbs/".auth()->id()."/{$filename}",
                Crypt::encryptString($image->encodeByExtension($file->getClientOriginalExtension(), quality: 70))
            );
        }
    if($type =="video"){
        try {
        $ffmpeg = \FFMpeg\FFMpeg::create([
            
        ]);
        $video = $ffmpeg->open($file->getRealPath());
         $video
            ->filters()
            ->resize(new \FFMpeg\Coordinate\Dimension(320, 240))
            ->synchronize();
         $video->frame(\FFMpeg\Coordinate\TimeCode::fromSeconds(2))->save(storage_path("app/private/uploads/thumbs/temp/{$filename}"));
        
       
       
         $thumbnailPath = "uploads/thumbs/".auth()->id()."/{$filename}";
        Storage::disk('private')->put($thumbnailPath, Crypt::encryptString(file_get_contents(storage_path("app/private/uploads/thumbs/temp/{$filename}"))));
         unlink(storage_path("app/private/uploads/thumbs/temp/{$filename}"));
        }
        catch (\Exception $e) {
            Log::error("Błąd podczas generowania miniatury wideo: " . $e->getMessage());
                // Możesz też ustawić domyślną miniaturę dla wideo, jeśli generowanie się nie powiedzie
                Storage::disk('private')->put("uploads/thumbs/".auth()->id()."/{$filename}", Crypt::encryptString(file_get_contents(public_path('logo.png'))));
            dd("Błąd podczas generowania miniatury wideo: " . $e->getMessage());
            
        }
    
            //  Storage::disk('private')->put("uploads/thumbs/".auth()->id()."/{$filename}", Crypt::encryptString(file_get_contents(public_path('logo.png'))));

        // unlink(storage_path("app/{$thumbnailPath}"));
    }
   

    


    $userFile = UserFile::create([
        'user_id' => $request->user()->id,
        'original_name' => $file->getClientOriginalName(),
        'path' => 'uploads/'. auth()->id() . "/{$filename}",
        'mime_type' => $mime,
        'size' => $file->getSize(),
        'type' => $type,
        'folder_id' => $folderId,
        'thumbnail' => $type === 'image' || $type === 'video' ? "uploads/thumbs/".auth()->id()."/{$filename}" : null,
        'encrypted' => true,
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
            // Storage::disk('private')->delete($file->path);
            // if (!empty($file->thumbnail) && Storage::disk('private')->exists($file->thumbnail)) {
            //     Storage::disk('private')->delete($file->thumbnail);
            // }

            // // Usuwanie rekordu z bazy danych
            $file->delete();
            
            // $file->delete();

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
        public function showFile(UserFile $file)
{
    // Używamy nowej metody z modelu
    if (!$file->hasAccessTo(auth()->user())) {
        abort(403, 'Brak dostępu do pliku.');
    }

    // $path = Storage::disk('private')->path($file->path);
    if(FileEncrypter::isEncrypted(storage_path("app/private/".$file->path))){
       $decrypted = FileEncrypter::decryptedContents(storage_path('app/private/' . $file->path));
        
       
    } else if(!$file->encrypted){ 
        $decrypted = Storage::disk('private')->get($file->path);
    }
    else if($file->encrypted){  
        $encrypted = Storage::disk('private')->get($file->path);
        $decrypted = Crypt::decrypt($encrypted);
    }   
   
    
    // Sprawdzamy czy plik fizycznie istnieje na dysku
    // if (!Storage::disk('private')->exists($file->path)) {
    //     abort(404, 'Plik nie istnieje na serwerze.');
    // }

    
        return response($decrypted)
        ->header('Content-Type', 'application/octet-stream')
        // ->header('Content-Type', 'image/jpeg')
        ->header('Content-Disposition', 'inline')
       ->header('Cache-Control', 'max-age=31536000, public');
        // ->header('Content-Disposition', 'inline; filename="' . $file->original_name . '"');
}
    public function showThumbnail(UserFile $file)
    {
        if (!$file->hasAccessTo(auth()->user())) abort(403);
        
        if (!$file->thumbnail || !Storage::disk('private')->exists($file->thumbnail)) {
            // Zwróć domyślną ikonę, jeśli miniatura nie istnieje
            return response()->file(public_path('logo.png'));
        }
        if($file->encrypted){
            $encrypted = Storage::disk('private')->get($file->thumbnail);
            $decrypted = Crypt::decryptString($encrypted);
        } else {
            $decrypted = Storage::disk('private')->get($file->thumbnail);
        }
       

       return response($decrypted)->header('Content-Type', 'image/jpeg')
    //    ->header('Content-Type', 'application/octet-stream')
       ->header('Content-Disposition', 'inline')
       ->header('Cache-Control', 'max-age=31536000, public');
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
        $newType = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml','video/mp4','video/quicktime'];
        $files = UserFile::where('user_id', $request->user()->id)
        ->whereIn('mime_type', $newType)
        ->orderBy('created_at', 'desc')
        ->get(['id', 'original_name', 'path', 'mime_type', 'size', 'mime_type', 'created_at', 'is_favorite']);
    }
    if($type === 'document'){
        $newType = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/plain'];
        $files = UserFile::where('user_id', $request->user()->id)
        ->whereIn('mime_type', $newType)
        ->orderBy('created_at', 'desc')
        ->get(['id', 'original_name', 'path', 'mime_type', 'size', 'created_at', 'is_favorite']);
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

    $capacity = Cache::remember("user:{$userId}:capacity", 60, function() use ($userId) {
        $used = UserFile::where('user_id', $userId)->sum('size');
        $total = 1 * 1024 * 1024 * 1024; // 15 GB
        return [
            'used' => round($used / (1024*1024*1024), 2),
            'total' => round($total / (1024*1024*1024), 2),
        ];
    });

    return response()->json($capacity);
}
        // return response()->json(['message' => 'Plik trwale usunięty']);}
    }