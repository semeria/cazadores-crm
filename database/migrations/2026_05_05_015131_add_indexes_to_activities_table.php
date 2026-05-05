<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('activities', function (Blueprint $table) {
            $table->index(['organization_id', 'status']);
            $table->index(['organization_id', 'due_date']);
            $table->index('assigned_user_id');
            $table->index('agent_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('activities', function (Blueprint $table) {

            $schemaManager = Schema::getConnection()->getSchemaBuilder();

            if ($schemaManager->hasIndex('activities', 'activities_organization_id_status_index')) {
                $table->dropIndex(['organization_id', 'status']);
            }

            if ($schemaManager->hasIndex('activities', 'activities_organization_id_due_date_index')) {
                $table->dropIndex(['organization_id', 'due_date']);
            }

            if ($schemaManager->hasIndex('activities', 'activities_assigned_user_id_index')) {
                $table->dropIndex(['assigned_user_id']);
            }

            if ($schemaManager->hasIndex('activities', 'activities_agent_id_index')) {
                $table->dropIndex(['agent_id']);
            }
        });
    }
};
