<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserFile extends Model
{
    use HasFactory;

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
}