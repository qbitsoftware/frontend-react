import { FeedbackFormComponent } from '@/components/feedback-form'
import { FeedbackFeed } from '@/components/feedback-feed'
import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import AdminHeader from '../-components/admin-header'

export const Route = createFileRoute('/admin/feedback/')({
  component: AdminFeedbackPage,
})

function AdminFeedbackPage() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      <div className="container p-8">
        <AdminHeader
          title={t('feedback.title')}
          description={t('feedback.subtitle')}
          href={""}
          feedback={true}
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <FeedbackFormComponent 
            className="" 
          />
          <FeedbackFeed />
        </div>
      </div>
    </div>
  )
}
