import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { UseGetTournamentTablesQuery } from '@/queries/tables'
import ErrorPage from '@/components/error'
import { CompactClassFilters } from '@/routes/admin/tournaments/-components/compact-class-filters'
import { Loader2 } from 'lucide-react'
import EmptyComponent from '@/routes/-components/empty-component'

export const Route = createFileRoute('/admin/tournaments/$tournamentid/kohad')({
  errorComponent: () => <ErrorPage />,
  component: RouteComponent,
})

function RouteComponent() {
  const { tournamentid } = Route.useParams()
  const navigate = useNavigate()

  const tournamentId = Number(tournamentid)

  const tablesQuery = UseGetTournamentTablesQuery(tournamentId)

  const handleGroupChange = (newGroupId: number) => {
    navigate({
      to: '/admin/tournaments/$tournamentid/grupid/$groupid/kohad',
      params: {
        tournamentid: tournamentid,
        groupid: newGroupId.toString(),
      },
    })
  }

  if (tablesQuery.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
        <div className="flex justify-center items-center h-[50vh]">
          <Loader2 className="animate-spin" />
        </div>
      </div>
    )
  }

  if (tablesQuery.isError) {
    return <ErrorPage />
  }

  if (!tablesQuery.data?.data || tablesQuery.data.data.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 px-2">
        <EmptyComponent errorMessage="competitions.errors.no_groups" />
      </div>
    )
  }

  const availableTables = tablesQuery.data.data || []
  const firstGroupId = availableTables[0]?.id

  if (firstGroupId) {
    navigate({
      to: '/admin/tournaments/$tournamentid/grupid/$groupid/kohad',
      params: {
        tournamentid: tournamentid,
        groupid: firstGroupId.toString(),
      },
      replace: true,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 px-2">
      <CompactClassFilters
        availableTables={availableTables}
        activeGroupId={[]}
        onGroupChange={handleGroupChange}
      />
    </div>
  )
}
