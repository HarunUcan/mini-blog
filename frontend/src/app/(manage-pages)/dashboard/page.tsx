"use client";

import ArticleTable from "@/components/ArticleTable";
import AuthGuard from "@/components/AuthGuard";
import Link from "next/link";
import { PiNotePencil } from "react-icons/pi";



export default function Dashboard() {
    return (
        <AuthGuard>
            <div className="px-4 md:px-8 lg:px-30">
                <div className="flex flex-col lg:flex-row justify-center items-center gap-4 lg:gap-0 lg:justify-between mt-8 2xl:mt-12">
                    <div className="flex flex-col items-center lg:items-start">
                        <span className="text-center text-2xl 2xl:text-4xl font-bold text-gray-800 dark:text-white">Your Stories</span>
                        <span className="text-center text-gray-600 dark:text-gray-400 2xl:text-2xl">Manage your posts and drafts.</span>
                    </div>

                    <button
                        className="font-semibold rounded-lg px-6 border-1 border-black dark:border-gray-200 text-gray-900 dark:text-gray-100 cursor-pointer 2xl:w-70 h-12 2xl:h-16 shadow-md"
                    >
                        <Link href="/write">
                            <span className="flex justify-center 2xl:text-2xl items-center gap-1">
                                <PiNotePencil className="text-2xl" />
                                <span>Write New Story</span>
                            </span>
                        </Link>
                    </button>
                </div>

                <div className="mt-4 mb-20">
                    <ArticleTable />
                </div>
            </div>
        </AuthGuard>
    );
}
