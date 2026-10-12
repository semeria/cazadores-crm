<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class PlanController extends Controller
{
    public function index()
    {
        return Inertia::render('SuperAdmin/Plans/Index', [
            'plans' => Plan::query()->withCount('subscriptions')->orderBy('price')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validatedPlan($request);
        $data['slug'] = $this->uniqueSlug($data['name']);
        $data['currency'] = 'MXN';
        $data['is_active'] = true;

        Plan::create($data);

        return back()->with('success', 'Plan creado correctamente.');
    }

    public function update(Request $request, Plan $plan)
    {
        $data = $this->validatedPlan($request);
        $data['slug'] = $this->uniqueSlug($data['name'], $plan->id);
        $data['currency'] = 'MXN';

        $plan->update($data);

        return back()->with('success', 'Plan actualizado. Las suscripciones existentes conservan su precio y periodo originales.');
    }

    public function setActive(Request $request, Plan $plan)
    {
        $data = $request->validate(['is_active' => ['required', 'boolean']]);
        $plan->update(['is_active' => $data['is_active']]);

        return back()->with('success', $plan->is_active ? 'Plan publicado.' : 'Plan archivado.');
    }

    private function validatedPlan(Request $request): array
    {
        $unit = $request->input('interval_unit');
        $allowedCount = $unit === 'year' ? 1 : 30;

        return $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:2000'],
            'price' => ['required', 'numeric', 'gt:0', 'max:99999999.99'],
            'interval_unit' => ['required', Rule::in(['day', 'year'])],
            'interval_count' => ['required', 'integer', Rule::in([$allowedCount])],
        ]);
    }

    private function uniqueSlug(string $name, ?int $exceptId = null): string
    {
        $base = Str::slug($name) ?: 'plan';
        $slug = $base;
        $suffix = 2;

        while (Plan::query()->where('slug', $slug)->when($exceptId, fn ($query) => $query->where('id', '!=', $exceptId))->exists()) {
            $slug = $base.'-'.$suffix++;
        }

        return $slug;
    }
}
