<?php

namespace App\Services;

use App\Models\Organization;
use App\Models\OrganizationSubscription;
use Illuminate\Support\Carbon;

class SubscriptionAccessService
{
    public const GRACE_DAYS = 2;

    public function canAccess(Organization $organization): bool
    {
        return $organization->hasLegacyAccess()
            || $this->currentStatus($organization)['has_access'];
    }

    /** @return array{status: string, has_access: bool, subscription: ?OrganizationSubscription} */
    public function currentStatus(Organization $organization): array
    {
        if ($organization->hasLegacyAccess()) {
            return ['status' => 'legacy', 'has_access' => true, 'subscription' => null];
        }

        $subscription = OrganizationSubscription::query()
            ->where('organization_id', $organization->id)
            ->whereIn('status', ['active', 'trialing'])
            ->whereNotNull('ends_at')
            ->latest('ends_at')
            ->first();

        if (! $subscription) {
            $pending = OrganizationSubscription::query()
                ->where('organization_id', $organization->id)
                ->where('status', 'pending_payment')
                ->latest('requested_at')
                ->first();

            return [
                'status' => $pending ? 'pending_payment' : 'no_subscription',
                'has_access' => false,
                'subscription' => $pending,
            ];
        }

        $now = Carbon::now();
        if ($subscription->ends_at->greaterThanOrEqualTo($now)) {
            return [
                'status' => $subscription->is_trial ? 'trialing' : 'active',
                'has_access' => true,
                'subscription' => $subscription,
            ];
        }

        if ($subscription->grace_ends_at && $subscription->grace_ends_at->greaterThanOrEqualTo($now)) {
            return ['status' => 'grace_period', 'has_access' => true, 'subscription' => $subscription];
        }

        return ['status' => 'expired', 'has_access' => false, 'subscription' => $subscription];
    }
}
