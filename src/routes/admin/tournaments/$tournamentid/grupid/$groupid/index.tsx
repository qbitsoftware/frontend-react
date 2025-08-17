import { createFileRoute } from '@tanstack/react-router'
import TournamentTableForm from '../-components/table-form'
import ErrorPage from '@/components/error'
import TimetableForm from '../-components/timetable-form'
import { useState } from 'react'
import { useTournamentTable } from '@/routes/voistlused/$tournamentid/-components/tt-provider'

export const Route = createFileRoute(
  '/admin/tournaments/$tournamentid/grupid/$groupid/',
)({
  component: RouteComponent,
  errorComponent: () => <ErrorPage />,
})

function RouteComponent() {
  const tt = useTournamentTable()
  const [showTimetable, setShowTimetable] = useState<boolean>(
    tt.group?.time_table || false
  )

  if (!tt || !tt.group) {
    return <></>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      <div className="p-2">
        <TournamentTableForm
          initial_data={tt.group}
          onTimetableToggle={setShowTimetable}
        />
        {showTimetable && (
          <TimetableForm tournament_table={tt.group} />
        )}
      </div>
    </div>
  )
}
