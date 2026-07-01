import React from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Report({ auth, transactions, summary }: any) {

    // Handler saat user mengubah filter bulan atau tahun
    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>, name: string) => {
        const url = new URL(window.location.href);
        url.searchParams.set(name, e.target.value);
        router.get(url.pathname + url.search, {}, { preserveState: true });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Laporan Arus Kas Keluar & Masuk</h2>}
        >
            <Head title="Laporan Keuangan" />

            <div className="py-12 mx-4">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">

                    {/* FILTER BULAN & TAHUN */}
                    <div className="bg-white p-4 shadow sm:rounded-lg flex flex-wrap gap-4 items-center justify-between">
                        <span className="font-medium text-gray-700">Periode Laporan</span>
                        <div className="flex space-x-2">
                            <select
                                value={summary.selected_month}
                                onChange={(e) => handleFilterChange(e, 'month')}
                                className="rounded-lg border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="01">Januari</option>
                                <option value="02">Februari</option>
                                <option value="03">Maret</option>
                                <option value="04">April</option>
                                <option value="05">Mei</option>
                                <option value="06">Juni</option>
                                <option value="07">Juli</option>
                                <option value="08">Agustus</option>
                                <option value="09">September</option>
                                <option value="10">Oktober</option>
                                <option value="11">November</option>
                                <option value="12">Desember</option>
                            </select>

                            <select
                                value={summary.selected_year}
                                onChange={(e) => handleFilterChange(e, 'year')}
                                className="rounded-lg border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="2025">2025</option>
                                <option value="2026">2026</option>
                                <option value="2027">2027</option>
                            </select>
                        </div>
                    </div>

                    {/* SUMMARY CARDS */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-green-50 border border-green-200 p-6 rounded-xl shadow-sm">
                            <p className="text-sm text-green-700 font-medium">🟢 Total Uang Masuk</p>
                            <p className="text-2xl font-extrabold text-green-900 mt-2">Rp {summary.total_income.toLocaleString('id-ID')}</p>
                        </div>
                        <div className="bg-red-50 border border-red-200 p-6 rounded-xl shadow-sm">
                            <p className="text-sm text-red-700 font-medium">🔴 Total Uang Keluar</p>
                            <p className="text-2xl font-extrabold text-red-900 mt-2">Rp {summary.total_expense.toLocaleString('id-ID')}</p>
                        </div>
                        <div className={`p-6 rounded-xl shadow-sm border ${summary.net_profit >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-amber-50 border-amber-200'}`}>
                            <p className={`text-sm font-medium ${summary.net_profit >= 0 ? 'text-blue-700' : 'text-amber-700'}`}>💵 Selisih (Sisa Saldo)</p>
                            <p className={`text-2xl font-extrabold mt-2 ${summary.net_profit >= 0 ? 'text-blue-900' : 'text-amber-900'}`}>
                                Rp {summary.net_profit.toLocaleString('id-ID')}
                            </p>
                        </div>
                    </div>

                    {/* TABEL GABUNGAN ARUS KAS */}
                    <div className="bg-white p-6 shadow sm:rounded-lg">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Detail Mutasi Transaksi</h3>
                        <div className="overflow-x-auto rounded-lg border border-gray-100">
                            <table className="w-full text-left text-sm text-gray-500">
                                <thead className="bg-gray-50 text-xs uppercase text-gray-700 border-b">
                                    <tr>
                                        <th className="px-6 py-3">Tanggal</th>
                                        <th className="px-6 py-3">Keterangan / Merchant</th>
                                        <th className="px-6 py-3">Kategori</th>
                                        <th className="px-6 py-3 text-right">Jumlah</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.length > 0 ? (
                                        transactions.map((tx: any, index: number) => (
                                            <tr key={index} className="border-b hover:bg-gray-50 transition">
                                                <td className="px-6 py-4 text-gray-900">
                                                    {new Date(tx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-sm font-semibold text-gray-900">{tx.title}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${tx.type === 'masuk' ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-gray-50 text-gray-600 ring-gray-500/10'}`}>
                                                        {tx.category}
                                                    </span>
                                                </td>
                                                <td className={`px-6 py-4 text-right font-bold text-sm ${tx.type === 'masuk' ? 'text-green-600' : 'text-red-600'}`}>
                                                    {tx.type === 'masuk' ? '+' : '-'} Rp {tx.amount.toLocaleString('id-ID')}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                                                Tidak ada mutasi transaksi pada periode ini.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}