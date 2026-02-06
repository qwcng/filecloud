<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Folder extends Model
{
    protected $fillable = ['name', 'user_id', 'parent_id'];

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Folder::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Folder::class, 'parent_id');
    }
    

    public function files(): HasMany
    {
        return $this->hasMany(UserFile::class, 'folder_id');
    }
    public function recursiveFilesCount(): int{
    $count = $this->files()->count(); // pliki w aktualnym folderze

    foreach ($this->children as $child) {
        $count += $child->recursiveFilesCount(); // pliki w podfolderach
    }
    

    return $count;
}
    public function sharedFolder()
    {
        return $this->hasOne(SharedFolder::class, 'folder_id');
    }
    public function isInsideAny(array $allowedFolderIds)
{
    // 1. Sprawdź, czy ten folder jest na liście
    if (in_array($this->id, $allowedFolderIds)) {
        return true;
    }

    // 2. Jeśli ma rodzica, sprawdź rekurencyjnie w górę
    if ($this->parent_id) {
        // Ładujemy rodzica, jeśli nie jest jeszcze załadowany
        $parent = $this->parent ?: $this->belongsTo(Folder::class, 'parent_id')->first();
        
        return $parent ? $parent->isInsideAny($allowedFolderIds) : false;
    }

    return false;
}
}