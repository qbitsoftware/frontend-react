import { useEffect } from 'react'
import ErrorPage from '@/components/error'
import { UseGetTournamentTablesQuery } from '@/queries/tables'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import Loader from '@/components/loader'

export const Route = createFileRoute(
  '/admin/tournaments/$tournamentid/osalejad/',
)({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      selectedGroup: search.selectedGroup as string | undefined,
    }
  },
  loader: ({ params }) => {
    return { params }
  },
  errorComponent: () => <ErrorPage />,
  component: RouteComponent,
})

function RouteComponent() {
  const { params } = Route.useLoaderData()
  const { selectedGroup } = Route.useSearch()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const tournamentId = Number(params.tournamentid)
  const tablesQuery = UseGetTournamentTablesQuery(tournamentId)

  useEffect(() => {
    if (tablesQuery.data?.data && tablesQuery.data.data.length > 0) {
      // Try to use the selected group from search params, otherwise use first group
      const targetGroupId = selectedGroup
        ? tablesQuery.data.data.find(table => table.id.toString() === selectedGroup)?.id
        : tablesQuery.data.data[0].id
      
      const groupId = targetGroupId || tablesQuery.data.data[0].id
      
      navigate({
        to: '/admin/tournaments/$tournamentid/grupid/$groupid/osalejad',
        params: {
          tournamentid: params.tournamentid,
          groupid: groupId.toString(),
        },
        search: { selectedGroup: undefined },
        replace: true,
      })
    }
  }, [tablesQuery.data?.data, navigate, params.tournamentid, selectedGroup])

  if (tablesQuery.isLoading) {
    return <Loader />
  }

  if (tablesQuery.isError || !tablesQuery.data?.data) {
    return <div>{t('errors.general.description')}</div>
  }

  // This component will quickly redirect, so we just show a loader
  return <Loader />
}