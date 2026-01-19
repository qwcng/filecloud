<?php
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\FileController;
use App\Http\Controllers\ShareController;

// Route::get('/favourites', function(){
//     return Inertia::render('Favourites');
// })->name('favourites');
Route::get('/getFavorites', [\App\Http\Controllers\FavouriteController::class, 'getFavorites'])->name('getFavourites');
Route::post('/toggleFavorite/{fileId}', [\App\Http\Controllers\FavouriteController::class, 'toggleFavorite'])->name('toggleFavourite');