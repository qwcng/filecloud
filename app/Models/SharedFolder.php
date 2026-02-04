<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SharedFolder extends Model
{
    //
    protected $fillable = [
        'user_id', 'folder_id', 'access_code', 'active', 'expires_at',
    ];
    public function folder()
    {
        return $this->belongsTo(Folder::class, 'folder_id');
    }
    // public function user()
    // {
    //     return $this->belongsTo(User::class, 'user_id');
    // }

}