<?php

namespace App\Http\Responses;

use Illuminate\Http\Request;
use Laravel\Passport\Contracts\AuthorizationViewResponse;

class PassportAuthResponse implements AuthorizationViewResponse
{
    /**
     * Parametry przekazane przez Passport.
     */
    protected array $parameters = [];

    /**
     * Metoda musi dokładnie pasować do interfejsu (array $parameters = [], return static)
     */
    public function withParameters(array $parameters = []): static
    {
        $this->parameters = $parameters;
        
        return $this;
    }

    /**
     * Renderowanie widoku.
     */
   public function toResponse($request)
{
    // Passport v13 wrzuca authToken do tablicy $this->parameters
    // Musimy upewnić się, że trafia on do widoku pod nazwą 'authToken'
    return view('vendor.passport.authorize', $this->parameters);
}
}