<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        // Si el usuario no está logueado o su rol no está en el arreglo de roles permitidos, lo bloqueamos
        if (! $request->user() || ! in_array($request->user()->role, $roles)) {
            abort(403, 'Acceso denegado. No tienes el perfil requerido para esta sección.');
        }

        return $next($request);
    }
}
