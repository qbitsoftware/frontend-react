import { createFileRoute } from '@tanstack/react-router'
import ErrorPage from '@/components/error'
import { useTranslation } from 'react-i18next'
import { TournamentsCalendar } from './-components/new-calendar'

export const Route = createFileRoute('/voistlused/')({
  errorComponent: () => {
    return <ErrorPage />
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { t } = useTranslation()
  return (
    <div className="w-full mx-auto px-3 sm:px-4 lg:px-4 max-w-[95%] sm:max-w-[85%]">
      <div className='py-3 sm:py-6'>
        <div className="bg-white border border-gray-200/50 shadow-lg rounded-2xl px-3 sm:px-6 md:px-8 lg:px-12 py-4 sm:py-8 space-y-4 sm:space-y-6">
          <div className="flex items-center gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-gray-200/50">
            <div className="w-1 h-6 sm:h-8 bg-[#4C97F1] rounded-full"></div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{t("calendar.title")}</h2>
          </div>
          <TournamentsCalendar />
        </div>
      </div>
    </div>
  )
}
