<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', Carbon::now()->endOfMonth()->toDateString());

        // 1. Query base respetando la visibilidad por rol (Scope del Bloque 3)
        $query = Activity::query()
            ->visibleToUser($user)
            ->whereDate('created_at', '>=', $startDate)
            ->whereDate('created_at', '<=', $endDate);

        // 2. KPIs (Contar por status automáticamente respetando el filtro del scope)
        $statusCounts = (clone $query)
            ->select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->get()
            ->pluck('total', 'status');

        $kpis = [
            'total'       => $statusCounts->sum(),
            'pending'     => $statusCounts->get('pending', 0),
            'in_progress' => $statusCounts->get('in_progress', 0),
            'in_review'   => $statusCounts->get('in_review', 0),
            'completed'   => $statusCounts->get('completed', 0),
            'overdue'     => Activity::visibleToUser($user)
                ->where('due_date', '<', Carbon::now()->toDateString())
                ->whereIn('status', ['pending', 'in_progress', 'in_review'])
                ->count(),
        ];

        // 3. Datos exclusivos para el Owner (Gráficos)
        $charts = [];
        if ($user->role === 'owner') {
            $charts['byUser'] = Activity::query() // Query global de la org
            ->whereNotNull('assigned_user_id')
                ->whereDate('created_at', '>=', $startDate)
                ->whereDate('created_at', '<=', $endDate)
                ->select('assigned_user_id', DB::raw('count(*) as total'))
                ->groupBy('assigned_user_id')
                ->with('assignee:id,name')
                ->get()
                ->map(fn($item) => ['name' => $item->assignee->name, 'total' => $item->total]);
        }

        // 4. Actividades próximas (Respetando visibilidad)
        $upcoming = Activity::visibleToUser($user)
            ->with(['assignee:id,name'])
            ->whereIn('status', ['pending', 'in_progress'])
            ->whereNotNull('due_date')
            ->orderBy('due_date', 'asc')
            ->take(5)
            ->get();

        return Inertia::render('Dashboard', [
            'kpis'      => $kpis,
            'charts'    => $charts,
            'upcoming'  => $upcoming,
            'filters'   => ['start_date' => $startDate, 'end_date' => $endDate],
            'role'      => $user->role
        ]);
    }
}
