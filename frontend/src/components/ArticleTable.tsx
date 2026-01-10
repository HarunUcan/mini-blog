"use client";

import { useEffect, useState } from "react";
import { LuPencil, LuTrash2 } from "react-icons/lu";
import { apiFetch } from "@/lib/auth";
import { useRouter } from "next/navigation";

type PostStatus = "DRAFT" | "PUBLISHED";

type Post = {
    id: string;
    title: string;
    status: PostStatus;
    createdAt: string;
    updatedAt: string;
    publishedAt: string | null;
};

type ApiSuccess<T> = {
    success: true;
    data: T;
};

type ApiError = {
    success: false;
    error: {
        message: string;
    };
};

function getApiErrorMessage<T>(payload: ApiSuccess<T> | ApiError | null, fallback: string) {
    if (!payload) return fallback;
    if ("success" in payload && payload.success === false) {
        return payload.error.message;
    }
    return fallback;
}

function formatDate(value?: string | null) {
    if (!value) return "-";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleDateString("tr-TR");
}

export default function ArticleTable() {
    const router = useRouter();
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;

        const loadPosts = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const res = await apiFetch("/posts/me/list");
                const text = await res.text();
                const payload = text ? (JSON.parse(text) as ApiSuccess<Post[]> | ApiError) : null;

                if (!res.ok || !payload || payload.success === false) {
                    throw new Error(getApiErrorMessage(payload, "Posts could not be loaded"));
                }

                if (active) {
                    setPosts(Array.isArray(payload.data) ? payload.data : []);
                }
            } catch (err) {
                if (active) {
                    setError(err instanceof Error ? err.message : "Posts could not be loaded");
                }
            } finally {
                if (active) {
                    setIsLoading(false);
                }
            }
        };

        loadPosts();

        return () => {
            active = false;
        };
    }, []);

    const handleDelete = async (post: Post, title: string) => {
        const confirmed = window.confirm(
            title ? `Delete "${title}"?` : "Delete this post?",
        );

        if (!confirmed) return;

        try {
            const res = await apiFetch(`/posts/${post.id}`, {
                method: "DELETE",
            });
            const text = await res.text();
            const payload = text ? (JSON.parse(text) as ApiSuccess<{ deleted: boolean }> | ApiError) : null;

            if (!res.ok || !payload || payload.success === false) {
                throw new Error(getApiErrorMessage(payload, "Post could not be deleted"));
            }

            setPosts((prev) => prev.filter((item) => item.id !== post.id));
        } catch (err) {
            window.alert(err instanceof Error ? err.message : "Post could not be deleted");
        }
    };

    return (
        <>
            {/* TABLE VIEW (md and up) */}
            <div className="hidden md:block w-full overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl dark:shadow-gray-700/40 transition-colors duration-300">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50/50 dark:bg-gray-700/50 text-[11px] 2xl:text-sm uppercase tracking-wider text-gray-400 dark:text-gray-500 font-bold">
                            <th className="px-6 py-4 2xl:py-5">Article Title</th>
                            <th className="px-6 py-4 2xl:py-5">Status</th>
                            <th className="px-6 py-4 2xl:py-5">Date</th>
                            <th className="px-6 py-4 2xl:py-5 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                        {isLoading && (
                            <tr>
                                <td className="px-6 py-6 text-gray-500 dark:text-gray-400" colSpan={4}>
                                    Loading posts...
                                </td>
                            </tr>
                        )}
                        {!isLoading && error && (
                            <tr>
                                <td className="px-6 py-6 text-red-600" colSpan={4}>
                                    {error}
                                </td>
                            </tr>
                        )}
                        {!isLoading && !error && posts.length === 0 && (
                            <tr>
                                <td className="px-6 py-6 text-gray-500 dark:text-gray-400" colSpan={4}>
                                    You do not have any posts yet.
                                </td>
                            </tr>
                        )}
                        {!isLoading && !error && posts.map((item) => {
                            const title = item.title?.trim() ? item.title : "Untitled";
                            const date = formatDate(item.publishedAt ?? item.updatedAt ?? item.createdAt);

                            return (
                                <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors group">

                                    {/* TITLE */}
                                    <td className="px-6 py-4 2xl:py-6">
                                        <div className="flex items-center gap-3 2xl:gap-4">
                                            <span className="font-semibold text-gray-700 dark:text-gray-200 2xl:text-lg">{title}</span>
                                        </div>
                                    </td>

                                    {/* STATUS */}
                                    <td className="px-6 py-4 2xl:py-6 font-bold text-gray-800 dark:text-white text-sm 2xl:text-lg">
                                        {item.status}
                                    </td>

                                    {/* DATE */}
                                    <td className="px-6 py-4 2xl:py-6 text-gray-500 dark:text-gray-400 text-sm 2xl:text-lg">
                                        {date}
                                    </td>

                                    {/* ACTIONS */}
                                    <td className="px-6 py-4 2xl:py-6">
                                        <div className="flex justify-end text-gray-400 dark:text-gray-500 gap-1 2xl:gap-2">
                                            <button
                                                onClick={() => router.push(`/write/${item.id}`)}
                                                className="w-8 h-8 2xl:w-12 2xl:h-12 flex items-center justify-center rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                                            >
                                                <LuPencil className="w-[18px] h-[18px] 2xl:w-6 2xl:h-6" />
                                            </button>

                                            <button
                                                onClick={() => handleDelete(item, title)}
                                                className="w-8 h-8 2xl:w-12 2xl:h-12 flex items-center justify-center rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
                                            >
                                                <LuTrash2 className="w-[18px] h-[18px] 2xl:w-6 2xl:h-6" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

        </>
    );
}
