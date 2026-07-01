<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\RecurringTransaction;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ProcessRecurringTransactions extends Command
{
    // Nama perintah yang akan dijalankan di terminal
    protected $signature = 'app:process-recurring-transactions';

    // Deskripsi perintah
    protected $description = 'Memproses transaksi berulang yang jatuh tempo hari ini';

    public function handle()
    {
        $today = Carbon::today()->format('Y-m-d');

        // 1. Ambil semua aturan transaksi berulang yang aktif dan jatuh tempo HARI INI atau SEBELUMNYA (jika cronjob sempat mati)
        $recurringTransactions = RecurringTransaction::where('status', 'active')
            ->where('next_due_date', '<=', $today)
            ->get();

        if ($recurringTransactions->isEmpty()) {
            $this->info('Tidak ada transaksi berulang yang jatuh tempo hari ini.');
            return 0;
        }

        foreach ($recurringTransactions as $recurring) {
            // Gunakan Database Transaction supaya jika salah satu proses error, data tidak korup
            DB::transaction(function () use ($recurring, $today) {

                // 2. Insert ke tabel TRANSAKSI UTAMA Anda
                // Selesaikan/sesuaikan kolomnya dengan struktur tabel transaksi kemarin
                RecurringTransaction::create([
                    'user_id' => $recurring->user_id,
                    'category_id' => $recurring->category_id,
                    'type' => $recurring->type,
                    'amount' => $recurring->amount,
                    'description' => '[Otomatis] ' . $recurring->description,
                    'date' => $recurring->next_due_date, // Catat sesuai tanggal jatuh temponya
                ]);

                // 3. Hitung tanggal jatuh tempo berikutnya (next_due_date) berdasarkan frekuensi
                $nextDue = Carbon::parse($recurring->next_due_date);

                switch ($recurring->frequency) {
                    case 'daily':
                        $nextDue->addDay();
                        break;
                    case 'weekly':
                        $nextDue->addWeek();
                        break;
                    case 'monthly':
                        $nextDue->addMonth();
                        break;
                    case 'yearly':
                        $nextDue->addYear();
                        break;
                }

                // 4. Update aturan transaksi dengan tanggal baru tersebut
                $recurring->update([
                    'next_due_date' => $nextDue->format('Y-m-d')
                ]);
            });

            $this->info("Transaksi '{$recurring->description}' berhasil diproses.");
        }

        $this->info('Semua transaksi berulang selesai diproses.');
        return 0;
    }
}
