<?php

namespace Tests\Feature;

use App\Models\Activity;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ActivityVisibilityTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_sees_all_activities_in_organization()
    {
        $org = Organization::factory()->create();
        $owner = User::factory()->create(['organization_id' => $org->id, 'role' => 'owner']);
        $member = User::factory()->create(['organization_id' => $org->id, 'role' => 'member']);

        Activity::factory()->create(['organization_id' => $org->id, 'assigned_user_id' => $owner->id, 'title' => 'Tarea Owner']);
        Activity::factory()->create(['organization_id' => $org->id, 'assigned_user_id' => $member->id, 'title' => 'Tarea Member']);

        $response = $this->actingAs($owner)->get('/activities');

        $response->assertSee('Tarea Owner');
        $response->assertSee('Tarea Member');
    }

    public function test_member_only_sees_their_assigned_activities()
    {
        $org = Organization::factory()->create();
        $member1 = User::factory()->create(['organization_id' => $org->id, 'role' => 'member']);
        $member2 = User::factory()->create(['organization_id' => $org->id, 'role' => 'member']);

        Activity::factory()->create(['organization_id' => $org->id, 'assigned_user_id' => $member1->id, 'title' => 'Mi Tarea']);
        Activity::factory()->create(['organization_id' => $org->id, 'assigned_user_id' => $member2->id, 'title' => 'Tarea Ajena']);

        $response = $this->actingAs($member1)->get('/activities');

        $response->assertSee('Mi Tarea');
        $response->assertDontSee('Tarea Ajena');
    }

    public function test_member_cannot_update_others_activities()
    {
        $org = Organization::factory()->create();
        $member1 = User::factory()->create(['organization_id' => $org->id, 'role' => 'member']);
        $member2 = User::factory()->create(['organization_id' => $org->id, 'role' => 'member']);

        $activity = Activity::factory()->create(['organization_id' => $org->id, 'assigned_user_id' => $member2->id]);

        $response = $this->actingAs($member1)->put("/activities/{$activity->id}", [
            'title' => 'Intento de Hack',
            'status' => 'completed',
            'priority' => 'high'
        ]);

        $response->assertStatus(403); // Forbidden
    }
}
