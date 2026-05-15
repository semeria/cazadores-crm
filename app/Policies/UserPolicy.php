<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    // Solo el owner puede ver la lista de miembros
    public function viewAny(User $user): bool
    {
        return $user->isOwner() || $user->isMember();
    }

    // El owner solo puede ver/editar miembros de su propia organización
    public function view(User $user, User $model): bool
    {
        return $user->role === 'owner' && $user->organization_id === $model->organization_id;
    }

    public function create(User $user): bool
    {
        return $user->role === 'owner';
    }

    public function update(User $currentUser, User $targetUser): bool
    {
        if ($currentUser->isOwner()) {
            return $currentUser->organization_id === $targetUser->organization_id;
        }

        // El Member solo puede editar al usuario si este es SU agente asignado
        if ($currentUser->isMember()) {
            return $targetUser->manager_id === $currentUser->id;
        }

        return false;
    }
}
