import { createFileRoute } from '@tanstack/react-router'
import {
  MatchesResponse,
  UseGetMatchesAllQuery,
  UseGetMatchesQuery,
} from '@/queries/match'
import { Matches } from '@/routes/admin/tournaments/$tournamentid/-components/matches'
import { UseGetTournamentTable } from '@/queries/tables'
import Loader from '@/components/loader'
import ErrorPage from '@/components/error'
import { ErrorResponse } from '@/types/errors'

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

  const { data: matches, isLoading: isLoadingMatches } = UseGetMatchesQuery(
    Number(tournamentid),
    Number(groupid),
  )

  const {
    data: matchesForTimeChange,
    isLoading: isLoadingMatchesForTimeChange,
  } = UseGetMatchesAllQuery(Number(tournamentid), Number(groupid))

  const { tableData } = Route.useLoaderData()

  if (isLoadingMatches || isLoadingMatchesForTimeChange) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader />
      </div>
    )
  }

  if (!matches || !tableData || !tableData.data || !matchesForTimeChange) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <ErrorPage />
      </div>
    )
  }

  return (
    <div className="pb-12">
      <Matches
        tournament_id={Number(tournamentid)}
        player_count={tableData.data.min_team_size}
        data={matches.data ?? []}
        all_matches={matchesForTimeChange.data ?? []}
        tournament_table={tableData.data}
      />
    </div>
  )
}
