<?php
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\FileController;
use App\Http\Controllers\ShareController;

Route::get('/share/{fileId}', [ShareController::class, 'shareFile'])->name('shareFile');
Route::post('/share/{fileId}/check', [ShareController::class, 'checkAccessCode'])->name('checkAccessCode');
Route::get('/share/{fileId}/show', [ShareController::class, 'showSharedFile'])->name('showSharedFile');
Route::get('/sharedFiles', function(){
    return Inertia::render('SharedFile');
});
Route::get('/share/{fileId}/download', [ShareController::class, 'downloadSharedFile'])->name('downloadSharedFile');
Route::post('/filesShare/{file}', [ShareController::class, 'createShare'])->name('share');
Route::delete('/filesShare/{file}', [ShareController::class, 'removeShare'])->name('removeShare');
Route::get('/getSharedFiles', [ShareController::class, 'getSharedFiles'])->name('sharedFiles');
Route::post('/revokeSharedFile', [ShareController::class, 'revokeSharedFile'])->name('revokeSharedFile');