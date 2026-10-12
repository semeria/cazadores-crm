<?php

namespace Tests\Feature;

use App\Models\Agent;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TeamManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_can_create_agent_user_with_same_organization_manager_and_agent_profile(): void
    {
        $organization = Organization::factory()->create();
        $owner = User::factory()->create([
            'organization_id' => $organization->id,
            'role' => User::ROLE_OWNER,
            'is_active' => true,
        ]);
        $manager = User::factory()->create([
            'organization_id' => $organization->id,
            'role' => User::ROLE_MEMBER,
            'is_active' => true,
        ]);

        $response = $this->actingAs($owner)->post('/team', [
            'name' => 'Agente Nuevo',
            'email' => 'agente@example.test',
            'phone' => '5551234567',
            'role' => User::ROLE_AGENT,
            'manager_id' => $manager->id,
            'specialty' => 'Ventas',
            'agent_status' => 'active',
            'notes' => 'Perfil de prueba',
        ]);

        $response->assertRedirect('/team');

        $agentUser = User::where('email', 'agente@example.test')->firstOrFail();
        $agentProfile = Agent::where('email', 'agente@example.test')->firstOrFail();

        $this->assertSame(User::ROLE_AGENT, $agentUser->role);
        $this->assertSame($organization->id, $agentUser->organization_id);
        $this->assertSame($manager->id, $agentUser->manager_id);
        $this->assertSame($manager->id, $agentProfile->supervisor_id);
        $this->assertSame('Ventas', $agentProfile->specialty);
    }

    public function test_owner_cannot_assign_agent_manager_from_another_organization(): void
    {
        $organization = Organization::factory()->create();
        $otherOrganization = Organization::factory()->create();
        $owner = User::factory()->create([
            'organization_id' => $organization->id,
            'role' => User::ROLE_OWNER,
            'is_active' => true,
        ]);
        $foreignManager = User::factory()->create([
            'organization_id' => $otherOrganization->id,
            'role' => User::ROLE_MEMBER,
            'is_active' => true,
        ]);

        $response = $this->actingAs($owner)->post('/team', [
            'name' => 'Agente Nuevo',
            'email' => 'agente@example.test',
            'phone' => '5551234567',
            'role' => User::ROLE_AGENT,
            'manager_id' => $foreignManager->id,
            'agent_status' => 'active',
        ]);

        $response->assertSessionHasErrors('manager_id');
        $this->assertDatabaseMissing('users', ['email' => 'agente@example.test']);
    }

    public function test_changing_agent_role_to_member_keeps_profile_but_marks_it_inactive(): void
    {
        $organization = Organization::factory()->create();
        $owner = User::factory()->create([
            'organization_id' => $organization->id,
            'role' => User::ROLE_OWNER,
            'is_active' => true,
        ]);
        $agentUser = User::factory()->create([
            'organization_id' => $organization->id,
            'role' => User::ROLE_AGENT,
            'email' => 'agente@example.test',
            'manager_id' => $owner->id,
            'is_active' => true,
        ]);
        Agent::factory()->create([
            'organization_id' => $organization->id,
            'email' => $agentUser->email,
            'supervisor_id' => $owner->id,
        ]);

        $response = $this->actingAs($owner)->put("/team/{$agentUser->id}", [
            'name' => $agentUser->name,
            'email' => $agentUser->email,
            'phone' => $agentUser->phone,
            'role' => User::ROLE_MEMBER,
            'is_active' => true,
        ]);

        $response->assertRedirect('/team');
        $this->assertSame(User::ROLE_MEMBER, $agentUser->fresh()->role);
        $this->assertNull($agentUser->fresh()->manager_id);
        $this->assertSame('inactive', Agent::where('email', $agentUser->email)->value('status'));
        $this->assertSame(1, Agent::where('email', $agentUser->email)->count());
    }

    public function test_non_owner_cannot_access_unified_team_management(): void
    {
        $organization = Organization::factory()->create();
        $member = User::factory()->create([
            'organization_id' => $organization->id,
            'role' => User::ROLE_MEMBER,
            'is_active' => true,
        ]);

        $this->actingAs($member)->get('/team')->assertForbidden();
    }
}
