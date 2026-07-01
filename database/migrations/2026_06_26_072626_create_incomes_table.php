<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('incomes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->decimal('amount', 15, 2); // Untuk menyimpan jumlah uang masuk
            $table->string('source');         // Sumber uang (misal: Gaji, Transferan, Bonus)
            $table->text('description')->nullable(); // Catatan tambahan (opsional)
            $table->date('transaction_date'); // Tanggal uang masuk
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('incomes');
    }
};
