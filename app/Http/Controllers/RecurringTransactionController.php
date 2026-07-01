<?php

namespace App\Http\Controllers;

use App\Models\RecurringTransaction;
use App\Models\Category; // Sesuaikan
use Illuminate\Http\Request;
use Inertia\Inertia;

class RecurringTransactionController extends Controller
{
    public function index()
    {
        $recurringTransactions = RecurringTransaction::with('category')
            ->where('user_id', auth()->id())
            ->latest()
            ->paginate(10);

        $categories = Category::all(); // Untuk opsi pilihan di form frontend

        return Inertia::render('Recurring/Index', [
            'recurringTransactions' => $recurringTransactions,
            'categories' => $categories
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'type' => 'required|in:income,expense',
            'amount' => 'required|numeric|min:1',
            'description' => 'required|string|max:255',
            'frequency' => 'required|in:daily,weekly,monthly,yearly',
            'start_date' => 'required|date',
        ]);

        // Otomatis pasang user_id dan next_due_date awal
        $validated['user_id'] = auth()->id();
        $validated['next_due_date'] = $request->start_date; 

        RecurringTransaction::create($validated);

        return redirect()->back()->with('success', 'Transaksi berulang berhasil ditambahkan!');
    }

    // Fungsi untuk pause/resume otomatisasi
    public function toggleStatus(RecurringTransaction $recurringTransaction)
    {
        $this->authorize('update', $recurringTransaction); // Opsional jika pakai Policy

        $newStatus = $recurringTransaction->status === 'active' ? 'paused' : 'active';
        $recurringTransaction->update(['status' => $newStatus]);

        return redirect()->back()->with('success', 'Status transaksi berhasil diperbarui!');
    }
}