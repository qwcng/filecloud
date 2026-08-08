<?php

namespace App\Http\Responses;

use Inertia\Inertia;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;

class LoginResponse implements LoginResponseContract
{
    /**
     * Create an HTTP response that represents the object.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function toResponse($request)
    {
        $home = config('fortify.home', '/dashboard');
        $target = session()->pull('url.intended', $home);

        if ($request->wantsJson()) {
            return response()->json(['two_factor' => false]);
        }

        // Jeśli to żądanie z Inertia i przekierowanie wskazuje na OAuth lub inny cel niebędący domyślnym dashboardem,
        // używamy Inertia::location(), aby wymusić pełne przeładowanie okna przeglądarki na docelowy URL (np. /oauth/authorize).
        if ($request->header('X-Inertia')) {
            if ($target !== $home && $target !== '/dashboard' && $target !== url('/dashboard')) {
                return Inertia::location($target);
            }
        }

        return redirect()->intended($target);
    }
}
