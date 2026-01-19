<?php

namespace App\Jobs;

use App\Models\Folder;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class DeleteFolderJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $folder;

    public function __construct(Folder $folder)
    {
        // SerializesModels sprawi, że do bazy trafi tylko ID, a model zostanie pobrany ponownie w Jobie
        $this->folder = $folder;
    }

    public function handle()
    {
        // Używamy transakcji, aby upewnić się, że jeśli baza zawiedzie, nie stracimy spójności
        DB::transaction(function () {
            $this->deleteFolderRecursively($this->folder);
        });
    }

    private function deleteFolderRecursively(Folder $folder)
    {
        // 1. Usuwanie plików z Storage i Bazy
        foreach ($folder->files as $file) {
            try {
                // Usuwanie z dysku
                if (Storage::disk('private')->exists($file->path)) {
                    Storage::disk('private')->delete($file->path);
                }
                
                if (!empty($file->thumbnail) && Storage::disk('private')->exists($file->thumbnail)) {
                    Storage::disk('private')->delete($file->thumbnail);
                }

                // Usuwanie rekordu pliku
                $file->delete();
            } catch (\Exception $e) {
                Log::error("Błąd podczas usuwania pliku ID {$file->id}: " . $e->getMessage());
                // W Jobie możemy rzucić wyjątek, aby ponowić próbę (jeśli tak skonfigurujemy)
            }
        }

        // 2. Rekurencja dla podfolderów
        foreach ($folder->children as $child) {
            $this->deleteFolderRecursively($child);
        }

        // 3. Usuń pusty folder z bazy
        $folder->delete();
    }
}