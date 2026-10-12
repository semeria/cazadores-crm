<?php

namespace App\Http\Middleware;

use App\Models\Organization;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasOrganization
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user() || $request->user()->isSuperAdmin() || ! $request->user()->organization_id) {
            // Si no tiene organización, podríamos redirigirlo a una vista de "Crear Organización"
            // Por ahora, devolvemos un 403 Forbidden
            abort(403, 'Debes pertenecer a una organización para acceder a esta área.');
        }

        $isActive = Organization::query()
            ->whereKey($request->user()->organization_id)
            ->where('status', 'active')
            ->exists();

        if (! $isActive) {
            abort(403, 'La organización está suspendida. Contacta al equipo de soporte.');
        }

        return $next($request);
    }
}
