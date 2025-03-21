import { UseGetTournaments } from '@/queries/tournaments'
import { createFileRoute } from '@tanstack/react-router'
import ErrorPage from '@/components/error'
import { XCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { SportsTimetable } from './-components/calendar'

export const Route = createFileRoute('/voistlused/')({
  errorComponent: () => {
    return <ErrorPage />
  },
  component: RouteComponent,
  loader: async ({ context: { queryClient } }) => {
    const tournaments = await queryClient.ensureQueryData(UseGetTournaments())
    return { tournaments }
  },
})

function RouteComponent() {
  const { tournaments } = Route.useLoaderData()
  const { t } = useTranslation()
  return (
    <div className="w-full mx-auto lg:px-4 max-w-[1440px]">
      {tournaments.data ? (
        // <TournamentList tournaments={tournaments.data} />
        <div className='py-4'>
          <div className="lg:rounded-lg bg-white px-4 sm:px-6 md:px-12 py-6 space-y-4">

            <h2 className="font-bold mb-6">Sports Tournament Calendar</h2>
            <SportsTimetable tournaments={tournaments.data} />
          </div>
        </div>
      ) : (
        <div className="w-full h-[90vh] flex flex-col items-center justify-center space-y-4 text-center">
          <XCircle className="w-16 h-16 text-gray-400 dark:text-gray-600" />
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-700 dark:text-gray-300">
            {t("admin.tournaments.errors.not_found")}
          </h2>
        </div>
      )}
    </div>
  )
}
