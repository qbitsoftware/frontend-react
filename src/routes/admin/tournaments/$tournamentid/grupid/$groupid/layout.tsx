import {
  createFileRoute,
  Outlet,
  redirect,
  useParams,
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
  const { tournamentid, groupid } = useParams({ from: "/admin/tournaments/$tournamentid/grupid/$groupid/" })
  if (!table_data || !table_data.data) {
    return <></>
  }

  return (
    <TournamentTableProvider
      key={`${tournamentid}-${groupid}`}
      tournament_table_data={table_data.data}>
      <div className="pb-8">
        <Outlet />
      </div>
    </TournamentTableProvider>
  )
}
