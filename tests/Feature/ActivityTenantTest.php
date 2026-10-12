<?php

namespace Tests\Feature;

use App\Models\Activity;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ActivityTenantTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_only_sees_activities_from_their_organization(): void
    {
        $orgA = Organization::factory()->create();
        $orgB = Organization::factory()->create();

        // 2. Crear usuarios para cada una
        $userA = User::factory()->create([
            'organization_id' => $orgA->id,
            'role' => User::ROLE_OWNER,
        ]);

        // 3. Crear actividades en ambas organizaciones
        Activity::factory()->create(['organization_id' => $orgA->id, 'title' => 'Actividad Org A']);
        Activity::factory()->create(['organization_id' => $orgB->id, 'title' => 'Actividad Org B']);

        // 4. Actuar: Iniciar sesión con el Usuario A y hacer petición a las actividades
        $response = $this->actingAs($userA)->get('/activities');

        // 5. Afirmar (Asserts): Solo debe ver su actividad
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Activities/Index')
            ->has('activities.data', 1)
            ->where('activities.data.0.title', 'Actividad Org A'));
    }
}
