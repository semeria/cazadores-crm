<?php

namespace App\Services;

use App\Models\Coupon;
use App\Models\CouponRedemption;
use App\Models\Organization;
use App\Models\OrganizationSubscription;
use App\Models\Plan;
use App\Models\SubscriptionPayment;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SubscriptionService
{
    public function requestPlan(User $user, int $planId, ?string $couponCode = null): OrganizationSubscription
    {
        return DB::transaction(function () use ($user, $planId, $couponCode): OrganizationSubscription {
            $organization = Organization::query()->whereKey($user->organization_id)->lockForUpdate()->firstOrFail();

            if (! $organization->isActive()) {
                throw ValidationException::withMessages(['plan_id' => 'La organización no tiene acceso activo.']);
            }

            $hasPendingRequest = OrganizationSubscription::query()
                ->where('organization_id', $organization->id)
                ->where('status', 'pending_payment')
                ->exists();

            if ($hasPendingRequest) {
                throw ValidationException::withMessages(['plan_id' => 'Ya existe una solicitud de suscripción pendiente.']);
            }

            $plan = Plan::query()->where('is_active', true)->lockForUpdate()->find($planId);
            if (! $plan) {
                throw ValidationException::withMessages(['plan_id' => 'El plan seleccionado no está disponible.']);
            }

            $now = Carbon::now();
            $priceCents = $this->toCents($plan->price);
            $discountCents = 0;
            $freeMonths = 0;
            $coupon = null;

            if ($couponCode !== null && trim($couponCode) !== '') {
                $coupon = Coupon::query()->where('code', mb_strtoupper(trim($couponCode)))->lockForUpdate()->first();
                $this->assertCouponAvailable($coupon, $organization, $now);

                if ($coupon->benefit_type === 'percentage') {
                    $discountCents = (int) round($priceCents * ((float) $coupon->benefit_value / 100));
                } elseif ($coupon->benefit_type === 'fixed') {
                    $discountCents = min($priceCents, $this->toCents($coupon->benefit_value));
                } else {
                    $freeMonths = (int) $coupon->benefit_value;
                }
            }

            $isTrial = (bool) ($coupon?->is_trial);
            if ($isTrial && OrganizationSubscription::query()
                ->where('organization_id', $organization->id)
                ->whereIn('status', ['active', 'trialing'])
                ->where('ends_at', '>=', $now)
                ->exists()) {
                throw ValidationException::withMessages(['coupon_code' => 'La organización ya tiene una suscripción vigente y no puede iniciar otra prueba.']);
            }

            $amountDueCents = $isTrial ? 0 : max(0, $priceCents - $discountCents);
            $subscription = OrganizationSubscription::create([
                'organization_id' => $organization->id,
                'plan_id' => $plan->id,
                'coupon_id' => $coupon?->id,
                'requested_by' => $user->id,
                'status' => $isTrial ? 'trialing' : 'pending_payment',
                'plan_name' => $plan->name,
                'plan_price' => $plan->price,
                'currency' => 'MXN',
                'interval_count' => $plan->interval_count,
                'interval_unit' => $plan->interval_unit,
                'discount_amount' => $this->fromCents($discountCents),
                'amount_due' => $this->fromCents($amountDueCents),
                'free_months' => $freeMonths,
                'is_trial' => $isTrial,
                'coupon_code' => $coupon?->code,
                'coupon_benefit_type' => $coupon?->benefit_type,
                'coupon_benefit_value' => $coupon?->benefit_value,
                'requested_at' => $now,
                'starts_at' => $isTrial ? $now : null,
                'ends_at' => $isTrial ? $now->copy()->addMonthsNoOverflow($freeMonths) : null,
                'grace_ends_at' => $isTrial ? $now->copy()->addMonthsNoOverflow($freeMonths)->addDays(SubscriptionAccessService::GRACE_DAYS) : null,
            ]);

            if ($coupon) {
                CouponRedemption::create([
                    'coupon_id' => $coupon->id,
                    'organization_id' => $organization->id,
                    'subscription_id' => $subscription->id,
                    'code' => $coupon->code,
                    'status' => $isTrial ? 'redeemed' : 'reserved',
                    'discount_amount' => $this->fromCents($discountCents),
                    'free_months' => $freeMonths,
                    'is_trial' => $isTrial,
                    'redeemed_at' => $isTrial ? $now : null,
                ]);
            }

            if ($isTrial) {
                $organization->update(['has_legacy_access' => false]);
                $organization->adminAudits()->create([
                    'actor_id' => $user->id,
                    'action' => 'subscription_trial_activated',
                    'changes' => ['plan' => $plan->name, 'coupon' => $coupon?->code, 'ends_at' => $subscription->ends_at?->toDateTimeString()],
                ]);
            } else {
                SubscriptionPayment::create([
                    'subscription_id' => $subscription->id,
                    'organization_id' => $organization->id,
                    'provider' => 'manual_transfer',
                    'status' => 'pending',
                    'amount' => $subscription->amount_due,
                    'currency' => 'MXN',
                ]);
            }

            return $subscription;
        });
    }

    public function approvePayment(SubscriptionPayment $payment, User $reviewer, ?string $note = null): OrganizationSubscription
    {
        return DB::transaction(function () use ($payment, $reviewer, $note): OrganizationSubscription {
            $lockedPayment = SubscriptionPayment::query()->lockForUpdate()->findOrFail($payment->id);

            if ($lockedPayment->status !== 'pending') {
                throw ValidationException::withMessages(['payment' => 'Este pago ya fue revisado.']);
            }

            $subscription = OrganizationSubscription::query()->lockForUpdate()->findOrFail($lockedPayment->subscription_id);
            if ($subscription->status !== 'pending_payment') {
                throw ValidationException::withMessages(['payment' => 'La solicitud ya no está pendiente.']);
            }

            $organization = Organization::query()->lockForUpdate()->findOrFail($subscription->organization_id);
            $now = Carbon::now();
            $previousSubscription = OrganizationSubscription::query()
                ->where('organization_id', $organization->id)
                ->whereIn('status', ['active', 'trialing'])
                ->where('id', '!=', $subscription->id)
                ->whereNotNull('ends_at')
                ->latest('ends_at')
                ->first();

            $startsAt = $now;
            if ($previousSubscription?->grace_ends_at?->greaterThanOrEqualTo($now)) {
                $startsAt = $previousSubscription->ends_at;
            }

            $endsAt = $this->addPlanInterval($startsAt, $subscription->interval_count, $subscription->interval_unit);
            if ($subscription->free_months > 0) {
                $endsAt->addMonthsNoOverflow($subscription->free_months);
            }

            $subscription->update([
                'status' => 'active',
                'starts_at' => $startsAt,
                'ends_at' => $endsAt,
                'grace_ends_at' => $endsAt->copy()->addDays(SubscriptionAccessService::GRACE_DAYS),
                'reviewed_by' => $reviewer->id,
                'reviewed_at' => $now,
                'review_note' => $note,
            ]);

            $lockedPayment->update([
                'status' => 'approved',
                'reviewed_by' => $reviewer->id,
                'reviewed_at' => $now,
                'review_note' => $note,
            ]);

            $subscription->couponRedemption()->where('status', 'reserved')->update([
                'status' => 'redeemed',
                'redeemed_at' => $now,
            ]);
            $organization->update(['has_legacy_access' => false]);
            $organization->adminAudits()->create([
                'actor_id' => $reviewer->id,
                'action' => 'subscription_activated',
                'changes' => [
                    'plan' => $subscription->plan_name,
                    'amount' => $subscription->amount_due,
                    'ends_at' => $endsAt->toDateTimeString(),
                ],
            ]);

            return $subscription->fresh();
        });
    }

    public function rejectPayment(SubscriptionPayment $payment, User $reviewer, string $note): void
    {
        DB::transaction(function () use ($payment, $reviewer, $note): void {
            $lockedPayment = SubscriptionPayment::query()->lockForUpdate()->findOrFail($payment->id);
            if ($lockedPayment->status !== 'pending') {
                throw ValidationException::withMessages(['payment' => 'Este pago ya fue revisado.']);
            }

            $subscription = OrganizationSubscription::query()->lockForUpdate()->findOrFail($lockedPayment->subscription_id);
            if ($subscription->status !== 'pending_payment') {
                throw ValidationException::withMessages(['payment' => 'La solicitud ya no está pendiente.']);
            }

            $now = Carbon::now();
            $subscription->update([
                'status' => 'rejected',
                'reviewed_by' => $reviewer->id,
                'reviewed_at' => $now,
                'review_note' => $note,
            ]);
            $lockedPayment->update([
                'status' => 'rejected',
                'reviewed_by' => $reviewer->id,
                'reviewed_at' => $now,
                'review_note' => $note,
            ]);
            $subscription->couponRedemption()->where('status', 'reserved')->update(['status' => 'released']);
            $subscription->organization->adminAudits()->create([
                'actor_id' => $reviewer->id,
                'action' => 'subscription_payment_rejected',
                'reason' => $note,
            ]);
        });
    }

    public function cancelRequest(OrganizationSubscription $subscription, User $user): void
    {
        DB::transaction(function () use ($subscription, $user): void {
            $lockedSubscription = OrganizationSubscription::query()
                ->where('organization_id', $user->organization_id)
                ->lockForUpdate()
                ->findOrFail($subscription->id);

            if ($lockedSubscription->status !== 'pending_payment') {
                throw ValidationException::withMessages(['subscription' => 'Solo se pueden cancelar solicitudes pendientes.']);
            }

            $lockedSubscription->update(['status' => 'cancelled']);
            $lockedSubscription->payment()->where('status', 'pending')->update(['status' => 'cancelled']);
            $lockedSubscription->couponRedemption()->where('status', 'reserved')->update(['status' => 'released']);
        });
    }

    private function assertCouponAvailable(?Coupon $coupon, Organization $organization, Carbon $now): void
    {
        if (! $coupon || ! $coupon->is_active) {
            throw ValidationException::withMessages(['coupon_code' => 'El cupón no existe o está inactivo.']);
        }

        if (($coupon->starts_at && $coupon->starts_at->isFuture()) || ($coupon->expires_at && $coupon->expires_at->isPast())) {
            throw ValidationException::withMessages(['coupon_code' => 'El cupón está fuera de su periodo de vigencia.']);
        }

        $reservedOrRedeemed = $coupon->redemptions()->whereIn('status', ['reserved', 'redeemed']);
        if ($coupon->max_redemptions !== null && (clone $reservedOrRedeemed)->count() >= $coupon->max_redemptions) {
            throw ValidationException::withMessages(['coupon_code' => 'El cupón alcanzó su límite de usos.']);
        }

        if ((clone $reservedOrRedeemed)->where('organization_id', $organization->id)->count() >= $coupon->max_per_organization) {
            throw ValidationException::withMessages(['coupon_code' => 'Esta organización ya utilizó el cupón permitido.']);
        }

        if ($coupon->is_trial && $coupon->benefit_type !== 'free_months') {
            throw ValidationException::withMessages(['coupon_code' => 'La configuración del cupón de prueba no es válida.']);
        }
    }

    private function addPlanInterval(Carbon $date, int $count, string $unit): Carbon
    {
        return $unit === 'year'
            ? $date->copy()->addYearsNoOverflow($count)
            : $date->copy()->addDays($count);
    }

    private function toCents(string|int|float $amount): int
    {
        [$whole, $fraction] = array_pad(explode('.', (string) $amount, 2), 2, '0');

        return ((int) $whole * 100) + (int) str_pad(substr($fraction, 0, 2), 2, '0');
    }

    private function fromCents(int $cents): string
    {
        return number_format($cents / 100, 2, '.', '');
    }
}
