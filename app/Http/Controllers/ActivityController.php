<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreActivityRequest;
use App\Models\Activity;
use App\Models\Agent;
use App\Models\User;
use App\Services\ActivityService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class ActivityController extends Controller
{
    protected ActivityService $activityService;

    public function __construct(ActivityService $activityService)
    {
        $this->activityService = $activityService;
    }
    public function index(Request $request)
    {
        Gate::authorize('viewAny', Activity::class);

        $activities = Activity::query()
            ->visibleToUser($request->user())
            ->with(['assignee:id,name', 'agent:id,name'])
            ->when($request->status, fn($q, $status) => $q->where('status', $status))
            ->when($request->priority, fn($q, $priority) => $q->where('priority', $priority))
            ->when($request->assigned_user_id, fn($q, $uid) => $q->where('assigned_user_id', $uid))
            ->when($request->agent_id, fn($q, $aid) => $q->where('agent_id', $aid))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Activities/Index', [
            'activities' => $activities,
            'filters' => $request->all(),
            'users' => User::select('id', 'name')->get(),
            'agents' => Agent::select('id', 'name')->get(),
        ]);
    }

    public function kanban(Request $request)
    {
        Gate::authorize('viewAny', Activity::class);

        $activities = Activity::with(['assignee:id,name', 'agent:id,name', 'comments.user:id,name'])
            ->visibleToUser($request->user())
            ->orderBy('position')
            ->get()
            ->groupBy('status');

        $columns = [
            'pending' => $activities->get('pending', []),
            'in_progress' => $activities->get('in_progress', []),
            'in_review' => $activities->get('in_review', []),
            'completed' => $activities->get('completed', []),
            'cancelled' => $activities->get('cancelled', []),
        ];

        return Inertia::render('Activities/Kanban', [
            'columns' => $columns,
            // Agregamos usuarios y agentes para el Modal
            'users' => User::select('id', 'name')->get(),
            'agents' => Agent::select('id', 'name')->get(),
        ]);
    }

    public function updatePosition(Request $request)
    {
        Gate::authorize('viewAny', Activity::class);

        $validated = $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|exists:activities,id',
            'items.*.status' => 'required|string',
            'items.*.position' => 'required|integer',
        ]);

        // Delegamos al servicio
        $this->activityService->reorderActivities($validated['items']);

        return response()->json(['success' => true]);
    }

    public function store(StoreActivityRequest $request)
    {
        Gate::authorize('create', Activity::class);

        // Pasamos los datos validados al servicio
        $this->activityService->createActivity($request->validated());

        return redirect()->back()->with('success', 'Actividad creada.');
    }

    public function update(Request $request, Activity $activity)
    {
        Gate::authorize('update', $activity);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|string',
            'priority' => 'required|string',
            'assigned_user_id' => 'nullable|exists:users,id',
            'agent_id' => 'nullable|exists:agents,id',
            'due_date' => 'nullable|date',
        ]);

        $activity->update($validated);

        return redirect()->back()->with('success', 'Actividad actualizada.');
    }

    public function destroy(Activity $activity)
    {
        Gate::authorize('delete', $activity);

        $activity->delete();

        return redirect()->back()->with('success', 'Actividad eliminada.');
    }
}
