import React, { useState, FormEvent } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import IncomeForm from '@/Components/IncomeForm';
import { Icon } from '@iconify/react';

interface IncomeProps {
    auth: {
        user: any;
    };
    incomes: {
        data: any[]; // Array data income sesungguhnya ada di sini
        links: any[]; // Data link navigasi tombol (prev, next, angka halaman)
        current_page: number;
        last_page: number;
        total: number;
    };
}


export default function Create({ auth, incomes }: IncomeProps): React.JSX.Element {
    const [isAddOpen, setIsAddOpen] = useState(false); // State Modal Tambah
    const [isEditOpen, setIsEditOpen] = useState(false); // State Modal Edit
    const [selectedIncome, setSelectedIncome] = useState<any>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);


    // Form Khusus Edit
    const editForm = useForm({
        amount: '',
        source: '',
        transaction_date: '',
        description: '',
    });

    // Pemicu Toast Sukses
    const triggerNotification = (msg: string) => {
        setSuccessMessage(msg);
        setTimeout(() => setSuccessMessage(null), 4000);
    };

    // Fungsi membuka modal edit
    const openEditModal = (income: any) => {
        setSelectedIncome(income);
        editForm.setData({
            amount: String(income.amount) || '',
            source: income.source || '',
            transaction_date: income.transaction_date || '',
            description: income.description || '',
        });
        setIsEditOpen(true);
    };

    // Submit Edit Data
    const handleEditSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        editForm.post(route('incomes.update', selectedIncome.id), {
            data: {
                ...editForm.data,
                _method: 'PATCH'
            },
            onSuccess: () => {
                setIsEditOpen(false);
                triggerNotification('Data uang masuk berhasil diperbarui! 🎉');
            },
        });
    };

    // Delete Data
    const handleDelete = (id: number) => {
        // Tampilkan konfirmasi bawaan browser yang aman
        if (confirm('Apakah Anda yakin ingin menghapus catatan uang masuk ini?')) {
            router.delete(route('incomes.destroy', id), {
                onSuccess: () => {
                    triggerNotification('Data uang masuk telah dihapus. 🗑️');
                }
            });
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Catat Uang Masuk" />

            <div className="max-w-6xl mx-auto space-y-6 px-4 py-6">

                {/* Toast Notifikasi */}
                {successMessage && (
                    <div className="max-w-md mx-auto p-3 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-semibold shadow-sm border border-emerald-100 text-center animate-fade-in">
                        {successMessage}
                    </div>
                )}

                {/* HEADER HALAMAN & TOMBOL TAMBAH DATA MODAL */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Manajemen Uang Masuk</h2>
                        <p className="text-sm text-gray-400">Pantau dan catat semua pemasukan finansial Anda.</p>
                    </div>
                    <button
                        onClick={() => setIsAddOpen(true)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/20 transition active:scale-95"
                    >
                        <Icon icon="heroicons:plus-circle-16-solid" className="w-5 h-5 text-blue-100" /> Tambah Uang Masuk
                    </button>
                </div>

                {/* TABEL DATA RIWAYAT */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Riwayat Uang Masuk</h3>
                    <div className="overflow-x-auto rounded-xl border border-gray-100">
                        <table className="w-full text-left text-sm text-gray-500">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-700 border-b">
                                <tr>
                                    <th className="px-6 py-3">Tanggal</th>
                                    <th className="px-6 py-3">Sumber</th>
                                    <th className="px-6 py-3">Catatan</th>
                                    <th className="px-6 py-3 text-right">Jumlah</th>
                                    <th className="px-6 py-3 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {incomes && incomes.data.length > 0 ? (
                                    incomes.data.map((income: any) => (
                                        <tr key={income.id} className="border-b hover:bg-gray-50/50 transition">
                                            <td className="px-6 py-4 text-gray-900 whitespace-nowrap">
                                                {income.transaction_date
                                                    ? new Date(income.transaction_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                                                    : '-'
                                                }
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-gray-900">{income.source}</td>
                                            <td className="px-6 py-4 truncate max-w-[150px]">{income.description || '-'}</td>
                                            <td className="px-6 py-4 text-right font-bold text-emerald-600 whitespace-nowrap">
                                                + Rp {Number(income.amount).toLocaleString('id-ID')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    {/* Tombol Edit */}
                                                    <button
                                                        onClick={() => openEditModal(income)}
                                                        className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold transition shadow-sm active:scale-95"
                                                    >
                                                        <Icon icon="heroicons:pencil-square-16-solid" className="w-3.5 h-3.5" />
                                                        Edit
                                                    </button>

                                                    {/* Tombol Hapus (Baru) */}
                                                    <button
                                                        onClick={() => handleDelete(income.id)}
                                                        className="flex items-center gap-1 px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-semibold transition shadow-sm active:scale-95"
                                                    >
                                                        <Icon icon="heroicons:trash-16-solid" className="w-3.5 h-3.5" />
                                                        Hapus
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                                            Belum ada catatan uang masuk.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                            {/* ✨ KOMPONEN PAGINATION BARU */}
                            {incomes && incomes.last_page > 1 && (
                                <div className="flex items-center justify-between border-t border-gray-100 px-4 py-4 sm:px-6 bg-gray-50/50 rounded-b-2xl">
                                    <div className="flex flex-1 justify-between sm:hidden">
                                        {/* Tampilan Mobile Singkat */}
                                        <button
                                            onClick={() => incomes.current_page > 1 && router.get(incomes.links[0].url)}
                                            disabled={incomes.current_page === 1}
                                            className="relative inline-flex items-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 active:scale-95 transition disabled:opacity-50"
                                        >
                                            Sebelumnya
                                        </button>
                                        <button
                                            onClick={() => incomes.current_page < incomes.last_page && router.get(incomes.links[incomes.links.length - 1].url)}
                                            disabled={incomes.current_page === incomes.last_page}
                                            className="relative ml-3 inline-flex items-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 active:scale-95 transition disabled:opacity-50"
                                        >
                                            Selanjutnya
                                        </button>
                                    </div>

                                    {/* Tampilan Desktop Lengkap */}
                                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                        <div>
                                            <p className="text-xs text-gray-400">
                                                Menampilkan <span className="font-semibold text-gray-700">Page {incomes.current_page}</span> dari <span className="font-semibold text-gray-700">{incomes.last_page}</span> halaman (<span className="font-semibold text-gray-700">{incomes.total}</span> data)
                                            </p>
                                        </div>
                                        <div>
                                            <nav className="isolate inline-flex -space-x-px rounded-xl gap-1" aria-label="Pagination">
                                                {incomes.links.map((link: any, index: number) => {
                                                    // Jangan render tombol jika link url kosong (misal tombol prev saat di page 1)
                                                    if (!link.url && index !== 0 && index !== incomes.links.length - 1) return null;

                                                    return (
                                                        <button
                                                            key={index}
                                                            onClick={() => link.url && router.get(link.url)}
                                                            disabled={!link.url || link.active}
                                                            className={`relative inline-flex items-center px-3.5 py-1.5 rounded-xl text-xs font-bold transition duration-200 active:scale-95 ${link.active
                                                                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                                                                    : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
                                                                } ${!link.url ? 'opacity-40 cursor-not-allowed' : ''}`}
                                                            dangerouslySetInnerHTML={{ __html: link.label }} // Untuk merender teks &laquo; (Panah) bawaan Laravel
                                                        />
                                                    );
                                                })}
                                            </nav>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </table>
                    </div>
                </div>
            </div>

            {/* ================= MODAL 1: TAMBAH DATA BARU ================= */}
            {isAddOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-gray-100 relative">
                        {/* Tombol X pojok kanan atas untuk tutup */}
                        <button
                            onClick={() => setIsAddOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold text-lg"
                        >
                            ✕
                        </button>

                        {/* Memanggil file form input yang kemarin */}
                        <IncomeForm onSuccessCallback={() => {
                            setIsAddOpen(false); // Tutup modal otomatis saat sukses simpan
                            triggerNotification('Mantap! Uang masuk berhasil dicatat. 🚀');
                        }} />
                    </div>
                </div>
            )}

            {/* ================= MODAL 2: EDIT DATA LAMA ================= */}
            {isEditOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span>✏️</span> Koreksi Uang Masuk
                        </h3>

                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Nominal (Rp)</label>
                                <input
                                    type="number"
                                    required
                                    value={editForm.data.amount}
                                    onChange={(e) => editForm.setData('amount', e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-800"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Sumber Uang</label>
                                <select
                                    required
                                    value={editForm.data.source}
                                    onChange={(e) => editForm.setData('source', e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-800"
                                >
                                    <option value="Gaji">Gaji Bulanan</option>
                                    <option value="Freelance">Proyek / Freelance</option>
                                    <option value="Investasi">Investasi / Saham</option>
                                    <option value="Transferan">Transferan / Pemberian</option>
                                    <option value="Lainnya">Lainnya</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Tanggal Terima</label>
                                <input
                                    type="date"
                                    required
                                    value={editForm.data.transaction_date}
                                    onChange={(e) => editForm.setData('transaction_date', e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-800"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Catatan</label>
                                <textarea
                                    value={editForm.data.description}
                                    onChange={(e) => editForm.setData('description', e.target.value)}
                                    rows={2}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-800 resize-none"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsEditOpen(false)}
                                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 text-sm font-semibold transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={editForm.processing}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-semibold transition shadow-md shadow-blue-500/10"
                                >
                                    {editForm.processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}