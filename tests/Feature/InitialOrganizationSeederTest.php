<?php

namespace Tests\Feature;

use App\Models\Organization;
use App\Models\User;
use Database\Seeders\InitialOrganizationSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class InitialOrganizationSeederTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'initial_account.organization_name' => 'Organización inicial',
            'initial_account.organization_slug' => 'organizacion-inicial',
            'initial_account.owner_name' => 'Owner inicial',
            'initial_account.owner_email' => 'owner@initial.test',
            'initial_account.owner_phone' => '5551112233',
            'initial_account.owner_password' => 'test-password-123',
        ]);
    }

    public function test_it_creates_an_organization_and_owner_account(): void
    {
        app(InitialOrganizationSeeder::class)->run();

        $organization = Organization::where('slug', 'organizacion-inicial')->firstOrFail();
        $owner = User::where('email', 'owner@initial.test')->firstOrFail();

        $this->assertSame('Organización inicial', $organization->name);
        $this->assertSame($organization->id, $owner->organization_id);
        $this->assertSame(User::ROLE_OWNER, $owner->role);
        $this->assertEquals(1, $owner->is_active);
        $this->assertTrue(Hash::check('test-password-123', $owner->password));
    }

    public function test_running_it_again_does_not_duplicate_or_overwrite_records(): void
    {
        $seeder = app(InitialOrganizationSeeder::class);
        $seeder->run();

        $owner = User::where('email', 'owner@initial.test')->firstOrFail();
        $owner->update(['name' => 'Nombre conservado', 'password' => 'other-password-456']);

        config([
            'initial_account.organization_name' => 'Nombre actualizado',
            'initial_account.owner_name' => 'Otro owner',
            'initial_account.owner_password' => 'new-password-789',
        ]);

        $seeder->run();

        $this->assertSame(1, Organization::where('slug', 'organizacion-inicial')->count());
        $this->assertSame(1, User::where('email', 'owner@initial.test')->count());
        $this->assertSame('Organización inicial', Organization::where('slug', 'organizacion-inicial')->value('name'));
        $this->assertSame('Nombre conservado', $owner->fresh()->name);
        $this->assertTrue(Hash::check('other-password-456', $owner->fresh()->password));
    }
}
