import { createFileRoute } from '@tanstack/react-router'
import { TournamentTables } from './-components/tables'
import { UseGetTournamentTables } from '@/queries/tables'
import { ErrorResponse } from '@/types/errors'
import ErrorPage from '@/components/error'
import { useTournament } from '@/routes/voistlused/$tournamentid/-components/tournament-provider'
import { Button } from '@/components/ui/button'
import { UseCalcTournamentRating } from '@/queries/tournaments'

export const Route = createFileRoute(
  '/admin/tournaments/$tournamentid/grupid/',
)({
  component: RouteComponent,
  errorComponent: () => <ErrorPage />,
  loader: async ({ context: { queryClient }, params }) => {
    let tournament_tables
    try {
      tournament_tables = await queryClient.ensureQueryData(
        UseGetTournamentTables(Number(params.tournamentid)),
      )
    } catch (error) {
      const err = error as ErrorResponse
      if (err.response.status !== 404) {
        throw error
      }
    }
    return { tournament_tables }
  },
})

function RouteComponent() {
  const { tournament_tables } = Route.useLoaderData()
  const tournament = useTournament()
  const useRatingMutation = UseCalcTournamentRating(tournament.id)
  const handleRatingCalculation = async () => {
    try {
      await useRatingMutation.mutateAsync()
    } catch (error) {
      console.log("Error", error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      <div className="p-4">
        <div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                Tournament Complete
              </h3>
              <p className="text-green-700 text-sm mb-4">
                All matches have been finished. Click below to finalize the tournament and calculate final ratings for all participants.
              </p>
              <Button
                variant="default"
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={handleRatingCalculation}
              >
                Finish Tournament & Calculate Ratings
              </Button>
            </div>
          </div>
        </div>
        <TournamentTables
          tables={tournament_tables?.data}
          tournament={tournament}
        />
      </div>
    </div>
  )
}
