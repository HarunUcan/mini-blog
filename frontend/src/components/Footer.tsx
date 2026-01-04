import Link from "next/link";

export default function Footer() {
    return (
        <footer className="mt-10 border-t border-gray-100 bg-gray-200 py-12 dark:border-gray-800 dark:bg-white/10">
            <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-6 px-6 sm:flex-row">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-xl text-primary dark:text-white">article</span>
                    <span className="text-lg font-bold text-primary dark:text-white">MiniBlog.</span>
                </div>
                <div className="flex flex-wrap justify-center gap-6 text-sm text-text-secondary dark:text-gray-400">
                    <Link href="#" className="hover:text-primary dark:hover:text-white">About</Link>
                    <Link href="#" className="hover:text-primary dark:hover:text-white">Help</Link>
                    <Link href="#" className="hover:text-primary dark:hover:text-white">Terms</Link>
                    <Link href="#" className="hover:text-primary dark:hover:text-white">Privacy</Link>
                </div>
                <div className="mt-8 sm:mt-0 text-center text-xs text-text-secondary dark:text-gray-500">
                    © {new Date().getFullYear()} MiniBlog Platform. All rights reserved.
                </div>
            </div>
        </footer>
    );
}