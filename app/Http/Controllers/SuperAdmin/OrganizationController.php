<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Organization;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class OrganizationController extends Controller
{
    public function index(Request $request)
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'in:active,suspended'],
        ]);

        $organizations = Organization::query()
            ->with(['owner:id,organization_id,name,email'])
            ->withCount('users')
            ->when($filters['search'] ?? null, fn ($query, $search) => $query->where(function ($subquery) use ($search) {
                $subquery->where('name', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%")
                    ->orWhereHas('owner', fn ($owner) => $owner->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%"));
            }))
            ->when($filters['status'] ?? null, fn ($query, $status) => $query->where('status', $status))
            ->orderByDesc('created_at')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('SuperAdmin/Organizations/Index', [
            'organizations' => $organizations,
            'filters' => $filters,
            'summary' => [
                'total' => Organization::count(),
                'active' => Organization::where('status', 'active')->count(),
                'suspended' => Organization::where('status', 'suspended')->count(),
            ],
        ]);
    }

    public function show(Organization $organization)
    {
        $organization->load([
            'owner:id,organization_id,name,email,phone,is_active',
            'adminAudits' => fn ($query) => $query->with('actor:id,name,email')->latest()->limit(20),
        ])->loadCount('users');

        return Inertia::render('SuperAdmin/Organizations/Show', [
            'organization' => $organization,
        ]);
    }

    public function update(Request $request, Organization $organization)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $before = ['name' => $organization->name];

        DB::transaction(function () use ($request, $organization, $data, $before): void {
            $organization->update($data);
            $organization->adminAudits()->create([
                'actor_id' => $request->user()->id,
                'action' => 'updated',
                'changes' => ['name' => ['from' => $before['name'], 'to' => $data['name']]],
            ]);
        });

        return back()->with('success', 'Organización actualizada correctamente.');
    }

    public function suspend(Request $request, Organization $organization)
    {
        $data = $request->validate([
            'reason' => ['required', 'string', 'max:1000'],
        ]);

        if ($organization->isActive()) {
            DB::transaction(function () use ($request, $organization, $data): void {
                $organization->update(['status' => 'suspended']);
                $organization->adminAudits()->create([
                    'actor_id' => $request->user()->id,
                    'action' => 'suspended',
                    'reason' => $data['reason'],
                ]);
            });
        }

        return back()->with('success', 'Organización suspendida. Sus datos se conservaron.');
    }

    public function reactivate(Request $request, Organization $organization)
    {
        if (! $organization->isActive()) {
            DB::transaction(function () use ($request, $organization): void {
                $organization->update(['status' => 'active']);
                $organization->adminAudits()->create([
                    'actor_id' => $request->user()->id,
                    'action' => 'reactivated',
                ]);
            });
        }

        return back()->with('success', 'Organización reactivada correctamente.');
    }
}
