"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MdLogout, MdMenu, MdClose } from "react-icons/md"; // Menu ikonları eklendi
import { MdOutlineMenuBook } from "react-icons/md";
import { IoPersonSharp } from "react-icons/io5";
import { getAuthUser, logout, type AuthUser } from "@/lib/auth";

export default function PanelHeader() {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setUser(getAuthUser());
    }, []);

    const displayName = user?.displayName ?? user?.email ?? "Kullanıcı";
    const roleLabel = user?.role ? (user.role === "ADMIN" ? "Admin" : "Editör") : "Editör";

    const handleLogout = async () => {
        if (isLoggingOut) return;
        setIsLoggingOut(true);

        try {
            await logout();
        } finally {
            setUser(null);
            router.replace("/login");
        }
    };

    return (
        <header className="bg-white dark:bg-white/10 2xl:py-8 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 transition-colors duration-300">
            {/* max-w-screen-xl: İçeriği 1280px genişliğe sabitler (Büyük ekranlarda dağılmayı önler)
                mx-auto: Ortalar
                px-4 sm:px-6 lg:px-8: Responsive padding (Telefonda az, bilgisayarda çok boşluk)
            */}
            <nav className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">

                    {/* SOL TARAF: LOGO */}
                    <div className="flex items-center flex-shrink-0">
                        <Link href="/" className="flex items-center gap-2">
                            {/* <img
                                src={`https://wcanx.co/logo.png`}
                                alt="WcanX Logo"
                                className="h-8  2xl:h-16 w-auto"
                            /> */}
                            <MdOutlineMenuBook className="text-3xl 2xl:text-5xl text-gray-800 dark:text-white" />
                            <span className="self-center text-xl  2xl:text-5xl font-semibold whitespace-nowrap text-gray-800 dark:text-white hidden sm:block">
                                MiniBlog.
                            </span>
                        </Link>
                    </div>

                    {/* SAĞ TARAF: KULLANICI & MOBİL BUTON */}
                    <div className="flex items-center gap-2 sm:gap-3">

                        {/* Kullanıcı Bilgisi (Telefonda yazıyı gizle 'hidden sm:flex') */}
                        <div className='flex flex-col items-end hidden sm:flex flex-col'>
                            <span className='text-xs 2xl:text-2xl font-bold text-gray-700 dark:text-white leading-tight'>{displayName}</span>
                            <span className='text-[11px] 2xl:text-lg text-gray-500 dark:text-gray-400 leading-tight'>{roleLabel}</span>
                        </div>
                        <div className='flex items-center gap-2 2xl:mr-16'>
                            <div className='flex justify-center items-center overflow-hidden w-8 2xl:w-12 h-8 2xl:h-12 rounded-full border-2 font-semibold border-gray-800 dark:border-gray-100 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-sm 2xl:text-2xl'>
                                <IoPersonSharp className="w-full h-auto mt-2" />
                            </div>
                        </div>

                        {/* Aksiyon Butonları */}

                        <button
                            type="button"
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            aria-label="Logout"
                            className="p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 transition group cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            <MdLogout className="text-xl 2xl:text-3xl text-gray-600 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400 transition duration-200" />
                        </button>

                        {/* Mobil Menü Açma Butonu (Sadece mobilde görünür 'md:hidden') */}
                        {/* <div className="-mr-2 flex md:hidden">
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                type="button"
                                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-500 dark:hover:text-white focus:outline-none"
                            >
                                <span className="sr-only">Menüyü aç</span>
                                {isMobileMenuOpen ? (
                                    <MdClose className="block h-6 w-6" aria-hidden="true" />
                                ) : (
                                    <MdMenu className="block h-6 w-6" aria-hidden="true" />
                                )}
                            </button>
                        </div> */}
                    </div>
                </div>
            </nav>

            {/* MOBİL MENÜ İÇERİĞİ (State true ise görünür) */}
            {/* {isMobileMenuOpen && (
                <div className="md:hidden bg-white dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-gray-800">
                    <div className="space-y-1 px-4 pb-3 pt-2 sm:px-3">
                        <Link
                            href="/dashboard"
                            className={`block rounded-md px-3 py-2 text-base font-medium ${isActive('/dashboard') ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'}`}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Dashboard
                        </Link>
                        <Link
                            href="/transactions"
                            className={`block rounded-md px-3 py-2 text-base font-medium ${isActive('/transactions') ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'}`}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            İşlemler
                        </Link>
                    </div>
                </div>
            )} */}
        </header>
    );
}
