import { Blog } from "@/types/blogs";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Clock, ArrowRight } from "lucide-react";

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("et-EE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

interface Props {
  blogs: Blog[] | null;
  isEmpty: boolean;
}

const NewsWidget = ({ blogs, isEmpty }: Props) => {
  const { t } = useTranslation();

  if (isEmpty) {
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-xl py-16 px-8 text-center bg-gray-50/50">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2m-4-3v6m0 0l-3-3m3 3l3-3" />
          </svg>
        </div>
        <p className="text-lg font-medium text-gray-700 mb-2">
          {t("homepage.news.missing")}
        </p>
        <p className="text-sm text-gray-500">
          Check back soon for the latest updates
        </p>
      </div>
    );
  }

  if (!blogs || blogs.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2 sm:space-y-3">
      {blogs.slice(0, 3).map((post) => (
        <Link
          key={post.id}
          href={`/uudised/${post.id}`}
          className="group block"
        >
          <article className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-2 sm:p-3 hover:border-[#4C97F1]/30 hover:shadow-lg hover:shadow-[#4C97F1]/10 transition-all duration-300">
            <div className="flex items-start gap-2 sm:gap-3">
              {/* Featured Image */}
              <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-md sm:rounded-lg overflow-hidden">
                <img
                  src={post.image_url || "/blog_placeholder.jpg"}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-1 sm:gap-2">
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base group-hover:text-[#4C97F1] transition-colors duration-200 line-clamp-2 leading-tight">
                    {post.title}
                  </h3>
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 group-hover:text-[#4C97F1] group-hover:translate-x-1 transition-all duration-200 flex-shrink-0 mt-0.5" />
                </div>
                
                <p className="text-gray-600 text-xs sm:text-sm mt-1 sm:mt-1.5 line-clamp-1 sm:line-clamp-2 leading-relaxed">
                  {post.description}
                </p>
                
                <div className="flex items-center justify-between mt-1.5 sm:mt-2">
                  <div className="flex items-center text-gray-500 text-xs">
                    <Clock className="w-3 h-3 mr-1 sm:mr-1.5" />
                    <time dateTime={post.created_at}>
                      {formatDate(post.created_at)}
                    </time>
                  </div>
                  
                  <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs font-medium bg-[#4C97F1]/10 text-[#4C97F1]">
                    News
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
