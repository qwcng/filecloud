<?php

namespace App\Http\Controllers;

use App\Models\SharedFile;
use App\Models\UserFile;
use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;
use Inertia\Inertia;

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
    
}