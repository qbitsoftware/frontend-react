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
  validateSearch: (search: Record<string, unknown>) => {
    return {
      openMatch: search.openMatch as string | undefined,
    }
  },
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
  const { openMatch } = Route.useSearch()
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
      to: "/admin/tournaments/$tournamentid/mangud",
      params: {
        tournamentid: tournamentid,
      },
      search: {
        selectedGroup: newGroupId.toString(),
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

  if (!matches || !tableData || !tableData.data || !matchesForTimeChange || !tablesQuery.data?.data || !tableData.data.group) {
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
        activeGroupId={[groupId]}
        onGroupChange={handleGroupChange}
      />

      {tableData.data.stages && tableData.data.stages.length >= 1 && (
        <div className="border-b border-gray-200 mb-4">
          <nav className="-mb-px flex space-x-8">
            {tableData.data.stages?.map((stage) => {
              return (
                <button
                  key={stage.id}
                  onClick={() => navigate({
                    to: "/admin/tournaments/$tournamentid/grupid/$groupid/mangud",
                    params: {
                      tournamentid: tournamentid,
                      groupid: stage.id.toString()
                    },
                    search: { selectedGroup: undefined, openMatch: undefined }
                  })}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${groupId === stage.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  {stage.class}
                </button>
              )
            })}
          </nav>
        </div>
      )}

      <div className="pb-12">
        <Matches
          tournament_id={tournamentId}
          player_count={tableData.data.group.min_team_size}
          data={matches.data ?? []}
          all_matches={matchesForTimeChange.data ?? []}
          tournament_table={tableData.data.group}
          openMatchId={openMatch}
        />
      </div>
    </div>
  )
}
