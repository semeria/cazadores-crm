<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Organization extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'status',
        'has_legacy_access',
    ];

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function quoteSettings()
    {
        return $this->hasOne(OrganizationQuoteSetting::class);
    }

    public function quotes()
    {
        return $this->hasMany(Quote::class);
    }

    public function owner()
    {
        return $this->hasOne(User::class)->where('role', User::ROLE_OWNER);
    }

    public function adminAudits()
    {
        return $this->hasMany(OrganizationAdminAudit::class);
    }

    public function subscriptions()
    {
        return $this->hasMany(OrganizationSubscription::class);
    }

    public function currentSubscription()
    {
        return $this->hasOne(OrganizationSubscription::class)
            ->whereIn('status', ['active', 'trialing'])
            ->latestOfMany();
    }

    public function hasLegacyAccess(): bool
    {
        return (bool) $this->has_legacy_access;
    }

    protected function casts(): array
    {
        return [
            'has_legacy_access' => 'boolean',
        ];
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }
}
