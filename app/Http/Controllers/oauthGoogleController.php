<?php

namespace App\Http\Controllers;
use Laravel\Socialite\Facades\Socialite;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class oauthGoogleController extends Controller
{
    //
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->redirect();
    }

    // Obsługa odpowiedzi z Google
    public function handleGoogleCallback()
    {
        $googleUser = Socialite::driver('google')->user();

        // Znajdź lub stwórz użytkownika w bazie
        $user = User::updateOrCreate([
            'email' => $googleUser->email,
        ], [
            'name' => $googleUser->name,
            'google_id' => $googleUser->id,
            'password' => bcrypt(Str::random(16)), // Hasło nie będzie używane, ale jest wymagane w bazie
        ]);

        Auth::login($user);

        return redirect('/dashboard');
    }
}