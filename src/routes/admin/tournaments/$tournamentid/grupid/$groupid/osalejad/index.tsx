import { createFileRoute } from '@tanstack/react-router'
import { UseGetTournament } from '@/queries/tournaments'
import { UseGetTournamentTable } from '@/queries/tables'
import Loader from '@/components/loader'
import ErrorPage from '@/components/error'
import { ErrorResponse } from '@/types/errors'
import { ParticipantProvider } from '@/providers/participantProvider'
import { NewSolo } from './-components/new-solo'

export const Route = createFileRoute(
    '/admin/tournaments/$tournamentid/grupid/$groupid/osalejad/',
)({
    component: RouteComponent,
    errorComponent: () => <ErrorPage />,
    loader: async ({ context: { queryClient }, params }) => {
        let tournament_data
        let table_data
        try {
            tournament_data = await queryClient.ensureQueryData(
                UseGetTournament(Number(params.tournamentid)),
            )
        } catch (error) {
            const err = error as ErrorResponse
            if (err.response.status !== 404) {
                throw error
            }
        }

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
        return { tournament_data, table_data }
    },
})

function RouteComponent() {
    const { tournament_data, table_data } = Route.useLoaderData()
    const { tournamentid, groupid } = Route.useParams()

    if (tournament_data && tournament_data.data && table_data && table_data.data) {
        return (
            <div className=''>

                {tournament_data && table_data &&
                    <ParticipantProvider tournament_id={Number(tournamentid)} tournament_table_id={Number(groupid)}>
                        {/* <ParticipantsForm
                            tournament_data={tournament_data.data}
                            table_data={table_data.data}
                        /> */}
                        <NewSolo />
                    </ParticipantProvider>
                }
            </div>
        )
    } else {
        return (
            <div className='flex justify-center items-center h-[50vh]'>
                <Loader />
            </div>
        )
    }


}
