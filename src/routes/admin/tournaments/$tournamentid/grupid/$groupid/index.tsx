import { createFileRoute } from '@tanstack/react-router'
import TournamentTableForm from '../-components/table-form'
import ErrorPage from '@/components/error'
import { useTournamentTable } from '@/routes/voistlused/$tournamentid/-components/tt-provider'

export const Route = createFileRoute(
  '/admin/tournaments/$tournamentid/grupid/$groupid/',
)({
  component: RouteComponent,
  errorComponent: () => <ErrorPage />,
})

function RouteComponent() {
  const tt = useTournamentTable()
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      <div className="p-2">
        <TournamentTableForm
          initial_data={tt.group}
          participants={tt.participants}
        />
      </div>
    </div>
  )
}
