<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id');
            $table->foreignId('user_id');
            $table->foreignId('buyer_id')->nullable();
            $table->string('invoice_number');
            $table->string('invoice_number_label')->nullable();
            $table->string('status', 20)->default('draft');
            $table->date('invoice_date');
            $table->string('invoice_date_label', 50)->nullable();
            $table->date('due_date')->nullable();
            $table->date('date_of_service')->nullable();
            $table->string('currency', 3)->default('INR');
            $table->string('language', 5)->default('en');
            $table->string('date_format', 20)->default('YYYY-MM-DD');
            $table->string('template', 20)->default('stripe');
            $table->string('invoice_type', 40)->default('standard');
            $table->string('tax_type', 20)->default('gst');
            $table->string('tax_label', 50)->default('GST');
            $table->decimal('tax_rate', 8, 4)->default(0);
            $table->string('tax_calculation_mode', 20)->default('exclusive');
            $table->boolean('tax_per_line')->default(false);
            $table->decimal('subtotal', 14, 2)->default(0);
            $table->decimal('tax_amount', 14, 2)->default(0);
            $table->decimal('total', 14, 2)->default(0);
            $table->decimal('discount_amount', 14, 2)->default(0);
            $table->boolean('vat_summary_visible')->default(true);
            $table->string('payment_method')->nullable();
            $table->text('header_notes')->nullable();
            $table->string('stripe_pay_url', 500)->nullable();
            $table->string('qr_code_data', 500)->nullable();
            $table->string('qr_code_description', 500)->nullable();
            $table->string('person_authorized_receive')->nullable();
            $table->string('person_authorized_issue')->nullable();
            $table->json('field_visibility')->nullable();
            $table->string('share_token', 64)->nullable()->unique();
            $table->json('document');
            $table->timestamps();

            $table->unique(['company_id', 'invoice_number']);
            $table->index(['company_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
