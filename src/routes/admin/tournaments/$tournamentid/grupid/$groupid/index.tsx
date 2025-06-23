import { createFileRoute } from '@tanstack/react-router'
import TournamentTableForm from '../-components/table-form'
import { UseGetTournamentTable } from '@/queries/tables'
import ErrorPage from '@/components/error'
import { ErrorResponse } from '@/types/errors'
import TimetableForm from '../-components/timetable-form'

export const Route = createFileRoute(
    '/admin/tournaments/$tournamentid/grupid/$groupid/',
)({
    component: RouteComponent,
    errorComponent: () => <ErrorPage />,
    loader: async ({ context: { queryClient }, params }) => {

        let table_data

        try {
            table_data = await queryClient.ensureQueryData(
                UseGetTournamentTable(
                    Number(params.tournamentid),
                    Number(params.groupid),
                ),
            )
        } catch (error) {
            const err = error as ErrorResponse
            if (err.response.status !== 404) {
                throw error
            }
        }
        return { table_data }
    },
})

function RouteComponent() {
    const { table_data } = Route.useLoaderData()

    if (!table_data || !table_data.data) {
        return <></>
    }
    return (
        <div>
            <TournamentTableForm initial_data={table_data.data} />
            <TimetableForm  tournament_table={table_data.data}/>
        </div>
    )
}
