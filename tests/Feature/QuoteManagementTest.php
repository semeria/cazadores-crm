<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Organization;
use App\Models\OrganizationQuoteSetting;
use App\Models\Quote;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class QuoteManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_any_organization_user_can_create_quote_with_automatic_folio_and_percentage_discount(): void
    {
        $organization = Organization::factory()->create();
        $member = User::factory()->create([
            'organization_id' => $organization->id,
            'role' => User::ROLE_MEMBER,
            'is_active' => true,
        ]);

        $response = $this->actingAs($member)->post('/quotes', $this->quotePayload([
            'recipient_name' => 'Cliente MXN',
            'currency' => 'MXN',
            'discount_type' => 'percent',
            'discount_value' => '10.00',
            'tax_rate' => '16.00',
            'items' => [
                ['description' => 'Servicio A', 'quantity' => '2.00', 'unit_price' => '100.00'],
            ],
        ]));

        $quote = Quote::where('organization_id', $organization->id)->firstOrFail();

        $response->assertRedirect(route('quotes.show', $quote));
        $this->assertSame('COT-000001', $quote->quote_number);
        $this->assertSame('200.00', $quote->subtotal);
        $this->assertSame('20.00', $quote->discount_amount);
        $this->assertSame('28.80', $quote->tax_amount);
        $this->assertSame('208.80', $quote->total);
        $this->assertSame($member->id, $quote->created_by);

        $this->actingAs($member)->post('/quotes', $this->quotePayload());
        $this->assertDatabaseHas('quotes', [
            'organization_id' => $organization->id,
            'quote_number' => 'COT-000002',
        ]);
    }

    public function test_creator_can_use_custom_folio_usd_and_fixed_discount(): void
    {
        $organization = Organization::factory()->create();
        $agent = User::factory()->create([
            'organization_id' => $organization->id,
            'role' => User::ROLE_AGENT,
            'is_active' => true,
        ]);

        $response = $this->actingAs($agent)->post('/quotes', $this->quotePayload([
            'folio_mode' => 'custom',
            'custom_folio' => 'COT-000001',
            'recipient_name' => 'Cliente USD',
            'currency' => 'USD',
            'discount_type' => 'fixed',
            'discount_value' => '25.00',
            'tax_rate' => '0.00',
            'items' => [
                ['description' => 'Producto B', 'quantity' => '1.00', 'unit_price' => '100.00'],
            ],
        ]));

        $quote = Quote::where('organization_id', $organization->id)->firstOrFail();

        $response->assertRedirect(route('quotes.show', $quote));
        $this->assertSame('COT-000001', $quote->quote_number);
        $this->assertSame('USD', $quote->currency);
        $this->assertSame('25.00', $quote->discount_amount);
        $this->assertSame('0.00', $quote->tax_amount);
        $this->assertSame('75.00', $quote->total);

        $this->actingAs($agent)->post('/quotes', $this->quotePayload([
            'folio_mode' => 'custom',
            'custom_folio' => 'COT-000001',
        ]))->assertSessionHasErrors('custom_folio');

        $this->actingAs($agent)->post('/quotes', $this->quotePayload());
        $this->assertDatabaseHas('quotes', [
            'organization_id' => $organization->id,
            'quote_number' => 'COT-000002',
        ]);
    }

    public function test_users_see_their_own_quotes_and_owner_sees_all_organization_quotes(): void
    {
        $organization = Organization::factory()->create();
        $owner = User::factory()->create([
            'organization_id' => $organization->id,
            'role' => User::ROLE_OWNER,
            'is_active' => true,
        ]);
        $creator = User::factory()->create([
            'organization_id' => $organization->id,
            'role' => User::ROLE_MEMBER,
            'is_active' => true,
        ]);
        $otherMember = User::factory()->create([
            'organization_id' => $organization->id,
            'role' => User::ROLE_MEMBER,
            'is_active' => true,
        ]);

        $this->actingAs($creator)->post('/quotes', $this->quotePayload(['recipient_name' => 'Cotización propia']));
        $quote = Quote::where('created_by', $creator->id)->firstOrFail();

        $this->actingAs($otherMember)->get('/quotes')->assertDontSee($quote->quote_number);
        $this->actingAs($otherMember)->get("/quotes/{$quote->id}")->assertForbidden();
        $this->actingAs($otherMember)->put("/quotes/{$quote->id}", $this->quotePayload())->assertForbidden();
        $this->actingAs($owner)->get('/quotes')->assertSee($quote->quote_number);
        $this->actingAs($owner)->get("/quotes/{$quote->id}")->assertOk();

        $this->actingAs($owner)->put("/quotes/{$quote->id}", $this->quotePayload([
            'recipient_name' => 'Actualizada por owner',
        ]))->assertRedirect(route('quotes.show', $quote));
        $this->assertSame('Actualizada por owner', $quote->fresh()->recipient_name);
    }

    public function test_quote_access_is_isolated_between_organizations(): void
    {
        $organizationA = Organization::factory()->create();
        $organizationB = Organization::factory()->create();
        $creator = User::factory()->create([
            'organization_id' => $organizationA->id,
            'role' => User::ROLE_MEMBER,
            'is_active' => true,
        ]);
        $otherOwner = User::factory()->create([
            'organization_id' => $organizationB->id,
            'role' => User::ROLE_OWNER,
            'is_active' => true,
        ]);

        $this->actingAs($creator)->post('/quotes', $this->quotePayload());
        $quote = Quote::where('organization_id', $organizationA->id)->firstOrFail();

        $this->actingAs($otherOwner)->get("/quotes/{$quote->id}")->assertNotFound();
        $this->actingAs($otherOwner)->get('/quotes')->assertDontSee($quote->quote_number);
        $this->actingAs($otherOwner)->delete("/quotes/{$quote->id}")->assertNotFound();
    }

    public function test_creator_and_owner_can_permanently_delete_quotes_but_other_users_cannot(): void
    {
        $organization = Organization::factory()->create();
        $owner = User::factory()->create([
            'organization_id' => $organization->id,
            'role' => User::ROLE_OWNER,
            'is_active' => true,
        ]);
        $creator = User::factory()->create([
            'organization_id' => $organization->id,
            'role' => User::ROLE_MEMBER,
            'is_active' => true,
        ]);
        $otherMember = User::factory()->create([
            'organization_id' => $organization->id,
            'role' => User::ROLE_MEMBER,
            'is_active' => true,
        ]);

        $this->actingAs($creator)->post('/quotes', $this->quotePayload());
        $creatorQuote = Quote::where('created_by', $creator->id)->firstOrFail();
        $creatorQuoteItemId = $creatorQuote->items()->value('id');

        $this->actingAs($otherMember)->delete("/quotes/{$creatorQuote->id}")->assertForbidden();
        $this->assertDatabaseHas('quotes', ['id' => $creatorQuote->id]);

        $this->actingAs($creator)->delete("/quotes/{$creatorQuote->id}")->assertRedirect('/quotes');
        $this->assertDatabaseMissing('quotes', ['id' => $creatorQuote->id]);
        $this->assertDatabaseMissing('quote_items', ['id' => $creatorQuoteItemId]);

        $this->actingAs($creator)->post('/quotes', $this->quotePayload());
        $ownerQuote = Quote::where('created_by', $creator->id)->firstOrFail();

        $this->actingAs($owner)->delete("/quotes/{$ownerQuote->id}")->assertRedirect('/quotes');
        $this->assertDatabaseMissing('quotes', ['id' => $ownerQuote->id]);
    }

    public function test_authorized_quote_user_can_download_pdf_with_current_organization_logo(): void
    {
        Storage::fake('local');
        $organization = Organization::factory()->create();
        $creator = User::factory()->create([
            'organization_id' => $organization->id,
            'role' => User::ROLE_MEMBER,
            'is_active' => true,
        ]);
        $otherMember = User::factory()->create([
            'organization_id' => $organization->id,
            'role' => User::ROLE_MEMBER,
            'is_active' => true,
        ]);

        $logoPath = UploadedFile::fake()->image('current-logo.png')->storeAs(
            "organizations/{$organization->id}/quote-logos",
            'current-logo.png',
            'local',
        );
        OrganizationQuoteSetting::create([
            'organization_id' => $organization->id,
            'logo_path' => $logoPath,
            'quote_prefix' => 'COT-',
            'number_padding' => 6,
            'next_number' => 1,
        ]);

        $this->actingAs($creator)->post('/quotes', $this->quotePayload());
        $quote = Quote::where('created_by', $creator->id)->firstOrFail();

        $response = $this->actingAs($creator)->get("/quotes/{$quote->id}/pdf");
        $response->assertOk();
        $this->assertStringStartsWith('%PDF-', $response->getContent());
        $this->assertStringContainsString('application/pdf', $response->headers->get('content-type'));
        $this->assertStringContainsString('attachment;', $response->headers->get('content-disposition'));

        $preview = $this->actingAs($creator)->get("/quotes/{$quote->id}/pdf/preview");
        $preview->assertOk();
        $this->assertStringStartsWith('%PDF-', $preview->getContent());
        $this->assertStringContainsString('inline;', $preview->headers->get('content-disposition'));

        $this->actingAs($otherMember)->get("/quotes/{$quote->id}/pdf")->assertForbidden();
        $this->actingAs($otherMember)->get("/quotes/{$quote->id}/pdf/preview")->assertForbidden();
    }

    public function test_only_owner_can_update_organization_quote_settings_and_logo(): void
    {
        Storage::fake('local');
        $organization = Organization::factory()->create();
        $owner = User::factory()->create([
            'organization_id' => $organization->id,
            'role' => User::ROLE_OWNER,
            'is_active' => true,
        ]);
        $member = User::factory()->create([
            'organization_id' => $organization->id,
            'role' => User::ROLE_MEMBER,
            'is_active' => true,
        ]);

        $response = $this->actingAs($owner)->post('/quotes/settings', [
            '_method' => 'PUT',
            'quote_prefix' => 'JA-2026-',
            'number_padding' => 5,
            'logo' => UploadedFile::fake()->image('organization-logo.png'),
        ]);

        $response->assertRedirect(route('quotes.settings.edit'));

        $settings = OrganizationQuoteSetting::where('organization_id', $organization->id)->firstOrFail();
        $this->assertSame('JA-2026-', $settings->quote_prefix);
        $this->assertSame(5, $settings->number_padding);
        Storage::disk('local')->assertExists($settings->logo_path);

        $this->actingAs($member)->post('/quotes/settings', [
            '_method' => 'PUT',
            'quote_prefix' => 'NO-',
            'number_padding' => 4,
        ])->assertForbidden();

        $this->actingAs($member)->get('/quotes/organization-logo')->assertOk();

        $this->actingAs($member)->post('/quotes', $this->quotePayload());
        $this->assertDatabaseHas('quotes', [
            'organization_id' => $organization->id,
            'quote_number' => 'JA-2026-00001',
        ]);
    }

    public function test_authorized_quote_user_can_download_a_pdf_with_current_organization_logo(): void
    {
        Storage::fake('local');
        $organization = Organization::factory()->create();
        $creator = User::factory()->create([
            'organization_id' => $organization->id,
            'role' => User::ROLE_MEMBER,
            'is_active' => true,
        ]);
        $otherMember = User::factory()->create([
            'organization_id' => $organization->id,
            'role' => User::ROLE_MEMBER,
            'is_active' => true,
        ]);

        $logoPath = UploadedFile::fake()->image('organization.png')->storeAs(
            "organizations/{$organization->id}/quote-logos",
            'organization.png',
            'local',
        );
        OrganizationQuoteSetting::create([
            'organization_id' => $organization->id,
            'logo_path' => $logoPath,
            'quote_prefix' => 'COT-',
            'number_padding' => 6,
            'next_number' => 1,
        ]);

        $this->actingAs($creator)->post('/quotes', $this->quotePayload());
        $quote = Quote::where('created_by', $creator->id)->firstOrFail();

        $response = $this->actingAs($creator)->get("/quotes/{$quote->id}/pdf");
        $response->assertOk();
        $this->assertStringStartsWith('%PDF-', $response->getContent());
        $this->assertStringContainsString('application/pdf', $response->headers->get('content-type'));
        $this->assertStringContainsString('.pdf', $response->headers->get('content-disposition'));

        $this->actingAs($otherMember)->get("/quotes/{$quote->id}/pdf")->assertForbidden();
    }

    public function test_quote_can_register_a_client_and_clients_can_be_reused_within_organization(): void
    {
        $organization = Organization::factory()->create();
        $member = User::factory()->create([
            'organization_id' => $organization->id,
            'role' => User::ROLE_MEMBER,
            'is_active' => true,
        ]);

        $this->actingAs($member)->post('/quotes', $this->quotePayload([
            'recipient_name' => 'Cliente Reutilizable',
            'recipient_email' => 'ventas@example.test',
            'recipient_phone' => '5551002000',
            'recipient_address' => 'Calle Uno 123',
            'save_client' => true,
        ]))->assertSessionHasNoErrors();

        $this->assertSame(1, Client::where('organization_id', $organization->id)->count());
        $client = Client::where('organization_id', $organization->id)->firstOrFail();
        $quote = Quote::where('created_by', $member->id)->firstOrFail();
        $this->assertSame($client->id, $quote->client_id);
        $this->assertSame('ventas@example.test', $client->email);

        $this->actingAs($member)->get('/clients/search?q=ventas%40example.test')
            ->assertOk()
            ->assertJsonPath('clients.0.id', $client->id);

        $this->actingAs($member)->post('/quotes', $this->quotePayload([
            'recipient_name' => 'Cliente Reutilizable',
            'recipient_email' => 'VENTAS@example.test',
            'client_id' => $client->id,
            'save_client' => false,
        ]))->assertSessionHasNoErrors();

        $this->assertSame(1, Client::where('organization_id', $organization->id)->count());
        $this->assertSame(2, Quote::where('created_by', $member->id)->count());
    }

    public function test_duplicate_client_email_is_reported_and_foreign_organization_client_cannot_be_selected(): void
    {
        $organizationA = Organization::factory()->create();
        $organizationB = Organization::factory()->create();
        $memberA = User::factory()->create([
            'organization_id' => $organizationA->id,
            'role' => User::ROLE_MEMBER,
            'is_active' => true,
        ]);
        $memberB = User::factory()->create([
            'organization_id' => $organizationB->id,
            'role' => User::ROLE_MEMBER,
            'is_active' => true,
        ]);

        $this->actingAs($memberA)->post('/quotes', $this->quotePayload([
            'recipient_email' => 'duplicado@example.test',
            'save_client' => true,
        ]))->assertSessionHasNoErrors();

        $this->actingAs($memberA)->get('/clients/search?q=duplicado@example.test')
            ->assertOk()
            ->assertJsonCount(1, 'clients');

        $this->actingAs($memberB)->get('/clients/search?q=duplicado@example.test')
            ->assertOk()
            ->assertJsonCount(0, 'clients');

        $this->actingAs($memberA)->post('/quotes', $this->quotePayload([
            'recipient_name' => 'Registro duplicado',
            'recipient_email' => 'DUPLICADO@example.test',
            'save_client' => true,
        ]))->assertSessionHasErrors('recipient_email');

        $foreignClient = Client::where('organization_id', $organizationA->id)->firstOrFail();
        $this->actingAs($memberB)->post('/quotes', $this->quotePayload([
            'client_id' => $foreignClient->id,
            'save_client' => false,
        ]))->assertSessionHasErrors('client_id');

        $this->assertSame(1, Client::withoutGlobalScopes()->where('organization_id', $organizationA->id)->count());
        $this->assertSame(0, Client::withoutGlobalScopes()->where('organization_id', $organizationB->id)->count());
    }

    private function quotePayload(array $overrides = []): array
    {
        return array_replace_recursive([
            'folio_mode' => 'auto',
            'custom_folio' => '',
            'client_id' => null,
            'save_client' => false,
            'recipient_name' => 'Cliente de prueba',
            'recipient_email' => '',
            'recipient_phone' => '',
            'recipient_address' => '',
            'issued_at' => now()->toDateString(),
            'valid_until' => '',
            'currency' => 'MXN',
            'discount_type' => 'none',
            'discount_value' => '0.00',
            'tax_rate' => '0.00',
            'items' => [
                ['description' => 'Servicio de prueba', 'quantity' => '1.00', 'unit_price' => '100.00'],
            ],
            'notes' => '',
        ], $overrides);
    }
}
