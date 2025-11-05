<?php
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\FileController;
Route::post('/createFolder', [FileController::class, 'createFolder'])->name('createFolder');
// Route::get('/folders', [FileController::class, 'listFolders'])->name('listFolders');
Route::get('/folders/{parent?}',  [FileController::class, 'listFolders'])->name('listFolders');
Route::delete('/folders/{parent?}', [FileController::class,'deleteFolder'])->name('deleteFolder');
Route::get('/pathTo/{folderId?}', [FileController::class, 'pathTo']) -> name('pathTo');