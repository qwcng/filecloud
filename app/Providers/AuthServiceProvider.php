<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Auth;
use App\Auth\VersecGuard;
use Laravel\Passport\Passport;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }


  public function boot(): void
{
    // Rejestracja niestandardowej straży
    Auth::extend('versec', function ($app, $name, array $config) {
        // Zwróć instancję Twojej niestandardowej straży
        return new VersecGuard(Auth::createUserProvider($config['provider'])); 
    });
}
}