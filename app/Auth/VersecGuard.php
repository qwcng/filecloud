<?php

namespace App\Auth;

use Illuminate\Contracts\Auth\Guard;
use Illuminate\Contracts\Auth\UserProvider;
use Illuminate\Contracts\Auth\Authenticatable;

class VersecGuard implements Guard
{
    protected $provider;
    protected $user;

    public function __construct(UserProvider $provider)
    {
        $this->provider = $provider;
    }

    public function user()
    {
        if ($this->user) {
            return $this->user;
        }

        $token = request()->cookie('krzysiek_session');

        if (!$token) {
            return null;
        }

        $user = $this->provider->retrieveById($token);
        $this->user = $user;

        return $this->user;
    }

    public function check()
    {
        return $this->user() !== null;
    }

    public function id()
    {
        return $this->user() ? $this->user()->getAuthIdentifier() : null;
    }

    public function validate(array $credentials = [])
    {
        return false;
    }

    public function setUser(Authenticatable $user)
    {
        $this->user = $user;
        return $this;
    }

    public function guest()
    {
        return !$this->check();
    }

    public function hasUser()
    {
        return $this->check();
    }
}