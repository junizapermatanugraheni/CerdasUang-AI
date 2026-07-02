import React from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function BottomBar(): React.JSX.Element {
    // usePage() digunakan untuk mengambil URL aktif saat ini untuk efek class 'active'
    const { url } = usePage();

    const menuItems = [
        { route: '/dashboard', label: 'Beranda', icon: '🏠', name: 'dashboard' },
        { route: '/incomes/create', label: 'Uang Masuk', icon: '💰', name: 'incomes.create' },
        { route: '/expenses/upload', label: 'Uang Keluar', icon: '📸', name: 'expenses.upload' },
        { route: '/report', label: 'Reporting', icon: '📉', name: 'expenses.report' }, 
    ];

    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-md bg-white/80 backdrop-blur-lg border border-gray-100 shadow-2xl rounded-2xl z-50">
            <div className="flex justify-around items-center py-2.5 px-2">
                {menuItems.map((item) => {
                    // Cek apakah URL sekarang sama dengan rute menu
                    const isActive = url.startsWith(item.route);

                    return (
                        <Link
                            key={item.route}
                            href={item.route}
                            className="flex flex-col items-center justify-center flex-1 min-w-[64px] relative py-1 group"
                        >
                            <span className={`text-xl transition-transform duration-200 ${isActive ? 'scale-125' : 'group-hover:scale-110 opacity-70'
                                }`}>
                                {item.icon}
                            </span>
                            <span className={`text-[10px] font-semibold mt-1 tracking-wide ${isActive ? 'text-blue-600' : 'text-gray-400'
                                }`}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}