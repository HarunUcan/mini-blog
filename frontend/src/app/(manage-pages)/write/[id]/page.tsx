"use client";

import { useCallback, useEffect, useState } from "react";
import Editor from "@/components/Editor";
import { PiImage } from "react-icons/pi";
import { apiFetch, ensureAccessToken, getAccessToken, refreshAccessToken } from "@/lib/auth";
import AuthGuard from "@/components/AuthGuard";
import { useParams } from "next/navigation";

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

type PostStatus = "DRAFT" | "PUBLISHED";

type PostDetail = {
    id: string;
    title: string | null;
    content: string | null;
    status: PostStatus;
};

export default function EditPostPage() {
    const params = useParams();
    const rawId = params.id;
    const postId = Array.isArray(rawId) ? rawId[0] : rawId;

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

    useEffect(() => {
        let active = true;

        const loadPost = async () => {
            if (!postId) {
                setLoadError("Post could not be loaded");
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setLoadError(null);

            try {
                const res = await apiFetch(`/posts/me/${postId}`);
                const text = await res.text();
                const payload = text ? (JSON.parse(text) as ApiSuccess<PostDetail> | ApiError) : null;

                if (!res.ok || !payload || payload.success === false) {
                    throw new Error(payload?.error?.message ?? "Post could not be loaded");
                }
                const post = payload.data;

                if (active) {
                    setTitle(post.title ?? "");
                    setContent(post.content ?? "");
                }

            } catch (err) {
                if (active) {
                    setLoadError(err instanceof Error ? err.message : "Post could not be loaded");
                }
            } finally {
                if (active) {
                    setIsLoading(false);
                }
            }
        };

        loadPost();

        return () => {
            active = false;
        };
    }, [postId]);

    const handleUpdate = useCallback(async () => {
        setSaveError(null);
        setSaveSuccess(null);

        const trimmedTitle = title.trim();
        if (!trimmedTitle) {
            setSaveError("Title is required to update.");
            return;
        }

        if (!postId) {
            setSaveError("Post could not be loaded");
            return;
        }

        setIsSaving(true);

        try {
            const res = await apiFetch(`/posts/${postId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: trimmedTitle,
                    content,
                }),
            });

            const text = await res.text();
            const payload = text ? (JSON.parse(text) as ApiSuccess<unknown> | ApiError) : null;

            if (!res.ok || !payload || payload.success === false) {
                throw new Error(payload?.error?.message ?? "Post could not be updated");
            }

            setSaveSuccess("Updated successfully.");
        } catch (err) {
            setSaveError(err instanceof Error ? err.message : "Update failed");
        } finally {
            setIsSaving(false);
        }
    }, [content, postId, title]);

    const uploadFile = useCallback(async (file: File) => {
        const hasSession = await ensureAccessToken();
        const token = getAccessToken();

        if (!hasSession || !token) {
            throw new Error("Please sign in to upload.");
        }

        if (!postId) {
            throw new Error("Post could not be loaded");
        }

        const fd = new FormData();
        fd.append("file", file);
        fd.append("postId", postId);

        const send = async (accessToken: string) => {
            return fetch("/api/upload", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                body: fd,
            });
        };

        let res = await send(token);

        if (res.status === 401) {
            const refreshed = await refreshAccessToken();
            const nextToken = getAccessToken();

            if (refreshed && nextToken) {
                res = await send(nextToken);
            }
        }

        if (!res.ok) {
            const err = await res.text();
            throw new Error(err);
        }

        const json = (await res.json()) as {
            success: boolean;
            data: {
                url: string;
            };
        };

        if (!json.success || !json.data?.url) {
            throw new Error("Upload response invalid");
        }

        return `${process.env.NEXT_PUBLIC_API_URL}${json.data.url}`;
    }, [postId]);

    const wordCount = content.replace(/<[^>]*>/g, "").split(/\s+/).filter((w) => w !== "").length;

    return (
        <AuthGuard>
            <div className="min-h-screen bg-white dark:bg-[#0f0f0f]">
                <div className="max-w-3xl mx-auto pt-12 px-4 mb-32">
                    {(loadError || saveError || saveSuccess) && (
                        <div className="mb-4 space-y-1">
                            {loadError && <p className="text-sm text-red-600">{loadError}</p>}
                            {saveError && <p className="text-sm text-red-600">{saveError}</p>}
                            {saveSuccess && <p className="text-sm text-green-600">{saveSuccess}</p>}
                        </div>
                    )}

                    {isLoading ? (
                        <p className="text-sm text-gray-500">Loading post...</p>
                    ) : loadError ? null : (
                        <>
                            <div className="mb-8 group">
                                <button className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                                    <PiImage size={24} />
                                    <span className="text-sm font-medium">Add Cover Image</span>
                                </button>
                            </div>

                            <textarea
                                placeholder="Title"
                                value={title}
                                onChange={(e) => {
                                    setTitle(e.target.value);
                                    e.target.style.height = "auto";
                                    e.target.style.height = `${e.target.scrollHeight}px`;
                                }}
                                className="w-full text-4xl md:text-5xl font-serif font-bold placeholder-gray-300 dark:placeholder-gray-600 text-gray-800 dark:text-gray-100 bg-transparent border-none outline-none resize-none overflow-hidden mb-6"
                                rows={1}
                            />

                            <Editor content={content} onChange={setContent} onUploadImage={uploadFile} />
                        </>
                    )}
                </div>

                <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-40 flex flex-col items-end gap-3">
                    <button
                        type="button"
                        onClick={handleUpdate}
                        disabled={isSaving || isLoading || !!loadError}
                        className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-full text-sm font-medium transition-colors shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {isSaving ? "Updating..." : "Update"}
                    </button>
                    <div className="bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700 rounded-lg px-4 py-2 hidden xl:block">
                        <span className="text-xs text-gray-500 font-medium">{wordCount} words - {Math.ceil(wordCount / 200)} min read</span>
                    </div>
                </div>
            </div>
        </AuthGuard>
    );
}
