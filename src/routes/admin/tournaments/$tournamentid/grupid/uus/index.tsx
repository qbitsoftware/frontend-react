import { createFileRoute } from '@tanstack/react-router'
import TournamentTableForm from '../-components/table-form'

export const Route = createFileRoute(
  '/admin/tournaments/$tournamentid/grupid/uus/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="px-10 py-4">
      <TournamentTableForm initial_data={undefined} participants={[]} />
    </div>
  )
}
