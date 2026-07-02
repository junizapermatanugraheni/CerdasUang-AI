import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'; // Sesuaikan path layout kamu
import { Toaster, toast } from 'react-hot-toast'; // Sesuaikan jika pakai library toast lain
import { Icon } from '@iconify/react';

export default function Upload({ auth, invoices, categories }: any) {
    console.log("Data Kategori dari Backend:", categories);

    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [isManualOpen, setIsManualOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterDate, setFilterDate] = useState('');

    // Form 1: Upload Nota Baru (AI)
    const uploadForm = useForm({
        document: null as File | null,
    });

    // Form 2: Input Manual
    const manualForm = useForm({
        merchant_name: '',
        total_amount: '',
        transaction_date: new Date().toISOString().split('T')[0],
        category_id: '',
    });

    // Form 3: Edit / Koreksi
    const editForm = useForm({
        merchant_name: '',
        total_amount: 0,
        transaction_date: '',
        category_id: '',
    });

    // Handler AI Upload
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImagePreview(URL.createObjectURL(file));
            uploadForm.setData('document', file);
        }
    };

    const handleUploadSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const loadingToast = toast.loading('Gemini AI sedang membaca nota kamu...');
        uploadForm.post(route('invoices.upload'), {
            forceFormData: true,
            onSuccess: () => {
                toast.dismiss(loadingToast);
                toast.success('Nota berhasil diproses oleh Gemini AI! 🎉');
                setImagePreview(null);
                setIsUploadOpen(false);
                uploadForm.reset();
            },
            onError: (err) => {
                toast.dismiss(loadingToast);
                toast.error(err.document || 'Gagal memproses nota.');
            }
        });
    };

    // Handler Input Manual
    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        manualForm.post(route('invoices.storeManual'), {
            onSuccess: () => {
                toast.success('Pengeluaran manual berhasil dicatat! 📝');
                setIsManualOpen(false);
                manualForm.reset();
            },
            onError: (errors) => {
                if (errors.error) {
                    toast.error(errors.error);
                } else if (Object.keys(errors).length > 0) {
                    const firstErrorKey = Object.keys(errors)[0];
                    toast.error(errors[firstErrorKey]);
                } else {
                    toast.error('Gagal menyimpan pengeluaran manual.');
                }
            }
        });
    };

    // Handler Edit
    const openEditModal = (invoice: any) => {
        setSelectedInvoice(invoice);
        editForm.setData({
            merchant_name: invoice.merchant_name || '',
            total_amount: invoice.total_amount || 0,
            transaction_date: invoice.transaction_date || '',
            category_id: invoice.category_id ? String(invoice.category_id) : '',
        });
        setIsEditOpen(true);
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        editForm.post(route('invoices.update', selectedInvoice.id), {
            onSuccess: () => {
                toast.success('Data berhasil dikoreksi! ✨');
                setIsEditOpen(false);
            },
            onError: () => toast.error('Gagal memperbarui data.')
        });
    };

    const handleDeleteExpense = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus pengeluaran ini? File nota yang tersimpan juga akan dihapus permanen.')) {
            router.delete(route('expenses.destroy', id), {
                onSuccess: () => {
                    // Opsional: panggil toast/notifikasi jika ada
                }
            });
        }
    };

    const filteredInvoices = invoices ? invoices.filter((invoice: any) => {
        const matchSearch = invoice.merchant_name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchDate = filterDate ? invoice.transaction_date === filterDate : true;
        return matchSearch && matchDate;
    }) : [];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Manajemen Nota & Pengeluaran</h2>}
        >
            <Head title="Upload & Daftar Nota" />

            <div className="py-12 mx-4">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    <div className="bg-white p-6 shadow sm:rounded-lg">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                            <h3 className="text-lg font-medium text-gray-900">Daftar Pengeluaran Terdeteksi</h3>

                            {/* Tombol Aksi Desktop */}
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setIsManualOpen(true)}
                                    className="inline-flex items-center rounded-md bg-white border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition"
                                >
                                    ✍️ Catat Manual
                                </button>
                                <button
                                    onClick={() => setIsUploadOpen(true)}
                                    className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition"
                                >
                                    📸 Scan Nota (AI)
                                </button>
                            </div>
                        </div>

                        {/* Filter */}
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mb-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Nama Merchant</label>
                                <input
                                    type="text"
                                    placeholder="Cari nama toko..."
                                    className="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Tanggal Transaksi</label>
                                <div className="flex space-x-2 mt-1">
                                    <input
                                        type="date"
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                        value={filterDate}
                                        onChange={(e) => setFilterDate(e.target.value)}
                                    />
                                    {filterDate && (
                                        <button onClick={() => setFilterDate('')} className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-xs hover:bg-gray-200 transition">Reset</button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <hr className="border-t border-gray-200 my-4" />

                        {/* TABEL DESKTOP */}
                        <div className="hidden sm:block max-h-96 overflow-y-auto border border-gray-100 rounded-lg shadow-inner">
                            <table className="w-full text-left text-sm text-gray-500">
                                <thead className="bg-gray-100 text-xs uppercase text-gray-700 sticky top-0 z-10 shadow-sm">
                                    <tr>
                                        <th className="px-4 py-3">Tanggal</th>
                                        <th className="px-4 py-3">Nama Toko</th>
                                        <th className="px-4 py-3">Sumber</th>
                                        <th className="px-4 py-3">Kategori</th>
                                        <th className="px-4 py-3">Total</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredInvoices.length > 0 ? (
                                        filteredInvoices.map((invoice: any) => (
                                            <tr key={invoice.id} className="border-b hover:bg-gray-50 cursor-pointer transition" onClick={() => openEditModal(invoice)}>
                                                <td className="px-4 py-3 text-gray-900">
                                                    {invoice.transaction_date ? new Date(invoice.transaction_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                                                </td>
                                                <td className="px-4 py-3 font-medium text-gray-900">{invoice.merchant_name}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${invoice.image_path ? 'bg-purple-50 text-purple-700 ring-purple-700/10' : 'bg-gray-50 text-gray-700 ring-gray-700/10'}`}>
                                                        {invoice.image_path ? '📸 AI Scan' : '✍️ Manual'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">{invoice.category ? invoice.category.name : 'Tanpa Kategori'}</td>
                                                <td className="px-4 py-3 font-semibold text-gray-900">Rp {Number(invoice.total_amount).toLocaleString('id-ID')}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${invoice.status === 'verified' ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-yellow-50 text-yellow-700 ring-yellow-600/20'}`}>
                                                        {invoice.status}
                                                    </span>
                                                </td>
                                                {/* 👇 TOMBOL HAPUS DATA DESKTOP */}
                                                <td className="px-4 py-3 text-center">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation(); // 🛠️ Mencegah modal edit terbuka saat tombol hapus diklik
                                                            handleDeleteExpense(invoice.id);
                                                        }}
                                                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition active:scale-95"
                                                        title="Hapus Data"
                                                    >
                                                        <Icon icon="heroicons:trash-16-solid" className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td className="px-4 py-4 text-center text-gray-400" colSpan={6}>Belum ada data pengeluaran.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* MOBILE LIST */}
                        <div className="sm:hidden max-h-[400px] overflow-y-auto pr-1 space-y-3">
                            {filteredInvoices.length > 0 ? (
                                filteredInvoices.map((invoice: any) => (
                                    <div key={invoice.id} className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center cursor-pointer" onClick={() => openEditModal(invoice)}>
                                        <div className="flex flex-col space-y-1">
                                            <span className="font-bold text-gray-900 text-sm truncate max-w-[150px]">{invoice.merchant_name}</span>
                                            <span className="text-xs text-gray-400">
                                                {invoice.image_path ? '📸 AI' : '✍️ Manual'} • {invoice.transaction_date ? new Date(invoice.transaction_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '-'}
                                            </span>
                                        </div>
                                        {/* Bagian Kanan: Harga + Tombol Sampah */}
                                        <div className="flex items-center gap-3">
                                            <span className="font-extrabold text-indigo-600 text-sm">Rp {Number(invoice.total_amount).toLocaleString('id-ID')}</span>

                                            {/* 👇 TOMBOL HAPUS DATA MOBILE */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation(); // 🛠️ Mencegah modal edit terbuka
                                                    handleDeleteExpense(invoice.id);
                                                }}
                                                className="p-1.5 bg-white text-rose-500 rounded-lg border border-gray-100 shadow-sm hover:bg-rose-50 transition active:scale-95"
                                            >
                                                <Icon icon="heroicons:trash-16-solid" className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-400 text-sm py-6">Belum ada data pengeluaran.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Toaster position='top-right' reverseOrder={false} />

            {/* Floating Buttons Mobile */}
            {/* <div className="sm:hidden fixed bottom-10 right-6 flex flex-col space-y-2 z-40">
                <button onClick={() => setIsManualOpen(true)} className="w-12 h-12 bg-white text-gray-700 border border-gray-300 rounded-full shadow-lg flex items-center justify-center text-xl font-bold">✍️</button>
                <button onClick={() => setIsUploadOpen(true)} className="w-12 h-12 bg-white text-gray-700 border border-gray-300 rounded-full shadow-lg flex items-center justify-center text-xl font-bold">📸</button>
            </div> */}

            {/* MODAL 1: SCAN NOTA DENGAN AI */}
            {isUploadOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl relative">
                        <button onClick={() => { setIsUploadOpen(false); setImagePreview(null); }} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-lg">✕</button>
                        <h3 className="mb-4 text-lg font-bold text-gray-900">Scan Nota Baru 📸</h3>
                        <form onSubmit={handleUploadSubmit} className="space-y-4">
                            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 p-6 rounded-lg bg-gray-50">
                                {imagePreview ? <img src={imagePreview} alt="Preview" className="mb-4 max-h-48 rounded object-cover" /> : <p className="mb-4 text-sm text-gray-500 text-center">Format file: JPG, PNG, PDF</p>}
                                <label className="cursor-pointer rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
                                    Pilih File
                                    <input type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFileChange} />
                                </label>
                            </div>
                            <div className="flex justify-end space-x-2 pt-2">
                                <button type="button" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm" onClick={() => { setIsUploadOpen(false); setImagePreview(null); }}>Batal</button>
                                <button type="submit" disabled={uploadForm.processing} className="flex-1 rounded-lg bg-green-600 py-2 text-sm font-semibold text-white shadow-sm disabled:opacity-50">
                                    {uploadForm.processing ? 'Memproses...' : 'Proses dengan AI ✨'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 2: INPUT MANUAL */}
            {isManualOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl relative">
                        <button onClick={() => setIsManualOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-lg">✕</button>
                        <h3 className="mb-4 text-lg font-bold text-gray-900">Catat Pengeluaran Manual ✍️</h3>
                        <form onSubmit={handleManualSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nama Toko / Keperluan</label>
                                <input type="text" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm" placeholder="Contoh: Warung Madura, Bayar Kos" value={manualForm.data.merchant_name} onChange={e => manualForm.setData('merchant_name', e.target.value)} />
                            </div>
                            <div className="flex flex-col gap-1 mb-4">
                                <label className="text-sm font-medium text-gray-700">Kategori</label>
                                <select
                                    value={String(manualForm.data.category_id)} // ✨ Di-force ke string
                                    onChange={(e) => manualForm.setData('category_id', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
                                    required
                                >
                                    <option value="">-- Pilih Kategori --</option>
                                    {categories && categories.map((category: any) => (
                                        <option key={category.id} value={String(category.id)}> {/* ✨ Nilai value jadikan string */}
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Jumlah Pengeluaran (Rp)</label>
                                <input type="number" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm" placeholder="Contoh: 15000" value={manualForm.data.total_amount} onChange={e => manualForm.setData('total_amount', e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tanggal</label>
                                <input type="date" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm" value={manualForm.data.transaction_date} onChange={e => manualForm.setData('transaction_date', e.target.value)} />
                            </div>
                            <div className="flex justify-end space-x-2 pt-2">
                                <button type="button" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm" onClick={() => setIsManualOpen(false)}>Batal</button>
                                <button type="submit" disabled={manualForm.processing} className="flex-1 rounded-lg bg-indigo-600 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">Simpan Catatan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 3: KOREKSI DATA */}
            {isEditOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl relative">
                        <button onClick={() => setIsEditOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-lg">✕</button>
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Koreksi Data Nota ✏️</h3>
                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nama Toko</label>
                                <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm" value={editForm.data.merchant_name} onChange={e => editForm.setData('merchant_name', e.target.value)} />
                            </div>
                            <div className="flex flex-col gap-1 mb-4">
                                <label className="text-sm font-medium text-gray-700">Kategori</label>
                                <select
                                    value={String(editForm.data.category_id)} // ✨ Menggunakan editForm dan di-force ke string
                                    onChange={(e) => editForm.setData('category_id', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
                                    required
                                >
                                    <option value="">-- Pilih Kategori --</option>
                                    {categories && categories.map((category: any) => (
                                        <option key={category.id} value={String(category.id)}> {/* ✨ Nilai value jadikan string */}
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Total Pengeluaran (Rp)</label>
                                <input type="number" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm" value={editForm.data.total_amount} onChange={e => editForm.setData('total_amount', Number(e.target.value))} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tanggal Transaksi</label>
                                <input type="date" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm" value={editForm.data.transaction_date} onChange={e => editForm.setData('transaction_date', e.target.value)} />
                            </div>
                            <div className="flex justify-end space-x-2 pt-2">
                                <button type="button" className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm" onClick={() => setIsEditOpen(false)}>Batal</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm" disabled={editForm.processing}>Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}