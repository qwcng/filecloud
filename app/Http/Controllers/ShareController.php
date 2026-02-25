<?php

namespace App\Http\Controllers;

use App\Models\file_download;
use App\Models\FileDownload;
use App\Models\Folder;
use App\Models\SavedFolder;
use App\Models\SharedFile;
use App\Models\SharedFolder;
use App\Models\UserFile;
use Carbon\Carbon;
use Ercsctt\FileEncryption\Facades\FileEncrypter;
// use Ercsctt\FileEncryption\FileEncrypter;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Inertia\Inertia;
use Psy\VersionUpdater\Downloader\FileDownloader;

class ShareController extends Controller
{
  public function createShare(Request $request, UserFile $file)
        {
            //  / tylko właściciel pliku
            if ($file->user_id !== auth()->id()) {
                abort(403);
            }
            $data = $request->validate([
                'access_code' => 'required|string|size:6',
                'expires_in' => 'nullable', // liczba godzin
            ]);

            $share = SharedFile::updateOrCreate(
                ['file_id' => $file->id],
                [
                    'user_id' => auth()->id(),
                    'access_code' => $data['access_code'],
                    'active' => true,
                    'expires_at' => $data['expires_in']
                        ? Carbon::createFromFormat('Y-m-d', $data['expires_in'])->endOfDay()
                        : ($data['expires_in']
                            ? Carbon::now()->addHours($data['expires_in'])
                            : null),
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

        // if (!$share || ($share->expires_at && $share->expires_at->isPast())) {
        //     abort(404, 'Link nieaktywny');
        // }

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

        // if (!$share || ($share->expires_at && $share->expires_at->isPast())) {
        //     // return response()->json(['success' => false, 'message' => 'Link wygasł'], 403);
        // }

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
        FileDownload::create([
            'user_id'=> auth()->id(),
            'client'=> $request->ip(),
            'file_id'=> $fileId,
            

        ]);
        $share = SharedFile::where('file_id', $file->id)
            ->where('active', true)
            ->first();

        // if (!$share || ($share->expires_at && $share->expires_at->isPast())) {
        //     abort(403, 'Link nieaktywny');
        // }

        if ($share->access_code !== $code) {
            abort(403, 'Niepoprawny kod dostępu');
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
            return response($decrypted)->header('Content-Type', $file->mime_type)
            ->header('Content-Disposition', 'inline; filename="' . $file->original_name . '"')
            ->header('Cache-Control', 'max-age=31536000, public');
    }
    public function showSharedFile(Request $request, $fileId)
    {
        $code = $request->query('code'); // pobieramy kod z GET
        if (!$code) {
            abort(403, 'Kod dostępu wymagany');
        }

        $file = UserFile::withoutGlobalScopes()->findOrFail($fileId);
        FileDownload::create([
            'user_id'=> auth()->id(),
            'client'=> $request->ip(),
            'file_id'=> $fileId,
            

        ]);

        $share = SharedFile::where('file_id', $file->id)
            ->where('active', true)
            ->first();

        // if (!$share || ($share->expires_at && $share->expires_at->isPast())) {
        //     abort(403, 'Link nieaktywny');
        // }

        if ($share->access_code !== $code) {
            abort(403, 'Niepoprawny kod dostępu');
        }

        
        $path = Storage::disk('private')->path($file->path);
        if(FileEncrypter::isEncrypted(storage_path("app/private/".$file->path))){
                $decrypted = FileEncrypter::decryptedContents(storage_path('app/private/' . $file->path));
        
       
            } else if(!$file->encrypted){ 
                $decrypted = Storage::disk('private')->get($file->path);
            }
            else if($file->encrypted){  
                $encrypted = Storage::disk('private')->get($file->path);
                $decrypted = Crypt::decrypt($encrypted);
            }
            return response($decrypted)->header('Content-Type', $file->mime_type)
            ->header('Content-Disposition', 'inline; filename="' . $file->original_name . '"')
            ->header('Cache-Control', 'max-age=31536000, public');
    }
    public function getSharedFiles(Request $request)
    {
        $sharedFiles = SharedFile::where('active', true)
        ->where('user_id', auth()->id())
            ->where(function ($query) {
                $query->whereNull('expires_at')
                      ->orWhere('expires_at', '>', Carbon::now());
            })
            ->with('user', 'file')
            ->get()
            ->map(function ($share) {
                return [
                    'id' => $share->file->id,
                    'name' => $share->file->original_name,
                    'type' => $share->file->type,
                    'size' => number_format($share->file->size / 1024 / 1024, 2),
                    'shared_at' => $share->created_at->toDateTimeString(),
                    'expires_at' => $share->expires_at ? $share->expires_at : null,
                    'code' => $share->access_code,
                    'downloads' => $share->downloads->count(),
                ];
            });

        return response()->json(['shared_files' => $sharedFiles]);
    }
    public function revokeSharedFile(Request $request){
        $request->validate(['file_id' => 'required|integer']);

        $share = SharedFile::where('file_id', $request->file_id)
            ->where('active', true)
            ->first();

        if ($share) {
            $share->active = false;
            $share->save();
        }

        return response()->json(['message' => 'Udostępnianie cofnięte']);
    }
    public function updateShareCode(Request $request){
        $request->validate([
            'file_id' => 'required|integer',
            'access_code' => 'required|string|size:6',
        ]);

        $share = SharedFile::where('file_id', $request->file_id)
            ->where('active', true)
            ->where('user_id', auth()->user()->id)
            ->first();

        if ($share) {
            $share->access_code = $request->access_code;
            $share->save();
        }

        return response()->json(['message' => 'Kod dostępu zaktualizowany']);
    }
    public function shareFolder(Folder $folder, Request $request, $folderId)
    {
        // if($folder->user_id !== auth()->id()) {
        //     abort(403);
        // }
       $request->validate([
            // 'access_code' => 'required|string|size:6',
            'expires_in' => 'nullable', // liczba godzin
        ]);
        SharedFolder::updateOrCreate(
            ['folder_id' => $folderId],
            [
                'user_id' => auth()->id(),
                'access_code' => $request->accesscode,
                'active' => true,
                'expires_at' => $request->expires_in
                    ? Carbon::now()->addHours($request->expires_in)
                    : null,
            ]
        );
        return response()->json([
            'message' => 'Folder został udostępniony',
            // 'share_url' => route('createFolderShare', $folder->id),
            // 'access_code' => $share->access_code,
            // 'expires_at' => $share->expires_at,
        ]);
      
    }
public function getSharedFilesFromFolder(Request $request, $folderId)
{
    // Walidacja - upewniamy się, że kod został przesłany
    $request->validate([
        'access_code' => 'required|string',
    ]);

    // 1. Znajdź folder sprawdzając dostęp, ważność i poprawność kodu
    $folder = Folder::where('id', $folderId)
        ->whereHas('sharedFolder', function ($query) use ($request) {
            $query->where('active', true)
                  ->where('access_code', $request->access_code) // Weryfikacja kodu
                  ->where(function ($q) {
                      $q->whereNull('expires_at')
                        ->orWhere('expires_at', '>', now());
                  });
        })->first();

    // Jeśli nie znaleziono folderu (zły kod, nieaktywny lub wygasł)
    if (!$folder) {
        return response()->json(['message' => 'Kod dostępu jest nieprawidłowy lub link wygasł.'], 403);
    }
    

    // 2. Pobierz pliki z tego folderu w wymaganym formacie
    $files = $folder->files()
        ->get(['id', 'original_name', 'path', 'mime_type', 'size', 'created_at', 'is_favorite'])
        ->map(function ($file) {
            return [
                'id'            => $file->id,
                'original_name' => $file->original_name,
                'path'          => $file->path,
                'mime_type'     => $file->mime_type,
                'size'          => number_format($file->size / 1024 / 1024, 2) . ' MB',
                'created_at'    => $file->created_at->toDateTimeString(),
                'is_favorite'   => (bool)$file->is_favorite,
            ];
        });
        session()->put("folder_access_{$folder->id}", true);
        return response()->json($files);
}
    public function getSharedFolders(Request $request){
        $folders = SharedFolder::where('user_id', $request->user()->id)
        ->get()

        ;
        return response()->json($folders);
    }
    public function showSharedFiles(Request $request,UserFile $file)
    {
    // Tutaj już nie sprawdzamy auth(), bo middleware sprawdziło sesję folderu
    FileDownload::create([
            'user_id'=> auth()->id(),
            'client'=> $request->ip(),
            'file_id'=> $file,
            

        ]);
        if(FileEncrypter::isEncrypted(storage_path("app/private/".$file->path))){
                        $decrypted = FileEncrypter::decryptedContents(storage_path('app/private/' . $file->path));
                
            
                    } else if(!$file->encrypted){ 
                        $decrypted = Storage::disk('private')->get($file->path);
                    }
                    else if($file->encrypted){  
                        $encrypted = Storage::disk('private')->get($file->path);
                        $decrypted = Crypt::decrypt($encrypted);
                    }
                    return response($decrypted)->header('Content-Type', $file->mime_type)
                    ->header('Content-Disposition', 'inline; filename="' . $file->original_name . '"')
                    ->header('Cache-Control', 'max-age=31536000, public');
            }
    public function showSharedFilesThumbnail(UserFile $file)
    {

    if ($file->encrypted && $file->thumbnail) {
        $encrypted = Storage::disk('private')->get($file->thumbnail);
        $decrypted = Crypt::decryptString($encrypted);
        return response($decrypted)->header('Content-Type', 'image/jpeg')
        ->header('Content-Disposition', 'inline')
        ->header('Cache-Control', 'max-age=31536000, public');
    } elseif ($file->thumbnail) {
      
    $path = Storage::disk('private')->path($file->thumbnail);
    
    return response()->file($path, [
        'Content-Disposition' => 'inline',
        'Cache-Control' => 'private, max-age=3600',
    ]);
}
    }
public function saveSharedFolder(Request $request, $folderId) 
{
    // 1. Sprawdzasz czy link udostępniania istnieje i czy kod pasuje
    $share = SharedFolder::where('folder_id', $folderId)
        ->where('access_code', $request->access_code)
        ->first();

    if (!$share) {
        return response()->json(['message' => 'Nieprawidłowy kod dostępu'], 403);
    }

    // 2. Zapisujesz folder dla użytkownika (używając nowej tabeli)
    // updateOrCreate zapobiega duplikatom, jeśli user kliknie dwa razy
    $saved = SavedFolder::updateOrCreate(
        [
            'user_id' => auth()->id(),
            'folder_id' => $folderId
        ],
        [
            'active' => true // jeśli wcześniej był nieaktywny, ustawiamy na true
        ]
    );

    return response()->json([
        'message' => 'Folder został zapisany w Twojej kolekcji',
        'folder' => $saved->load('folder') // od razu zwracamy dane folderu
    ]);
}
public function getSavedFolders(){
    
}
}