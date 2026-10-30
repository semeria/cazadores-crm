<?php

use App\Http\Controllers\ActivityController;
use App\Http\Controllers\AgentController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MemberController;
use App\Http\Controllers\QuoteController;
use App\Http\Controllers\QuoteSettingsController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\SuperAdmin\BillingSettingsController;
use App\Http\Controllers\SuperAdmin\CouponController;
use App\Http\Controllers\SuperAdmin\OrganizationController as SuperAdminOrganizationController;
use App\Http\Controllers\SuperAdmin\PlanController;
use App\Http\Controllers\SuperAdmin\SubscriptionPaymentController;
use App\Http\Controllers\SuperAdmin\SubscriptionReportController;
use App\Http\Controllers\TeamController;
use Illuminate\Support\Facades\Route;

// Redirección base
Route::get('/', function () {
    return redirect()->route('login');
});

// Rutas Públicas / Invitados
Route::middleware('guest')->group(function () {
    Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
    Route::post('/register', [AuthController::class, 'register']);

    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);
});

// Rutas Autenticadas
Route::middleware('auth')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    Route::middleware('super-admin')->prefix('super-admin')->name('super-admin.')->group(function () {
        Route::get('/organizations', [SuperAdminOrganizationController::class, 'index'])->name('organizations.index');
        Route::get('/organizations/{organization}', [SuperAdminOrganizationController::class, 'show'])->name('organizations.show');
        Route::put('/organizations/{organization}', [SuperAdminOrganizationController::class, 'update'])->name('organizations.update');
        Route::post('/organizations/{organization}/suspend', [SuperAdminOrganizationController::class, 'suspend'])->name('organizations.suspend');
        Route::post('/organizations/{organization}/reactivate', [SuperAdminOrganizationController::class, 'reactivate'])->name('organizations.reactivate');

        Route::get('/plans', [PlanController::class, 'index'])->name('plans.index');
        Route::post('/plans', [PlanController::class, 'store'])->name('plans.store');
        Route::put('/plans/{plan}', [PlanController::class, 'update'])->name('plans.update');
        Route::patch('/plans/{plan}/active', [PlanController::class, 'setActive'])->name('plans.active');

        Route::get('/coupons', [CouponController::class, 'index'])->name('coupons.index');
        Route::post('/coupons', [CouponController::class, 'store'])->name('coupons.store');
        Route::put('/coupons/{coupon}', [CouponController::class, 'update'])->name('coupons.update');
        Route::patch('/coupons/{coupon}/active', [CouponController::class, 'setActive'])->name('coupons.active');

        Route::get('/payments', [SubscriptionPaymentController::class, 'index'])->name('payments.index');
        Route::post('/payments/{payment}/approve', [SubscriptionPaymentController::class, 'approve'])->name('payments.approve');
        Route::post('/payments/{payment}/reject', [SubscriptionPaymentController::class, 'reject'])->name('payments.reject');

        Route::get('/subscriptions', [SubscriptionReportController::class, 'index'])->name('subscriptions.index');
        Route::get('/subscriptions/export', [SubscriptionReportController::class, 'export'])->name('subscriptions.export');

        Route::get('/settings', [BillingSettingsController::class, 'edit'])->name('settings.edit');
        Route::put('/settings', [BillingSettingsController::class, 'update'])->name('settings.update');
    });

    Route::middleware('organization')->group(function () {

        Route::get('/subscription', [SubscriptionController::class, 'index'])->name('subscription.index');
        Route::post('/subscription/request', [SubscriptionController::class, 'request'])->name('subscription.request');
        Route::post('/subscription/{subscription}/cancel', [SubscriptionController::class, 'cancel'])->name('subscription.cancel');

        Route::middleware('subscription')->group(function () {

            Route::get('/clients/search', [ClientController::class, 'search'])->name('clients.search');
            Route::get('/quotes', [QuoteController::class, 'index'])->name('quotes.index');
            Route::get('/quotes/create', [QuoteController::class, 'create'])->name('quotes.create');
            Route::post('/quotes', [QuoteController::class, 'store'])->name('quotes.store');
            Route::get('/quotes/organization-logo', [QuoteSettingsController::class, 'logo'])->name('quotes.organization-logo');
            Route::get('/quotes/{quote}/pdf/preview', [QuoteController::class, 'pdfPreview'])->name('quotes.pdf.preview');
            Route::get('/quotes/{quote}/pdf', [QuoteController::class, 'pdf'])->name('quotes.pdf');
            Route::middleware('role:owner')->group(function () {
                Route::get('/quotes/settings', [QuoteSettingsController::class, 'edit'])->name('quotes.settings.edit');
                Route::put('/quotes/settings', [QuoteSettingsController::class, 'update'])->name('quotes.settings.update');
            });
            Route::get('/quotes/{quote}/edit', [QuoteController::class, 'edit'])->name('quotes.edit');
            Route::put('/quotes/{quote}', [QuoteController::class, 'update'])->name('quotes.update');
            Route::delete('/quotes/{quote}', [QuoteController::class, 'destroy'])->name('quotes.destroy');
            Route::get('/quotes/{quote}', [QuoteController::class, 'show'])->name('quotes.show');

            // ==========================================
            // BURBUJA DIRECTIVA (Solo Owner y Member)
            // ==========================================
            Route::middleware(['role:owner,member'])->group(function () {

                Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

                // Gestión de Equipo y Agentes
                Route::resource('members', MemberController::class)->only(['index', 'store', 'update']);
                Route::post('members/{member}/reset-password', [MemberController::class, 'resetPassword'])->name('members.reset-password');
                Route::resource('agents', AgentController::class);

                Route::middleware(['role:owner'])->group(function () {
                    Route::get('/team', [TeamController::class, 'index'])->name('team.index');
                    Route::post('/team', [TeamController::class, 'store'])->name('team.store');
                    Route::put('/team/{teamMember}', [TeamController::class, 'update'])->name('team.update');
                    Route::post('/team/{teamMember}/reset-password', [TeamController::class, 'resetPassword'])->name('team.reset-password');
                });

                // Gestión Global de Actividades
                Route::get('/activities', [ActivityController::class, 'index'])->name('activities.index');
                Route::get('/activities/kanban', [ActivityController::class, 'kanban'])->name('activities.kanban');
                Route::post('/activities', [ActivityController::class, 'store'])->name('activities.store');
                Route::put('/activities/reorder', [ActivityController::class, 'updatePosition'])->name('activities.reorder');
                Route::put('/activities/{activity}', [ActivityController::class, 'update'])->name('activities.update');
                Route::delete('/activities/{activity}', [ActivityController::class, 'destroy'])->name('activities.destroy');

                // Comentarios
                Route::post('/activities/{activity}/comments', [CommentController::class, 'store'])->name('comments.store');
            });

            // ==========================================
            // BURBUJA OPERATIVA (Solo Agentes)
            // ==========================================
            Route::middleware(['role:agent'])->prefix('agent')->group(function () {

                Route::get('/', fn () => redirect()->route('agent.kanban'));

                Route::get('/kanban', [ActivityController::class, 'kanban'])->name('agent.kanban');
                Route::get('/activities', [ActivityController::class, 'index'])->name('activities.index');

                // Operaciones limitadas para el agente
                Route::post('/activities', [ActivityController::class, 'store']);
                Route::put('/activities/{activity}', [ActivityController::class, 'update']);
                Route::put('/activities/reorder', [ActivityController::class, 'updatePosition']);

                // Si el agente puede comentar, descomenta esta línea:
                // Route::post('/activities/{activity}/comments', [CommentController::class, 'store']);
            });

        });

    });
});
