<?php
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\FileController;
use App\Models\SharedFile;
use Illuminate\Support\Facades\Cache;
use App\Http\Controllers\oauthGoogleController;
Route::get('auth/google', [oauthGoogleController::class, 'redirectToGoogle']);
Route::get('auth/google/callback', [oauthGoogleController::class, 'handleGoogleCallback']);