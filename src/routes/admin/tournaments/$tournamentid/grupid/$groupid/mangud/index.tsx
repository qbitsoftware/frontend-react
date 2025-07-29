import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  MatchesResponse,
  UseGetMatchesAllQuery,
  UseGetMatchesQuery,
} from '@/queries/match'
import { Matches } from '@/routes/admin/tournaments/$tournamentid/-components/matches'
import { UseGetTournamentTable, UseGetTournamentTablesQuery } from '@/queries/tables'
import Loader from '@/components/loader'
import ErrorPage from '@/components/error'
import { ErrorResponse } from '@/types/errors'
import { CompactClassFilters } from '@/routes/admin/tournaments/-components/compact-class-filters'

export const Route = createFileRoute(
  '/admin/tournaments/$tournamentid/grupid/$groupid/mangud/',
)({
  errorComponent: () => <ErrorPage />,
  loader: async ({ context: { queryClient }, params }) => {
    const matches: MatchesResponse | undefined = undefined
    let tableData
    try {
      tableData = await queryClient.ensureQueryData(
        UseGetTournamentTable(
          Number(params.tournamentid),
          Number(params.groupid),
        ),
      )
    } catch (error) {
      const err = error as ErrorResponse
      if (err.response.status !== 404) {
        throw error
      }
    }
    return { matches, params, tableData }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { tournamentid, groupid } = Route.useParams()
  const navigate = useNavigate()

  const tournamentId = Number(tournamentid)
  const groupId = Number(groupid)

  const { data: matches, isLoading: isLoadingMatches } = UseGetMatchesQuery(
    tournamentId,
    groupId,
  )

  const {
    data: matchesForTimeChange,
    isLoading: isLoadingMatchesForTimeChange,
  } = UseGetMatchesAllQuery(tournamentId, groupId, 
  )

  const tablesQuery = UseGetTournamentTablesQuery(tournamentId)

  const handleGroupChange = (newGroupId: number) => {
    navigate({
      to: "/admin/tournaments/$tournamentid/grupid/$groupid/mangud",
      params: {
        tournamentid: tournamentid,
        groupid: newGroupId.toString(),
      },
    });
  }

  const { tableData } = Route.useLoaderData()

  if (isLoadingMatches || isLoadingMatchesForTimeChange || tablesQuery.isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader />
      </div>
    )
  }

  if (!matches || !tableData || !tableData.data || !matchesForTimeChange || !tablesQuery.data?.data) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <ErrorPage />
      </div>
    )
  }

  const availableTables = tablesQuery.data.data || [];

  return (
    <div className="min-h-screen px-2">
      <CompactClassFilters
        availableTables={availableTables}
        activeGroupId={groupId}
        onGroupChange={handleGroupChange}
      />
      
      <div className="pb-12">
        <Matches
          tournament_id={tournamentId}
          player_count={tableData.data.min_team_size}
          data={matches.data ?? []}
          all_matches={matchesForTimeChange.data ?? []}
          tournament_table={tableData.data}
        />
      </div>
    </div>
  )
}
