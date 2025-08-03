import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import ErrorPage from '@/components/error'
import { UseGetBlog } from '@/queries/blogs'
import Editor from '../admin/-components/yooptaeditor'
import { useState, useEffect } from 'react'
import { YooptaContentValue } from '@yoopta/editor'
import { useTranslation } from 'react-i18next'
import { getFormattedDate } from '../voistlused/$tournamentid/ajakava/-components/schedule-utils'
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

    const categories = article.data.category.split('/').map((category) => category.trim())
    const category = categories[0]

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])


    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="py-6 sm:py-8">
                    <div className="flex items-center gap-3 mb-6">
                        <Link
                            to="/uudised"
                            search={{ page: 1 }}
                            className="group inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            {t('news.all_news')}
                        </Link>
                        
                        {category && (
                            <>
                                <span className="text-gray-400">/</span>
                                <Link
                                    to="/uudised"
                                    search={{ page: 1, category }}
                                    className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors capitalize"
                                >
                                    {t('news.categories.' + category.toLowerCase())}
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                <div className="mb-8 sm:mb-12">
                    {article.data.has_image && article.data.image_url && (
                        <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden shadow-2xl mb-8">
                            <img
                                src={article.data.image_url}
                                alt={article.data.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    <div className="text-center space-y-6">
                        {category && (
                            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-500/10 text-blue-600 text-sm font-semibold">
                                {t('news.categories.' + category.toLowerCase())}
                            </div>
                        )}

                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                            {article.data.title}
                        </h1>

                        {article.data.description && (
                            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                                {article.data.description}
                            </p>
                        )}

                        <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <time dateTime={article.data.created_at}>
                                    {getFormattedDate(article.data.created_at)}
                                </time>
                            </div>
                            <button 
                                onClick={() => {
                                    if (navigator.share) {
                                        navigator.share({
                                            title: article.data.title,
                                            text: article.data.description,
                                            url: window.location.href
                                        });
                                    } else {
                                        navigator.clipboard.writeText(window.location.href);
                                    }
                                }}
                                className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors"
                            >
                                <Share2 className="w-4 h-4" />
                                {t('news.share', 'Share')}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden mb-12">
                    <div className="px-6 sm:px-8 lg:px-12 py-8 sm:py-12">
                        {value ? (
                            <div className="prose prose-lg prose-gray max-w-none">
                                <Editor value={value} setValue={setValue} readOnly={true} />
                            </div>
                        ) : (
                            <div className="flex items-center justify-center py-16">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                                    <p className="text-gray-500">{t('news.loading')}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="pb-12 text-center">
                    <Button 
                        asChild 
                        size="lg"
                        className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                    >
                        <Link to="/uudised" search={{ page: 1 }}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            {t('news.back_to_news', 'Back to News')}
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}

