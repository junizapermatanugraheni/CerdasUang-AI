<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('recurring_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            // Sesuaikan nama tabel kategori Anda (misal: categories atau transaction_categories)
            $table->foreignId('category_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['income', 'expense']);
            $table->bigInteger('amount');
            $table->string('description');
            $table->enum('frequency', ['daily', 'weekly', 'monthly', 'yearly']);
            $table->date('start_date');
            $table->date('next_due_date'); // Tanggal eksekusi berikutnya
            $table->enum('status', ['active', 'paused'])->default('active');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recurring_transactions');
    }
};
