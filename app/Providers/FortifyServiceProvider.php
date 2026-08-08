<?php

namespace App\Providers;

use App\Actions\Fortify\CreateNewUser;
use App\Actions\Fortify\ResetUserPassword;
use App\Actions\Fortify\UpdateUserPassword;
use App\Actions\Fortify\UpdateUserProfileInformation;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use App\Actions\Fortify\RedirectIfTwoFactorAuthenticatable;
use Laravel\Fortify\Fortify;
use Inertia\Inertia;
use Laravel\Fortify\Actions\RedirectIfTwoFactorAuthenticatable as FortifyRedirectAction;
use Illuminate\Support\Facades\Route;

class FortifyServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(\Laravel\Fortify\Contracts\LoginResponse::class, \App\Http\Responses\LoginResponse::class);
        $this->app->singleton(\Laravel\Fortify\Contracts\TwoFactorLoginResponse::class, \App\Http\Responses\TwoFactorLoginResponse::class);
        $this->app->singleton(\Laravel\Fortify\Contracts\RegisterResponse::class, \App\Http\Responses\RegisterResponse::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Fortify::createUsersUsing(CreateNewUser::class);
        Fortify::updateUserProfileInformationUsing(UpdateUserProfileInformation::class);
        Fortify::updateUserPasswordsUsing(UpdateUserPassword::class);
        Fortify::resetUserPasswordsUsing(ResetUserPassword::class);
        
        $this->app->singleton(FortifyRedirectAction::class, RedirectIfTwoFactorAuthenticatable::class);

        Fortify::twoFactorChallengeView(function () {
            return Inertia::render('auth/two-factor-challenge');
        });
        Fortify::confirmPasswordView(function () {
            return Inertia::render('auth/confirm-password');
        });
        Fortify::loginView(function (Request $request) {
            if ($request->has('redirect_to')) {
                session()->put('url.intended', $request->input('redirect_to'));
            } elseif ($request->has('return_to')) {
                session()->put('url.intended', $request->input('return_to'));
            } elseif ($request->has('intended')) {
                session()->put('url.intended', $request->input('intended'));
            }

            return Inertia::render('auth/login', [
                'canResetPassword' => Route::has('password.request'),
                'status' => session('status'),
            ]);
        });
        Fortify::registerView(function (Request $request) {
            if ($request->has('redirect_to')) {
                session()->put('url.intended', $request->input('redirect_to'));
            } elseif ($request->has('return_to')) {
                session()->put('url.intended', $request->input('return_to'));
            } elseif ($request->has('intended')) {
                session()->put('url.intended', $request->input('intended'));
            }

            return Inertia::render('auth/register', [
                'status' => session('status'),
            ]);
        });
        Fortify::requestPasswordResetLinkView(function () {
            return Inertia::render('auth/forgot-password');
        });
        Fortify::resetPasswordView(function () {
            return Inertia::render('auth/reset-password');
        });
        Fortify::verifyEmailView(function () {
            return Inertia::render('auth/verify-email');
        });

        RateLimiter::for('login', function (Request $request) {
            $throttleKey = Str::transliterate(Str::lower($request->input(Fortify::username())).'|'.$request->ip());

            return Limit::perMinute(5)->by($throttleKey);
        });

        RateLimiter::for('two-factor', function (Request $request) {
            return Limit::perMinute(5)->by($request->session()->get('login.id'));
        });
    }
}
