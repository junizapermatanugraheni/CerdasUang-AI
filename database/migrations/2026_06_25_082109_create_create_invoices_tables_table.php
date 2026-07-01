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
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Pemilik nota
            $table->foreignId('category_id')->nullable()->constrained('categories')->onDelete('set null'); // Kategori dari AI
            $table->string('merchant_name')->nullable(); // Nama Toko/Vendor
            $table->decimal('total_amount', 15, 2)->default(0); // Total Nominal Uang
            $table->date('transaction_date')->nullable(); // Tanggal di nota
            $table->string('image_path')->nullable(); // Lokasi simpan file foto nota
            $table->enum('status', ['pending', 'verified'])->default('pending'); // Status validasi user
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('create_invoices_tables');
    }
};
