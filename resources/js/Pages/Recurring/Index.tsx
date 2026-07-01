import React, { FormEvent } from 'react';
import { useForm, router } from '@inertiajs/react';

// 1. Definisikan Interface Data
interface Category {
    id: number;
    name: string;
}

interface RecurringTransaction {
    id: number;
    category_id: number;
    type: 'income' | 'expense';
    amount: number;
    description: string;
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    start_date: string;
    next_due_date: string;
    status: 'active' | 'paused';
    category?: Category;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    recurringTransactions: {
        data: RecurringTransaction[];
        links: PaginationLink[];
    };
    categories: Category[];
}

export default function Index({ recurringTransactions, categories }: Props) {
    // 2. Setup Form Inertia dengan Type Safety
    const { data, setData, post, processing, errors, reset } = useForm({
        category_id: '' as string | number,
        type: 'expense' as 'income' | 'expense',
        amount: '' as string | number,
        description: '',
        frequency: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'yearly',
        start_date: '',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(route('recurring.store'), {
            onSuccess: () => reset(),
        });
    };

    const handleToggleStatus = (id: number) => {
        router.patch(route('recurring.toggle', id));
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Manajemen Transaksi Berulang (TSX)</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* KIRI: FORM INPUT */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-fit">
                    <h2 className="text-lg font-semibold mb-4 text-gray-700">Tambah Transaksi Rutin</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tipe</label>
                            <select
                                value={data.type}
                                onChange={e => setData('type', e.target.value as 'income' | 'expense')}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="expense">Pengeluaran (Uang Keluar)</option>
                                <option value="income">Pemasukan (Uang Masuk)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Kategori</label>
                            <select
                                value={data.category_id}
                                onChange={e => setData('category_id', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="">-- Pilih Kategori --</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                            {errors.category_id && <span className="text-red-500 text-xs">{errors.category_id}</span>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nominal (Rp)</label>
                            <input
                                type="number"
                                value={data.amount}
                                onChange={e => setData('amount', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                placeholder="Contoh: 150000"
                            />
                            {errors.amount && <span className="text-red-500 text-xs">{errors.amount}</span>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Deskripsi / Keterangan</label>
                            <input
                                type="text"
                                value={data.description}
                                onChange={e => setData('description', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                placeholder="Misal: Langganan Netflix"
                            />
                            {errors.description && <span className="text-red-500 text-xs">{errors.description}</span>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Frekuensi Perulangan</label>
                            <select
                                value={data.frequency}
                                onChange={e => setData('frequency', e.target.value as 'daily' | 'weekly' | 'monthly' | 'yearly')}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="daily">Harian</option>
                                <option value="weekly">Mingguan</option>
                                <option value="monthly">Bulanan</option>
                                <option value="yearly">Tahunan</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tanggal Mulai / Jatuh Tempo Pertama</label>
                            <input
                                type="date"
                                value={data.start_date}
                                onChange={e => setData('start_date', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                            {errors.start_date && <span className="text-red-500 text-xs">{errors.start_date}</span>}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 font-medium"
                        >
                            {processing ? 'Menyimpan...' : 'Simpan Otomatisasi'}
                        </button>
                    </form>
                </div>

                {/* KANAN: TABEL DAFTAR TRANSAKSI BERULANG */}
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-lg font-semibold mb-4 text-gray-700">Daftar Aturan Aktif</h2>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Keterangan</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nominal</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Frekuensi</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Next Due</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200 text-sm">
                                {recurringTransactions.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-gray-400">Belum ada transaksi berulang yang dibuat.</td>
                                    </tr>
                                ) : (
                                    recurringTransactions.data.map((item) => (
                                        <tr key={item.id}>
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-gray-900">{item.description}</div>
                                                <div className="text-xs text-gray-500">{item.category?.name || 'Tanpa Kategori'}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={item.type === 'income' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                                                    {item.type === 'income' ? '+' : '-'} Rp {Number(item.amount).toLocaleString('id-ID')}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 capitalize text-gray-600">{item.frequency}</td>
                                            <td className="px-4 py-3 text-gray-600">{item.next_due_date}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                    {item.status === 'active' ? 'Aktif' : 'Jeda'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    onClick={() => handleToggleStatus(item.id)}
                                                    className={`text-xs px-3 py-1 rounded border ${item.status === 'active' ? 'border-yellow-500 text-yellow-600 hover:bg-yellow-50' : 'border-green-500 text-green-600 hover:bg-green-50'}`}
                                                >
                                                    {item.status === 'active' ? 'Pause' : 'Resume'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {recurringTransactions.links && recurringTransactions.links.length > 3 && (
                        <div className="mt-4 flex justify-end space-x-1">
                            {recurringTransactions.links.map((link, i) => (
                                <button
                                    key={i}
                                    disabled={!link.url || link.active}
                                    onClick={() => link.url && router.get(link.url)}
                                    className={`px-3 py-1 text-xs border rounded ${link.active ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} ${!link.url && 'opacity-50'}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}