import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { UseGetBlogsOption } from '@/queries/blogs'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Calendar,
  FileText,
  FileX,
  X,
  Clock,
  ArrowRight,
} from 'lucide-react'
import { Blog } from '@/types/blogs'
import { formatDate } from '@/lib/utils'

// Define interfaces
interface LoaderData {
  blogs: Blog[]
  totalPages: number
  isLoading: boolean
  error: string | null
}

interface CategoryItem {
  id: string
  label: string
}

// Hardcoded categories
export const categories: CategoryItem[] = [
  { id: 'competitions', label: 'Competitions' },
  { id: 'news', label: 'News' },
  { id: 'good_read', label: 'Good Read' },
  { id: 'results', label: 'Results' },
]

// Define the search params schema
const searchParamsSchema = z.object({
  page: z.coerce.number().default(1),
  category: z.string().optional(),
  search: z.string().optional(),
})

type SearchParams = z.infer<typeof searchParamsSchema>

export const Route = createFileRoute('/uudised/')({
  component: BlogPage,
  validateSearch: searchParamsSchema,

  loaderDeps: ({ search }) => ({
    page: search.page || 1,
    category: search.category,
    search: search.search,
  }),

  loader: async ({ context, deps }): Promise<LoaderData> => {
    const { queryClient } = context

    try {
      const response = await queryClient.ensureQueryData(
        UseGetBlogsOption(deps.page, deps.category, deps.search),
      )

      return {
        blogs: response?.data?.blogs || [],
        totalPages: response?.data?.total_pages || 0,
        isLoading: false,
        error: null,
      }
    } catch (error) {
      console.error('Error loading blogs:', error)
      return {
        blogs: [],
        totalPages: 0,
        isLoading: false,
        error: 'Failed to load blog posts',
      }
    }
  },
})

