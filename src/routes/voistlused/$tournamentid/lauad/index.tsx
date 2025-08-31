import { createFileRoute } from '@tanstack/react-router'
import { useTournament } from '../-components/tournament-provider'
import { UseGetFreeVenues } from '@/queries/venues'
import { UseGetTournamentTablesQuery } from '@/queries/tables'
import { VenueTable } from './-components/venue-table'
import LoadingScreen from '@/routes/-components/loading-screen'
import { useState } from 'react'
import { FullscreenVenueDialog } from './-components/fullscreen-venue-dialog'

export const Route = createFileRoute('/voistlused/$tournamentid/lauad/')({
    component: RouteComponent,
    errorComponent: () => <div>Error loading venues</div>,
})

function RouteComponent() {
    const { tournamentData: tournament } = useTournament()
    const { data: venues, isLoading, error } = UseGetFreeVenues(Number(tournament.id), true)
    const { data: tournamentGroups } = UseGetTournamentTablesQuery(Number(tournament.id))
    const [isFullscreenOpen, setIsFullscreenOpen] = useState(false)

    if (isLoading) {
        return <LoadingScreen />;
    }

    if (error) {
        return <div className="p-4 text-red-600">Error loading venues: {error.message}</div>;
    }

    return (
        <div className="min-h-screen">
            <div className="flex justify-between items-center mb-6 px-4">
                <FullscreenVenueDialog
                    venues={venues?.data ?? []}
                    groups={tournamentGroups?.data}
                    isOpen={isFullscreenOpen}
                    onOpenChange={setIsFullscreenOpen}
                />
            </div>
            <div className="px-4">
                <VenueTable
                    venues={venues?.data ?? []}
                    groups={tournamentGroups?.data}
                />
            </div>
        </div>
    )
}
