import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  UseGetTournamentTableQuery,
  UseGetTournamentTablesQuery,
} from '@/queries/tables'
import ErrorPage from '@/components/error'
import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { UseGetPlacements } from '@/queries/brackets'
import Standings from '@/components/standings'
import EmptyComponent from '@/routes/-components/empty-component'
import LoadingScreen from '@/routes/-components/loading-screen'
import { GroupType } from '@/types/matches'

export const Route = createFileRoute(
  '/admin/tournaments/$tournamentid/grupid/$groupid/kohad/',
)({
  errorComponent: () => <ErrorPage />,
  component: RouteComponent,
})

function RouteComponent() {
  const { tournamentid, groupid } = Route.useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const tournamentId = Number(tournamentid)
  const groupId = Number(groupid)

  const { data: tableData, isLoading: isLoadingTable } =
    UseGetTournamentTableQuery(tournamentId, groupId)
  const tablesQuery = UseGetTournamentTablesQuery(tournamentId)

  const {
    data: participants,
    isLoading: isLoadingPlacements,
    isError: isPlacementsError,
  } = UseGetPlacements(tournamentId, groupId)

  const translateBracketName = (index: number) => {
    if (index === 1) {
      return t('common.winner')
    }

    if (index === 2) {
      return t('common.consolation')
    }

    return t('common.subgroups')
  }

  if (isLoadingTable || tablesQuery.isLoading || isLoadingPlacements) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
        <div className="flex justify-center items-center h-[50vh]">
          <Loader2 className="animate-spin" />
        </div>
      </div>
    )
  }

  if (tablesQuery.isError || isPlacementsError || !tableData?.data) {
    return <ErrorPage />
  }

  if (!tablesQuery.data?.data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 px-2">
        <EmptyComponent errorMessage="competitions.errors.no_groups" />
      </div>
    )
  }

  const groupIds = tableData.data.stages?.map((stage) => stage.id) || [groupId]
  if (tableData.data.group?.type === GroupType.DYNAMIC) {
    if (groupIds.length > 1) {
      navigate({ to: '/admin/tournaments/$tournamentid/grupid/$groupid/kohad', params: { tournamentid, groupid: String(groupIds[1]) } })
    }
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {tableData.data.stages && tableData.data.stages.length >= 1 && (
        <div className="border-b border-gray-200 mb-4">
          <nav className="-mb-px flex space-x-8">
            {tableData.data.stages?.map((stage, index) => {
              if (index === 0) { return null }
              const translatedName = translateBracketName(index)

              return (
                <button
                  key={stage.id}
                  onClick={() =>
                    navigate({
                      to: '/admin/tournaments/$tournamentid/grupid/$groupid/kohad',
                      params: {
                        tournamentid,
                        groupid: stage.id.toString(),
                      },
                    })
                  }
                  className={`py-2 px-2 border-b-2 font-medium text-sm transition-all duration-300 ${groupId === stage.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  {translatedName}
                </button>
              )
            })}
          </nav>
        </div>
      )}

      <div className="px-2 pb-8">
        {isLoadingPlacements ? (
          <LoadingScreen />
        ) : isPlacementsError ? (
          <ErrorPage />
        ) : participants && participants.data && tableData.data.group ? (
          <Standings
            participants={participants.data}
            tournament_table={tableData.data.group}
          />
        ) : (
          <EmptyComponent errorMessage="competitions.errors.standings_missing" />
        )}
      </div>
    </div>
  )
}
