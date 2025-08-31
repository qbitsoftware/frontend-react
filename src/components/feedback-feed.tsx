import { useGetAllFeedback } from '@/queries/users'
import { useTranslation } from 'react-i18next'
import { MessageSquare, User, Clock } from 'lucide-react'

export function FeedbackFeed() {
  const { data: feedbackData, isLoading, error } = useGetAllFeedback()
  const { t } = useTranslation()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-5 h-5 text-[#4C97F1]" />
          <h3 className="text-lg font-semibold text-gray-800">{t('feedback.feed.title')}</h3>
        </div>
        <div className="bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl p-6 shadow-sm">
          <p className="text-gray-500 text-center">{t('feedback.feed.loading')}</p>
        </div>
      </div>
    )
  }

  if (error || !feedbackData?.data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-5 h-5 text-[#4C97F1]" />
          <h3 className="text-lg font-semibold text-gray-800">{t('feedback.feed.title')}</h3>
        </div>
        <div className="bg-white/70 backdrop-blur-sm border border-red-200 rounded-xl p-6 shadow-sm">
          <p className="text-red-600 text-center">Error loading feedback</p>
        </div>
      </div>
    )
  }

  const feedback = feedbackData.data

  if (feedback.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-5 h-5 text-[#4C97F1]" />
          <h3 className="text-lg font-semibold text-gray-800">{t('feedback.feed.title')}</h3>
        </div>
        <div className="bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl p-8 shadow-sm">
          <div className="text-center">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-600 mb-2">
              {t('feedback.feed.empty')}
            </h4>
            <p className="text-gray-500 text-sm">{t('feedback.feed.empty_description')}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl shadow-sm">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <MessageSquare className="w-5 h-5 text-[#4C97F1]" />
          <h3 className="text-lg font-semibold text-gray-800">{t('feedback.feed.title')}</h3>
          <span className="text-sm text-gray-500 ml-2">({feedback.length})</span>
        </div>
        
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
          {feedback.map((item) => (
            <div key={item.id} className="bg-gray-50/80 border border-gray-100 rounded-lg p-4 hover:bg-white hover:shadow-sm transition-all duration-200">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-medium text-gray-900 text-base leading-tight">{item.title}</h4>
                  <span className="text-xs text-gray-400 whitespace-nowrap ml-3">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                <p className="text-gray-700 text-sm mb-4 leading-relaxed whitespace-pre-wrap">
                  {item.body}
                </p>
                
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <User className="w-3 h-3" />
                    <span className="font-medium">{item.name || t('feedback.feed.anonymous')}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(item.created_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
