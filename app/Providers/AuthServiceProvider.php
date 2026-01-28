<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Auth;
use App\Auth\VersecGuard;
use Laravel\Passport\Passport;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Laravel\Passport\Http\Responses\AuthorizationViewResponse;
use App\Http\Responses\PassportAuthResponse;
use Laravel\Passport\Contracts\AuthorizationViewResponse as AuthorizationViewResponseContract;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
        $this->app->bind(
            AuthorizationViewResponseContract::class, 
            PassportAuthResponse::class
        );
    }


  public function boot(): void
{

        Passport::ignoreRoutes(); // Wyłączamy auto-ładowanie...
        Passport::cookie('versec_session');
        // $this->app->bind(AuthorizationViewResponse::class, PassportAuthResponse::class);

    // Passport::routes();
    // Passport::ignoreRoutes();
    // Rejestracja niestandardowej straży
    // Passport::routes();
    // Auth::extend('versec', function ($app, $name, array $config) {
    //     // Zwróć instancję Twojej niestandardowej straży
    //     return new VersecGuard(Auth::createUserProvider($config['provider'])); 
    // });
}
}