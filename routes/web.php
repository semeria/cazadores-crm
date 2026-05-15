<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AgentController;
use App\Http\Controllers\ActivityController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MemberController;
use App\Http\Controllers\CommentController;

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

    // ==========================================
    // BURBUJA DIRECTIVA (Solo Owner y Member)
    // ==========================================
    Route::middleware(['role:owner,member'])->group(function () {

        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

        // Gestión de Equipo y Agentes
        Route::resource('members', MemberController::class)->only(['index', 'store', 'update']);
        Route::post('members/{member}/reset-password', [MemberController::class, 'resetPassword'])->name('members.reset-password');
        Route::resource('agents', AgentController::class);

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

        Route::get('/', fn() => redirect()->route('agent.kanban'));

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
