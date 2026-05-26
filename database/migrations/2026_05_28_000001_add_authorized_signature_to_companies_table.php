<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->string('default_authorized_signatory')->nullable()->after('default_show_terms_on_invoice');
            $table->boolean('default_show_authorized_signature_on_invoice')
                ->default(true)
                ->after('default_authorized_signatory');
        });
    }

    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn([
                'default_authorized_signatory',
                'default_show_authorized_signature_on_invoice',
            ]);
        });
    }
};
