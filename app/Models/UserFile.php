<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class UserFile extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'folder_id',
        'original_name',
        'path',
        'mime_type',
        'size',
        'type',
        'thumbnail',
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }
    public function folder() {
        return $this->belongsTo(Folder::class);
    }
    public function hasAccessTo($user)
    {
        if (!$user) return false;

        // 1. Właściciel zawsze ma dostęp
        if ($this->user_id === $user->id) {
            return true;
        }

        // 2. Jeśli plik jest w "root" (brak folderu), a nie jesteś właścicielem -> brak dostępu
        if (!$this->folder_id) {
            return false;
        }

        // 3. Pobierz ID folderów, które użytkownik zapisał ("repostował")
        $savedFolderIds = SavedFolder::where('user_id', $user->id)
            ->where('active', true)
            ->pluck('folder_id')
            ->toArray();

        // 4. Sprawdź rekurencyjnie w górę drzewa folderów
        // Upewnij się, że relacja folder() jest załadowana
        return $this->folder ? $this->folder->isInsideAny($savedFolderIds) : false;
    }
}