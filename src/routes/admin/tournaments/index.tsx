import { createFileRoute } from '@tanstack/react-router'
import { TournamentTable } from './-components/tournaments'
import ErrorPage from '@/components/error'
import { UseGetTournamentsAdminQuery } from '@/queries/tournaments'


export interface TournamentSearchParams {
    tutorial?: boolean
}

export const Route = createFileRoute('/admin/tournaments/')({
    errorComponent: () => <ErrorPage />,
    component: RouteComponent,
})

function RouteComponent() {
    const { data: tournaments_data, isLoading } = UseGetTournamentsAdminQuery()
    void isLoading

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
            <div className='p-2 py-8 md:p-8'>
                {tournaments_data?.data && (
                    <TournamentTable tournaments={tournaments_data.data} />
                )
                }
            </div>
        </div>
    )

}
