import {
  createFileRoute,
  Outlet,
} from '@tanstack/react-router'
import { UseGetTournamentTable } from '@/queries/tables'
import ErrorPage from '@/components/error'
import { ErrorResponse } from '@/types/errors'

export const Route = createFileRoute(
  '/admin/tournaments/$tournamentid/grupid/$groupid',
)({
  component: RouteComponent,
  errorComponent: () => <ErrorPage />,
  loader: async ({ context: { queryClient }, params }) => {
    let table_data

    try {
      table_data = await queryClient.ensureQueryData(
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
    return { table_data }
  },
})

function RouteComponent() {
  const { table_data } = Route.useLoaderData()

  if (!table_data || !table_data.data) {
    return <></>
  }

  return (
    <div className="pb-8">
      <Outlet />
    </div>
  )
}
