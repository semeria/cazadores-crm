<?php

namespace Tests\Feature;

use App\Models\Organization;
use App\Models\User;
use Database\Seeders\PlatformSuperAdminSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SuperAdminOrganizationManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_super_admin_can_list_and_view_organizations(): void
    {
        $superAdmin = $this->createSuperAdmin();
        $organization = Organization::factory()->create(['name' => 'Organización Demo']);

        $this->actingAs($superAdmin)
            ->get('/super-admin/organizations')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('SuperAdmin/Organizations/Index')
                ->where('organizations.data.0.name', 'Organización Demo'));

        $this->get("/super-admin/organizations/{$organization->id}")
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('SuperAdmin/Organizations/Show')
                ->where('organization.id', $organization->id));
    }

    public function test_tenant_owner_cannot_access_super_admin_routes(): void
    {
        $organization = Organization::factory()->create();
        $owner = User::factory()->create([
            'organization_id' => $organization->id,
            'role' => User::ROLE_OWNER,
            'is_active' => true,
        ]);

        $this->actingAs($owner)->get('/super-admin/organizations')->assertForbidden();
    }

    public function test_super_admin_cannot_access_tenant_routes_without_organization(): void
    {
        $this->actingAs($this->createSuperAdmin())->get('/dashboard')->assertForbidden();
    }

    public function test_super_admin_can_suspend_and_reactivate_organization_with_audit(): void
    {
        $superAdmin = $this->createSuperAdmin();
        $organization = Organization::factory()->create();

        $this->actingAs($superAdmin)
            ->post("/super-admin/organizations/{$organization->id}/suspend", ['reason' => 'Solicitud del cliente'])
            ->assertRedirect();

        $this->assertSame('suspended', $organization->fresh()->status);
        $this->assertDatabaseHas('organization_admin_audits', [
            'organization_id' => $organization->id,
            'actor_id' => $superAdmin->id,
            'action' => 'suspended',
            'reason' => 'Solicitud del cliente',
        ]);

        $this->post("/super-admin/organizations/{$organization->id}/reactivate")
            ->assertRedirect();

        $this->assertSame('active', $organization->fresh()->status);
        $this->assertDatabaseHas('organization_admin_audits', [
            'organization_id' => $organization->id,
            'actor_id' => $superAdmin->id,
            'action' => 'reactivated',
        ]);
    }

    public function test_super_admin_can_edit_organization_name_with_audit(): void
    {
        $superAdmin = $this->createSuperAdmin();
        $organization = Organization::factory()->create(['name' => 'Nombre anterior']);

        $this->actingAs($superAdmin)
            ->put("/super-admin/organizations/{$organization->id}", ['name' => 'Nombre actualizado'])
            ->assertRedirect();

        $this->assertSame('Nombre actualizado', $organization->fresh()->name);
        $this->assertDatabaseHas('organization_admin_audits', [
            'organization_id' => $organization->id,
            'actor_id' => $superAdmin->id,
            'action' => 'updated',
            'changes->name->from' => 'Nombre anterior',
            'changes->name->to' => 'Nombre actualizado',
        ]);
    }

    public function test_suspending_organization_blocks_existing_sessions_and_preserves_data(): void
    {
        $organization = Organization::factory()->create(['status' => 'suspended']);
        $owner = User::factory()->create([
            'organization_id' => $organization->id,
            'role' => User::ROLE_OWNER,
            'is_active' => true,
        ]);

        $this->actingAs($owner)->get('/dashboard')->assertRedirect('/login');

        $this->assertGuest();
        $this->assertDatabaseHas('organizations', [
            'id' => $organization->id,
            'status' => 'suspended',
        ]);
        $this->assertDatabaseHas('users', ['id' => $owner->id]);
    }

    public function test_login_is_rejected_for_suspended_organization(): void
    {
        $organization = Organization::factory()->create(['status' => 'suspended']);
        $owner = User::factory()->create([
            'organization_id' => $organization->id,
            'role' => User::ROLE_OWNER,
            'password' => bcrypt('password'),
            'is_active' => true,
        ]);

        $this->post('/login', [
            'email' => $owner->email,
            'password' => 'password',
        ])->assertSessionHasErrors('email');

        $this->assertGuest();
    }

    public function test_platform_admin_seeder_requires_explicit_configuration_and_is_idempotent(): void
    {
        config([
            'platform_admin.name' => 'Platform Admin',
            'platform_admin.email' => 'platform@example.test',
            'platform_admin.phone' => '5550100100',
            'platform_admin.password' => 'StrongPlatformPassword1!',
        ]);

        $this->seed(PlatformSuperAdminSeeder::class);
        $this->seed(PlatformSuperAdminSeeder::class);

        $this->assertSame(1, User::where('email', 'platform@example.test')->count());
        $this->assertTrue(User::where('email', 'platform@example.test')->firstOrFail()->isSuperAdmin());
        $this->assertNull(User::where('email', 'platform@example.test')->value('organization_id'));

        $this->post('/login', [
            'email' => 'platform@example.test',
            'password' => 'StrongPlatformPassword1!',
        ])->assertRedirect('/super-admin/organizations');
    }

    private function createSuperAdmin(): User
    {
        return User::factory()->create([
            'organization_id' => null,
            'role' => User::ROLE_MEMBER,
            'is_super_admin' => true,
            'is_active' => true,
        ]);
    }
}
