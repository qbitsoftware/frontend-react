import { createFileRoute } from '@tanstack/react-router'
import { TournamentTables } from './-components/tables'
import { UseGetTournamentTables } from '@/queries/tables'
import { ErrorResponse } from '@/types/errors'
import ErrorPage from '@/components/error'
import { UseGetTournamentAdmin } from '@/queries/tournaments'

export const Route = createFileRoute(
  '/admin/tournaments/$tournamentid/grupid/',
)({
  component: RouteComponent,
  errorComponent: () => <ErrorPage />,
  loader: async ({ context: { queryClient }, params }) => {
    let tournament_tables
    try {
      tournament_tables = await queryClient.ensureQueryData(
        UseGetTournamentTables(Number(params.tournamentid)),
      )
    } catch (error) {
      const err = error as ErrorResponse
      if (err.response.status !== 404) {
        throw error
      }
    }
    const tournament = await queryClient.ensureQueryData(
      UseGetTournamentAdmin(Number(params.tournamentid)),
    )
    return { tournament, tournament_tables }
  },
})

function RouteComponent() {
  const { tournament_tables, tournament } = Route.useLoaderData()

  if (!tournament || !tournament.data) {
    return <div></div>
  }

  return (
    <div className="p-4">
      <TournamentTables
        tables={tournament_tables?.data}
        tournament={tournament.data}
      />
    </div>
  )
}
