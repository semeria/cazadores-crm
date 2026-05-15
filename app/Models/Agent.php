<?php

namespace App\Models;

use App\Models\Traits\TenantScoped;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class Agent extends Model
{

    use HasFactory, TenantScoped;

    protected $fillable = [
        'user_id',
        'supervisor_id',
        'name',
        'email',
        'phone',
        'specialty',
        'status',
        'notes',
    ];

    public function user()
    {
        // Esto le dice a Laravel que busque el user_id en la tabla agents
        // y lo relacione con el id de la tabla users.
        return $this->belongsTo(User::class);
    }

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function supervisor()
    {
        return $this->belongsTo(User::class, 'supervisor_id');
    }
}
