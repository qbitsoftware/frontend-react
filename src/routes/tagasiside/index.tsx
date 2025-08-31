import { FeedbackFormComponent } from '@/components/feedback-form'
import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/tagasiside/')({
  component: PublicFeedbackPage,
})

function PublicFeedbackPage() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {t('feedback.title')}
          </h1>
          <p className="text-gray-600 text-lg">
            {t('feedback.subtitle')}
          </p>
        </div>
        
        <FeedbackFormComponent 
          className=""
          showSuccessMessage={true}
        />
      </div>
    </div>
  )
}