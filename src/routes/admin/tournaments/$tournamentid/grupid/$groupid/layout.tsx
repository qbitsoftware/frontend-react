import {
  createFileRoute,
  Outlet,
  useParams,
} from '@tanstack/react-router'
import { UseGetTournamentTable } from '@/queries/tables'
import ErrorPage from '@/components/error'
import { TournamentTableProvider } from '@/routes/voistlused/$tournamentid/-components/tt-provider'
import { CompactClassFilters } from '../../../-components/compact-class-filters'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useTournament } from '@/routes/voistlused/$tournamentid/-components/tournament-provider'

export const Route = createFileRoute(
  '/admin/tournaments/$tournamentid/grupid/$groupid',
)({
  component: RouteComponent,
  errorComponent: () => <ErrorPage />,
})

function RouteComponent() {
  const params = useParams({ strict: false })
  const { data: table_data } = useQuery(UseGetTournamentTable(
    Number(params.tournamentid),
    Number(params.groupid),
  ))

  const { tournamentTables } = useTournament()

  const memoizedAvailableTables = useMemo(() =>
    tournamentTables || [],
    [tournamentTables]
  );

  const memoizedGroupIds = useMemo(() =>
    table_data?.data?.stages?.map((stage) => stage.id) || [Number(params.groupid)],
    [table_data?.data?.stages, params.groupid]
  );

  if (!table_data || !table_data.data) {
    return <></>
  }
  return (
    <TournamentTableProvider
      tournament_table_data={table_data.data}>
      <div className="pb-8">
        <CompactClassFilters
          availableTables={memoizedAvailableTables}
          activeGroupId={memoizedGroupIds}
        />
        <Outlet />
      </div>
    </TournamentTableProvider>
  )
}
