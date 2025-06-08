import { createFileRoute } from '@tanstack/react-router'
import { UseGetTournament } from '@/queries/tournaments'
import { UseGetTournamentTableQuery } from '@/queries/tables'
import Loader from '@/components/loader'
import ErrorPage from '@/components/error'
import { ErrorResponse } from '@/types/errors'
import { NewSolo } from './-components/new-solo'
import { NewTeams } from './-components/new-teams'
import { UseGetParticipantsQuery } from '@/queries/participants'
import SeedingHeader from './-components/seeding-header'

export const Route = createFileRoute(
    '/admin/tournaments/$tournamentid/grupid/$groupid/osalejad/',
)({
    component: RouteComponent,
    errorComponent: () => <ErrorPage />,
    loader: async ({ context: { queryClient }, params }) => {
        let tournament_data
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

        return { tournament_data }
    },
})

function RouteComponent() {
    const { tournament_data } = Route.useLoaderData()
    const { tournamentid, groupid } = Route.useParams()
    const { data: participant_data } = UseGetParticipantsQuery(Number(tournamentid), Number(groupid), false)
    const { data: table_data } = UseGetTournamentTableQuery(Number(tournamentid), Number(groupid))

    if (tournament_data && tournament_data.data && table_data && table_data.data) {
        return (
            <div className=''>

                {tournament_data && table_data && participant_data && participant_data.data &&
                    <>
                        <SeedingHeader
                            tournament_id={Number(tournamentid)}
                            table_data={table_data.data}
                            participants={participant_data.data}
                        />

                        {table_data.data.solo ?
                            <NewSolo participant_data={participant_data} tournament_id={Number(tournamentid)} tournament_table={table_data.data} />
                            :
                            <NewTeams participant_data={participant_data} tournament_id={Number(tournamentid)} tournament_table={table_data.data} />
                        }
                    </>
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
