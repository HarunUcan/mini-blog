"use client";

import { useState } from "react";
import Editor from "@/components/Editor"; // Yukarıdaki kodu bu yola kaydetmelisin
import { PiImage, PiDotsThreeOutline, PiBell } from "react-icons/pi";
import Link from "next/link";
import { ensureAccessToken, getAccessToken, refreshAccessToken } from "@/lib/auth";
import AuthGuard from "@/components/AuthGuard";

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

async function uploadFile(file: File, postId?: string) {
    const hasSession = await ensureAccessToken();
    const token = getAccessToken();

    if (!hasSession || !token) {
        throw new Error("Please sign in to upload.");
    }

    const fd = new FormData();
    fd.append("file", file);
    if (postId) fd.append("postId", postId);

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

    // ✅ Editor Image src olarak absolute URL verelim
    return `${process.env.NEXT_PUBLIC_API_URL}${json.data.url}`;
}

export default function WritePage() {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    // Basit bir kelime sayacı (Resimdeki sağ taraftaki sayaç için)
    const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).filter(w => w !== '').length;

    return (
        <AuthGuard>
            <div className="min-h-screen bg-white dark:bg-[#0f0f0f]">

                {/* --- MAIN CONTENT --- */}
                <div className="max-w-3xl mx-auto pt-12 px-4 mb-32">

                    {/* Kapak Resmi Ekleme */}
                    <div className="mb-8 group">
                        <button className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                            <PiImage size={24} />
                            <span className="text-sm font-medium">Add Cover Image</span>
                        </button>
                    </div>

                    {/* Başlık Alanı (Textarea - otomatik büyüyen) */}
                    <textarea
                        placeholder="Title"
                        value={title}
                        onChange={(e) => {
                            setTitle(e.target.value);
                            // Otomatik yükseklik ayarı
                            e.target.style.height = 'auto';
                            e.target.style.height = e.target.scrollHeight + 'px';
                        }}
                        className="w-full text-4xl md:text-5xl font-serif font-bold placeholder-gray-300 dark:placeholder-gray-600 text-gray-800 dark:text-gray-100 bg-transparent border-none outline-none resize-none overflow-hidden mb-6"
                        rows={1}
                    />

                    {/* Editör */}
                    <Editor content={content} onChange={setContent} onUploadImage={uploadFile} />

                </div>

                {/* --- SAĞ ALT KÖŞE SAYAÇ (Opsiyonel / Tasarımda sağda görünüyor) --- */}
                <div className="fixed bottom-8 right-8 bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700 rounded-lg px-4 py-2 hidden xl:block">
                    <span className="text-xs text-gray-500 font-medium">{wordCount} words • {Math.ceil(wordCount / 200)} min read</span>
                </div>
            </div>
        </AuthGuard>
    );
}
