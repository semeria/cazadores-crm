<?php

namespace Tests\Feature;

use App\Models\Coupon;
use App\Models\Organization;
use App\Models\OrganizationSubscription;
use App\Models\Plan;
use App\Models\SubscriptionPayment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class SubscriptionBillingTest extends TestCase
{
    use RefreshDatabase;

    public function test_super_admin_can_create_dynamic_plan_and_coupon(): void
    {
        $admin = $this->superAdmin();

        $this->actingAs($admin)->post('/super-admin/plans', [
            'name' => 'Anual',
            'description' => 'Plan anual',
            'price' => '2400.00',
            'interval_count' => 1,
            'interval_unit' => 'year',
        ])->assertRedirect();

        $plan = Plan::where('name', 'Anual')->firstOrFail();
        $this->assertSame('MXN', $plan->currency);
        $this->assertSame('year', $plan->interval_unit);

        $this->actingAs($admin)->post('/super-admin/coupons', [
            'code' => 'PRUEBA12',
            'name' => 'Prueba anual',
            'description' => 'Acceso de prueba',
            'benefit_type' => 'free_months',
            'benefit_value' => 12,
            'is_trial' => true,
            'max_redemptions' => 10,
        ])->assertRedirect();

        $this->assertDatabaseHas('coupons', [
            'code' => 'PRUEBA12',
            'benefit_type' => 'free_months',
            'benefit_value' => 12,
            'is_trial' => true,
        ]);
    }

    public function test_owner_requests_transfer_and_access_starts_only_after_manual_approval(): void
    {
        $organization = Organization::factory()->create(['has_legacy_access' => false]);
        $owner = $this->owner($organization);
        $plan = $this->plan();

        $this->actingAs($owner)->post('/subscription/request', ['plan_id' => $plan->id])->assertRedirect();

        $subscription = OrganizationSubscription::firstOrFail();
        $payment = SubscriptionPayment::firstOrFail();
        $this->assertSame('pending_payment', $subscription->status);
        $this->assertSame('manual_transfer', $payment->provider);
        $this->assertSame('pending', $payment->status);
        $this->assertSame('650.00', $payment->amount);
        $this->assertFalse($organization->fresh()->hasLegacyAccess());

        $this->actingAs($owner)->get('/subscription')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Subscription/Index')
                ->where('subscriptions.0.payment.id', $payment->id)
                ->where('subscriptionAccess.has_access', false));

        $this->get('/activities')->assertRedirect('/subscription');

        $admin = $this->superAdmin();
        $this->actingAs($admin)->get('/super-admin/payments')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('SuperAdmin/Payments/Index')
                ->where('payments.data.0.subscription.id', $subscription->id));

        $this->actingAs($admin)->post("/super-admin/payments/{$payment->id}/approve", [
            'review_note' => 'Transferencia confirmada',
        ])->assertRedirect();

        $subscription->refresh();
        $this->assertSame('active', $subscription->status);
        $this->assertLessThanOrEqual(5, $subscription->starts_at->diffInSeconds(Carbon::now()));
        $this->assertTrue($subscription->ends_at->equalTo($subscription->starts_at->copy()->addDays(30)));
        $this->assertTrue($subscription->grace_ends_at->equalTo($subscription->ends_at->copy()->addDays(2)));
        $this->assertSame('approved', $payment->fresh()->status);
        $this->actingAs($owner->fresh())->get('/activities')->assertOk();
    }

    public function test_trial_coupon_activates_immediately_without_a_payment(): void
    {
        $organization = Organization::factory()->create(['has_legacy_access' => false]);
        $owner = $this->owner($organization);
        $plan = $this->plan();
        $coupon = Coupon::create([
            'code' => 'TRIAL3',
            'name' => 'Prueba de tres meses',
            'benefit_type' => 'free_months',
            'benefit_value' => 3,
            'is_trial' => true,
            'max_per_organization' => 1,
            'is_active' => true,
        ]);

        $this->actingAs($owner)->post('/subscription/request', [
            'plan_id' => $plan->id,
            'coupon_code' => 'trial3',
        ])->assertRedirect('/dashboard');

        $subscription = OrganizationSubscription::firstOrFail();
        $this->assertSame('trialing', $subscription->status);
        $this->assertTrue($subscription->is_trial);
        $this->assertTrue($subscription->ends_at->equalTo($subscription->starts_at->copy()->addMonthsNoOverflow(3)));
        $this->assertSame(0, SubscriptionPayment::count());
        $this->assertDatabaseHas('coupon_redemptions', [
            'coupon_id' => $coupon->id,
            'organization_id' => $organization->id,
            'status' => 'redeemed',
        ]);
        $this->assertFalse($organization->fresh()->hasLegacyAccess());
        $this->actingAs($owner->fresh())->get('/activities')->assertOk();
    }

    public function test_non_trial_coupon_is_reserved_until_manual_approval(): void
    {
        $organization = Organization::factory()->create(['has_legacy_access' => false]);
        $owner = $this->owner($organization);
        $plan = $this->plan();
        $coupon = Coupon::create([
            'code' => 'DIEZPORCIENTO',
            'name' => 'Diez por ciento',
            'benefit_type' => 'percentage',
            'benefit_value' => 10,
            'is_trial' => false,
            'max_per_organization' => 1,
            'is_active' => true,
        ]);

        $this->actingAs($owner)->post('/subscription/request', [
            'plan_id' => $plan->id,
            'coupon_code' => $coupon->code,
        ])->assertRedirect();

        $subscription = OrganizationSubscription::firstOrFail();
        $this->assertSame('pending_payment', $subscription->status);
        $this->assertSame('585.00', $subscription->amount_due);
        $this->assertDatabaseHas('coupon_redemptions', [
            'coupon_id' => $coupon->id,
            'status' => 'reserved',
        ]);
    }

    public function test_rejected_transfer_releases_the_reserved_coupon(): void
    {
        $organization = Organization::factory()->create(['has_legacy_access' => false]);
        $owner = $this->owner($organization);
        $plan = $this->plan();
        $coupon = Coupon::create([
            'code' => 'BONO1',
            'name' => 'Un mes extra',
            'benefit_type' => 'free_months',
            'benefit_value' => 1,
            'is_trial' => false,
            'max_per_organization' => 1,
            'is_active' => true,
        ]);

        $this->actingAs($owner)->post('/subscription/request', [
            'plan_id' => $plan->id,
            'coupon_code' => $coupon->code,
        ])->assertRedirect();

        $payment = SubscriptionPayment::firstOrFail();
        $this->actingAs($this->superAdmin())->post("/super-admin/payments/{$payment->id}/reject", [
            'review_note' => 'No se encontró el depósito',
        ])->assertRedirect();

        $this->assertSame('rejected', $payment->fresh()->status);
        $this->assertDatabaseHas('coupon_redemptions', [
            'coupon_id' => $coupon->id,
            'organization_id' => $organization->id,
            'status' => 'released',
        ]);

        $this->actingAs($owner->fresh())->post('/subscription/request', [
            'plan_id' => $plan->id,
            'coupon_code' => $coupon->code,
        ])->assertRedirect();

        $this->assertDatabaseHas('coupon_redemptions', [
            'coupon_id' => $coupon->id,
            'organization_id' => $organization->id,
            'status' => 'reserved',
        ]);
    }

    public function test_super_admin_report_tracks_paid_coupon_and_trial_subscriptions_and_exports_csv(): void
    {
        $plan = $this->plan();
        $paidOrganization = Organization::factory()->create(['has_legacy_access' => false]);
        $paidOwner = $this->owner($paidOrganization);
        $discountCoupon = Coupon::create([
            'code' => 'PAGA10',
            'name' => 'Descuento de pago',
            'benefit_type' => 'percentage',
            'benefit_value' => 10,
            'is_trial' => false,
            'max_per_organization' => 1,
            'is_active' => true,
        ]);

        $this->actingAs($paidOwner)->post('/subscription/request', [
            'plan_id' => $plan->id,
            'coupon_code' => $discountCoupon->code,
        ])->assertRedirect();
        $paidPayment = SubscriptionPayment::where('organization_id', $paidOrganization->id)->firstOrFail();

        $admin = $this->superAdmin();
        $this->actingAs($admin)->post("/super-admin/payments/{$paidPayment->id}/approve")->assertRedirect();

        $trialOrganization = Organization::factory()->create(['has_legacy_access' => false]);
        $trialOwner = $this->owner($trialOrganization);
        $trialCoupon = Coupon::create([
            'code' => 'PRUEBA2',
            'name' => 'Dos meses de prueba',
            'benefit_type' => 'free_months',
            'benefit_value' => 2,
            'is_trial' => true,
            'max_per_organization' => 1,
            'is_active' => true,
        ]);

        $this->actingAs($trialOwner)->post('/subscription/request', [
            'plan_id' => $plan->id,
            'coupon_code' => $trialCoupon->code,
        ])->assertRedirect('/dashboard');

        $this->actingAs($admin)->get('/super-admin/subscriptions?coupon_code=PAGA10')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('SuperAdmin/Subscriptions/Index')
                ->has('subscriptions.data', 1)
                ->where('subscriptions.data.0.organization.name', $paidOrganization->name)
                ->where('subscriptions.data.0.payment.status', 'approved')
                ->where('subscriptions.data.0.coupon_code', 'PAGA10')
                ->where('summary.paid_count', 1)
                ->where('summary.paid_amount', 585)
                ->where('summary.coupon_count', 1));

        $this->get('/super-admin/subscriptions?type=trial')
            ->assertInertia(fn ($page) => $page
                ->has('subscriptions.data', 1)
                ->where('subscriptions.data.0.organization.name', $trialOrganization->name)
                ->where('subscriptions.data.0.is_trial', true));

        $this->get('/super-admin/subscriptions/export?coupon_code=PRUEBA2')
            ->assertOk()
            ->assertHeader('content-type', 'text/csv; charset=UTF-8');

        $this->actingAs($paidOwner)->get('/super-admin/subscriptions')->assertForbidden();
    }

    public function test_legacy_access_is_preserved_until_subscription_is_activated(): void
    {
        $organization = Organization::factory()->create(['has_legacy_access' => true]);
        $owner = $this->owner($organization);

        $this->actingAs($owner)->get('/activities')->assertOk();
        $this->get('/subscription')->assertOk()->assertInertia(fn ($page) => $page
            ->where('subscriptionAccess.status', 'legacy')
            ->where('subscriptionAccess.has_access', true));
        $this->assertTrue($organization->fresh()->hasLegacyAccess());
    }

    public function test_expired_subscription_allows_two_day_grace_then_redirects_to_billing(): void
    {
        $organization = Organization::factory()->create(['has_legacy_access' => false]);
        $owner = $this->owner($organization);
        $plan = $this->plan();
        $endsAt = Carbon::now()->subDay();
        OrganizationSubscription::create([
            'organization_id' => $organization->id,
            'plan_id' => $plan->id,
            'status' => 'active',
            'plan_name' => $plan->name,
            'plan_price' => $plan->price,
            'currency' => 'MXN',
            'interval_count' => 30,
            'interval_unit' => 'day',
            'amount_due' => $plan->price,
            'requested_at' => Carbon::now()->subDays(31),
            'starts_at' => Carbon::now()->subDays(31),
            'ends_at' => $endsAt,
            'grace_ends_at' => Carbon::now()->addDay(),
        ]);

        $this->actingAs($owner)->get('/activities')->assertOk();

        $organization->subscriptions()->first()->update(['grace_ends_at' => Carbon::now()->subSecond()]);
        $this->get('/activities')->assertRedirect('/subscription');
        $this->get('/subscription')->assertInertia(fn ($page) => $page
            ->where('subscriptionAccess.status', 'expired')
            ->where('subscriptionAccess.has_access', false));
    }

    public function test_new_publicly_registered_organizations_do_not_receive_legacy_access(): void
    {
        $this->post('/register', [
            'name' => 'Nuevo Owner',
            'email' => 'nuevo-owner@example.test',
            'phone' => '5550101010',
            'organization_name' => 'Nueva Organización',
            'password' => 'password',
            'password_confirmation' => 'password',
        ])->assertRedirect('/dashboard');

        $this->assertDatabaseHas('organizations', [
            'name' => 'Nueva Organización',
            'has_legacy_access' => false,
        ]);
        $this->get('/dashboard')->assertRedirect('/subscription');
        $this->get('/subscription')->assertInertia(fn ($page) => $page
            ->where('subscriptionAccess.has_access', false));
    }

    private function owner(Organization $organization): User
    {
        return User::factory()->create([
            'organization_id' => $organization->id,
            'role' => User::ROLE_OWNER,
            'is_active' => true,
        ]);
    }

    private function superAdmin(): User
    {
        return User::factory()->create([
            'organization_id' => null,
            'role' => User::ROLE_MEMBER,
            'is_super_admin' => true,
            'is_active' => true,
        ]);
    }

    private function plan(): Plan
    {
        return Plan::create([
            'name' => 'Mensual',
            'slug' => 'mensual',
            'description' => 'Plan de 30 días',
            'price' => '650.00',
            'currency' => 'MXN',
            'interval_count' => 30,
            'interval_unit' => 'day',
            'is_active' => true,
        ]);
    }
}
