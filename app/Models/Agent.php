<?php

namespace App\Models;

use App\Models\Traits\TenantScoped;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Agent extends Model
{

    use HasFactory, TenantScoped;

    protected $fillable = [
        'supervisor_id',
        'name',
        'email',
        'phone',
        'specialty',
        'status',
        'notes',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function supervisor()
    {
        return $this->belongsTo(User::class, 'supervisor_id');
    }
}
