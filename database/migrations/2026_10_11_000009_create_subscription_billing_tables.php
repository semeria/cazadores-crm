<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('organizations', function (Blueprint $table) {
            $table->boolean('has_legacy_access')->default(true)->index();
        });

        Schema::create('plans', function (Blueprint $table) {
            $table->id();
            $table->string('name', 120);
            $table->string('slug', 140)->unique();
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2);
            $table->char('currency', 3)->default('MXN');
            $table->unsignedSmallInteger('interval_count');
            $table->string('interval_unit', 16);
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
        });

        Schema::create('coupons', function (Blueprint $table) {
            $table->id();
            $table->string('code', 64)->unique();
            $table->string('name', 120);
            $table->text('description')->nullable();
            $table->string('benefit_type', 24);
            $table->decimal('benefit_value', 10, 2);
            $table->boolean('is_trial')->default(false);
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->unsignedInteger('max_redemptions')->nullable();
            $table->unsignedSmallInteger('max_per_organization')->default(1);
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
        });

        Schema::create('organization_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('plan_id')->constrained()->restrictOnDelete();
            $table->foreignId('coupon_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('requested_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('status', 24)->index();
            $table->string('plan_name', 120);
            $table->decimal('plan_price', 10, 2);
            $table->char('currency', 3)->default('MXN');
            $table->unsignedSmallInteger('interval_count');
            $table->string('interval_unit', 16);
            $table->decimal('discount_amount', 10, 2)->default(0);
            $table->decimal('amount_due', 10, 2)->default(0);
            $table->unsignedSmallInteger('free_months')->default(0);
            $table->boolean('is_trial')->default(false);
            $table->string('coupon_code', 64)->nullable();
            $table->string('coupon_benefit_type', 24)->nullable();
            $table->decimal('coupon_benefit_value', 10, 2)->nullable();
            $table->timestamp('requested_at');
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->timestamp('grace_ends_at')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->text('review_note')->nullable();
            $table->timestamps();
            $table->index(['organization_id', 'status']);
        });

        Schema::create('coupon_redemptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('coupon_id')->constrained()->restrictOnDelete();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('subscription_id')->unique()->constrained('organization_subscriptions')->cascadeOnDelete();
            $table->string('code', 64);
            $table->string('status', 16)->index();
            $table->decimal('discount_amount', 10, 2)->default(0);
            $table->unsignedSmallInteger('free_months')->default(0);
            $table->boolean('is_trial')->default(false);
            $table->timestamp('redeemed_at')->nullable();
            $table->timestamps();
            $table->index(['coupon_id', 'organization_id', 'status']);
        });

        Schema::create('subscription_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subscription_id')->constrained('organization_subscriptions')->cascadeOnDelete();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('provider', 32)->default('manual_transfer');
            $table->string('status', 16)->index();
            $table->decimal('amount', 10, 2);
            $table->char('currency', 3)->default('MXN');
            $table->timestamp('reviewed_at')->nullable();
            $table->text('review_note')->nullable();
            $table->timestamps();
            $table->index(['organization_id', 'status']);
        });

        Schema::create('platform_billing_settings', function (Blueprint $table) {
            $table->id();
            $table->text('transfer_instructions')->nullable();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('platform_billing_settings');
        Schema::dropIfExists('subscription_payments');
        Schema::dropIfExists('coupon_redemptions');
        Schema::dropIfExists('organization_subscriptions');
        Schema::dropIfExists('coupons');
        Schema::dropIfExists('plans');

        Schema::table('organizations', function (Blueprint $table) {
            $table->dropColumn('has_legacy_access');
        });
    }
};
