import Link from "next/link";

export default function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-white/10">
            <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 text-primary dark:text-white group">
                    <span className="material-symbols-outlined text-2xl group-hover:rotate-12 transition-transform duration-300">article</span>
                    <span className="text-xl font-bold tracking-tight">MiniBlog.</span>
                </Link>

                {/* Right Actions */}
                <nav className="flex items-center gap-6">
                    <Link href="/write" className="hidden text-sm font-medium text-text-secondary hover:text-primary dark:text-gray-400 dark:hover:text-white sm:block">
                        Write
                    </Link>
                    <div className="h-4 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block"></div>
                    <Link href="/login" className="text-sm font-medium text-text-secondary hover:text-primary dark:text-gray-400 dark:hover:text-white">
                        Sign in
                    </Link>
                    <Link href="/register" className="rounded-full bg-primary px-4 py-2 text-sm font-medium bg-black text-white transition-opacity hover:opacity-90 dark:bg-white dark:text-black">
                        Get Started
                    </Link>
                </nav>
            </div>
        </header>
    );
}