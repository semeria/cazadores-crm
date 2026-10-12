<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrganizationAdminAudit extends Model
{
    protected $fillable = [
        'organization_id',
        'actor_id',
        'action',
        'reason',
        'changes',
    ];

    protected function casts(): array
    {
        return [
            'changes' => 'array',
        ];
    }

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function actor()
    {
        return $this->belongsTo(User::class, 'actor_id');
    }
}
