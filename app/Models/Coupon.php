<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    protected $fillable = [
        'code',
        'name',
        'description',
        'benefit_type',
        'benefit_value',
        'is_trial',
        'starts_at',
        'expires_at',
        'max_redemptions',
        'max_per_organization',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'benefit_value' => 'decimal:2',
            'is_trial' => 'boolean',
            'is_active' => 'boolean',
            'starts_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    public function redemptions()
    {
        return $this->hasMany(CouponRedemption::class);
    }
}
