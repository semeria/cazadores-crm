<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quotes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('quote_number', 64);
            $table->string('recipient_name');
            $table->string('recipient_email')->nullable();
            $table->string('recipient_phone', 40)->nullable();
            $table->text('recipient_address')->nullable();
            $table->date('issued_at');
            $table->date('valid_until')->nullable();
            $table->char('currency', 3);
            $table->string('discount_type', 16)->default('none');
            $table->decimal('discount_value', 14, 2)->default(0);
            $table->decimal('subtotal', 14, 2)->default(0);
            $table->decimal('discount_amount', 14, 2)->default(0);
            $table->decimal('tax_rate', 5, 2)->default(0);
            $table->decimal('tax_amount', 14, 2)->default(0);
            $table->decimal('total', 14, 2)->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['organization_id', 'quote_number']);
            $table->index(['organization_id', 'created_by', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quotes');
    }
};
