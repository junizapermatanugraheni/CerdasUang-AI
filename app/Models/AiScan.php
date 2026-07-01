<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AiScan extends Model
{
    // 1. Kunci nama tabel ke database Supabase kamu
    protected $table = 'ai_scans';

    // 2. ✨ TAMBAHKAN BARIS INI: Izinkan kolom-kolom ini diisi massal
    protected $fillable = [
        'invoice_id',
        'ai_model_used',
        'raw_response',
    ];
}
