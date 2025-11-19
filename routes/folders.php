<?php
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\FileController;
use App\Http\Controllers\FolderController;

Route::post('/createFolder', [FolderController::class, 'createFolder'])->name('createFolder');
// Route::get('/folders', [FileController::class, 'listFolders'])->name('listFolders');
Route::get('/folders/{parent?}',  [FolderController::class, 'listFolders'])->name('listFolders');
Route::delete('/folders/{parent?}', [FolderController::class,'deleteFolder'])->name('deleteFolder');

Route::post('/changeFolderName/{folderId}', [FolderController::class, 'changeFolderName'])->name('changeFolderName');