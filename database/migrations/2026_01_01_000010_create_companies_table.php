<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('companies', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('address')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('postal_code')->nullable();
            $table->string('tax_id')->nullable();
            $table->string('tax_id_label', 50)->default('GSTIN');
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('gst', 15)->nullable();
            $table->string('pan', 10)->nullable();
            $table->string('account_number')->nullable();
            $table->string('swift_bic')->nullable();
            $table->longText('logo_data_url')->nullable();
            $table->text('seller_notes')->nullable();
            $table->string('default_tax_type', 20)->default('gst');
            $table->string('default_tax_label', 50)->default('GST');
            $table->decimal('default_tax_rate', 8, 4)->default(0);
            $table->string('tax_calculation_mode', 20)->default('exclusive');
            $table->boolean('tax_per_line')->default(false);
            $table->string('default_invoice_template', 20)->default('stripe');
            $table->string('default_invoice_type', 40)->default('standard');
            $table->foreignId('default_custom_template_id')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('companies');
    }
};
