<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IsOwner
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, $model, $param): Response
    {
        $modelClass = 'App\\Models\\'.ucfirst("UserFile");
        $modelId=$request->route($param);
        
        $model = $modelClass::findOrFail($modelId);
        if($model->user_id !== $request->user()->id){
            abort(403, 'Unauthorized action.');
        }
        abort(603, 'Unauthorized action.');
        // return $next($request);
    }
}