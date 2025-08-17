import { createFileRoute } from '@tanstack/react-router'
import { TournamentTable } from './-components/tournaments'
import ErrorPage from '@/components/error'
import { UseGetTournamentsAdmin } from '@/queries/tournaments'


export interface TournamentSearchParams {
    tutorial?: boolean
}

export const Route = createFileRoute('/admin/tournaments/')({
    loader: async ({ context: { queryClient } }) => {
        try {
            const tournaments_data = await queryClient.ensureQueryData(UseGetTournamentsAdmin())
            return { tournaments_data, error: null }
        } catch (error) {
            return { tournaments_data: null, error }
        }
    },
    errorComponent: () => <ErrorPage />,
    component: RouteComponent,
})

function RouteComponent() {
    const { tournaments_data } = Route.useLoaderData()

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
