import { createFileRoute } from '@tanstack/react-router'
import ErrorPage from '@/components/error'
import { XCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { TournamentsCalendar } from './-components/new-calendar'
import { UseGetTournamentsPublic } from '@/queries/tournaments'

export const Route = createFileRoute('/voistlused/')({
  errorComponent: () => {
    return <ErrorPage />
  },
  component: RouteComponent,
  loader: async ({ context: { queryClient } }) => {
    const tournaments = await queryClient.ensureQueryData(UseGetTournamentsPublic())
    return { tournaments }
  },
})

function RouteComponent() {
  const { tournaments } = Route.useLoaderData()
  const { t } = useTranslation()
  return (
    <div className="w-full mx-auto px-3 sm:px-4 lg:px-4 max-w-[95%] sm:max-w-[85%]">
      {tournaments.data ? (
        <div className='py-3 sm:py-6'>
          <div className="bg-white border border-gray-200/50 shadow-lg rounded-2xl px-3 sm:px-6 md:px-8 lg:px-12 py-4 sm:py-8 space-y-4 sm:space-y-6">
            <div className="flex items-center gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-gray-200/50">
              <div className="w-1 h-6 sm:h-8 bg-[#4C97F1] rounded-full"></div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{t("calendar.title")}</h2>
            </div>
            <TournamentsCalendar tournaments={tournaments.data} />
          </div>
        </div>
      ) : (
        <div className="w-full h-[90vh] flex flex-col items-center justify-center space-y-6 text-center">
          <div className="bg-gray-100 rounded-full p-8">
            <XCircle className="w-16 h-16 text-gray-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
              {t("admin.tournaments.errors.not_found")}
            </h2>
            <p className="text-gray-600">Check back soon for upcoming tournaments</p>
          </div>
        </div>
      )}
    </div>
  )
}
