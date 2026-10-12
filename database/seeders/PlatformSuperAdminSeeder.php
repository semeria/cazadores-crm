<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use RuntimeException;

class PlatformSuperAdminSeeder extends Seeder
{
    public function run(): void
    {
        $name = config('platform_admin.name');
        $email = config('platform_admin.email');
        $phone = config('platform_admin.phone');
        $password = config('platform_admin.password');

        if (! is_string($name) || trim($name) === '' || ! filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new RuntimeException('PLATFORM_ADMIN_NAME and a valid PLATFORM_ADMIN_EMAIL are required.');
        }

        if (! is_string($password) || strlen($password) < 12) {
            throw new RuntimeException('PLATFORM_ADMIN_PASSWORD must contain at least 12 characters.');
        }

        $existingUser = User::query()->where('email', $email)->first();

        if ($existingUser) {
            if ($existingUser->isSuperAdmin() && $existingUser->organization_id === null) {
                return;
            }

            throw new RuntimeException('PLATFORM_ADMIN_EMAIL is already used by a non-platform account.');
        }

        User::create([
            'name' => $name,
            'email' => $email,
            'phone' => $phone,
            'password' => Hash::make($password),
            'organization_id' => null,
            'role' => User::ROLE_MEMBER,
            'is_active' => true,
            'is_super_admin' => true,
        ]);
    }
}
