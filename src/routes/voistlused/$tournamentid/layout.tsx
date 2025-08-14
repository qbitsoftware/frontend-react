import { createFileRoute, Outlet } from '@tanstack/react-router'
import Navbar from './-components/navbar'
import { TournamentProvider } from './-components/tournament-provider'
import { useEffect } from 'react'
import ErrorPage from '@/components/error'
import NotFoundPage from '@/routes/-components/notfound'
import { UseGetTournamentTables } from '@/queries/tables'
import { ErrorResponse } from '@/types/errors'
import { UseGetTournamentPublic } from '@/queries/tournaments'
import { UseGetTournamentMatches } from '@/queries/match'

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
      let tournament_matches = null
      
      try {
        tournament_tables = await queryClient.ensureQueryData(
          UseGetTournamentTables(Number(params.tournamentid)),
        )
      } catch (error) {
        const err = error as ErrorResponse
        console.error('Error loading tournament tables:', error)
        if (err.response?.status === 404) {
          tournament_tables = null
        } else {
          throw error
        }
      }

      try {
        tournament_matches = await queryClient.ensureQueryData(
          UseGetTournamentMatches(Number(params.tournamentid)),
        )
      } catch (error) {
        const err = error as ErrorResponse
        console.error('Error loading tournament matches:', error)
        if (err.response?.status === 404) {
          tournament_matches = null
        } else {
          throw error
        }
      }

      return { tournament_tables, tournamentData, tournament_matches }
    } catch (error) {
      console.error('Error in tournament loader:', error)
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
          <div className=" px-0 py-4 md:py-10">
            <Outlet />
          </div>
        </div>
      </TournamentProvider>
    )
  } else {
    console.error('No tournament data available')
    return <ErrorPage />
  }
}
