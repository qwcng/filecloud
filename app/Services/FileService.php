<?php

namespace App\Services;

use App\Models\UserFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Crypt;
use Ercsctt\FileEncryption\Facades\FileEncrypter;
use Illuminate\Http\Response;

class FileService
{
    public function getInlineFileResponse(UserFile $file): Response
    {

        if (FileEncrypter::isEncrypted(storage_path("app/private/" . $file->path))) {
            $decrypted = FileEncrypter::decryptedContents(storage_path('app/private/' . $file->path));
        } else if (!$file->encrypted) {
            $decrypted = Storage::disk('private')->get($file->path);
        } else {
            $encrypted = Storage::disk('private')->get($file->path);
            $decrypted = Crypt::decrypt($encrypted);
        }

        return response($decrypted)
            ->header('Content-Type', $file->mime_type)
            ->header('Content-Disposition', 'inline; filename="' . $file->original_name . '.pdf"')
            ->header('Content-Length', strlen($decrypted))
            ->header('Cache-Control', 'private, max-age=3600');
    }

    public function getThumbnailResponse(UserFile $file)
    {
        if (!$file->thumbnail || !Storage::disk('private')->exists($file->thumbnail)) {
            return response()->file(public_path('logo.png'));
        }

        if ($file->encrypted) {
            $encrypted = Storage::disk('private')->get($file->thumbnail);
            $decrypted = Crypt::decryptString($encrypted);
        } else {
            $decrypted = Storage::disk('private')->get($file->thumbnail);
        }

       return response($decrypted)
           ->header('Content-Type', 'image/jpeg')
           ->header('Content-Disposition', 'inline')
           ->header('Cache-Control', 'max-age=31536000, public');
    }
}
