<?php

namespace App\Http\Controllers; // ✨ Kuncinya di sini: Hapus tulisan "\API"

use App\Http\Controllers\Controller;
use App\Models\Income;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FinancialController extends Controller
{
    /**
     * 💰 MEMPROSES INPUT UANG MASUK (Mendukung Web Inertia)
     */
    public function store(Request $request)
    {
        // 1. Sesuaikan validasi dengan nama state di React (income_date)
        $request->validate([
            'amount' => 'required|numeric|min:0',
            'source' => 'required|string|max:255',
            'income_date' => 'required|date', // ✨ Diubah dari transaction_date ke income_date
            'description' => 'nullable|string',
        ]);

        try {
            // 2. Simpan ke Database Supabase
            Income::create([
                'user_id' => Auth::id(),
                'amount' => $request->amount,
                'source' => $request->source,
                'description' => $request->description,
                // 👇 Map kolom 'income_date' dari React ke nama kolom tabel DB kamu (transaction_date)
                'transaction_date' => $request->income_date,
            ]);

            // 3. Kembalikan flash message sukses untuk Inertia
            return redirect()->back()->with('message', 'Mantap! Uang masuk berhasil dicatat.');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Gagal mencatat: ' . $e->getMessage()]);
        }
    }

    /**
     * 📊 MENGAMBIL SUMMARY SALDO (Untuk Dashboard)
     */
    public function getBalanceSummary()
    {
        $userId = Auth::id();

        $totalIncome = Income::where('user_id', $userId)->sum('amount');
        $totalExpense = Invoice::where('user_id', $userId)->sum('total_amount');
        $currentBalance = $totalIncome - $totalExpense;

        return response()->json([
            'total_income' => (float)$totalIncome,
            'total_expense' => (float)$totalExpense,
            'current_balance' => (float)$currentBalance
        ], 200);
    }
}
