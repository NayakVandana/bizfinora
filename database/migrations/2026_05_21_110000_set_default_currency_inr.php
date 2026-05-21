<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('invoices')) {
            DB::table('invoices')->update(['currency' => 'INR']);
        }
    }

    public function down(): void
    {
        // No rollback — INR-only is intentional for this app.
    }
};
