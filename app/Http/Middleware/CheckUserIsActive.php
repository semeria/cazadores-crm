<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckUserIsActive
{
    public function handle(Request $request, Closure $next): Response
    {
        // Verificamos si hay un usuario autenticado y si está inactivo
        if (Auth::check() && !Auth::user()->is_active) {

            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            // Redirigimos al login con el mensaje de error para Inertia
            return redirect()->route('login')->with('error', 'Tu cuenta ha sido desactivada. Por favor, contacta a tu administrador.');
        }

        return $next($request);
    }
}
