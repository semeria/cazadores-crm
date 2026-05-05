<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    // Solo el owner puede ver la lista de miembros
    public function viewAny(User $user): bool
    {
        return $user->role === 'owner';
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

    public function update(User $user, User $model): bool
    {
        // No permitimos que un owner se edite a sí mismo desde este módulo (tendría su propio perfil)
        return $user->role === 'owner'
            && $user->organization_id === $model->organization_id
            && $user->id !== $model->id;
    }
}
