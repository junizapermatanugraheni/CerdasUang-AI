import { useState, PropsWithChildren, ReactNode } from 'react';
import Dropdown from '@/Components/Dropdown';
import { Link, usePage } from '@inertiajs/react';
import { User } from '@/types';

interface AuthenticatedProps {
    user: User;
    header?: ReactNode;
}

export default function Authenticated({ user, children }: PropsWithChildren<AuthenticatedProps>) {
    const { url } = usePage();

    // Definisikan menu navigasi terpusat
    const menuItems = [
        { route: route('dashboard'), label: 'Beranda', icon: '🏠', name: 'dashboard' },
        { route: route('incomes.create'), label: 'Uang Masuk', icon: '💰', name: 'incomes.create' },
        { route: route('expenses.upload'), label: 'Uang Keluar', icon: '📸', name: 'expenses.upload' },
        { route: route('expenses.report'), label: 'Reporting', icon: '📉', name: 'expenses.report' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 font-sans antialiased pb-24 md:pb-0 md:ps-64">

            {/* =========================================================
                1. FIXED SIDEBAR (Hanya Tampil di Desktop / Layar Lebar)
               ========================================================= */}
            <aside className="fixed inset-y-0 start-0 z-40 hidden w-64 border-e border-gray-100 bg-white p-5 md:block">
                <div className="flex h-full flex-col justify-between">
                    <div>
                        {/* Logo / Judul App */}
                        <div className="mb-8 px-2 flex items-center gap-2">
                            <span className="text-2xl">🤖</span>
                            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                CerdasUang AI
                            </span>
                        </div>

                        {/* Menu Navigation Links */}
                        <nav className="space-y-1.5">
                            {menuItems.map((item) => {
                                // Cek keaktifan link menggunakan rute bawaan laravel/inertia
                                const isActive = url.startsWith(item.route) || (item.name && route().current(item.name));
                                return (
                                    <Link
                                        key={item.route}
                                        href={item.route}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive
                                            ? 'bg-blue-50 text-blue-600 shadow-sm shadow-blue-500/5'
                                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                    >
                                        <span className="text-lg">{item.icon}</span>
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Bagian Bawah Sidebar (User Profile) */}
                    <div className="border-t border-gray-100 pt-4">
                        <div className="px-2 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                            Akun Saya
                        </div>
                        <Dropdown>
                            <Dropdown.Trigger>
                                <button className="flex w-full items-center gap-3 rounded-xl p-2 text-start hover:bg-gray-50 transition duration-150">
                                    <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-700 truncate">{user.name}</p>
                                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                                    </div>
                                </button>
                            </Dropdown.Trigger>
                            <Dropdown.Content>
                                <Dropdown.Link href={route('profile.edit')}>⚙️ Pengaturan Profil</Dropdown.Link>
                                <Dropdown.Link href={route('logout')} method="post" as="button">
                                    🚪 Keluar Sistem
                                </Dropdown.Link>
                            </Dropdown.Content>
                        </Dropdown>
                    </div>
                </div>
            </aside>

            {/* =========================================================
                2. MODERN FLOATING HEADER (Sticky & Blur Effect)
               ========================================================= */}
            <header className="sticky top-0 z-30 border-b border-gray-100 bg-white/70 backdrop-blur-xl px-4 py-4 md:px-8">
                <div className="mx-auto max-w-7xl flex items-center justify-between">
                    {/* Judul Kiri (Sapaan Dinamis) */}
                    <div>
                        <h2 className="text-sm text-gray-400 font-medium">Selamat Datang Kembali,</h2>
                        <p className="text-lg font-bold text-gray-800">{user.name} 👋</p>
                    </div>

                    {/* Profile Dropdown Kanan (Khuesus Tampilan Mobile) */}
                    <div className="md:hidden">
                        <Dropdown>
                            <Dropdown.Trigger>
                                <button className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-lg shadow-blue-500/20">
                                    {user.name.charAt(0).toUpperCase()}
                                </button>
                            </Dropdown.Trigger>
                            <Dropdown.Content>
                                <div className="px-4 py-2 border-b border-gray-50 text-xs text-gray-400 truncate">
                                    {user.email}
                                </div>
                                <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
                                <Dropdown.Link href={route('logout')} method="post" as="button">
                                    Log Out
                                </Dropdown.Link>
                            </Dropdown.Content>
                        </Dropdown>
                    </div>
                </div>
            </header>

            {/* =========================================================
                3. AREA KONTEN UTAMA
               ========================================================= */}
            <main className="p-4 md:p-8 mx-auto max-w-7xl">
                {children}
            </main>

            {/* =========================================================
                4. FLOATING BOTTOM BAR (Hanya Tampil di Mobile / HP)
               ========================================================= */}
            <div className="fixed bottom-4 start-1/2 -translate-x-1/2 w-[92%] max-w-md bg-white/80 backdrop-blur-lg border border-gray-100 shadow-2xl rounded-2xl z-50 md:hidden transition-all duration-300">
                <div className="flex justify-around items-center py-2.5 px-2">
                    {menuItems.map((item) => {
                        const isActive = url.startsWith(item.route) || (item.name && route().current(item.name));
                        return (
                            <Link
                                key={item.route}
                                href={item.route}
                                className="flex flex-col items-center justify-center flex-1 min-w-[64px] relative py-1 group"
                            >
                                {isActive && (
                                    <span className="absolute -top-1 w-8 h-1 bg-blue-600 rounded-full animate-pulse" />
                                )}
                                <span className={`text-xl transition-transform duration-200 ${isActive ? 'scale-125 text-blue-600' : 'group-hover:scale-110 opacity-70'
                                    }`}>
                                    {item.icon}
                                </span>
                                <span className={`text-[10px] font-bold mt-1 tracking-wide ${isActive ? 'text-blue-600' : 'text-gray-400'
                                    }`}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>

        </div>
    );
}