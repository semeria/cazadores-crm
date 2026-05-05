<?php

namespace App\Http\Controllers;

use App\Models\Agent;
use App\Models\User;
use App\Http\Requests\StoreAgentRequest;
use App\Http\Requests\UpdateAgentRequest;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate; // 1. Importamos la clase Gate

class AgentController extends Controller
{
    public function index(Request $request)
    {
        // 2. Usamos Gate::authorize en lugar de $this->authorize
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

        Agent::create($request->validated());

        return redirect()->route('agents.index')->with('success', 'Agente creado correctamente.');
    }

    public function edit(Agent $agent)
    {
        Gate::authorize('update', $agent);

        $supervisors = User::select('id', 'name')->get();

        return Inertia::render('Agents/Edit', [
            'agent' => $agent,
            'supervisors' => $supervisors
        ]);
    }

    public function update(UpdateAgentRequest $request, Agent $agent)
    {
        Gate::authorize('update', $agent);

        $agent->update($request->validated());

        return redirect()->route('agents.index')->with('success', 'Agente actualizado correctamente.');
    }

    public function destroy(Agent $agent)
    {
        Gate::authorize('delete', $agent);

        $agent->delete();

        return redirect()->route('agents.index')->with('success', 'Agente eliminado correctamente.');
    }
}
