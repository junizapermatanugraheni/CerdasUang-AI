import { useEffect, FormEventHandler } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        return () => {
            reset('password', 'password_confirmation');
        };
    }, []);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'));
    };

    return (
        <GuestLayout>
            <Head title="Daftar Akun Baru" />

            {/* Header Form yang Lebih Menarik */}
            <div className="text-center mb-8">
                <div className="mx-auto h-12 w-12 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-md">
                    CU
                </div>
                <h2 className="mt-4 text-3xl font-extrabold text-slate-900 tracking-tight">
                    Buat Akun
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                    Mulai langkah awal kelola finansial cerdas Anda
                </p>
            </div>

            <form onSubmit={submit} className="space-y-5">
                {/* Input Nama */}
                <div>
                    <InputLabel htmlFor="name" value="Nama Lengkap" className="text-slate-700 font-semibold mb-1.5 block" />

                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        className="mt-1 block w-full px-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-900 placeholder-slate-400 shadow-sm"
                        autoComplete="name"
                        isFocused={true}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="Nama lengkap Anda"
                        required
                    />

                    <InputError message={errors.name} className="mt-2 text-sm font-medium text-red-500" />
                </div>

                {/* Input Email */}
                <div>
                    <InputLabel htmlFor="email" value="Alamat Email" className="text-slate-700 font-semibold mb-1.5 block" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full px-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-900 placeholder-slate-400 shadow-sm"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="nama@email.com"
                        required
                    />

                    <InputError message={errors.email} className="mt-2 text-sm font-medium text-red-500" />
                </div>

                {/* Input Password */}
                <div>
                    <InputLabel htmlFor="password" value="Kata Sandi" className="text-slate-700 font-semibold mb-1.5 block" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full px-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-900 placeholder-slate-400 shadow-sm"
                        autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder="••••••••"
                        required
                    />

                    <InputError message={errors.password} className="mt-2 text-sm font-medium text-red-500" />
                </div>

                {/* Input Konfirmasi Password */}
                <div>
                    <InputLabel htmlFor="password_confirmation" value="Konfirmasi Kata Sandi" className="text-slate-700 font-semibold mb-1.5 block" />

                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full px-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-900 placeholder-slate-400 shadow-sm"
                        autoComplete="new-password"
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        placeholder="••••••••"
                        required
                    />

                    <InputError message={errors.password_confirmation} className="mt-2 text-sm font-medium text-red-500" />
                </div>

                {/* Bagian Tombol Aksi & Navigasi Balik */}
                <div className="pt-2 flex flex-col space-y-4">
                    <PrimaryButton
                        className="w-full justify-center py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md shadow-indigo-100 hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        disabled={processing}
                    >
                        {processing ? 'Mendaftar...' : 'Daftar Sekarang'}
                    </PrimaryButton>

                    <div className="text-center border-t border-slate-100 pt-4">
                        <p className="text-sm text-slate-600">
                            Sudah punya akun?{' '}
                            <Link
                                href={route('login')}
                                className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors underline decoration-2 decoration-indigo-100 hover:decoration-indigo-500"
                            >
                                Masuk di sini
                            </Link>
                        </p>
                    </div>
                </div>
            </form>
        </GuestLayout>
    );
}