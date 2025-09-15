import { createFileRoute, Outlet } from '@tanstack/react-router'
import Navbar from './-components/navbar'
import { TournamentProvider } from './-components/tournament-provider'
import { useEffect } from 'react'
import ErrorPage from '@/components/error'
import NotFoundPage from '@/routes/-components/notfound'
import { UseGetTournamentTables } from '@/queries/tables'
import { ErrorResponse } from '@/types/errors'
import { UseGetTournamentPublic } from '@/queries/tournaments'

export const Route = createFileRoute('/voistlused/$tournamentid')({
  component: RouteComponent,
  errorComponent: () => <ErrorPage />,
  notFoundComponent: () => <NotFoundPage />,
  loader: async ({ context: { queryClient }, params }) => {
    try {
      const tournamentData = await queryClient.ensureQueryData(
        UseGetTournamentPublic(Number(params.tournamentid)),
      )

      let tournament_tables = null

      try {
        tournament_tables = await queryClient.ensureQueryData(
          UseGetTournamentTables(Number(params.tournamentid)),
        )
      } catch (error) {
        const err = error as ErrorResponse
        if (err.response?.status === 404) {
          tournament_tables = null
        } else {
          throw error
        }
      }

      return { tournament_tables, tournamentData }
    } catch (error) {
      throw error
    }
  },
})

function RouteComponent() {
  const { tournamentData, tournament_tables } = Route.useLoaderData()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  if (tournamentData.data) {
    return (
      <TournamentProvider tournamentData={tournamentData.data}>
        <div className="max-w-[95%] mx-auto min-h-screen flex flex-col">
          <Navbar tournament_tables={tournament_tables?.data || []} />
          <div className="pt-4">
            <Outlet />
          </div>
        </div>
      </TournamentProvider>
    )
  } else {
    return <ErrorPage />
  }
}
