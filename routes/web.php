<?php

use App\Http\Controllers\FinancialController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RecurringTransactionController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// 🟢 1. HALAMAN UTAMA (Welcome/Landing Page) - Kembalikan ini agar tidak Not Found!
// Route::get('/', function () {
//     return Inertia::render('Welcome', [
//         'canLogin' => Route::has('login'),
//         'canRegister' => Route::has('register'),
//         'laravelVersion' => Application::VERSION,
//         'phpVersion' => PHP_VERSION,
//     ]);
// });
Route::get('/', function () {
    return redirect()->route('login');
});

// 🔒 2. GABUNGAN RUTE HALAMAN WEB INERTIA (Butuh Login & Verifikasi)
Route::middleware(['auth', 'verified'])->group(function () {

    // 📊 Dashboard Utama
    Route::get('/dashboard', [InvoiceController::class, 'index'])->name('dashboard');

    // 💰 FITUR UANG MASUK (Income)
    // Menampilkan halaman Create.tsx lewat controller
    Route::get('/incomes/create', [InvoiceController::class, 'incomePage'])->name('incomes.create');

    // 🛠️ FIX: Ubah dari FinancialController ke InvoiceController@storeIncome
    Route::post('/incomes', [InvoiceController::class, 'storeIncome'])->name('incomes.store');

    // Fitur Update Income
    Route::patch('/incomes/{id}', [InvoiceController::class, 'updateIncome'])->name('incomes.update');

    // Fitur Delete Income
    Route::delete('/incomes/{id}', [InvoiceController::class, 'destroyIncome'])->name('incomes.destroy');

    // 🛠️ FIX 2: Sesuaikan nama route dan method spoofing untuk update income
    Route::post('/incomes/{id}', [InvoiceController::class, 'updateIncome'])->name('incomes.update');


    // 💸 FITUR UANG KELUAR / NOTA (Expense)
    Route::get('/expenses/upload', [InvoiceController::class, 'uploadPage'])->name('expenses.upload');
    Route::post('/invoices/upload', [InvoiceController::class, 'upload'])->name('invoices.upload');
    Route::post('/invoices/storeManual', [InvoiceController::class, 'storeManual'])->name('invoices.storeManual');
    Route::post('/invoices/{id}', [InvoiceController::class, 'update'])->name('invoices.updateExpense');
    Route::delete('/invoices/{id}', [InvoiceController::class, 'destroyExpense'])->name('expenses.destroy');

    Route::get('/report', [InvoiceController::class, 'reportPage'])->name('expenses.report');

    // Internal API
    Route::get('/finance/summary', [FinancialController::class, 'getBalanceSummary']);
    Route::get('/finance/report', [FinancialController::class, 'getFinancialReport']);

    Route::get('/recurring-transactions', [RecurringTransactionController::class, 'index'])->name('recurring.index');
    Route::post('/recurring-transactions', [RecurringTransactionController::class, 'store'])->name('recurring.store');
    Route::patch('/recurring-transactions/{recurringTransaction}/toggle', [RecurringTransactionController::class, 'toggleStatus'])->name('recurring.toggle');
});

// 👤 3. MANAJEMEN PROFILE USER
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';
