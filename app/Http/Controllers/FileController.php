<?php

    namespace App\Http\Controllers;

    use App\Models\UserFile;
    use App\Models\Folder;
    use Illuminate\Http\Request;
    use Illuminate\Support\Facades\Storage;
    use Inertia\Inertia;
    use App\Models\SharedFile;
    use Carbon\Carbon;
    use Illuminate\Support\Str;
    use Intervention\Image\Laravel\Facades\Image;
    
    class FileController extends Controller
    {
        // use \Illuminate\Foundation\Auth\Access\AuthorizesRequests;
        
        public function index(Request $request)
        {
            $files = UserFile::where('user_id', $request->user()->id)
            ->where('folder_id', null)
                ->orderBy('created_at', 'desc')
                ->get(['id', 'original_name', 'path', 'mime_type', 'size', 'created_at']);

            return response()->json([
                'files' => $files
            ]);
        }

        public function folder(Request $request, $folder)
        {   
            if ($folder === 'dashboard') {
                $folderr = null;
            }
            else {
                $folderr = $folder;
            }
            $files = UserFile::where('user_id', $request->user()->id)
                ->where('folder_id', $folderr)
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
        'Content-Type' => 'application/epub+zip',
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
    public function createShare(Request $request, UserFile $file)
        {
            //  / tylko właściciel pliku
            if ($file->user_id !== auth()->id()) {
                abort(403);
            }
            $data = $request->validate([
                'access_code' => 'required|string|size:6',
                'expires_in' => 'nullable|integer|min:1', // liczba godzin
            ]);

            $share = SharedFile::updateOrCreate(
                ['file_id' => $file->id],
                [
                    'access_code' => $data['access_code'],
                    'active' => true,
                    'expires_at' => $data['expires_in']
                        ? Carbon::now()->addHours($data['expires_in'])
                        : null,
                ]
            );

            // return response()->json([
            //     'message' => 'Plik został udostępniony',
            //     'share_url' => route('shareFile', $file->id),
            //     'access_code' => $share->access_code,
            //     'expires_at' => $share->expires_at,
            // ]);
        }

        public function removeShare(UserFile $file)
        {
        if ($file->user_id !== auth()->id()) {
                abort(403);
            }

            SharedFile::where('file_id', $file->id)->delete();

            return response()->json(['message' => 'Udostępnianie wyłączone']);
        }

    public function shareFile($fileId)
    {
        $file = UserFile::withoutGlobalScopes()->findOrFail($fileId);

        $share = SharedFile::where('file_id', $file->id)
            ->where('active', true)
            ->first();

        if (!$share || ($share->expires_at && $share->expires_at->isPast())) {
            abort(404, 'Link nieaktywny');
        }

        return Inertia::render('ShareFile', [
            'fileId' => $file->id,
            'fileName' => $file->original_name,
        ]);
    }

    public function checkAccessCode(Request $request, $fileId)
    {
        $request->validate(['code' => 'required|string|size:6']);

        $file = UserFile::withoutGlobalScopes()->findOrFail($fileId);

        $share = SharedFile::where('file_id', $file->id)
            ->where('active', true)
            ->first();

        if (!$share || ($share->expires_at && $share->expires_at->isPast())) {
            // return response()->json(['success' => false, 'message' => 'Link wygasł'], 403);
        }

        if ($share->access_code !== $request->code) {
            // return response()->json(['success' => false, 'message' => 'Niepoprawny kod'], 403);
        }

        return response()->json([
            'success' => true,
            'file' => [
                'id' => $file->id,
                'name' => $file->original_name,
                'url' => route('downloadFile', $file->id),
                'type' => $file->type,
                'size' => number_format($file->size / 1024 / 1024, 2),
            ],
        ]);
    }
    public function downloadSharedFile(Request $request, $fileId)
    {
        $code = $request->query('code'); // pobieramy kod z GET

        $file = UserFile::withoutGlobalScopes()->findOrFail($fileId);

        $share = SharedFile::where('file_id', $file->id)
            ->where('active', true)
            ->first();

        if (!$share || ($share->expires_at && $share->expires_at->isPast())) {
            abort(403, 'Link nieaktywny');
        }

        if ($share->access_code !== $code) {
            abort(403, 'Niepoprawny kod dostępu');
        }

        return Storage::disk('private')->download($file->path, $file->original_name);
    }
    public function showSharedFile(Request $request, $fileId)
    {
        $code = $request->query('code'); // pobieramy kod z GET
        if (!$code) {
            abort(403, 'Kod dostępu wymagany');
        }

        $file = UserFile::withoutGlobalScopes()->findOrFail($fileId);

        $share = SharedFile::where('file_id', $file->id)
            ->where('active', true)
            ->first();

        if (!$share || ($share->expires_at && $share->expires_at->isPast())) {
            abort(403, 'Link nieaktywny');
        }

        if ($share->access_code !== $code) {
            abort(403, 'Niepoprawny kod dostępu');
        }

        // 👇 zamiast pobierania – wyświetlamy inline (np. obrazek, pdf itp.)
        $path = Storage::disk('private')->path($file->path);
        return response()->file($path);
    }
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
    if ($parent === 'dashboard' || $parent === null) {
        $parent = null;
    }

    // wczytujemy całe drzewo folderów + pliki
    $folders = Folder::where('user_id', $request->user()->id)
        ->where('parent_id', $parent)
        ->with(['children.children.children', 'children.files', 'files'])
        ->orderBy('created_at', 'desc')
        ->get();

    // dodajemy total_files_count
    $folders = $folders->map(function ($folder) {
        return [
            'id' => $folder->id,
            'name' => $folder->name,
            'created_at' => $folder->created_at,
            'filesCount' => $folder->files()->count(), // lokalne
            'files_count' => $folder->recursiveFilesCount() // rekurencyjne
        ];
    });

    return response()->json($folders);
}
    private function deleteFolderRecursively(Folder $folder)
{
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

    // 🔒 Sprawdzenie, czy folder należy do zalogowanego użytkownika
    if ($folder->user_id !== $request->user()->id) {
        abort(403, 'Brak uprawnień do usunięcia tego folderu.');
    }

    // 🧹 Usuń folder wraz z plikami i podfolderami
    $this->deleteFolderRecursively($folder);

    return response()->json(['message' => 'Folder został usunięty.']);
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