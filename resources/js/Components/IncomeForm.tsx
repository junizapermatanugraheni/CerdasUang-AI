import React from 'react';
import { useForm } from '@inertiajs/react';

interface IncomeFormProps {
    onSuccessCallback?: () => void;
}

export default function IncomeForm({ onSuccessCallback }: IncomeFormProps): React.JSX.Element {
    // State form disesuaikan dengan database: transaction_date
    const { data, setData, post, processing, errors, reset } = useForm({
        amount: '',
        source: '',
        transaction_date: new Date().toISOString().split('T')[0],
        description: '',
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        post(route('incomes.store'), {
            onSuccess: () => {
                // Reset form kecuali tanggal setelah sukses input
                reset('amount', 'source', 'description');
                if (onSuccessCallback) {
                    onSuccessCallback();
                }
            },
        });
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm max-w-md mx-auto w-full">
            <h2 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
                <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg text-lg">💰</span>
                Catat Uang Masuk
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Input Nominal */}
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Nominal (Rp)</label>
                    <input
                        type="number"
                        required
                        value={data.amount}
                        onChange={(e) => setData('amount', e.target.value)}
                        placeholder="Contoh: 5000000"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-gray-700"
                    />
                    {errors.amount && <p className="text-xs text-rose-500 mt-1">{errors.amount}</p>}
                </div>

                {/* Input Sumber Uang */}
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Sumber Uang</label>
                    <select
                        required
                        value={data.source}
                        onChange={(e) => setData('source', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-gray-700 bg-white"
                    >
                        <option value="">-- Pilih Sumber --</option>
                        <option value="Gaji">Gaji Bulanan</option>
                        <option value="Freelance">Proyek / Freelance</option>
                        <option value="Investasi">Investasi / Saham</option>
                        <option value="Transferan">Transferan / Pemberian</option>
                        <option value="Lainnya">Lainnya</option>
                    </select>
                    {errors.source && <p className="text-xs text-rose-500 mt-1">{errors.source}</p>}
                </div>

                {/* Input Tanggal Terima */}
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Tanggal Terima</label>
                    <input
                        type="date"
                        required
                        value={data.transaction_date}
                        onChange={(e) => setData('transaction_date', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-gray-700"
                    />
                    {errors.transaction_date && <p className="text-xs text-rose-500 mt-1">{errors.transaction_date}</p>}
                </div>

                {/* Input Catatan */}
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Catatan (Opsional)</label>
                    <textarea
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        placeholder="Detail keterangan tambahan..."
                        rows={2}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-gray-700 resize-none"
                    />
                    {errors.description && <p className="text-xs text-rose-500 mt-1">{errors.description}</p>}
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-3 rounded-xl shadow-lg shadow-blue-500/20 transition duration-200 active:scale-[0.98]"
                >
                    {processing ? 'Menyimpan...' : 'Simpan Uang Masuk'}
                </button>
            </form>
        </div>
    );
}