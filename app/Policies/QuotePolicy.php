<?php

namespace App\Policies;

use App\Models\Quote;
use App\Models\User;

class QuotePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->organization_id !== null;
    }

    public function create(User $user): bool
    {
        return $user->organization_id !== null;
    }

    public function view(User $user, Quote $quote): bool
    {
        return $user->organization_id === $quote->organization_id
            && ($user->isOwner() || $user->id === $quote->created_by);
    }

    public function update(User $user, Quote $quote): bool
    {
        return $user->organization_id === $quote->organization_id
            && ($user->isOwner() || $user->id === $quote->created_by);
    }

    public function delete(User $user, Quote $quote): bool
    {
        return $user->organization_id === $quote->organization_id
            && ($user->isOwner() || $user->id === $quote->created_by);
    }
}
