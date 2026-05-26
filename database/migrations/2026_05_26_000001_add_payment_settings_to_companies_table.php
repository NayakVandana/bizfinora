<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->string('account_holder')->nullable()->after('account_number');
            $table->string('account_type', 32)->nullable()->after('account_holder');
            $table->string('upi_id', 100)->nullable()->after('account_type');
            $table->string('branch_ifsc', 20)->nullable()->after('upi_id');
            $table->string('branch_name')->nullable()->after('branch_ifsc');
            $table->text('payment_note')->nullable()->after('branch_name');
            $table->string('default_payment_qr_payload', 500)->nullable()->after('payment_note');
            $table->boolean('default_show_payment_on_invoice')->default(true)->after('default_payment_qr_payload');
        });
    }

    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn([
                'account_holder',
                'account_type',
                'upi_id',
                'branch_ifsc',
                'branch_name',
                'payment_note',
                'default_payment_qr_payload',
                'default_show_payment_on_invoice',
            ]);
        });
    }
};
