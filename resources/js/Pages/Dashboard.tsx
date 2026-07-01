import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Icon } from '@iconify/react';
import { Head } from '@inertiajs/react';
import React from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
// Import komponen chart atau icon pendukung jika ada

interface DashboardProps {
    auth: { user: any };
    chartData: any[];
    categories: any[];
    invoices: any[];
    financialSummary: { // ✨ Pastikan tipe data prop ini terdefinisi
        total_income: number;
        total_expense: number;
        current_balance: number;
    };
}
export default function Dashboard({ auth, chartData, categories, invoices, financialSummary }: any) {
    // Ambil data angka dari backend, jika kosong default ke 0
    const totalMasuk = financialSummary?.total_income || 0;
    const totalKeluar = financialSummary?.total_expense || 0;
    const sisaSaldo = financialSummary?.current_balance || 0;



    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Dashboard Keuangan</h2>}
        >
            <Head title="Dashboard" />

            <div className="py-12 mx-4">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">

                    {/* 📊 BARIS KARTU STATISTIK */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">

                        {/* CARD 1: SALDO UTAMA (DOMPETKU) - Dibuat paling menonjol */}
                        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-3xl text-white border border-slate-700 shadow-xl shadow-slate-900/10 transition hover:shadow-slate-900/15 duration-300">
                            {/* Dekorasi efek cahaya lingkaran di latar belakang */}
                            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-blue-500/10 rounded-full blur-xl"></div>

                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Saldo (Saldoku)</p>
                                    <h3 className="text-2xl font-black mt-1 text-white tracking-tight">
                                        Rp {financialSummary?.current_balance?.toLocaleString('id-ID') ?? 0}
                                    </h3>
                                </div>
                                <span className="p-2 bg-slate-800/80 text-blue-400 rounded-xl border border-slate-700">
                                    <Icon icon="heroicons:wallet-16-solid" className="w-5 h-5" />
                                </span>
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-2">
                                <span className="text-emerald-400">●</span> Selisih akumulasi pemasukan & pengeluaran
                            </div>
                        </div>

                        {/* CARD 2: TOTAL PEMASUKAN */}
                        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between transition hover:shadow-md duration-300">
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Uang Masuk</p>
                                <h4 className="text-xl font-extrabold text-emerald-600">
                                    + Rp {financialSummary?.total_income?.toLocaleString('id-ID') ?? 0}
                                </h4>
                                <p className="text-[10px] text-gray-400">Total catatan pendapatan</p>
                            </div>
                            <span className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                                <Icon icon="heroicons:arrow-trending-up-16-solid" className="w-5 h-5" />
                            </span>
                        </div>

                        {/* CARD 3: TOTAL PENGELUARAN */}
                        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between transition hover:shadow-md duration-300">
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Uang Keluar</p>
                                <h4 className="text-xl font-extrabold text-rose-600">
                                    - Rp {financialSummary?.total_expense?.toLocaleString('id-ID') ?? 0}
                                </h4>
                                <p className="text-[10px] text-gray-400">Total nota & input manual</p>
                            </div>
                            <span className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
                                <Icon icon="heroicons:arrow-trending-down-16-solid" className="w-5 h-5" />
                            </span>
                        </div>

                    </div>

                    {/* 📈 DI SINI AREA GRAFIK CHART DATA DAN TABEL NOTA BELANJA KAMU SEBELUMNYA */}
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm transition hover:shadow-md duration-300">
                        {/* Header Grafik yang Lebih Proporsional */}
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-md font-bold text-gray-800 flex items-center gap-2">
                                    <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                                        <Icon icon="heroicons:presentation-chart-line-16-solid" className="w-4 h-4" />
                                    </span>
                                    Tren Pengeluaran
                                </h3>
                                <p className="text-xs text-gray-400 mt-0.5">Grafik fluktuasi pengeluaran Anda bulan ini</p>
                            </div>

                            {/* Tambahan Badge Indikator Kecil */}
                            <span className="text-[11px] font-semibold bg-gray-50 text-gray-500 px-2.5 py-1 rounded-full border border-gray-100">
                                Kalkulasi Otomatis
                            </span>
                        </div>

                        {/* Area Grafik Garis (Line/Area Smooth) */}
                        <div className="h-72 w-full">
                            {chartData && chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            {/* ✨ Membuat efek warna gradient transparan di bawah garis */}
                                            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>

                                        {/* Grid Garis Latar Belakang Tipis */}
                                        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f3f4f6" />

                                        {/* Sumbu X & Y */}
                                        <XAxis dataKey="date" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                                        <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} dx={-5} />

                                        {/* Tooltip Melayang yang Dipercantik */}
                                        <Tooltip
                                            formatter={(value) => [`Rp ${Number(value).toLocaleString('id-ID')}`, 'Total Pengeluaran']}
                                            contentStyle={{
                                                background: 'rgba(255, 255, 255, 0.96)',
                                                borderRadius: '16px',
                                                border: '1px solid #f1f5f9',
                                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
                                                padding: '10px 14px'
                                            }}
                                        />

                                        {/* ✨ Garis Utama (Garis melengkung mulus/smooth pakai type="monotone") */}
                                        <Area
                                            type="monotone"
                                            dataKey="total"
                                            stroke="#3b82f6"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorTotal)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm gap-2 bg-gray-50/50 rounded-2xl border border-dashed border-gray-100">
                                    <Icon icon="heroicons:document-magnifying-glass" className="w-8 h-8 text-gray-300" />
                                    <p className="text-xs">Belum ada data grafik untuk periode ini.</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}