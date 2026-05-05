<?php

namespace App\Models;

use App\Models\Traits\TenantScoped;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Activity extends Model
{
    use HasFactory, TenantScoped;

    protected $fillable = [
        'assigned_user_id',
        'agent_id',
        'title',
        'description',
        'status',
        'priority',
        'due_date',
        'position',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function assignee()
    {
        return $this->belongsTo(User::class, 'assigned_user_id');
    }

    public function agent()
    {
        return $this->belongsTo(Agent::class);
    }

    public function scopeVisibleToUser($query, $user)
    {
        // Si es owner, no añadimos filtros extra (ya está el TenantScoped de organización)
        if ($user->role === 'owner') {
            return $query;
        }

        // Si es member, solo ve lo que tiene asignado
        return $query->where('assigned_user_id', $user->id);
    }

    public function comments()
    {
        return $this->hasMany(ActivityComment::class)->latest();
    }
}
