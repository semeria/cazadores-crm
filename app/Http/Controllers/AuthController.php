<?php

namespace App\Http\Controllers;

use App\Models\Organization;
use App\Models\PlatformBillingSetting;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;

class AuthController extends Controller
{
    public function showRegister()
    {
        return Inertia::render('Auth/Register', [
            'registrationsEnabled' => PlatformBillingSetting::registrationsEnabled(),
        ]);
    }

    public function register(Request $request)
    {
        if (! PlatformBillingSetting::registrationsEnabled()) {
            return back()->withErrors([
                'registration' => 'El registro de organizaciones está desactivado temporalmente. Contacta al administrador.',
            ]);
        }

        // 1. Validaciones actualizadas
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'phone' => 'required|string|max:20',
            'organization_name' => 'required|string|max:255', // Nuevo campo obligatorio
            'password' => 'required|string|min:8|confirmed',
        ]);

        // 2. Transacción para asegurar integridad
        $user = DB::transaction(function () use ($validated) {

            // Crear la Organización primero
            $org = Organization::create([
                'name' => $validated['organization_name'],
                // Generamos un slug único (útil si después quieres urls como app.com/acme-corp)
                'slug' => Str::slug($validated['organization_name']).'-'.Str::random(6),
                'has_legacy_access' => false,
            ]);

            // Crear el Usuario Owner ligado a la Organización
            return User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'password' => Hash::make($validated['password']),
                'organization_id' => $org->id,
                'role' => 'owner', // Forzamos el rol
                'is_active' => true,
            ]);
        });

        // 3. Autenticar y redirigir
        Auth::login($user);

        return redirect()->route('dashboard');
    }

    public function showLogin()
    {
        return Inertia::render('Auth/Login', [
            'registrationsEnabled' => PlatformBillingSetting::registrationsEnabled(),
        ]);
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $remember = $request->boolean('remember');

        if (Auth::attempt($credentials, $remember)) {
            $authUser = Auth::user();

            if (! $authUser->is_active || ($authUser->organization_id !== null && ! $authUser->organization?->isActive())) {
                Auth::logout();

                return back()->withErrors([
                    'email' => 'Tu cuenta u organización no tiene acceso activo. Contacta al equipo de soporte.',
                ]);
            }

            $request->session()->regenerate();

            if ($authUser->isSuperAdmin()) {
                return redirect()->route('super-admin.organizations.index');
            }

            if ($authUser->isAgent()) {
                return redirect()->intended('/agent/kanban');
            }

            return redirect()->route('dashboard');
        }

        return back()->withErrors([
            'email' => 'Las credenciales no coinciden con nuestros registros.',
        ]);
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }
}
