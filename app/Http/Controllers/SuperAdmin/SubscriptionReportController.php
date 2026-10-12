<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\OrganizationSubscription;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class SubscriptionReportController extends Controller
{
    public function index(Request $request)
    {
        $filters = $this->validatedFilters($request);
        $query = $this->subscriptionQuery($filters);

        $paidQuery = clone $query;
        $paidQuery->whereHas('payment', fn ($payment) => $payment
            ->where('status', 'approved')
            ->where('amount', '>', 0));

        $summary = [
            'subscriptions' => (clone $query)->count(),
            'paid_count' => (clone $paidQuery)->count(),
            'paid_amount' => (clone $paidQuery)
                ->withSum(['payment as approved_amount' => fn ($payment) => $payment
                    ->where('status', 'approved')
                    ->where('amount', '>', 0)], 'amount')
                ->get()
                ->sum('approved_amount'),
            'coupon_count' => (clone $query)->whereHas('couponRedemption', fn ($redemption) => $redemption
                ->whereIn('status', ['reserved', 'redeemed']))->count(),
            'trial_count' => (clone $query)->where('is_trial', true)->count(),
        ];

        $subscriptions = $query
            ->with([
                'organization:id,name,slug',
                'organization.owner:id,organization_id,name,email',
                'payment:id,subscription_id,status,provider,amount,currency,reviewed_by,reviewed_at',
                'payment.reviewer:id,name',
                'couponRedemption:id,subscription_id,code,status,discount_amount,free_months,is_trial,redeemed_at',
            ])
            ->latest('requested_at')
            ->paginate(25)
            ->withQueryString();

        $now = now();
        $subscriptions->getCollection()->each(fn (OrganizationSubscription $subscription) => $subscription->setAttribute('effective_status', $subscription->effectiveStatus($now)));

        return Inertia::render('SuperAdmin/Subscriptions/Index', [
            'subscriptions' => $subscriptions,
            'filters' => $filters,
            'summary' => $summary,
        ]);
    }

    public function export(Request $request)
    {
        $query = $this->subscriptionQuery($this->validatedFilters($request))
            ->with([
                'organization:id,name,slug',
                'organization.owner:id,organization_id,name,email',
                'payment:id,subscription_id,status,provider,amount,currency,reviewed_at',
                'couponRedemption:id,subscription_id,code,status,discount_amount,free_months,is_trial,redeemed_at',
            ]);

        $fileName = 'suscripciones-'.now()->format('Ymd-His').'.csv';

        return response()->streamDownload(function () use ($query): void {
            $output = fopen('php://output', 'w');
            fwrite($output, "\xEF\xBB\xBF");
            fputcsv($output, [
                'Organización',
                'Slug',
                'Owner',
                'Correo owner',
                'Plan',
                'Estado',
                'Precio lista MXN',
                'Descuento MXN',
                'Importe solicitado MXN',
                'Pago',
                'Método',
                'Cupón',
                'Prueba',
                'Meses gratis',
                'Fecha de solicitud',
                'Inicio',
                'Fin',
                'Fin de gracia',
                'Pago revisado',
            ]);

            $query->chunkById(500, function ($subscriptions) use ($output): void {
                foreach ($subscriptions as $subscription) {
                    $row = [
                        $subscription->organization?->name,
                        $subscription->organization?->slug,
                        $subscription->organization?->owner?->name,
                        $subscription->organization?->owner?->email,
                        $subscription->plan_name,
                        $subscription->effectiveStatus(),
                        $subscription->plan_price,
                        $subscription->discount_amount,
                        $subscription->amount_due,
                        $subscription->payment?->status ?? 'sin pago',
                        $subscription->payment?->provider,
                        $subscription->coupon_code,
                        $subscription->is_trial ? 'Sí' : 'No',
                        $subscription->free_months,
                        $subscription->requested_at?->toDateTimeString(),
                        $subscription->starts_at?->toDateTimeString(),
                        $subscription->ends_at?->toDateTimeString(),
                        $subscription->grace_ends_at?->toDateTimeString(),
                        $subscription->payment?->reviewed_at?->toDateTimeString(),
                    ];

                    fputcsv($output, array_map(
                        fn ($value) => is_string($value) ? $this->safeCsvCell($value) : $value,
                        $row,
                    ));
                }
            }, 'organization_subscriptions.id');

            fclose($output);
        }, $fileName, ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    private function validatedFilters(Request $request): array
    {
        return $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'type' => ['nullable', 'in:paid,with_coupon,trial'],
            'status' => ['nullable', 'in:pending_payment,active,trialing,grace_period,expired,rejected,cancelled'],
            'payment_status' => ['nullable', 'in:pending,approved,rejected,cancelled,none'],
            'coupon_code' => ['nullable', 'string', 'max:64'],
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date', 'after_or_equal:from'],
        ]);
    }

    private function subscriptionQuery(array $filters): Builder
    {
        $now = now();

        return OrganizationSubscription::query()
            ->select('organization_subscriptions.*')
            ->when($filters['search'] ?? null, fn ($query, $search) => $query->whereHas('organization', fn ($organization) => $organization
                ->where('name', 'like', "%{$search}%")
                ->orWhere('slug', 'like', "%{$search}%")
                ->orWhereHas('owner', fn ($owner) => $owner
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%"))))
            ->when($filters['type'] ?? null, function ($query, $type) {
                if ($type === 'paid') {
                    $query->whereHas('payment', fn ($payment) => $payment
                        ->where('status', 'approved')
                        ->where('amount', '>', 0));
                } elseif ($type === 'with_coupon') {
                    $query->whereHas('couponRedemption', fn ($redemption) => $redemption
                        ->whereIn('status', ['reserved', 'redeemed']));
                } else {
                    $query->where('is_trial', true);
                }
            })
            ->when($filters['status'] ?? null, function ($query, $status) use ($now): void {
                if ($status === 'grace_period') {
                    $query->whereIn('status', ['active', 'trialing'])
                        ->where('ends_at', '<', $now)
                        ->where('grace_ends_at', '>=', $now);
                } elseif ($status === 'expired') {
                    $query->whereIn('status', ['active', 'trialing'])
                        ->where('grace_ends_at', '<', $now);
                } elseif (in_array($status, ['active', 'trialing'], true)) {
                    $query->where('status', $status)->where('ends_at', '>=', $now);
                } else {
                    $query->where('status', $status);
                }
            })
            ->when($filters['payment_status'] ?? null, function ($query, $status): void {
                if ($status === 'none') {
                    $query->whereDoesntHave('payment');
                } else {
                    $query->whereHas('payment', fn ($payment) => $payment->where('status', $status));
                }
            })
            ->when($filters['coupon_code'] ?? null, fn ($query, $code) => $query
                ->where('coupon_code', Str::upper(trim($code))))
            ->when($filters['from'] ?? null, fn ($query, $from) => $query->whereDate('requested_at', '>=', $from))
            ->when($filters['to'] ?? null, fn ($query, $to) => $query->whereDate('requested_at', '<=', $to));
    }

    private function safeCsvCell(string $value): string
    {
        return preg_match('/^[\t\r\n ]*[=+\-@]/u', $value) === 1 ? "'".$value : $value;
    }
}
