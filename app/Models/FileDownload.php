<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FileDownload extends Model
{
    
    protected $fillable = ['user_id','client','file_id'];
    protected $table = 'download_history';
    public function user():BelongsTo{
        return $this->belongsTo(User::class);
    }
    public function file():BelongsTo{
        return $this->belongsTo(UserFile::class);
    }
}