import { createFileRoute, Outlet, redirect, useLocation } from '@tanstack/react-router'
import { UseGetTournament } from '@/queries/tournaments'
import { ErrorResponse } from '@/types/types'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/admin/tournaments/$tournamentid')({
  component: RouteComponent,
  loader: async ({ context: { queryClient }, params }) => {
    let tournament_data = undefined
    try {
      tournament_data = await queryClient.ensureQueryData(
        UseGetTournament(Number(params.tournamentid)),
      )
    } catch (error) {
      const err = error as ErrorResponse
      if (err.response.status === 404) {
        throw redirect({
          to: '/admin/tournaments',
        })
      }
      throw error
    }

    return { tournament_data }
  },
})


function RouteComponent() {
  const location = useLocation()
  console.log(location)
  const { tournament_data } = Route.useLoaderData()
  const { tournamentid } = Route.useParams()

  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{tournament_data.data?.name}</h1>
        <div className="space-x-4">
          <Link to={`/admin/tournaments/${tournamentid}`}>
            <Button className={cn(location.href ==`/admin/tournaments/${tournamentid}` && "bg-secondary text-white")} variant="outline">Info</Button>
          </Link>
          <Link to={`/admin/tournaments/${tournamentid}/matches`}>
            <Button className={cn(location.href ==`/admin/tournaments/${tournamentid}/matches` && "bg-secondary text-white")} variant="outline">Matches</Button>
          </Link>
          <Link to={`/admin/tournaments/${tournamentid}/participants`}>
            <Button className={cn(location.href ==`/admin/tournaments/${tournamentid}/participants` && "bg-secondary text-white")} variant="outline">Participants</Button>
          </Link>
          <Link to={`/admin/tournaments/${tournamentid}/brackets`}>
            <Button className={cn(location.href ==`/admin/tournaments/${tournamentid}/brackets` && "bg-secondary text-white")} variant="outline">Brackets</Button>
          </Link>
        </div>
      </div>
      <Outlet />
    </div>
  )
}
