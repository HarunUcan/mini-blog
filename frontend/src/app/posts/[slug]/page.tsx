import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { notFound } from "next/navigation";

type Post = {
    id: string;
    title: string;
    content: unknown;
    createdAt: string;
    publishedAt: string | null;
    slug: string | null;
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

function stripHtml(html: string) {
    return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function getReadTime(html: string) {
    const text = stripHtml(html);
    if (!text) return 1;
    const words = text.split(" ").length;
    return Math.max(1, Math.ceil(words / 200));
}

async function fetchPost(slug: string) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
        throw new Error("NEXT_PUBLIC_API_URL is not set");
    }

    const res = await fetch(`${apiUrl}/posts/${slug}`, {
        cache: "no-store",
    });

    if (res.status === 404) return null;

    const payload = (await res.json().catch(() => null)) as
        | ApiSuccess<Post>
        | ApiError
        | null;

    if (!res.ok || !payload || payload.success === false) {
        return null;
    }

    return payload.data;
}

export default async function PostDetailPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const post = await fetchPost(slug);
    if (!post) {
        notFound();
    }

    const contentHtml = typeof post.content === "string" ? post.content : "";
    const readTime = getReadTime(contentHtml);
    const publishedDate = new Date(post.publishedAt ?? post.createdAt);
    const formattedDate = Number.isNaN(publishedDate.getTime())
        ? "Draft"
        : publishedDate.toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "2-digit",
          });

    return (
        <>
            <Header />

            <main className="flex-1">
                <div className="mx-auto flex max-w-4xl flex-col px-6">
                    <section className="border-b border-gray-300 py-16 dark:border-gray-800">
                        <div className="flex flex-col gap-4">
                            <span className="text-xs uppercase tracking-[0.2em] text-text-secondary dark:text-gray-500">
                                Story
                            </span>
                            <h1 className="font-serif text-4xl font-black leading-tight tracking-tight text-primary dark:text-white sm:text-5xl">
                                {post.title || "Untitled"}
                            </h1>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-text-secondary dark:text-gray-400">
                                <span className="font-medium text-primary dark:text-white">
                                    MiniBlog
                                </span>
                                <span className="h-1 w-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                                <span>{formattedDate}</span>
                                <span className="h-1 w-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                                <span>{readTime} min read</span>
                            </div>
                        </div>
                    </section>

                    <article
                        className="post-content py-10 text-lg leading-relaxed text-gray-700 dark:text-gray-300"
                        dangerouslySetInnerHTML={{ __html: contentHtml }}
                    />
                </div>
            </main>

            <Footer />
        </>
    );
}
