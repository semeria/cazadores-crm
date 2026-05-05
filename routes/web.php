<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AgentController;
use App\Http\Controllers\ActivityController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MemberController;
use App\Http\Controllers\CommentController;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::middleware('guest')->group(function () {
    Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
    Route::post('/register', [AuthController::class, 'register']);

    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);
});

Route::middleware('auth')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::resource('agents', AgentController::class);

    Route::get('/activities', [ActivityController::class, 'index'])->name('activities.index');
    Route::get('/activities/kanban', [ActivityController::class, 'kanban'])->name('activities.kanban');
    Route::post('/activities', [ActivityController::class, 'store'])->name('activities.store');
    Route::put('/activities/reorder', [ActivityController::class, 'updatePosition'])->name('activities.reorder');

    Route::put('/activities/{activity}', [ActivityController::class, 'update'])->name('activities.update');
    Route::delete('/activities/{activity}', [ActivityController::class, 'destroy'])->name('activities.destroy');

    Route::resource('members', MemberController::class)->only(['index', 'store', 'update']);
    Route::post('members/{member}/reset-password', [MemberController::class, 'resetPassword'])->name('members.reset-password');

    Route::post('/activities/{activity}/comments', [CommentController::class, 'store'])->name('comments.store');

    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
});
