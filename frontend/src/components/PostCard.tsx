interface PostProps {
    title: string;
    excerpt: string;
    author: string;
    date: string;
    category: string;
    readTime: string;
    imageUrl: string;
    authorImageUrl?: string; // Opsiyonel
}

export default function PostCard({ title, excerpt, author, date, category, readTime, imageUrl, authorImageUrl }: PostProps) {
    return (
        <>
            <article className="group flex cursor-pointer flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex flex-1 flex-col gap-3 pr-8">
                    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-text-secondary dark:text-gray-500">
                        <div className="flex items-center gap-2">
                            <div
                                className="h-5 w-5 rounded-full bg-gray-200 bg-cover bg-center"
                                style={{ backgroundImage: `url("${authorImageUrl || '/placeholder-user.jpg'}")` }}
                            ></div>
                            <span className="text-primary dark:text-gray-300">{author}</span>
                        </div>
                        <span>•</span>
                        <span>{date}</span>
                    </div>

                    <h2 className="font-serif text-2xl font-bold leading-tight text-primary group-hover:underline decoration-2 decoration-gray-300 underline-offset-4 dark:text-white dark:decoration-gray-600">
                        {title}
                    </h2>

                    <p className="font-serif line-clamp-3 text-base leading-relaxed text-text-secondary dark:text-gray-400">
                        {excerpt}
                    </p>

                    <div className="mt-2 flex items-center gap-4">
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-primary dark:bg-gray-800 dark:text-gray-300">
                            {category}
                        </span>
                        <span className="text-xs text-text-secondary dark:text-gray-500">{readTime}</span>
                        <div className="flex-1"></div>
                        <button className="text-text-secondary hover:text-primary dark:text-gray-500 dark:hover:text-white">
                            <span className="material-symbols-outlined text-[20px]">bookmark_add</span>
                        </button>
                    </div>
                </div>

                <div className="h-48 w-full shrink-0 overflow-hidden rounded-lg sm:h-32 sm:w-48 bg-gray-50">
                    <div
                        className="h-full w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                        style={{ backgroundImage: `url("${imageUrl}")` }}
                    ></div>
                </div>
            </article>
            <hr className="border-gray-100 dark:border-gray-800" />
        </>
    );
}