<?php

namespace App\Http\Controllers;

use App\Models\OrganizationSubscription;
use App\Models\Plan;
use App\Models\PlatformBillingSetting;
use App\Services\SubscriptionAccessService;
use App\Services\SubscriptionService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SubscriptionController extends Controller
{
    public function index(Request $request, SubscriptionAccessService $access)
    {
        $organization = $request->user()->organization;

        return Inertia::render('Subscription/Index', [
            'plans' => Plan::query()->where('is_active', true)->orderBy('price')->get(),
            'legacyAccess' => $organization->hasLegacyAccess(),
            'access' => $access->currentStatus($organization),
            'subscriptions' => OrganizationSubscription::query()
                ->where('organization_id', $organization->id)
                ->with(['payment:id,subscription_id,status,amount,currency,review_note', 'couponRedemption:id,subscription_id,code,status,free_months,is_trial'])
                ->latest('requested_at')
                ->limit(10)
                ->get(),
            'transferInstructions' => PlatformBillingSetting::query()->value('transfer_instructions'),
            'canRequest' => $request->user()->isOwner(),
        ]);
    }

    public function request(Request $request, SubscriptionService $subscriptions)
    {
        abort_unless($request->user()->isOwner(), 403);

        $data = $request->validate([
            'plan_id' => ['required', 'integer', 'exists:plans,id'],
            'coupon_code' => ['nullable', 'string', 'max:64'],
        ]);

        $subscription = $subscriptions->requestPlan(
            $request->user(),
            (int) $data['plan_id'],
            $data['coupon_code'] ?? null,
        );

        if ($subscription->is_trial) {
            return redirect()->route('dashboard')->with('success', 'Prueba activada. Ya puedes usar el CRM.');
        }

        if ((float) $subscription->amount_due === 0.0) {
            return back()->with('success', 'La solicitud no tiene importe pendiente. Espera la activación manual del Superadministrador.');
        }

        return back()->with('success', 'Solicitud registrada. Realiza la transferencia y espera la aprobación del Superadministrador.');
    }

    public function cancel(Request $request, OrganizationSubscription $subscription, SubscriptionService $subscriptions)
    {
        abort_unless($request->user()->isOwner(), 403);
        $subscriptions->cancelRequest($subscription, $request->user());

        return back()->with('success', 'Solicitud cancelada.');
    }
}
