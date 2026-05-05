<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Organization;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MemberManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_can_access_members_module()
    {
        $org = Organization::factory()->create();
        $owner = User::factory()->create(['organization_id' => $org->id, 'role' => 'owner']);

        $response = $this->actingAs($owner)->get('/members');
        $response->assertStatus(200);
    }

    public function test_member_cannot_access_members_module()
    {
        $org = Organization::factory()->create();
        $member = User::factory()->create(['organization_id' => $org->id, 'role' => 'member']);

        $response = $this->actingAs($member)->get('/members');
        $response->assertStatus(403); // Forbidden, gracias a la Policy
    }

    public function test_owner_can_only_see_members_of_their_organization()
    {
        $org1 = Organization::factory()->create();
        $org2 = Organization::factory()->create();

        $owner = User::factory()->create(['organization_id' => $org1->id, 'role' => 'owner']);
        $member1 = User::factory()->create(['organization_id' => $org1->id, 'name' => 'Member Org 1']);
        $member2 = User::factory()->create(['organization_id' => $org2->id, 'name' => 'Member Org 2']);

        $response = $this->actingAs($owner)->get('/members');

        $response->assertSee('Member Org 1');
        $response->assertDontSee('Member Org 2');
    }
}
