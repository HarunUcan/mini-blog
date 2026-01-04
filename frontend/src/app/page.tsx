import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostCard from "@/components/PostCard";

// Geçici veri (NestJS'den gelecek verinin simülasyonu)
const POSTS = [
  {
    id: 1,
    title: "The Future of Minimalist Design",
    excerpt: "Minimalism isn't just about using less; it's about making room for more of what matters. In digital design, this means stripping away the non-essential...",
    author: "Alex Doe",
    date: "Oct 24, 2023",
    category: "Design",
    readTime: "4 min read",
    imageUrl: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&q=80&w=300&h=200", // Örnek resim
    authorImageUrl: "https://i.pravatar.cc/150?u=alex"
  },
  {
    id: 2,
    title: "Why Typography Matters More Than You Think",
    excerpt: "Good typography makes us read more efficiently. It guides the eye and sets the tone of the voice before a single word is comprehended.",
    author: "Sarah Smith",
    date: "Oct 22, 2023",
    category: "Typography",
    readTime: "6 min read",
    imageUrl: "https://images.unsplash.com/photo-1555445054-a1d45f413014?auto=format&fit=crop&q=80&w=300&h=200",
    authorImageUrl: "https://i.pravatar.cc/150?u=sarah"
  }
  // Diğer postlar buraya eklenebilir...
];

export default function Home() {
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
            <div className="flex flex-col gap-16">
              {POSTS.map((post) => (
                <PostCard
                  key={post.id}
                  {...post}
                />
              ))}
            </div>
          </div>

          {/* Pagination */}
          <div className="flex justify-center py-10">
            <button className="rounded-full border border-gray-200 bg-transparent px-6 py-3 text-sm font-medium text-primary transition-colors hover:border-primary hover:bg-gray-50 dark:border-gray-700 dark:text-white dark:hover:border-white dark:hover:bg-gray-800">
              Load more stories
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}