<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SharedFile extends Model
{
    protected $fillable = [
        'file_id', 'access_code', 'active', 'expires_at',
    ];

    public function file()
    {
        return $this->belongsTo(UserFile::class, 'file_id');
    }
}