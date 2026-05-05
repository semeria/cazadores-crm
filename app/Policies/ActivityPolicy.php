<?php

namespace App\Policies;

use App\Models\Activity;
use App\Models\User;

class ActivityPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->organization_id !== null;
    }

    public function view(User $user, Activity $activity): bool
    {
        if ($user->role === 'owner') {
            return $user->organization_id === $activity->organization_id;
        }

        return $user->id === $activity->assigned_user_id;
    }

    public function create(User $user): bool
    {
        // Solo el owner puede crear actividades en este flujo (o podrías permitir a miembros crear las suyas)
        return $user->role === 'owner';
    }

    public function update(User $user, Activity $activity): bool
    {
        if ($user->role === 'owner') {
            return $user->organization_id === $activity->organization_id;
        }

        // El member solo puede editar sus propias actividades
        return $user->id === $activity->assigned_user_id;
    }

    public function delete(User $user, Activity $activity): bool
    {
        // Solo el owner puede borrar
        return $user->role === 'owner' && $user->organization_id === $activity->organization_id;
    }
}
