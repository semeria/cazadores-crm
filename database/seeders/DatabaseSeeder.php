<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Organization;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
//         User::factory(10)->create();

//        User::factory()->create([
//            'name' => 'Test User',
//            'email' => 'test@example.com',
//        ]);


        $org = Organization::create([
            'name' => 'Empresa Alpha',
            'slug' => Str::slug('Empresa Alpha'),
        ]);

        User::create([
            'name' => 'CEO Admin',
            'email' => 'ceo@alpha.com',
            'phone' => '5551234567',
            'password' => bcrypt('password'),
            'organization_id' => $org->id,
            'role' => 'owner',
        ]);

        User::create([
            'name' => 'Empleado Juan',
            'email' => 'juan@alpha.com',
            'phone' => '5559876543',
            'password' => bcrypt('password'),
            'organization_id' => $org->id,
            'role' => 'member',
        ]);

        \App\Models\Agent::factory(15)->create([
            'organization_id' => $org->id,
            'supervisor_id' => 1, // Asignamos al CEO como supervisor
        ]);
    }
}
