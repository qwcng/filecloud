<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SharedFile extends Model
{
    protected $fillable = [
        'user_id', 'file_id', 'access_code', 'active', 'expires_at',
    ];

    public function file()
    {
        return $this->belongsTo(UserFile::class, 'file_id');
    }
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
    public function downloads()
    {
        return $this->hasMany(FileDownload::class, 'file_id','file_id');

    }
}