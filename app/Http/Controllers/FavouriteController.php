<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class FavouriteController extends Controller
{
    
    public function toggleFavorite(Request $request, $fileId)
    {
        $file = \App\Models\UserFile::findOrFail($fileId);
        if ($file->user_id !== auth()->id()) {
            abort(403);
        }
        $file->is_favorite = !$file->is_favorite;
        $file->save();
        return response()->json([
            'message' => $file->is_favorite ? 'Plik dodany do ulubionych' : 'Plik usunięty z ulubionych',
            'is_favorite' => $file->is_favorite,
        ]);
    }
    public function getFavorites(Request $request)
    {
        $favouriteFiles = \App\Models\UserFile::where('user_id', $request->user()->id)
            ->where('is_favorite', true)
            ->orderBy('created_at', 'desc')
            ->get(['id', 'original_name', 'path', 'mime_type', 'size', 'created_at']);

        return response()->json(['files' => $favouriteFiles]);
    }
}