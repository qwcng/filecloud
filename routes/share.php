<?php
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\FileController;
Route::get('/share/{fileId}', [FileController::class, 'shareFile'])->name('shareFile');
Route::post('/share/{fileId}/check', [FileController::class, 'checkAccessCode'])->name('checkAccessCode');
Route::get('/share/{fileId}/show', [FileController::class, 'showSharedFile'])->name('showSharedFile');

Route::get('/share/{fileId}/download', [FileController::class, 'downloadSharedFile'])
    ->name('downloadSharedFile');