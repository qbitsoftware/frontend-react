import { createFileRoute } from '@tanstack/react-router'
import { useTournament } from '../-components/tournament-provider'
import { UseGetFreeVenues } from '@/queries/venues'
import { UseGetTournamentTablesQuery } from '@/queries/tables'
import { VenueTable } from './-components/venue-table'
import LoadingScreen from '@/routes/-components/loading-screen'

export const Route = createFileRoute('/voistlused/$tournamentid/lauad/')({
    component: RouteComponent,
    errorComponent: () => <div>Error loading venues</div>,
})

function RouteComponent() {
    const { tournamentData: tournament } = useTournament()
    const { data: venues, isLoading } = UseGetFreeVenues(Number(tournament.id), true)
    const { data: tournamentGroups } = UseGetTournamentTablesQuery(Number(tournament.id))

    if (isLoading) {
        return <LoadingScreen />;
    }

    return (
        <div className="min-h-screen">
            <VenueTable
                venues={venues?.data ?? []}
                groups={tournamentGroups?.data}
            />
        </div>
    )
}
