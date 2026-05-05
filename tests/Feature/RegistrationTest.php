<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Organization;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_new_users_can_register_and_create_an_organization()
    {
        $response = $this->post('/register', [
            'name' => 'Test Owner',
            'email' => 'owner@example.com',
            'phone' => '1234567890',
            'organization_name' => 'Test Company LLC',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        // Verificamos que redirija al dashboard
        $response->assertRedirect('/dashboard');
        $this->assertAuthenticated();

        // Verificamos que la organización se creó en la BD
        $this->assertDatabaseHas('organizations', [
            'name' => 'Test Company LLC',
        ]);

        $org = Organization::where('name', 'Test Company LLC')->first();

        // Verificamos que el usuario se creó correctamente como owner y atado a la org
        $this->assertDatabaseHas('users', [
            'email' => 'owner@example.com',
            'organization_id' => $org->id,
            'role' => 'owner',
        ]);
    }
}
