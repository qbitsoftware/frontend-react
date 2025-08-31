import { Blog } from "@/types/blogs";
import { Link } from "@tanstack/react-router";
import { Clock, ArrowRight } from "lucide-react";
import { UseGetBlogsQueryPublic } from "@/queries/blogs";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("et-EE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const NewsWidget = () => {
  const { t } = useTranslation();
  const { data, isLoading, error } = UseGetBlogsQueryPublic();
  const [blogs, setBlogs] = useState<Blog[]>([]);

  useEffect(() => {
    if (data && data.data) {
      setBlogs(data.data.blogs);
    }
  }, [data])

  const BlogSkeleton = () => (
    <div className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-2 sm:p-2.5">
      <div className="flex items-start gap-2 sm:gap-3">
        <Skeleton className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-md sm:rounded-lg" />

        <div className="flex-1 min-w-0 space-y-1 sm:space-y-1.5">
          <div className="flex items-start justify-between gap-1 sm:gap-2">
            <Skeleton className="h-4 sm:h-5 w-3/4" />
            <Skeleton className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5" />
          </div>

          <Skeleton className="h-3 sm:h-4 w-full" />
          <Skeleton className="h-3 sm:h-4 w-2/3 sm:block hidden" />

          <div className="flex items-center justify-between mt-1.5 sm:mt-2">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <Skeleton className="w-3 h-3 rounded" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-5 sm:h-6 w-12 rounded" />
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-2 sm:space-y-3">
        {[...Array(3)].map((_, index) => (
          <BlogSkeleton key={`blog-skeleton-${index}`} />
        ))}
      </div>
    );
  }

  if (error || !blogs.length) {
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-lg sm:rounded-xl py-8 sm:py-12 px-4 sm:px-6 text-center bg-gray-50/50">
        <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-gray-200 flex items-center justify-center">
          <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
        </div>
        <p className="text-sm sm:text-base font-medium text-gray-700 mb-1">
          {t('news.no_news')}
        </p>
        <p className="text-xs sm:text-sm text-gray-500">
          {t('news.no_news_description')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 sm:space-y-3">
      {blogs.slice(0, 3).map((post) => (
        <Link
          key={post.id}
          href={`/uudised/${post.id}`}
          className="group block"
        >
          <article className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-2 sm:p-2.5 hover:border-[#4C97F1]/30 hover:shadow-lg hover:shadow-[#4C97F1]/10 transition-all duration-300">
            <div className="flex items-start gap-2 sm:gap-3">
              {/* Featured Image */}
              <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 rounded-md sm:rounded-lg overflow-hidden">
                <img
                  src={post.image_url || "/blog_placeholder.jpg"}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-1 sm:gap-2">
                  <h3 className="font-semibold text-gray-900 text-xs sm:text-sm group-hover:text-[#4C97F1] transition-colors duration-200 line-clamp-2 leading-tight">
                    {post.title.length > 50 ? `${post.title.substring(0, 50)}...` : post.title}
                  </h3>
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 group-hover:text-[#4C97F1] group-hover:translate-x-1 transition-all duration-200 flex-shrink-0 mt-0.5" />
                </div>

                <p className="text-gray-600 text-xs mt-1 line-clamp-1 leading-relaxed">
                  {post.description}
                </p>

                <div className="flex items-center justify-between mt-1 sm:mt-1.5">
                  <div className="flex items-center text-gray-500 text-xs">
                    <Clock className="w-3 h-3 mr-1 sm:mr-1.5" />
                    <time dateTime={post.created_at}>
                      {formatDate(post.created_at)}
                    </time>
                  </div>

                  <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs font-medium bg-[#4C97F1]/10 text-[#4C97F1]">
                    {t(`news.categories.${(post.category || 'news').toLowerCase()}`, post.category || 'News')}
                  </span>
                </div>
              </div>
            </div>
          </article>
        </Link>
      ))}
    </div>
  );
};

export default NewsWidget;
