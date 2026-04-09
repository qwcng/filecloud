<?php

namespace App\Services;

use App\Models\UserFile;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Intervention\Image\Laravel\Facades\Image;
use Ercsctt\FileEncryption\Facades\FileEncrypter;
use FFMpeg\FFMpeg;
use FFMpeg\Coordinate\Dimension;
use FFMpeg\Coordinate\TimeCode;

class FileUploadService
{
    /**
     * Odpowiada za bezpieczne wgrywanie pliku, miniaturyzację, 
     * szyfrowanie i zapis do bazy danych.
     */
    public function handleUpload(UploadedFile $file, ?int $folderId, int $userId): UserFile
    {
        $filename = time() . '_' . Str::random(16) . '.enc';
        $mime = $file->getMimeType();

        // 1. Główne szyfrowanie potężnym FileEncrypter (bez wpychania go do RAMu)
        FileEncrypter::encryptFile(
            $file->getRealPath(), 
            storage_path("app/private/uploads/{$userId}/{$filename}")
        );

        // 2. Parsowanie MimeType
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

        // Zmienna dla lokalizacji miniaturki
        $thumbnailDiskPath = null;
        $thumbnailPathWithoutDisk = null;

        // 3. Miniaturyzacja Zdjęć
        if ($type === "image") {
            try {
                $image = Image::read($file)->cover(300, 200);
                $thumbnailPathWithoutDisk = "uploads/thumbs/{$userId}/{$filename}";
                
                Storage::put(
                    "private/{$thumbnailPathWithoutDisk}",
                    Crypt::encryptString($image->encodeByExtension($file->getClientOriginalExtension(), quality: 70))
                );
            } catch (\Exception $e) {
                Log::error("Błąd miniatury(zdjęcie): " . $e->getMessage());
            }
        }

        // 4. Miniaturyzacja Wideo (FFMpeg)
        if ($type === "video") {
            try {
                if(env('APP_ENV') === 'local'){
                $ffmpeg = FFMpeg::create();
               
            } else {
                // dd(env('APP_ENV'));
                $ffmpeg = FFMpeg::create([
               'ffmpeg.binaries'  => '/usr/local/bin/ffmpeg',
                'ffprobe.binaries' => '/usr/local/bin/ffprobe',
                'timeout' => 60,
        ]);
    }
                
                $video = $ffmpeg->open($file->getRealPath());
                $video->filters()
                      ->resize(new Dimension(320, 240))
                      ->synchronize();
                      
                $tempPath = storage_path("app/private/uploads/thumbs/temp/{$filename}");
                $video->frame(TimeCode::fromSeconds(1.5))->save($tempPath);
                
                $thumbnailPathWithoutDisk = "uploads/thumbs/{$userId}/{$filename}";
                Storage::disk('private')->put(
                    $thumbnailPathWithoutDisk, 
                    Crypt::encryptString(file_get_contents($tempPath))
                );
                
                // Posprzątanie pliku tymczasowego na dysku
                unlink($tempPath);

            } catch (\Exception $e) {
                Log::error("Błąd podczas generowania miniatury wideo: " . $e->getMessage());
                // Ustaw domyślne logo w razie błędu FFMpeg
                $thumbnailPathWithoutDisk = "uploads/thumbs/{$userId}/{$filename}";
                Storage::disk('private')->put(
                    $thumbnailPathWithoutDisk, 
                    Crypt::encryptString(file_get_contents(public_path('logo.png')))
                );
            }
        }

        // 5. Zapis w bazie danych
        return UserFile::create([
            'user_id' => $userId,
            'original_name' => $file->getClientOriginalName(),
            'path' => "uploads/{$userId}/{$filename}",
            'mime_type' => $mime,
            'size' => $file->getSize(),
            'type' => $type,
            'folder_id' => $folderId,
            'thumbnail' => $thumbnailPathWithoutDisk,
            'encrypted' => true,
        ]);
    }
}
