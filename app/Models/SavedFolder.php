<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SavedFolder extends Model
{
    protected $fillable = [
        'user_id', 
        'folder_id', 
        'active',
    ];

    /**
     * Pobierz folder powiązany z tym zapisem.
     */
    public function folder(): BelongsTo
    {
        return $this->belongsTo(Folder::class);
    }

    /**
     * Pobierz użytkownika, który zapisał ten folder.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}