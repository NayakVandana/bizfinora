<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->string('gst', 15)->nullable()->after('phone');
            $table->string('pan', 10)->nullable()->after('gst');
        });

        DB::table('companies')
            ->whereNull('gst')
            ->whereNotNull('tax_id')
            ->where('tax_id', '!=', '')
            ->update(['gst' => DB::raw('tax_id')]);
    }

    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn(['gst', 'pan']);
        });
    }
};
