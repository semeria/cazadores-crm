<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

class OrganizationSubscription extends Model
{
    protected $fillable = [
        'organization_id',
        'plan_id',
        'coupon_id',
        'requested_by',
        'reviewed_by',
        'status',
        'plan_name',
        'plan_price',
        'currency',
        'interval_count',
        'interval_unit',
        'discount_amount',
        'amount_due',
        'free_months',
        'is_trial',
        'coupon_code',
        'coupon_benefit_type',
        'coupon_benefit_value',
        'requested_at',
        'starts_at',
        'ends_at',
        'grace_ends_at',
        'reviewed_at',
        'review_note',
    ];

    protected function casts(): array
    {
        return [
            'plan_price' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'amount_due' => 'decimal:2',
            'coupon_benefit_value' => 'decimal:2',
            'is_trial' => 'boolean',
            'requested_at' => 'datetime',
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'grace_ends_at' => 'datetime',
            'reviewed_at' => 'datetime',
        ];
    }

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }

    public function coupon()
    {
        return $this->belongsTo(Coupon::class);
    }

    public function requester()
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function payment()
    {
        return $this->hasOne(SubscriptionPayment::class, 'subscription_id');
    }

    public function couponRedemption()
    {
        return $this->hasOne(CouponRedemption::class, 'subscription_id');
    }

    public function effectiveStatus(?Carbon $now = null): string
    {
        if (! in_array($this->status, ['active', 'trialing'], true) || ! $this->ends_at) {
            return $this->status;
        }

        $now ??= Carbon::now();

        if ($this->ends_at->greaterThanOrEqualTo($now)) {
            return $this->status;
        }

        if ($this->grace_ends_at && $this->grace_ends_at->greaterThanOrEqualTo($now)) {
            return 'grace_period';
        }

        return 'expired';
    }
}
