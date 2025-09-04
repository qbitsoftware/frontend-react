import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import ErrorPage from '@/components/error'
import { UseGetBlog } from '@/queries/blogs'
import Editor from '../admin/-components/yooptaeditor'
import { useState, useEffect } from 'react'
import { YooptaContentValue } from '@yoopta/editor'
import { useTranslation } from 'react-i18next'
import { getFormattedDate } from '../voistlused/$tournamentid/mangud/-components/schedule-utils'
import { ArrowLeft, Calendar, Share2 } from 'lucide-react'

export const Route = createFileRoute('/uudised/$blogid')({
    errorComponent: () => {
        return <ErrorPage />
    },
    component: RouteComponent,
    loader: async ({ context: { queryClient }, params }) => {
        const articledata = queryClient.ensureQueryData(UseGetBlog(Number(params.blogid)))
        return articledata
    }
})

function RouteComponent() {

    const article = Route.useLoaderData()
    const { t } = useTranslation()

    const [value, setValue] = useState<YooptaContentValue | undefined>(article.data.full_content ? JSON.parse(article.data.full_content) : undefined);
    const [showCopied, setShowCopied] = useState(false);

    const categories = article.data.category.split('/').map((category) => category.trim())
    const category = categories[0]

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])


    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
            <div className="max-w-5xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
                <div className="py-4 sm:py-6 md:py-8 lg:py-12">
                    <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8 lg:mb-12">
                        <Link
                            to="/uudised"
                            search={{ page: 1 }}
                            className="group inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-all duration-300 hover:bg-blue-50 px-3 py-2 rounded-lg"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
                            {t('news.all_news')}
                        </Link>
                        
                        {category && (
                            <>
                                <span className="text-gray-300">•</span>
                                <Link
                                    to="/uudised"
                                    search={{ page: 1, category }}
                                    className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-all duration-300 hover:bg-blue-50 px-3 py-2 rounded-lg capitalize"
                                >
                                    {t('news.categories.' + category.toLowerCase())}
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                <div className="mb-8 sm:mb-12 lg:mb-16">

                    <div className="text-center space-y-6 lg:space-y-8 max-w-4xl mx-auto">
                        {category && (
                            <div className="inline-flex items-center px-4 lg:px-6 py-2 lg:py-3 rounded-full bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-200/50 text-blue-600 text-sm lg:text-base font-semibold backdrop-blur-sm">
                                {t('news.categories.' + category.toLowerCase())}
                            </div>
                        )}

                        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl xl:text-7xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent leading-[1.1] lg:leading-[1.05] px-2 sm:px-0">
                            {article.data.title}
                        </h1>

                        {article.data.description && (
                            <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed lg:leading-relaxed px-2 sm:px-0 font-light">
                                {article.data.description}
                            </p>
                        )}

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 lg:gap-8 pt-4 lg:pt-8">
                            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-sm">
                                <Calendar className="w-4 h-4 text-blue-500" />
                                <time dateTime={article.data.created_at} className="text-sm lg:text-base font-medium text-gray-700">
                                    {getFormattedDate(article.data.created_at)}
                                </time>
                            </div>
                            <button 
                                onClick={async () => {
                                    try {
                                        await navigator.clipboard.writeText(window.location.href);
                                        setShowCopied(true);
                                        setTimeout(() => setShowCopied(false), 2000);
                                    } catch (err) {
                                        console.error('Failed to copy URL:', err);
                                    }
                                }}
                                className="flex items-center gap-3 px-4 py-2 rounded-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 hover:text-blue-700 transition-all duration-300 border border-blue-200/50 backdrop-blur-sm relative"
                            >
                                <Share2 className="w-4 h-4" />
                                <span className="text-sm lg:text-base font-medium">
                                    {showCopied ? t('news.link_copied') : t('news.share')}
                                </span>
                                {showCopied && (
                                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-3 py-1 rounded-lg text-xs whitespace-nowrap animate-in fade-in-0 zoom-in-95 duration-200">
                                        {t('news.link_copied')}
                                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                    </div>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-indigo-500/5 rounded-2xl lg:rounded-3xl blur-3xl"></div>
                    <div className="relative bg-white/80 backdrop-blur-xl rounded-xl lg:rounded-3xl shadow-xl lg:shadow-2xl border border-white/50 overflow-hidden mb-8 sm:mb-12 lg:mb-16">
                        <div className="px-4 sm:px-6 md:px-8 lg:px-16 xl:px-20 py-6 sm:py-8 lg:py-16">
                            {value ? (
                                <div className="prose prose-sm sm:prose-base lg:prose-lg xl:prose-xl prose-gray max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-blockquote:border-blue-200 prose-blockquote:bg-blue-50/50">
                                    <Editor value={value} setValue={setValue} readOnly={true} />
                                </div>
                            ) : (
                                <div className="flex items-center justify-center py-16 lg:py-24">
                                    <div className="text-center">
                                        <div className="relative">
                                            <div className="animate-spin rounded-full h-8 lg:h-12 w-8 lg:w-12 border-4 border-blue-200 border-t-blue-500 mx-auto mb-4 lg:mb-6"></div>
                                            <div className="absolute inset-0 rounded-full bg-blue-100/20 blur-xl"></div>
                                        </div>
                                        <p className="text-gray-600 text-sm lg:text-base font-medium">{t('news.loading')}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="pb-8 sm:pb-12 lg:pb-16 text-center px-4 sm:px-0">
                    <Button 
                        asChild 
                        size="lg"
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 lg:px-12 py-3 lg:py-4 rounded-xl lg:rounded-2xl font-semibold shadow-lg hover:shadow-2xl transition-all duration-300 text-sm lg:text-base w-full sm:w-auto group backdrop-blur-sm border border-white/20"
                    >
                        <Link to="/uudised" search={{ page: 1 }}>
                            <ArrowLeft className="w-4 h-4 mr-3 group-hover:-translate-x-1 transition-transform duration-300" />
                            {t('news.back_to_news')}
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}

