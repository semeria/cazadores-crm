<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTeamMemberRequest;
use App\Http\Requests\UpdateTeamMemberRequest;
use App\Models\Agent;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;

class TeamController extends Controller
{
    public function index(Request $request)
    {
        Gate::authorize('viewAny', User::class);

        $filters = $request->validate([
            'search' => 'nullable|string|max:255',
            'role' => ['nullable', 'string', 'in:member,agent'],
        ]);

        $users = User::query()
            ->where('organization_id', $request->user()->organization_id)
            ->whereIn('role', [User::ROLE_MEMBER, User::ROLE_AGENT])
            ->with(['manager' => fn ($query) => $query
                ->where('organization_id', $request->user()->organization_id)
                ->select('id', 'name')])
            ->when($filters['role'] ?? null, fn ($query, $role) => $query->where('role', $role))
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where(fn ($subquery) => $subquery
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%"));
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $agentProfiles = Agent::query()
            ->whereIn('email', $users->getCollection()->pluck('email'))
            ->get()
            ->keyBy('email');

        $users->getCollection()->transform(function (User $user) use ($agentProfiles) {
            $profile = $user->isAgent() ? $agentProfiles->get($user->email) : null;

            return [
                ...$user->only(['id', 'name', 'email', 'phone', 'role', 'is_active', 'position', 'manager_id']),
                'manager' => $user->manager,
                'agent_profile' => $profile ? $profile->only(['specialty', 'status', 'notes']) : null,
            ];
        });

        return Inertia::render('Team/Index', [
            'teamMembers' => $users,
            'filters' => $filters,
            'managers' => User::query()
                ->where('organization_id', $request->user()->organization_id)
                ->whereIn('role', [User::ROLE_OWNER, User::ROLE_MEMBER])
                ->where('is_active', true)
                ->select('id', 'name', 'role')
                ->orderBy('name')
                ->get(),
        ]);
    }

    public function store(StoreTeamMemberRequest $request)
    {
        Gate::authorize('create', User::class);

        $data = $request->validated();
        $temporaryPassword = Str::password(12, true, true, true, false);

        DB::transaction(function () use ($request, $data, $temporaryPassword): void {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'phone' => $data['phone'],
                'password' => Hash::make($temporaryPassword),
                'organization_id' => $request->user()->organization_id,
                'role' => $data['role'],
                'is_active' => $data['is_active'] ?? true,
                'position' => $data['specialty'] ?? $data['position'] ?? null,
                'manager_id' => $data['role'] === User::ROLE_AGENT ? ($data['manager_id'] ?? null) : null,
            ]);

            if ($user->isAgent()) {
                $this->syncAgentProfile($user, $data, $data['manager_id'] ?? null);
            }
        });

        return redirect()->route('team.index')->with([
            'success' => 'Usuario creado correctamente.',
            'temp_password' => $temporaryPassword,
        ]);
    }

    public function update(UpdateTeamMemberRequest $request, User $teamMember)
    {
        Gate::authorize('update', $teamMember);

        $data = $request->validated();
        $oldEmail = $teamMember->email;
        $profile = Agent::query()->where('email', $oldEmail)->first();

        DB::transaction(function () use ($teamMember, $data, $profile): void {
            $teamMember->update([
                'name' => $data['name'],
                'email' => $data['email'],
                'phone' => $data['phone'],
                'role' => $data['role'],
                'is_active' => $data['is_active'],
                'position' => $data['specialty'] ?? $data['position'] ?? null,
                'manager_id' => $data['role'] === User::ROLE_AGENT ? ($data['manager_id'] ?? null) : null,
            ]);

            if ($data['role'] === User::ROLE_AGENT) {
                $this->syncAgentProfile($teamMember, $data, $data['manager_id'] ?? null, $profile);
            } elseif ($profile) {
                $profile->update(['status' => 'inactive']);
            }
        });

        return redirect()->route('team.index')->with('success', 'Usuario actualizado correctamente.');
    }

    public function resetPassword(Request $request, User $teamMember)
    {
        abort_unless(
            $teamMember->organization_id === $request->user()->organization_id
                && $teamMember->id !== $request->user()->id
                && in_array($teamMember->role, [User::ROLE_MEMBER, User::ROLE_AGENT], true),
            403,
        );

        Gate::authorize('update', $teamMember);

        $temporaryPassword = Str::password(12, true, true, true, false);
        $teamMember->update(['password' => Hash::make($temporaryPassword)]);

        return redirect()->route('team.index')->with([
            'success' => 'Contraseña restablecida correctamente.',
            'temp_password' => $temporaryPassword,
        ]);
    }

    private function syncAgentProfile(User $user, array $data, ?int $supervisorId, ?Agent $profile = null): void
    {
        $attributes = [
            'organization_id' => $user->organization_id,
            'supervisor_id' => $supervisorId,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'specialty' => $data['specialty'] ?? null,
            'status' => $data['agent_status'] ?? 'active',
            'notes' => $data['notes'] ?? null,
        ];

        if ($profile) {
            $profile->update($attributes);

            return;
        }

        Agent::create($attributes);
    }
}
