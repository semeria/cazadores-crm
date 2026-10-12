<?php

use App\Http\Middleware\CheckRole;
use App\Http\Middleware\CheckSuperAdmin;
use App\Http\Middleware\CheckUserIsActive;
use App\Http\Middleware\EnsureSubscriptionAccess;
use App\Http\Middleware\EnsureUserHasOrganization;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        if (env('TRUSTED_PROXIES')) {
            $middleware->trustProxies(at: env('TRUSTED_PROXIES'));
        }

        $middleware->web(append: [
            HandleInertiaRequests::class,
            CheckUserIsActive::class,

        ]);

        $middleware->alias([
            'organization' => EnsureUserHasOrganization::class,
            'role' => CheckRole::class,
            'super-admin' => CheckSuperAdmin::class,
            'subscription' => EnsureSubscriptionAccess::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
