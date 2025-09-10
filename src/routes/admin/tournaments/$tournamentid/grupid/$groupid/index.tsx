import { createFileRoute, useParams } from '@tanstack/react-router'
import TournamentTableForm from '../-components/table-form'
import ErrorPage from '@/components/error'
import { UseGetTournamentTableQuery } from '@/queries/tables'

export const Route = createFileRoute(
  '/admin/tournaments/$tournamentid/grupid/$groupid/',
)({
  component: RouteComponent,
  errorComponent: () => <ErrorPage />,
})

function RouteComponent() {
  const params = useParams({ from: "/admin/tournaments/$tournamentid/grupid/$groupid/" })

  const { data: tournamentTable, isLoading } = UseGetTournamentTableQuery(Number(params.tournamentid), Number(params.groupid))
  if (isLoading) {
    return <div>Loading...</div>
  }
  if (!tournamentTable || !tournamentTable.data.group) {
    return <div>No data</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      <div className="p-2">
        <TournamentTableForm
          initial_data={tournamentTable?.data.group}
        />
      </div>
    </div>
  )
}
