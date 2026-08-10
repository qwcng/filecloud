<?php

use App\Http\Controllers\FileController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;

// Route::middleware('auth:api')->get('/user', function (Request $request) {
//     return [
//         'id'    => $request->user()->id,
//         'name'  => $request->user()->name,
//         'email' => $request->user()->email,
//     ];
// });
Route::middleware('auth:api')->group(function () {
    Route::get('/user', function (Request $request) {
    return [
        'id'    => $request->user()->id,
        'name'  => $request->user()->name,
        'email' => $request->user()->email,
    ];});
    Route::post('/weather/save',[FileController::class,'createFile']);
    


});