<?php

namespace Tests\Feature;

use App\Models\Activity;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class ActivityCommentTest extends TestCase
{
    use RefreshDatabase;
    public function test_member_can_only_comment_on_assigned_activity()
    {
        $org = Organization::factory()->create();
        $member = User::factory()->create(['organization_id' => $org->id, 'role' => 'member']);
        $otherMember = User::factory()->create(['organization_id' => $org->id, 'role' => 'member']);

        // Actividad de OTRO miembro
        $activity = Activity::factory()->create([
            'organization_id' => $org->id,
            'assigned_user_id' => $otherMember->id
        ]);

        $response = $this->actingAs($member)->post("/activities/{$activity->id}/comments", [
            'body' => 'Intento de comentario'
        ]);

        $response->assertStatus(403);
    }

    public function test_comment_creates_history_record()
    {
        $org = Organization::factory()->create();
        $owner = User::factory()->create(['organization_id' => $org->id, 'role' => 'owner']);
        $activity = Activity::factory()->create(['organization_id' => $org->id]);

        $this->actingAs($owner)->post("/activities/{$activity->id}/comments", [
            'body' => 'Este es un comentario de prueba'
        ]);

        $this->assertDatabaseHas('activity_histories', [
            'activity_id' => $activity->id,
            'type' => 'comment_added'
        ]);
    }
}
