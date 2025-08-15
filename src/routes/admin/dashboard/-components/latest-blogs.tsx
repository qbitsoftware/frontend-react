import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateString } from "@/lib/utils";
import { UseGetBlogsQuery } from "@/queries/blogs";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function AdminDashBoardBlogs() {
    const { t } = useTranslation()
    const { data: blogData, isLoading, error } = UseGetBlogsQuery(1);

    return (
        <Card className="shadow-sm">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-base sm:text-lg">
                            {t("admin.dashboard.latest_blogs")}
                        </CardTitle>
                        <CardDescription className="text-sm">
                            {t("admin.dashboard.latest_blogs_description")}
                        </CardDescription>
                    </div>
                    <Link href="/admin/blog">
                        <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                            {t("admin.dashboard.view_all")}
                            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                        </Button>
                    </Link>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {isLoading && (
                    <>
                        {[...Array(3)].map((_, index) => (
                            <div key={index} className="p-3 rounded-lg border animate-pulse">
                                <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                                <div className="space-y-1 mb-2">
                                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-3 bg-gray-200 rounded w-12"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1"></div>
                                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </>
                )}

                {error && (
                    <div className="p-4 rounded-lg border border-red-200 bg-red-50">
                        <div className="flex items-center gap-2 text-red-700 mb-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-medium text-sm">Error loading blogs</span>
                        </div>
                        <p className="text-xs text-red-600">
                            {t("admin.dashboard.error_loading_blogs")}
                        </p>
                    </div>
                )}

                {!isLoading && !error && blogData?.data && blogData.data.length > 0 && (
                    <>
                        {blogData.data.map((blog) => (
                            <Link key={blog.id} href={`/admin/blog/${blog.id}`}>
                                <div className="p-2 rounded-lg border hover:bg-gray-50 transition-colors cursor-pointer flex justify-between items-center">
                                    <div className="">
                                        <h4 className="font-medium text-sm sm:text-base truncate">{blog.title}</h4>
                                        <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">{blog.description}</p>
                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <span>{formatDateString(blog.created_at)}</span>
                                        </div>
                                    </div>
                                    {blog.image_url &&
                                        <div>
                                            <img src={blog.image_url} alt={blog.title} className="w-full aspect-square h-16 object-cover" />
                                        </div>
                                    }
                                </div>
                            </Link>
                        ))}
                    </>
                )}

                {!isLoading && !error && (!blogData?.data || blogData.data.length === 0) && (
                    <div className="p-4 rounded-lg border border-gray-200 bg-gray-50 text-center">
                        <p className="text-sm text-gray-500">
                            {t("admin.dashboard.no_blogs_yet")}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}