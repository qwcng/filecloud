<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\FileController;
use App\Models\SharedFile;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

// Dashboard i pliki tylko dla zalogowanych
Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
    Route::get('dashboard/{file}', function () {
        return Inertia::render('dashboard');
    })->name('dashboard.files');
    // Route::get('dashboard/:id', function () {
    //     return Inertia::render('dashboard');
    // })->name('dashboard');


    Route::get('addFile', function () {
        return Inertia::render('AddFile');
    })->name('addFile');

    // Upload pliku
    Route::post('/uploadFile', [FileController::class, 'uploadFile'])->name('uploadFile');

    // Lista plików użytkownika
    Route::get('/files', [FileController::class, 'index'])->name('files.index');
    Route::get('/files/{folder}', [FileController::class, 'folder'])->name('files.folder');

    Route::delete('/files/{file}', [FileController::class, 'deleteFile'])->name('files.delete');
    Route::patch('/files/{file}/move', [FileController::class, 'moveFile'])->name('files.move');

    Route::get('/d/{file}', [FileController::class, 'downloadFile'])->name('downloadFile');

    // Wyświetlenie pliku (np. obraz, audio, wideo)
    Route::get('/showFile/{file}', [FileController::class, 'showFile'])
        ->name('showFile');

    // Wyświetlenie pliku tekstowego
    Route::get('/textFile/{fileId}', [FileController::class, 'showTextFile'])
        ->name('textFile');

    // Udostępnianie pliku
    Route::post('/filesShare/{file}', [FileController::class, 'createShare'])->name('files.share');
    Route::delete('/filesShare/{file}', [FileController::class, 'removeShare'])->name('files.removeShare');
});

// Publiczny dostęp do udostępnionego pliku przez kod
Route::get('/share/{fileId}', [FileController::class, 'shareFile'])->name('shareFile');
Route::post('/share/{fileId}/check', [FileController::class, 'checkAccessCode'])->name('checkAccessCode');
Route::get('/share/{fileId}/show', [FileController::class, 'showSharedFile'])->name('showSharedFile');

Route::get('/share/{fileId}/download', [FileController::class, 'downloadSharedFile'])
    ->name('downloadSharedFile');
Route::post('/createFolder', [FileController::class, 'createFolder'])->name('createFolder');
// Route::get('/folders', [FileController::class, 'listFolders'])->name('listFolders');
Route::get('/folders/{parent?}',  [FileController::class, 'listFolders'])->name('listFolders');
Route::get('/pathTo/{folderId?}', [FileController::class, 'pathTo']) -> name('pathTo');



Route::get('/sharedFile', function(){
 Inertia::render('SharedFile');
});
// Dodatkowe pliki konfiguracyjne
Route::get('/word',function(){
    return Inertia::render('Word');
});
Route::get('/edit/{fileId}', [FileController::class, 'editFile'])->name('editFile');
Route::post('/edit/{fileId}/save', [FileController::class, 'saveEditedFile'])->name('saveEditedFile');
require __DIR__.'/settings.php';
require __DIR__.'/auth.php';