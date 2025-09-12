import { Button } from "@/components/ui/button"
import { replaceSpecialCharacters } from "@/lib/utils";
import { Article } from "@/types/blogs";
import { Link } from "@tanstack/react-router"
import { useTranslation } from "react-i18next";

interface LatestArticlesProps {
    articles: Article[]
}

export const LatestArticles: React.FC<LatestArticlesProps> = ({ articles }) => {
    const { t } = useTranslation();

    return (
        <div>
            <h2 className="text-3xl font-semibold text-gray-900 mb-6">{t('homepage.latest_news')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {articles.map((article, index) => {
                    const categories = article.category.split('/').map((category) => category.trim())
                    return (
                        <div key={index} className="bg-white shadow-lg rounded-lg overflow-hidden">
                            {article.thumbnail ? (
                                <img src={article.thumbnail} alt={article.title} width={300} height={300} className="w-full h-[300px] object-cover" />
                            ) : <img src={"/racket.svg"} alt={article.title} width={300} height={300} className="w-full h-[300px] object-fill" />
                            }
                            <div className="p-6">
                                <p className="text-sm font-medium text-blue-600 mb-1">{categories.map((category, idx) => {
                                    if (idx === categories.length - 1) {
                                        return (
                                            <Link to={`/uudised`} search={{ category: replaceSpecialCharacters(category) }}>
                                                <span key={category}>{category}</span>
                                            </Link>
                                        )
                                    } else {
                                        return (
                                            <div key={idx}>
                                                <Link to={`/uudised`} search={{ category: replaceSpecialCharacters(category) }}>
                                                    <span key={category} className="mr-2">{category}</span>
                                                </Link>
                                                <span className='mr-2'>/</span>
                                            </div>
                                        )
                                    }
                                })}</p>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">{article.title}</h3>
                                <p className="text-gray-500 mb-4">{article.created_at}</p>
                                <Link to={`/uudised/$blogid`} params={{ blogid: String(article.id) }}>
                                    <Button variant="outline" className="w-full border border-blue-500">{t('homepage.news.read_more')}</Button>
                                </Link>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}