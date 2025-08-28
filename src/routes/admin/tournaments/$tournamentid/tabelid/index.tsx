import ErrorPage from '@/components/error'
import { UseGetTournamentTablesQuery } from '@/queries/tables'
import { createFileRoute, useParams } from '@tanstack/react-router'
import Loader from '@/components/loader'
import NoGroupsError from '../-components/no-groups-error'

export const Route = createFileRoute(
  '/admin/tournaments/$tournamentid/tabelid/',
)({
  errorComponent: () => <ErrorPage />,
  component: RouteComponent,
})

function RouteComponent() {
  const params = useParams({ from: "/admin/tournaments/$tournamentid/grupid/$groupid/tabelid/" })

  const tournamentId = Number(params.tournamentid)
  const tablesQuery = UseGetTournamentTablesQuery(tournamentId)

  if (tablesQuery.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
        <Loader />
      </div>
    )
  }

  if (tablesQuery.isError || !tablesQuery.data?.data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
        <NoGroupsError />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      <Loader />
    </div>
  )
}
