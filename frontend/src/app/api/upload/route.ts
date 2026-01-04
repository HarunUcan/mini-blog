import { NextResponse } from "next/server";

export const runtime = "nodejs";

// 🔴 TEST AMAÇLI HARDCODE TOKEN
const TEST_ACCESS_TOKEN =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1YmMxZGQ4Yy0zYzQ4LTQwMmUtOTc1NS0zYWUzY2ZmOWJjOWIiLCJlbWFpbCI6ImluZm9AaGFydW51Y2FuLmNvbSIsInJvbGUiOiJVU0VSIiwiaWF0IjoxNzY3NTY4MzY5LCJleHAiOjE3Njc1NjkyNjl9.XP-7bICoPGSxaPcStkKQLEraBaaD6fFWT4yU1AHV840";

export async function POST(req: Request) {
    const formData = await req.formData();
    const file = formData.get("file");
    const postId = formData.get("postId");

    if (!file || !(file instanceof File)) {
        return NextResponse.json(
            { message: "file is required" },
            { status: 400 }
        );
    }

    // 🔁 NestJS'e forward edilecek FormData
    const fd = new FormData();
    fd.append("file", file);
    if (typeof postId === "string" && postId) {
        fd.append("postId", postId);
    }

    const backendRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/media/upload`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${TEST_ACCESS_TOKEN}`,
                // ❗ FormData kullanırken Content-Type set ETME
            },
            body: fd,
        }
    );

    // backend response'u aynen client'a döndür
    const text = await backendRes.text();

    return new NextResponse(text, {
        status: backendRes.status,
        headers: {
            "content-type":
                backendRes.headers.get("content-type") ??
                "application/json",
        },
    });
}
