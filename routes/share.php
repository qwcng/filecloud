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
Route::post('/updateShareCode', [ShareController::class, 'updateShareCode'])->name('updateShareCode');


// Route::get('/folderShare/{folderId}', [ShareController::class, 'shareFolder'])->name('shareFolder');
Route::get('/folderShare/{folderId}', function ($folderId) {
    return Inertia::render('SharedFolder', ['folderId' => $folderId]);
})->name('shareFolderPage');
Route::post('/folderShare/{folderId}/share', [ShareController::class, 'shareFolder'])->name('createFolderShare');
Route::post('/folderShare/{folderId}/check', [ShareController::class, 'getSharedFilesFromFolder'])->name('checkFolderAccessCode');
Route::get('/folderShare/{folderId}/show', [ShareController::class, 'showSharedFolder'])->name('showSharedFolder');
Route::get('/getSharedFolders', [ShareController::class, 'getSharedFolders']);