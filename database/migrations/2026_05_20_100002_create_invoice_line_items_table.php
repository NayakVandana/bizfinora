<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoice_line_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->constrained()->cascadeOnDelete();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->string('description');
            $table->decimal('quantity', 14, 4)->default(1);
            $table->string('unit', 20)->nullable();
            $table->decimal('unit_price', 14, 2)->default(0);
            $table->decimal('tax_rate', 8, 4)->nullable();
            $table->decimal('line_total', 14, 2)->default(0);
            $table->decimal('line_tax', 14, 2)->default(0);
            $table->timestamps();

            $table->index(['invoice_id', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoice_line_items');
    }
};
