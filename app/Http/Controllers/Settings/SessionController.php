<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class SessionController extends Controller
{
    public function getActiveSessions()
    {
        $activeSessions = DB::table('sessions')->where('user_id', Auth::id())->get();

        return response()->json($activeSessions);
    }
    public function deleteSession($id)
    {
        $session = DB::table('sessions')->where('id', $id)->delete();
        return response()->json($session);
    }
    
}
