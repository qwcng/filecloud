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
}