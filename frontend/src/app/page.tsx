import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostCard from "@/components/PostCard";

type PublicPost = {
  id: string;
  title: string;
  content: unknown;
  createdAt: string;
  publishedAt: string | null;
  slug: string | null;
  author?: {
    displayName?: string | null;
  };
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

function getApiUrl(path: string) {
  const base = process.env.API_URL_INTERNAL ?? process.env.NEXT_PUBLIC_API_URL;
  if (!base) {
    throw new Error("API_URL_INTERNAL or NEXT_PUBLIC_API_URL is not set");
  }

  const normalizedBase = base.endsWith("/") ? base.slice(0, -1) : base;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function getReadTime(html: string) {
  const text = stripHtml(html);
  if (!text) return 1;
  const words = text.split(" ").length;
  return Math.max(1, Math.ceil(words / 200));
}

function getExcerpt(html: string, maxLength = 180) {
  const text = stripHtml(html);
  if (!text) return "No preview available.";
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}...`;
}

function extractFirstImage(html: string) {
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match?.[1] ?? "";
}

function formatDate(value: string | null) {
  if (!value) return "Draft";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Draft";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

async function fetchPosts() {
  try {
    const res = await fetch(getApiUrl("/posts"), {
      cache: "no-store",
    });

    const payload = (await res.json().catch(() => null)) as
      | ApiSuccess<PublicPost[]>
      | ApiError
      | null;

    if (!res.ok || !payload || payload.success === false) {
      return [];
    }

    return payload.data ?? [];
  } catch {
    return [];
  }
}

export default async function Home() {
  const posts = await fetchPosts();
  const hasPosts = posts.length > 0;

  return (
    <>
      <Header />

      <main className="flex-1">
        <div className="mx-auto flex max-w-4xl flex-col px-6">
          {/* Hero Section */}
          <section className="border-b border-gray-300 py-20 dark:border-gray-800">
            <div className="flex flex-col gap-6">
              <h1 className="font-serif text-5xl font-black leading-tight tracking-tight text-primary dark:text-white sm:text-6xl lg:text-7xl">
                Thoughts, stories, <br className="hidden sm:block" /> and ideas.
              </h1>
              <p className="max-w-xl text-xl font-light leading-relaxed text-text-secondary dark:text-gray-400">
                A minimal place to read, write, and deepen your understanding of the world around us.
              </p>
            </div>
          </section>

          {/* Article Feed */}
          <div className="flex flex-col py-10">
            {/* Filter Tabs */}
            <div className="mb-12 flex items-center gap-8 border-b border-gray-300 pb-4 dark:border-gray-800 overflow-x-auto">
              <button className="text-sm font-medium text-primary dark:text-white shrink-0">For you</button>
              <button className="text-sm font-medium text-text-secondary hover:text-primary dark:text-gray-500 dark:hover:text-white shrink-0">Following</button>
              <button className="text-sm font-medium text-text-secondary hover:text-primary dark:text-gray-500 dark:hover:text-white shrink-0">Design</button>
              <button className="text-sm font-medium text-text-secondary hover:text-primary dark:text-gray-500 dark:hover:text-white shrink-0">Technology</button>
            </div>

            {/* Article List */}
            {hasPosts ? (
              <div className="flex flex-col gap-16">
                {posts.map((post) => {
                  const contentHtml = typeof post.content === "string" ? post.content : "";
                  const excerpt = getExcerpt(contentHtml);
                  const readTime = `${getReadTime(contentHtml)} min read`;
                  const date = formatDate(post.publishedAt ?? post.createdAt);
                  const imageUrl = extractFirstImage(contentHtml);
                  const author = post.author?.displayName ?? "MiniBlog";

                  return (
                    <PostCard
                      key={post.id}
                      title={post.title?.trim() || "Untitled"}
                      excerpt={excerpt}
                      author={author}
                      date={date}
                      category="Story"
                      readTime={readTime}
                      imageUrl={imageUrl}
                      href={post.slug ? `/posts/${post.slug}` : undefined}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-gray-200 bg-white/70 px-6 py-8 text-center text-sm text-text-secondary shadow-sm dark:border-gray-800 dark:bg-white/5 dark:text-gray-400">
                No stories published yet.
              </div>
            )}
          </div>

          {/* Pagination */}
          {hasPosts && (
            <div className="flex justify-center py-10">
              <button className="rounded-full border border-gray-200 bg-transparent px-6 py-3 text-sm font-medium text-primary transition-colors hover:border-primary hover:bg-gray-50 dark:border-gray-700 dark:text-white dark:hover:border-white dark:hover:bg-gray-800">
                Load more stories
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
