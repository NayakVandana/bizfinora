<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('buyers', function (Blueprint $table) {
            $table->string('company_name')->nullable()->after('company_id');
            $table->string('gst', 15)->nullable()->after('phone');
            $table->string('pan', 10)->nullable()->after('gst');
        });

        DB::table('buyers')->whereNull('company_name')->update([
            'company_name' => DB::raw('name'),
        ]);
    }

    public function down(): void
    {
        Schema::table('buyers', function (Blueprint $table) {
            $table->dropColumn(['company_name', 'gst', 'pan']);
        });
    }
};
