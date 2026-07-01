<?php

use App\Http\Controllers\Settings\SessionController;
use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('settings.profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('settings.profile.update');
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('settings.profile.destroy');

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('settings.password.edit');

    Route::put('settings/password', [PasswordController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('settings.password.update');

    Route::get('settings/appearance', function () {
        return Inertia::render('settings/appearance');
    })->name('settings.appearance.edit');

    Route::get('settings/two-factor', function () {
        return Inertia::render('settings/two-factor');
    })->name('settings.two-factor.edit');

    Route::get('settings/sessions', function () {
        return Inertia::render('settings/sessions');
    })->name('settings.sessions.edit');

    Route::get('/auth/getActiveSessions', [SessionController::class, 'getActiveSessions']);
    Route::delete('/auth/deleteSession/{id}', [SessionController::class, 'deleteSession']);

});
