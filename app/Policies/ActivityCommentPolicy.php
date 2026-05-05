<?php

namespace App\Policies;

use App\Models\Activity;
use App\Models\ActivityComment;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class ActivityCommentPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return false;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, ActivityComment $activityComment): bool
    {
        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user, Activity $activity): bool
    {
        // El owner puede comentar todo, el member solo si está asignado
        if ($user->role === 'owner') {
            return $user->organization_id === $activity->organization_id;
        }
        return $user->id === $activity->assigned_user_id;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, ActivityComment $activityComment): bool
    {
        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, ActivityComment $comment): bool
    {
        // Solo puedes borrar tu propio comentario y solo si han pasado menos de 30 min
        return $user->id === $comment->user_id && $comment->created_at->diffInMinutes(now()) < 30;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, ActivityComment $activityComment): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, ActivityComment $activityComment): bool
    {
        return false;
    }
}
