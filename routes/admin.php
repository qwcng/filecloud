<?php
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\FileController;
use App\Http\Controllers\ShareController;
use App\Http\Middleware\CheckFolderAccess;
Route::get('/privacy', function () {
    return Inertia::render('admin/PrivacyPolicy');
});