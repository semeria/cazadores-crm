<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Http\Requests\StoreMemberRequest;
use App\Http\Requests\UpdateMemberRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;

class MemberController extends Controller
{
    public function index(Request $request)
    {
        Gate::authorize('viewAny', User::class);

        // Filtramos manualmente por organización (evita scopes globales en User que rompan Auth)
        $members = User::where('organization_id', $request->user()->organization_id)
            ->where('id', '!=', $request->user()->id) // Excluir al owner actual
            ->latest()
            ->paginate(10);

        return Inertia::render('Members/Index', [
            'members' => $members
        ]);
    }

    public function store(StoreMemberRequest $request)
    {
        Gate::authorize('create', User::class);

        $password = Str::random(10); // Generamos password temporal

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => Hash::make($password),
            'organization_id' => $request->user()->organization_id,
            'role' => 'member',
            'position' => $request->position,
            'is_active' => true,
        ]);

        return redirect()->back()->with('success', "Miembro creado. Contraseña temporal: {$password}");
    }

    public function update(UpdateMemberRequest $request, User $member)
    {
        Gate::authorize('update', $member);
        $member->update($request->validated());
        return redirect()->back()->with('success', 'Miembro actualizado correctamente.');
    }

    // Nuevo método para resetear contraseña
    public function resetPassword(Request $request, User $member)
    {
        Gate::authorize('update', $member);

        $newPassword = Str::random(10);
        $member->update(['password' => Hash::make($newPassword)]);

        return redirect()->back()->with('success', "Contraseña reseteada. Nueva contraseña: {$newPassword}");
    }
}
