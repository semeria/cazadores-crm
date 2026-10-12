<?php

namespace App\Http\Middleware;

use App\Services\SubscriptionAccessService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSubscriptionAccess
{
    public function __construct(private SubscriptionAccessService $access) {}

    public function handle(Request $request, Closure $next): Response
    {
        $organization = $request->user()?->organization;

        if (! $organization || ! $this->access->canAccess($organization)) {
            return redirect()->route('subscription.index')->with('error', 'El acceso al CRM requiere una suscripción activa.');
        }

        return $next($request);
    }
}
