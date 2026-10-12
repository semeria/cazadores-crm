<?php

namespace Database\Seeders;

use App\Models\Organization;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class InitialOrganizationSeeder extends Seeder
{
    public function run(): void
    {
        $organizationName = config('initial_account.organization_name');
        $organizationSlug = config('initial_account.organization_slug');
        $ownerName = config('initial_account.owner_name');
        $ownerEmail = config('initial_account.owner_email');
        $ownerPhone = config('initial_account.owner_phone');
        $ownerPassword = config('initial_account.owner_password');

        if (! is_string($ownerPassword) || strlen($ownerPassword) < 8) {
            throw new RuntimeException('INITIAL_OWNER_PASSWORD must contain at least 8 characters.');
        }

        if (! filter_var($ownerEmail, FILTER_VALIDATE_EMAIL)) {
            throw new RuntimeException('INITIAL_OWNER_EMAIL must be a valid email address.');
        }

        DB::transaction(function () use ($organizationName, $organizationSlug, $ownerName, $ownerEmail, $ownerPhone, $ownerPassword): void {
            $organization = Organization::firstOrCreate(
                ['slug' => $organizationSlug],
                ['name' => $organizationName],
            );

            $owner = User::firstOrCreate(
                ['email' => $ownerEmail],
                [
                    'name' => $ownerName,
                    'phone' => $ownerPhone,
                    'password' => $ownerPassword,
                    'organization_id' => $organization->id,
                    'role' => User::ROLE_OWNER,
                    'is_active' => true,
                ],
            );

            if ($owner->organization_id !== $organization->id || ! $owner->isOwner()) {
                throw new RuntimeException('INITIAL_OWNER_EMAIL is already used by a different account.');
            }
        });
    }
}
