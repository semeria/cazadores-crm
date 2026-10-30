<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('platform_billing_settings', function (Blueprint $table) {
            $table->boolean('registrations_enabled')->default(true);
        });
    }

    public function down(): void
    {
        Schema::table('platform_billing_settings', function (Blueprint $table) {
            $table->dropColumn('registrations_enabled');
        });
    }
};
