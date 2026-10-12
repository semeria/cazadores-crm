<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\SubscriptionPayment;
use App\Services\SubscriptionService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SubscriptionPaymentController extends Controller
{
    public function index(Request $request)
    {
        $filters = $request->validate([
            'status' => ['nullable', 'in:pending,approved,rejected,cancelled'],
        ]);

        return Inertia::render('SuperAdmin/Payments/Index', [
            'payments' => SubscriptionPayment::query()
                ->with(['organization:id,name,slug', 'subscription:id,plan_name,plan_price,amount_due,currency,interval_count,interval_unit,status,coupon_code', 'reviewer:id,name'])
                ->when($filters['status'] ?? null, fn ($query, $status) => $query->where('status', $status))
                ->orderByRaw("CASE WHEN status = 'pending' THEN 0 ELSE 1 END")
                ->latest()
                ->paginate(20)
                ->withQueryString(),
            'filters' => $filters,
        ]);
    }

    public function approve(Request $request, SubscriptionPayment $payment, SubscriptionService $subscriptions)
    {
        $data = $request->validate(['review_note' => ['nullable', 'string', 'max:1000']]);
        $subscriptions->approvePayment($payment, $request->user(), $data['review_note'] ?? null);

        return back()->with('success', 'Pago aprobado y suscripción activada.');
    }

    public function reject(Request $request, SubscriptionPayment $payment, SubscriptionService $subscriptions)
    {
        $data = $request->validate(['review_note' => ['required', 'string', 'max:1000']]);
        $subscriptions->rejectPayment($payment, $request->user(), $data['review_note']);

        return back()->with('success', 'Pago rechazado. El owner podrá enviar una nueva solicitud.');
    }
}
