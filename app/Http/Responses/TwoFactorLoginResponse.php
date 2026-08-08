<?php

namespace App\Http\Responses;

use Inertia\Inertia;
use Laravel\Fortify\Contracts\TwoFactorLoginResponse as TwoFactorLoginResponseContract;

class TwoFactorLoginResponse implements TwoFactorLoginResponseContract
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

        if ($request->header('X-Inertia')) {
            if ($target !== $home && $target !== '/dashboard' && $target !== url('/dashboard')) {
                return Inertia::location($target);
            }
        }

        return redirect()->intended($target);
    }
}
