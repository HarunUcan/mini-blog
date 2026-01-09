"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Editor from "@/components/Editor"; // YukarÃ„Â±daki kodu bu yola kaydetmelisin
import { PiImage } from "react-icons/pi";
import { apiFetch, ensureAccessToken, getAccessToken, refreshAccessToken } from "@/lib/auth";
import AuthGuard from "@/components/AuthGuard";
import { useRouter } from "next/navigation";

type UploadResponse = {
    success: boolean;
    data: {
        id: string;
        path: string;
        url: string; // "/uploads/....jpg"
        mimeType: string;
        sizeBytes: number;
        width: number | null;
        height: number | null;
    };
};

type DraftPost = {
    id: string;
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

export default function WritePage() {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [postId, setPostId] = useState<string | null>(null);
    const [draftError, setDraftError] = useState<string | null>(null);
    const [isPublishing, setIsPublishing] = useState(false);
    const [publishError, setPublishError] = useState<string | null>(null);
    const [publishSuccess, setPublishSuccess] = useState<string | null>(null);

    const router = useRouter();


    const draftPromiseRef = useRef<Promise<string | null> | null>(null);

    const createDraft = useCallback(async () => {
        const res = await apiFetch("/posts", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                title: "",
                content: "",
            }),
        });

        const text = await res.text();
        const payload = text ? (JSON.parse(text) as ApiSuccess<DraftPost> | ApiError) : null;

        if (!res.ok || !payload || payload.success === false) {
            throw new Error(payload?.error?.message ?? "Draft could not be created");
        }

        const id = payload.data?.id;
        if (!id) {
            throw new Error("Draft could not be created");
        }

        setPostId(id);
        setDraftError(null);
        return id;
    }, []);

    const ensureDraftId = useCallback(async () => {
        if (postId) return postId;

        if (!draftPromiseRef.current) {
            draftPromiseRef.current = createDraft();
        }

        try {
            return await draftPromiseRef.current;
        } finally {
            draftPromiseRef.current = null;
        }
    }, [createDraft, postId]);

    useEffect(() => {
        let active = true;

        const initDraft = async () => {
            try {
                await ensureDraftId();
            } catch (err) {
                if (active) {
                    setDraftError(err instanceof Error ? err.message : "Draft could not be created");
                }
            }
        };

        initDraft();

        return () => {
            active = false;
        };
    }, [ensureDraftId]);

    const handlePublish = useCallback(async () => {
        setPublishError(null);
        setPublishSuccess(null);

        const trimmedTitle = title.trim();
        if (!trimmedTitle) {
            setPublishError("Title is required to publish.");
            return;
        }

        setIsPublishing(true);

        try {
            const draftId = await ensureDraftId();
            if (!draftId) {
                throw new Error("Draft could not be created");
            }

            const updateRes = await apiFetch(`/posts/${draftId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: trimmedTitle,
                    content,
                }),
            });

            const updateText = await updateRes.text();
            const updatePayload = updateText ? (JSON.parse(updateText) as ApiSuccess<unknown> | ApiError) : null;

            if (!updateRes.ok || !updatePayload || updatePayload.success === false) {
                throw new Error(updatePayload?.error?.message ?? "Post could not be saved");
            }

            const publishRes = await apiFetch(`/posts/publish/${draftId}`, {
                method: "POST",
            });

            const publishText = await publishRes.text();
            const publishPayload = publishText ? (JSON.parse(publishText) as ApiSuccess<unknown> | ApiError) : null;

            if (!publishRes.ok || !publishPayload || publishPayload.success === false) {
                throw new Error(publishPayload?.error?.message ?? "Post could not be published");
            }

            setPublishSuccess("Published successfully.");
            router.replace(`/dashboard`);
        } catch (err) {
            setPublishError(err instanceof Error ? err.message : "Publish failed");
        } finally {
            setIsPublishing(false);
        }
    }, [content, ensureDraftId, title]);

    const uploadFile = useCallback(async (file: File) => {
        const hasSession = await ensureAccessToken();
        const token = getAccessToken();

        if (!hasSession || !token) {
            throw new Error("Please sign in to upload.");
        }

        const draftId = await ensureDraftId();
        if (!draftId) {
            throw new Error("Draft could not be created");
        }

        const fd = new FormData();
        fd.append("file", file);
        fd.append("postId", draftId);

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

        const json = (await res.json()) as UploadResponse;

        if (!json.success || !json.data?.url) {
            throw new Error("Upload response invalid");
        }

        // Ã†â€™o Editor Image src olarak absolute URL verelim
        return `${process.env.NEXT_PUBLIC_API_URL}${json.data.url}`;
    }, [ensureDraftId]);

    // Basit bir kelime sayacÃ„Â± (Resimdeki saÃ„Å¸ taraftaki sayaÃƒÂ§ iÃƒÂ§in)
    const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).filter(w => w !== '').length;

    return (
        <AuthGuard>
            <div className="min-h-screen bg-white dark:bg-[#0f0f0f]">

                {/* --- MAIN CONTENT --- */}
                <div className="max-w-3xl mx-auto pt-12 px-4 mb-32">
                    {(draftError || publishError || publishSuccess) && (
                        <div className="mb-4 space-y-1">
                            {draftError && <p className="text-sm text-red-600">{draftError}</p>}
                            {publishError && <p className="text-sm text-red-600">{publishError}</p>}
                            {publishSuccess && <p className="text-sm text-green-600">{publishSuccess}</p>}
                        </div>
                    )}

                    {/* Kapak Resmi Ekleme */}
                    <div className="mb-8 group">
                        <button className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                            <PiImage size={24} />
                            <span className="text-sm font-medium">Add Cover Image</span>
                        </button>
                    </div>

                    {/* BaÃ…Å¸lÃ„Â±k AlanÃ„Â± (Textarea - otomatik bÃƒÂ¼yÃƒÂ¼yen) */}
                    <textarea
                        placeholder="Title"
                        value={title}
                        onChange={(e) => {
                            setTitle(e.target.value);
                            // Otomatik yÃƒÂ¼kseklik ayarÃ„Â±
                            e.target.style.height = 'auto';
                            e.target.style.height = e.target.scrollHeight + 'px';
                        }}
                        className="w-full text-4xl md:text-5xl font-serif font-bold placeholder-gray-300 dark:placeholder-gray-600 text-gray-800 dark:text-gray-100 bg-transparent border-none outline-none resize-none overflow-hidden mb-6"
                        rows={1}
                    />

                    {/* EditÃƒÂ¶r */}
                    <Editor content={content} onChange={setContent} onUploadImage={uploadFile} />

                </div>

                {/* --- SAÃ„Â ALT KÃƒâ€“Ã…ÂE SAYAÃƒâ€¡ (Opsiyonel / TasarÃ„Â±mda saÃ„Å¸da gÃƒÂ¶rÃƒÂ¼nÃƒÂ¼yor) --- */}
                <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-40 flex flex-col items-end gap-3">
                    <button
                        type="button"
                        onClick={handlePublish}
                        disabled={isPublishing}
                        className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-full text-sm font-medium transition-colors shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {isPublishing ? "Publishing..." : "Publish"}
                    </button>
                    <div className="bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700 rounded-lg px-4 py-2 hidden xl:block">
                        <span className="text-xs text-gray-500 font-medium">{wordCount} words - {Math.ceil(wordCount / 200)} min read</span>
                    </div>
                </div>
            </div>
        </AuthGuard>
    );
}



