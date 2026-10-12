<?php

namespace App\Http\Middleware;

use App\Models\Organization;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckUserIsActive
{
    public function handle(Request $request, Closure $next): Response
    {
        // Verificamos si hay un usuario autenticado y si está inactivo
        if (Auth::check() && (! Auth::user()->is_active || $this->organizationIsSuspended())) {

            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            // Redirigimos al login con el mensaje de error para Inertia
            return redirect()->route('login')->with('error', 'Tu cuenta u organización no tiene acceso activo. Contacta al equipo de soporte.');
        }

        return $next($request);
    }

    private function organizationIsSuspended(): bool
    {
        $user = Auth::user();

        return $user->organization_id !== null
            && ! Organization::query()
                ->whereKey($user->organization_id)
                ->where('status', 'active')
                ->exists();
    }
}
