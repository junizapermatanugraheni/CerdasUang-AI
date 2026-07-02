import React, { FormEvent } from 'react';
import { useForm, Head, Link } from '@inertiajs/react';

export default function Login() {
    // Setup form Inertia untuk autentikasi
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
            <Head title="Masuk ke Aplikasi Keuangan" />

            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-md border border-gray-100">
                {/* HEADER LOGO/NAMA APLIKASI */}
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-md">
                        CU
                    </div>
                    <h2 className="mt-4 text-3xl font-extrabold text-gray-900 tracking-tight">
                        CerdasUang AI
                    </h2>
                    <p className="mt-2 text-sm text-gray-500">
                        Kelola finansial Anda dengan otomatis dan cerdas
                    </p>
                </div>

                {/* FORM LOGIN */}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md space-y-4">
                        {/* EMAIL */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Alamat Email</label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="nama@email.com"
                                required
                            />
                            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                        </div>

                        {/* PASSWORD */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Kata Sandi</label>
                            <input
                                type="password"
                                value={data.password}
                                onChange={e => setData('password', e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="••••••••"
                                required
                            />
                            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                        </div>
                    </div>

                    {/* REMEMBER ME */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember_me"
                                type="checkbox"
                                checked={data.remember}
                                onChange={e => setData('remember', e.target.checked)}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-900">
                                Ingat saya
                            </label>
                        </div>
                    </div>

                    <p className="text-sm text-gray-600">
                        Belum punya akun?{' '}
                        <Link
                            href={route('register')}
                            className="text-indigo-600 hover:text-indigo-500 font-medium underline"
                        >
                            Daftar di sini
                        </Link>
                    </p>

                    {/* BUTTON SUBMIT */}
                    <div>
                        <button
                            type="submit"
                            disabled={processing}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 transition-colors duration-200"
                        >
                            {processing ? 'Membuka Dasbor...' : 'Login'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}