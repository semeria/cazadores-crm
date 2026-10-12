<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SubscriptionPayment extends Model
{
    protected $fillable = [
        'subscription_id',
        'organization_id',
        'reviewed_by',
        'provider',
        'status',
        'amount',
        'currency',
        'reviewed_at',
        'review_note',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'reviewed_at' => 'datetime',
        ];
    }

    public function subscription()
    {
        return $this->belongsTo(OrganizationSubscription::class, 'subscription_id');
    }

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
