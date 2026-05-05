<?php

namespace Tests\Feature;

use App\Models\Activity;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class ActivityTenantTest extends TestCase
{
    use RefreshDatabase;
    public function test_example(): void
    {
        $orgA = Organization::factory()->create();
        $orgB = Organization::factory()->create();

        // 2. Crear usuarios para cada una
        $userA = User::factory()->create(['organization_id' => $orgA->id]);

        // 3. Crear actividades en ambas organizaciones
        Activity::factory()->create(['organization_id' => $orgA->id, 'title' => 'Actividad Org A']);
        Activity::factory()->create(['organization_id' => $orgB->id, 'title' => 'Actividad Org B']);

        // 4. Actuar: Iniciar sesión con el Usuario A y hacer petición a las actividades
        $response = $this->actingAs($userA)->get('/activities');

        // 5. Afirmar (Asserts): Solo debe ver su actividad
        $response->assertStatus(200);
        $response->assertSee('Actividad Org A');
        $response->assertDontSee('Actividad Org B');
    }
}
