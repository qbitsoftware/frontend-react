import { createFileRoute } from '@tanstack/react-router'
import { useTournament } from '../-components/tournament-provider'
import { UseGetFreeVenues } from '@/queries/venues'
import { UseGetTournamentTablesQuery } from '@/queries/tables'
import { VenueTable } from './-components/venue-table'
import { useTranslation } from 'react-i18next'
import LoadingScreen from '@/routes/-components/loading-screen'

export const Route = createFileRoute('/voistlused/$tournamentid/lauad/')({
    component: RouteComponent,
    errorComponent: () => <div>Error loading venues</div>,
})

function RouteComponent() {
    const tournament = useTournament()
    const { t } = useTranslation()
    const { data: venues, isLoading } = UseGetFreeVenues(Number(tournament.id), true)
    const { data: tournamentGroups } = UseGetTournamentTablesQuery(Number(tournament.id))

    if (isLoading) {
        return <LoadingScreen />;
      }

    return (
        <div className='px-2'>
            <h4 className='font-bold mb-4 md:mb-8 text-center md:text-left text-gray-700'>
                {t('competitions.tables', { defaultValue: 'Lauad' })}
            </h4>
            <VenueTable
                venues={venues?.data ?? []}
                groups={tournamentGroups?.data}
            />
        </div>
    )
}