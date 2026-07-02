<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\AiScan;
use App\Models\Category;
use App\Models\Invoice;
use App\Models\Income;
use App\Services\GeminiService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class InvoiceController extends Controller
{
    protected $geminiService;

    public function __construct(GeminiService $geminiService)
    {
        $this->geminiService = $geminiService;
    }

    /**
     * 📊 HALAMAN UTAMA: DASHBOARD
     * Mengambil data summary statistik dan chartData
     */
    public function index()
    {
        $userId = auth()->id();

        // 1. Ambil data invoice + Eager Loading relasi kategori
        $invoices = Invoice::where('user_id', $userId)
            ->with('category') // Tambahkan ini agar nama kategori bisa dipanggil di React
            ->orderBy('created_at', 'desc')
            ->get();

        // 2. Hitung Ringkasan Keuangan
        $totalIncome = Income::where('user_id', $userId)->sum('amount');
        $totalExpense = Invoice::where('user_id', $userId)->sum('total_amount');
        $currentBalance = $totalIncome - $totalExpense;

        // 3. Ambil data tren pengeluaran untuk grafik
        $chartData = Invoice::where('user_id', $userId)
            ->where('status', 'verified')
            ->select(
                DB::raw("TO_CHAR(transaction_date, 'DD Mon') as date"),
                DB::raw('SUM(total_amount) as total')
            )
            ->groupBy(DB::raw("TO_CHAR(transaction_date, 'DD Mon'), transaction_date"))
            ->orderBy('transaction_date', 'asc')
            ->get();

        // ✨ Ambil master kategori untuk dropdown di React
        $categories = \App\Models\Category::all();

        // Kirim data ke Dashboard.tsx
        return Inertia::render('Dashboard', [
            'invoices' => $invoices,
            'chartData' => $chartData,
            'categories' => $categories, // Dikirim ke frontend
            'financialSummary' => [
                'total_income'    => (float) $totalIncome,
                'total_expense'   => (float) $totalExpense,
                'current_balance' => (float) $currentBalance,
            ]
        ]);
    }

    /**
     * 📑 HALAMAN BARU: EXPENSE / UPLOAD NOTA
     */
    public function uploadPage()
    {
        $invoices = Invoice::where('user_id', auth()->id())
            ->with('category') // ✨ Tambahkan ini juga biar nama kategori muncul di tabel halaman upload
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Expense/Upload', [
            'invoices' => $invoices,
            'categories' => \App\Models\Category::select('id', 'name')->get() // ✨ TULIS INI JUGA DI SINI!
        ]);
    }

    /**
     * 🚀 PROSES UPLOAD NOTA DENGAN AI
     */
    public function upload(Request $request)
    {
        $request->validate([
            'document' => 'required|image|mimes:jpeg,png,jpg,webp,heic|max:10240', // Naikkan ke 10MB
        ]);

        // 1. Simpan gambar terlebih dahulu
        $path = $request->file('document')->store('invoices', 'public');

        // 2. Buat data invoice awal dengan status pending
        $invoice = Invoice::create([
            'user_id' => auth()->id(),
            'image_path' => $path,
            'status' => 'pending', // default pending
            'merchant_name' => 'Gagal scan otomatis (Server AI Sibuk)',
            'total_amount' => 0,
            'category_id' => null
        ]);

        // 3. Panggil Gemini Service
        $aiResult = $this->geminiService->scanInvoice($path);

        // 4. Cek apakah Gemini sukses atau gagal (is_failed)
        if (isset($aiResult['is_failed']) && $aiResult['is_failed'] === true) {
            // Jika AI gagal/RTO/503, biarkan data awal apa adanya, arahkan user ke form edit
            return redirect()->back()->with('warning', 'Server AI sedang sibuk, silakan isi data manual atau edit data ini.');
        }

        // 5. Jika AI SUKSES, baru update data invoice dengan hasil dari AI
        $invoice->update([
            'merchant_name'    => $aiResult['merchant_name'] ?? 'Toko Tidak Diketahui',
            'total_amount'     => $aiResult['total_amount'] ?? 0,
            'transaction_date' => $aiResult['transaction_date'] ?? now()->format('Y-m-d'),
            'category_id'      => $aiResult['category_id'] ?? null,
            'status'           => 'verified' // ganti jadi verified jika sukses
        ]);

        return redirect()->back()->with('success', 'Nota berhasil diproses oleh AI! 🎉');
    }

    /**
     * 📝 PROSES INPUT MANUAL PENGELUARAN
     */
    public function storeManual(Request $request)
    {
        $request->validate([
            'merchant_name'    => 'required|string|max:255',
            'total_amount'     => 'required|numeric|min:0',
            'transaction_date' => 'required|date',
            'category_id'      => 'required|exists:categories,id', // Validasi category wajib valid
        ]);

        try {
            Invoice::create([
                'user_id'          => auth()->id(),
                'merchant_name'    => $request->merchant_name,
                'total_amount'     => $request->total_amount,
                'transaction_date' => $request->transaction_date,
                'category_id'      => $request->category_id, // Simpan category_id
                'status'           => 'verified',
                'image_path'       => null,
            ]);

            return redirect()->back()->with('message', 'Pengeluaran manual berhasil dicatat! 📝');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Gagal menyimpan data: ' . $e->getMessage()]);
        }
    }

    /**
     * ✏️ PROSES KOREKSI / UPDATE DATA NOTA
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'merchant_name'    => 'required|string|max:255',
            'total_amount'     => 'required|numeric|min:0',
            'transaction_date' => 'nullable|date',
            'category_id'      => 'required|exists:categories,id', // Tambahkan validasi category saat edit
        ]);

        try {
            $invoice = Invoice::where('user_id', auth()->id())->findOrFail($id);

            $invoice->update([
                'merchant_name'    => $request->merchant_name,
                'total_amount'     => $request->total_amount,
                'transaction_date' => $request->transaction_date,
                'category_id'      => $request->category_id, // Update category_id
            ]);

            return redirect()->back()->with('message', 'Data pengeluaran berhasil diperbarui! ✏️');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Gagal memperbarui data: ' . $e->getMessage()]);
        }
    }

    /**
     * 💰 PROSES SIMPAN DATA PENDAPATAN BARU (Income)
     */
    public function storeIncome(Request $request)
    {
        // 1. Validasi data yang dikirim dari form React
        $request->validate([
            'amount' => 'required|numeric|min:0',
            'source' => 'required|string|max:255',
            'transaction_date' => 'required|date',
            'description' => 'nullable|string',
        ]);

        // 2. Buat record baru di tabel incomes
        Income::create([
            'user_id'          => auth()->id(),
            'amount'           => $request->amount,
            'source'           => $request->source,
            'transaction_date' => $request->transaction_date,
            'description'      => $request->description,
        ]);

        // 3. Kembalikan respons sukses agar Inertia me-refresh tabel secara otomatis
        return redirect()->back()->with('message', 'Uang masuk berhasil dicatat! 🚀');
    }

    public function reportPage(Request $request)
    {
        $userId = auth()->id();

        // Ambil filter bulan & tahun (default bulan & tahun ini jika tidak diisi)
        $month = $request->get('month', now()->format('m'));
        $year = $request->get('year', now()->format('Y'));

        // 1. Ambil data Uang Masuk (Income) berdasarkan filter
        $incomes = Income::where('user_id', $userId)
            ->whereMonth('created_at', $month) // atau berdasarkan kolom tanggal khusus jika ada
            ->whereYear('created_at', $year)
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'type' => 'masuk',
                    'title' => $item->description ?? 'Pendapatan', // Sesuaikan kolom deskripsi di tabel income kamu
                    'amount' => (float) $item->amount,
                    'date' => $item->created_at->format('Y-m-d'),
                    'category' => 'Pendapatan'
                ];
            });

        // 2. Ambil data Uang Keluar (Invoice/Expense) berdasarkan filter
        $expenses = Invoice::where('user_id', $userId)
            ->whereMonth('transaction_date', $month)
            ->whereYear('transaction_date', $year)
            ->with('category')
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'type' => 'keluar',
                    'title' => $item->merchant_name,
                    'amount' => (float) $item->total_amount,
                    'date' => $item->transaction_date,
                    'category' => $item->category ? $item->category->name : 'Tanpa Kategori'
                ];
            });

        // 3. Gabungkan kedua data dan urutkan berdasarkan tanggal terbaru
        $allTransactions = $incomes->concat($expenses)->sortByDesc('date')->values();

        // 4. Hitung total summary untuk bulan terpilih
        $totalIncome = $incomes->sum('amount');
        $totalExpense = $expenses->sum('amount');

        return Inertia::render('Expense/Report', [
            'transactions' => $allTransactions,
            'summary' => [
                'total_income' => $totalIncome,
                'total_expense' => $totalExpense,
                'net_profit' => $totalIncome - $totalExpense,
                'selected_month' => $month,
                'selected_year' => $year,
            ]
        ]);
    }

    public function incomePage()
    {
        // 1. Ambil data uang masuk dari database milik user yang login
        // ✨ Ubah ->get() menjadi ->paginate(10)
        $incomes = Income::where('user_id', auth()->id())
            ->orderBy('transaction_date', 'desc')
            ->paginate(10); // Menampilkan 10 data per halaman

        // 2. Lempar data 'incomes' ke React (Tanpa perlu Category lagi)
        return Inertia::render('Income/Create', [
            'incomes' => $incomes
        ]);
    }

    public function updateIncome(Request $request, $id)
    {
        // Validasi menggunakan field database kamu: transaction_date
        $request->validate([
            'amount' => 'required|numeric',
            'source' => 'required|string',
            'transaction_date' => 'required|date',
            'description' => 'nullable|string',
        ]);

        $income = Income::where('user_id', auth()->id())->findOrFail($id);

        $income->update([
            'amount' => $request->amount,
            'source' => $request->source,
            'transaction_date' => $request->transaction_date,
            'description' => $request->description,
        ]);

        return redirect()->back();
    }
    public function destroyIncome($id)
    {
        // Pastikan data yang dihapus benar-benar milik user yang sedang login
        $income = Income::where('user_id', auth()->id())->findOrFail($id);

        $income->delete();

        return redirect()->back()->with('message', 'Data uang masuk berhasil dihapus! 🗑️');
    }
    public function destroyExpense($id)
    {
        // 1. Cari data invoice yang murni milik user login
        $invoice = Invoice::where('user_id', auth()->id())->findOrFail($id);

        // 2. Jika ada file gambar nota, hapus dari storage fisik
        if ($invoice->image_path && Storage::disk('public')->exists($invoice->image_path)) {
            Storage::disk('public')->delete($invoice->image_path);
        }

        // 3. Hapus data dari database
        $invoice->delete();

        return redirect()->back()->with('message', 'Catatan pengeluaran berhasil dihapus! 🗑️');
    }
}
