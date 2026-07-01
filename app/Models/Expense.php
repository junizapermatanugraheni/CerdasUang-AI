<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Expense extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'amount',
        'description',
        'category',      // Contoh: Makanan, Transportasi, Bulanan
        'expense_date',  // Tanggal pengeluaran
        'image_path',    // Untuk menyimpan path foto nota yang di-upload ke Supabase Storage
        'ai_raw_response' // Menghemat API call dengan menyimpan log JSON mentah dari Gemini AI (Opsional)
    ];

    // Relasi balik ke User
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