function BlogPage(): JSX.Element {
  const { t } = useTranslation()
  const { blogs, totalPages, error } = Route.useLoaderData()
  const searchParams = Route.useSearch()
  const page = searchParams.page || 1
  const { category, search } = searchParams
  const navigate = Route.useNavigate()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const [searchQuery, setSearchQuery] = useState(search || '')

  const availableCategories = [
    { id: "competitions", label: t("news.categories.competitions", "Competitions") },
    { id: "news", label: t("news.categories.news", "News") },
    { id: "good_read", label: t("news.categories.good_read", "Good Read") },
    { id: "results", label: t("news.categories.results", "Results") }
  ];

  const truncateText = (
    text: string | undefined,
    maxLength: number = 150,
  ): string => {
    if (!text) return ''
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text
  }

  const handleCategoryChange = (newCategory: string): void => {
    navigate({
      search: (prev: SearchParams) => ({
        ...prev,
        category: newCategory === 'all' ? undefined : newCategory,
        page: 1,
      }),
    })
  }

  const handleSearchSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    navigate({
      search: (prev: SearchParams) => ({
        ...prev,
        search: searchQuery || undefined,
        page: 1,
      }),
    })
  }

  const handlePageChange = (newPage: number): void => {
    navigate({
      search: (prev: SearchParams) => ({
        ...prev,
        page: newPage,
      }),
      replace: true,
    })
    window.scrollTo(0, 0)
  }

  const clearFilters = (): void => {
    setSearchQuery('')
    navigate({
      search: {
        page: 1,
      },
    })
  }

  const EmptyState = (): JSX.Element => (
    <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-center">
      <div className="relative">
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mb-6">
          <FileX size={40} className="text-blue-500" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
          <span className="text-xs">!</span>
        </div>
      </div>
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
        {t('blog.no_posts_found', 'No posts found')}
      </h2>
      <p className="text-gray-600 max-w-md mb-8 text-sm sm:text-base leading-relaxed">
        {t(
          'blog.try_different_filters',
          'Try different search terms or filters to find what you\'re looking for.',
        )}
      </p>
      <Button
        onClick={clearFilters}
        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
      >
        {t('blog.clear_filters', 'Clear all filters')}
      </Button>
    </div>
  )

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4">
          <div className="text-center py-12 bg-white rounded-3xl shadow-xl border border-gray-200">
            <div className="relative inline-block mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl flex items-center justify-center">
                <FileX size={40} className="text-red-500" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                <span className="text-white text-xs font-bold">!</span>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              {t('blog.error_title', 'Something went wrong')}
            </h2>
            <p className="text-gray-600 mb-8 text-sm leading-relaxed">
              {t(
                'blog.error_message',
                'Failed to load blog posts. Please try again later.',
              )}
            </p>
            <Button
              onClick={clearFilters}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
            >
              {t('blog.try_again', 'Try again')}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8 sm:mb-12 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
            {t('news.title')}
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            {t('news.subtitle', 'Stay updated with the latest news and announcements')}
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 sm:mb-12 space-y-6 sm:space-y-8">
          {/* Category Tabs */}
          <Tabs
            value={category || 'all'}
            className="w-full"
            onValueChange={(value) => handleCategoryChange(value)}
          >
            <div className="flex justify-center">
              <div className="inline-flex bg-white rounded-2xl p-1 shadow-lg border border-gray-200 overflow-x-auto max-w-full">
                <TabsList className="bg-transparent p-0 h-auto space-x-1">
                  <TabsTrigger value="all" className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-medium data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all whitespace-nowrap">
                    {t('news.categories.all', 'All')}
                  </TabsTrigger>

                  {availableCategories.map((cat) => (
                    <TabsTrigger
                      key={cat.id}
                      value={cat.id}
                      className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-medium data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all whitespace-nowrap"
                    >
                      {t(`news.categories.${cat.id}`, cat.label)}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
            </div>
          </Tabs>

          {/* Search Bar */}
          <div className="flex justify-center">
            <form onSubmit={handleSearchSubmit} className="w-full max-w-lg">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <Input
                  type="text"
                  placeholder={t('news.search_content', 'Search posts...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-12 sm:h-14 w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-2xl text-sm sm:text-base bg-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-lg"
                />
                {searchQuery && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setSearchQuery('');
                      clearFilters();
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Blog Posts Grid - Responsive Layout */}
        {blogs.length > 0 ? (
          <>
            {/* Mobile Compact Layout */}
            <div className="block sm:hidden space-y-3 mb-12">
              {blogs.map((post, index) => (
                <Link
                  key={post.id}
                  to={`/uudised/${post.id}`}
                  className="group block"
                >
                  <article className="bg-white border border-gray-200 rounded-xl p-3 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
                    <div className="flex items-start gap-3">
                      {/* Compact Image */}
                      <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                        {post.has_image && post.image_url ? (
                          <img
                            src={post.image_url}
                            alt={post.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading={index < 6 ? 'eager' : 'lazy'}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                            <FileText size={20} className="text-gray-400" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-gray-900 text-base group-hover:text-blue-600 transition-colors duration-200 line-clamp-2 leading-tight">
                            {post.title}
                          </h3>
                          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-200 flex-shrink-0 mt-0.5" />
                        </div>

                        <p className="text-gray-600 text-sm mt-1.5 line-clamp-2 leading-relaxed">
                          {truncateText(post.description, 100)}
                        </p>

                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center text-gray-500 text-xs">
                            <Clock className="w-3 h-3 mr-1.5" />
                            <time dateTime={post.created_at}>
                              {formatDate(post.created_at)}
                            </time>
                          </div>

                          {post.category && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600">
                              {availableCategories.find((c) => c.id === post.category)?.label || post.category}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>

            {/* Desktop Grid Layout */}
            <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-12 lg:mb-16">
              {blogs.map((post, index) => (
                <Link
                  key={post.id}
                  to={`/uudised/${post.id}`}
                  className="group focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded-2xl"
                >
                  <Card className="h-full flex flex-col bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:scale-[1.02] rounded-2xl overflow-hidden">
                    <div className="aspect-[16/10] w-full overflow-hidden relative">
                      {post.has_image && post.image_url ? (
                        <>
                          <img
                            src={post.image_url}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading={index < 6 ? 'eager' : 'lazy'}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </>
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <FileText size={40} className="text-gray-400" />
                        </div>
                      )}

                      {/* Category Badge */}
                      {post.category && (
                        <div className="absolute top-4 left-4">
                          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-sm text-gray-800 shadow-sm">
                            {availableCategories.find((c) => c.id === post.category)?.label || post.category}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col flex-grow p-5 lg:p-6">
                      <CardTitle className="mb-3 text-lg lg:text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {post.title}
                      </CardTitle>

                      <CardContent className="p-0 flex-grow mb-4">
                        <p className="text-gray-600 text-sm lg:text-base leading-relaxed line-clamp-3">
                          {truncateText(post.description, 120)}
                        </p>
                      </CardContent>

                      <CardFooter className="px-0 pt-0 pb-0 mt-auto">
                        <div className="flex items-center justify-between w-full text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar size={16} className="mr-2" />
                            <time dateTime={post.created_at}>
                              {formatDate(post.created_at)}
                            </time>
                          </div>
                          <span className="text-blue-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                            {t('news.read_more', 'Read more')}
                          </span>
                        </div>
                      </CardFooter>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <EmptyState />
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-12 sm:mt-16">
            <div className="flex items-center gap-2 bg-white rounded-2xl p-2 shadow-lg border border-gray-200">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                className="h-10 w-10 rounded-xl disabled:opacity-50 hover:bg-gray-100"
              >
                <ChevronLeft size={18} />
              </Button>

              <div className="flex items-center gap-1 mx-1">
                {Array.from({ length: totalPages }).map((_, index) => {
                  const pageNumber = index + 1

                  // Show first, last, current and pages around current
                  const shouldShowPage =
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    Math.abs(pageNumber - page) <= 1

                  // Show ellipsis if needed
                  const shouldShowEllipsis =
                    (pageNumber === 2 && page > 3) ||
                    (pageNumber === totalPages - 1 && page < totalPages - 2)

                  if (shouldShowPage) {
                    return (
                      <Button
                        key={pageNumber}
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePageChange(pageNumber)}
                        className={`h-10 w-10 rounded-xl font-medium transition-all ${page === pageNumber
                          ? 'bg-blue-500 text-white shadow-md hover:bg-blue-600'
                          : 'hover:bg-gray-100 text-gray-700'
                          }`}
                      >
                        {pageNumber}
                      </Button>
                    )
                  } else if (shouldShowEllipsis) {
                    return (
                      <span key={pageNumber} className="px-2 text-gray-400 font-medium">
                        …
                      </span>
                    )
                  }

                  return null
                })}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
                className="h-10 w-10 rounded-xl disabled:opacity-50 hover:bg-gray-100"
              >
                <ChevronRight size={18} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BlogPage
