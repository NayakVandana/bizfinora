<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoice_templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('base_invoice_type', 40)->default('standard');
            $table->string('layout', 20)->default('stripe');
            $table->json('preset');
            $table->timestamps();

            $table->index(['company_id', 'name']);
        });

        Schema::table('companies', function (Blueprint $table) {
            $table->foreignId('default_custom_template_id')
                ->nullable()
                ->after('default_invoice_type')
                ->constrained('invoice_templates')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropConstrainedForeignId('default_custom_template_id');
        });

        Schema::dropIfExists('invoice_templates');
    }
};
