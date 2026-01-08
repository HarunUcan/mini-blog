import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
        return NextResponse.json(
            { message: "Authorization header required" },
            { status: 401 }
        );
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const postId = formData.get("postId");

    if (!file || !(file instanceof File)) {
        return NextResponse.json(
            { message: "file is required" },
            { status: 400 }
        );
    }

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
                Authorization: authHeader,
                // Do not set Content-Type when sending FormData.
            },
            body: fd,
        }
    );

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
