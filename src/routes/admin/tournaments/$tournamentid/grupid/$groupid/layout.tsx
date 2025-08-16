import {
  createFileRoute,
  Outlet,
  redirect,
} from '@tanstack/react-router'
import { UseGetTournamentTable } from '@/queries/tables'
import ErrorPage from '@/components/error'
import { TournamentTableProvider } from '@/routes/voistlused/$tournamentid/-components/tt-provider'

export const Route = createFileRoute(
  '/admin/tournaments/$tournamentid/grupid/$groupid',
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
      throw redirect({ to: `/admin/tournaments/${params.tournamentid}/grupid` })
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
    <TournamentTableProvider tournament_table_data={table_data.data}>
      <div className="pb-8">
        <Outlet />
      </div>
    </TournamentTableProvider>
  )
}
