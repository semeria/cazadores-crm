<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class CouponController extends Controller
{
    public function index()
    {
        return Inertia::render('SuperAdmin/Coupons/Index', [
            'coupons' => Coupon::query()->withCount([
                'redemptions as used_count' => fn ($query) => $query->where('status', 'redeemed'),
                'redemptions as reserved_count' => fn ($query) => $query->where('status', 'reserved'),
            ])->latest()->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validatedCoupon($request);
        $data['code'] = Str::upper(trim($data['code']));
        $data['is_active'] = true;
        $data['max_per_organization'] = 1;
        Coupon::create($data);

        return back()->with('success', 'Cupón creado correctamente.');
    }

    public function update(Request $request, Coupon $coupon)
    {
        $data = $this->validatedCoupon($request, $coupon);
        $data['code'] = Str::upper(trim($data['code']));
        $data['max_per_organization'] = 1;
        $coupon->update($data);

        return back()->with('success', 'Cupón actualizado. Las redenciones existentes conservan sus datos.');
    }

    public function setActive(Request $request, Coupon $coupon)
    {
        $data = $request->validate(['is_active' => ['required', 'boolean']]);
        $coupon->update(['is_active' => $data['is_active']]);

        return back()->with('success', $coupon->is_active ? 'Cupón activado.' : 'Cupón desactivado.');
    }

    private function validatedCoupon(Request $request, ?Coupon $coupon = null): array
    {
        $request->merge(['code' => Str::upper(trim((string) $request->input('code')))]);
        $type = $request->input('benefit_type');
        $trial = $request->boolean('is_trial');

        if ($trial && $type !== 'free_months') {
            throw ValidationException::withMessages(['is_trial' => 'Una prueba debe otorgar meses gratis.']);
        }

        $benefitRules = match ($type) {
            'percentage' => ['required', 'numeric', 'gt:0', 'lte:100'],
            'fixed' => ['required', 'numeric', 'gt:0', 'max:99999999.99'],
            'free_months' => ['required', 'integer', 'between:1,12'],
            default => ['required', 'numeric'],
        };

        $data = $request->validate([
            'code' => ['required', 'string', 'max:64', Rule::unique('coupons', 'code')->ignore($coupon?->id)],
            'name' => ['required', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:2000'],
            'benefit_type' => ['required', Rule::in(['percentage', 'fixed', 'free_months'])],
            'benefit_value' => $benefitRules,
            'is_trial' => ['required', 'boolean'],
            'starts_at' => ['nullable', 'date'],
            'expires_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'max_redemptions' => ['nullable', 'integer', 'min:1'],
        ]);

        return $data;
    }
}
