<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\FileController;
use App\Http\Controllers\FolderController;
use App\Models\SharedFile;
use Illuminate\Support\Facades\Cache;

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
    Route::get('/pathTo/{folderId?}', [FileController::class, 'pathTo']) -> name('pathTo');
    Route::get('/d/{file}', [FileController::class, 'downloadFile'])->name('downloadFile');

    // Wyświetlenie pliku (np. obraz, audio, wideo)
    Route::get('/showFile/{file}', [FileController::class, 'showFile'])
        ->name('showFile')
        ->withTrashed();
    Route::get('/showThumbnail/{file}', [FileController::class, 'showThumbnail'])
        ->name('showThumbnail');

    // Wyświetlenie pliku tekstowego
    Route::get('/textFile/{fileId}', [FileController::class, 'showTextFile'])
        ->name('textFile');

    Route::get('/search/{query}', [FileController::class, 'searchFiles'])->name('searchFiles');
   
   
});

// Publiczny dostęp do udostępnionego pliku przez kod

Route::get('/getFileByType/{type}', [FileController::class, 'filesByType'])->name('getAllImages');

Route::get('/sharedFile', function(){
 Inertia::render('SharedFile');
});
// Dodatkowe pliki konfiguracyjne
Route::get('/word',function(){
    return Inertia::render('Word');
});


Route::get('/type/{type?}', function(){    
    return Inertia::render("Type");})->name('files.byType');
Route::get('/polygon/{fileId?}',function($fileId){    
    return Inertia::render("Polygon",['defaultUrl' => $fileId]);})->name('files.byPolygon');


Route::get('/edit/{fileId}', [FileController::class, 'editFile'])->name('editFile');
Route::post('/edit/{fileId}/save', [FileController::class, 'saveEditedFile'])->name('saveEditedFile');
Route::post('/changeFileName/{fileId}', [FileController::class, 'changeFileName'])->name('changeFileName');
Route::get('/test123', function(){
    // Cache::store('redis')->put('route', 'rout'.time().'x', 3600); 
    return Inertia::render('Test');
});
Route::get('/home', function(){
    return Inertia::render('Home');
})->name('homePage');
Route::post('/createFile', [FileController::class, 'createFile'])->name('createFile');
Route::get('/trash', function(){
    return Inertia::render('Trash');
});
Route::get('/getTrashFiles', [FileController::class, 'showTrash'])->name('getTrashFiles');
Route::post('/restoreFile/{fileId}', [FileController::class, 'restoreFile'])->name('restoreFile');
Route::delete('/pernamentlyDeleteFile/{fileId}', [FileController::class, 'permanentlyDeleteFile'])->name('deleteForever');
Route::get('/downloadFolder/{folderId}', [FolderController::class,'downloadFolder']);


require __DIR__.'/oauth.php';
require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/folders.php';
require __DIR__.'/share.php';
require __DIR__.'/favourite.php';