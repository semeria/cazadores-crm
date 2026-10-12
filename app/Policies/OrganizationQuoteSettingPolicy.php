<?php

namespace App\Policies;

use App\Models\OrganizationQuoteSetting;
use App\Models\User;

class OrganizationQuoteSettingPolicy
{
    public function view(User $user, OrganizationQuoteSetting $settings): bool
    {
        return $user->organization_id === $settings->organization_id;
    }

    public function viewLogo(User $user, OrganizationQuoteSetting $settings): bool
    {
        return $this->view($user, $settings);
    }

    public function update(User $user, OrganizationQuoteSetting $settings): bool
    {
        return $user->isOwner() && $user->organization_id === $settings->organization_id;
    }
}
