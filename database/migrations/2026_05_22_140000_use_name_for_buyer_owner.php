<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('buyers', 'owner_name')) {
            return;
        }

        DB::table('buyers')
            ->whereNotNull('owner_name')
            ->where('owner_name', '!=', '')
            ->update([
                'name' => DB::raw('owner_name'),
            ]);

        Schema::table('buyers', function (Blueprint $table) {
            $table->dropColumn('owner_name');
        });
    }

    public function down(): void
    {
        Schema::table('buyers', function (Blueprint $table) {
            $table->string('owner_name')->nullable()->after('company_name');
        });

        DB::table('buyers')
            ->whereNotNull('name')
            ->update([
                'owner_name' => DB::raw('name'),
            ]);
    }
};
