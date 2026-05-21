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
            $table->string('tax_id')->nullable();
            $table->string('tax_id_label', 50)->default('VAT no');
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('account_number')->nullable();
            $table->string('swift_bic')->nullable();
            $table->longText('logo_data_url')->nullable();
            $table->text('seller_notes')->nullable();
            $table->string('default_tax_type', 20)->default('vat');
            $table->string('default_tax_label', 50)->default('VAT');
            $table->decimal('default_tax_rate', 8, 4)->default(0);
            $table->string('tax_calculation_mode', 20)->default('exclusive');
            $table->boolean('tax_per_line')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('companies');
    }
};
