<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->date('invoice_date')->nullable()->after('status');
            $table->string('invoice_date_label', 50)
                ->nullable()
                ->after('invoice_number_label');
        });

        DB::table('invoices')->update([
            'invoice_date' => DB::raw('issue_date'),
        ]);

        Schema::table('invoices', function (Blueprint $table) {
            $table->dropColumn('issue_date');
        });
    }

    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->date('issue_date')->nullable()->after('status');
        });

        DB::table('invoices')->update([
            'issue_date' => DB::raw('invoice_date'),
        ]);

        Schema::table('invoices', function (Blueprint $table) {
            $table->dropColumn(['invoice_date', 'invoice_date_label']);
        });
    }
};
