<?php

namespace App\Http\Controllers;

use App\Models\Agent;
use App\Models\User;
use App\Http\Requests\StoreAgentRequest;
use App\Http\Requests\UpdateAgentRequest;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AgentController extends Controller
{
    public function index(Request $request)
    {
        Gate::authorize('viewAny', Agent::class);

        $search = $request->input('search');
        $status = $request->input('status');

        $agents = Agent::query()
            ->with('supervisor:id,name')
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('specialty', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Agents/Index', [
            'agents' => $agents,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function create()
    {
        Gate::authorize('create', Agent::class);

        $supervisors = User::select('id', 'name')->get();

        return Inertia::render('Agents/Create', [
            'supervisors' => $supervisors
        ]);
    }

    public function store(StoreAgentRequest $request)
    {
        Gate::authorize('create', Agent::class);

        $tempPassword = Str::password(12, true, true, true, false);

        $data = $request->validated();

        $agentUser = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'],
            'password' => Hash::make($tempPassword),
            'role' => User::ROLE_AGENT,
            'organization_id' => auth()->user()->organization_id,
            'manager_id' => $data['supervisor_id'] ?? auth()->id(), // Usamos supervisor_id de tu form
            'is_active' => $data['status'] === 'active',
        ]);


        Agent::create($data);

        return redirect()->route('agents.index')->with([
            'success' => 'Agente creado y acceso al sistema habilitado correctamente.',
            'temp_password' => $tempPassword
        ]);
    }

    public function edit(Agent $agent)
    {
        Gate::authorize('update', $agent);

        $agent->load('user');
        $supervisors = User::select('id', 'name')->get();

        return Inertia::render('Agents/Edit', [
            'agent' => $agent,
            'supervisors' => $supervisors
        ]);
    }

    public function update(UpdateAgentRequest $request, Agent $agent)
    {
        Gate::authorize('update', $agent);

        $data = $request->validated();

        // 1. Buscamos al Usuario (acceso al sistema) usando el correo ORIGINAL del agente
        $user = User::where('email', $agent->email)->first();

        // 2. Si el usuario existe, le actualizamos sus datos de acceso
        if ($user) {
            $user->update([
                'name' => $data['name'],
                'email' => $data['email'], // Se actualiza si el directivo lo cambió
                'manager_id' => $data['supervisor_id'] ?? auth()->id(),
                'is_active' => $data['status'] === 'active',
                'position' => $data['specialty'] ?? null,
            ]);
        }

        // 3. Actualizamos los datos del Agente de forma normal
        $agent->update($data);

        return redirect()->route('agents.index')->with('success', 'Agente actualizado correctamente.');
    }

    public function destroy(Agent $agent)
    {
        Gate::authorize('delete', $agent);

        $agent->delete();

        return redirect()->route('agents.index')->with('success', 'Agente eliminado correctamente.');
    }
}
