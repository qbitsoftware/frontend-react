import { useEffect } from 'react'
import ErrorPage from '@/components/error'
import { UseGetTournamentTablesQuery } from '@/queries/tables'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import Loader from '@/components/loader'

export const Route = createFileRoute(
  '/admin/tournaments/$tournamentid/tabelid/',
)({
  loader: ({ params }) => {
    return { params }
  },
  errorComponent: () => <ErrorPage />,
  component: RouteComponent,
})

function RouteComponent() {
  const { params } = Route.useLoaderData()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const tournamentId = Number(params.tournamentid)
  const tablesQuery = UseGetTournamentTablesQuery(tournamentId)

  useEffect(() => {
    // Auto-redirect to first group when component loads
    if (tablesQuery.data?.data && tablesQuery.data.data.length > 0) {
      const firstGroupId = tablesQuery.data.data[0].id
      navigate({
        to: '/admin/tournaments/$tournamentid/grupid/$groupid/tabelid',
        params: {
          tournamentid: params.tournamentid,
          groupid: firstGroupId.toString(),
        },
        replace: true,
      })
    }
  }, [tablesQuery.data?.data, navigate, params.tournamentid])

  if (tablesQuery.isLoading) {
    return <Loader />
  }

  if (tablesQuery.isError || !tablesQuery.data?.data) {
    return <div>{t('errors.general.description')}</div>
  }

  // This component will quickly redirect, so we just show a loader
  return <Loader />
}
