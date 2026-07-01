<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('ai_scans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->constrained()->onDelete('cascade');
            $table->string('ai_model_used')->default('gemini-1.5-flash'); // Model AI yang dipakai
            $table->jsonb('raw_response')->nullable(); // Respon mentah JSON dari AI (Postgres mendukung jsonb)
            $table->integer('tokens_used')->nullable(); // Opsional: jumlah token yang habis
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('create_ai_scans_tables');
    }
};
