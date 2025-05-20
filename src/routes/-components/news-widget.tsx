import { Blog } from "@/types/blogs";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Clock } from "lucide-react";

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
      <div className="border-2 border-dashed rounded-md py-12 px-8">
        <p className="pb-1 text-center font-medium text-stone-700">
          {t("homepage.news.missing")}
        </p>
      </div>
    );
  }

  if (!blogs || blogs.length === 0) {
    return null;
  }

  return (
    <div>
      <ul className="divide-y">
        {blogs.slice(0, 3).map((post) => (
          <li key={post.id} className="py-3 first:pt-0 last:pb-0">
            <Link
              href={`/uudised/${post.id}`}
              className="flex items-start space-x-3 group hover:bg-neutral-50 rounded p-2 -m-2 transition-colors"
            >
              <div className="flex-shrink-0 w-20 h-20 bg-neutral-100 rounded overflow-hidden">
                <img
                  src={post.image_url || "/blog_placeholder.jpg"}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-grow">
                <h6 className="font-medium text-sm sm:text-base leading-tight group-hover:underline line-clamp-2">
                  {post.title}
                </h6>
                <div className="flex items-center mt-2 text-neutral-500 text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  <span>{formatDate(post.created_at)}</span>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NewsWidget;
