import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  UseGetMatchesAllQuery,
  UseGetMatchesQuery,
} from '@/queries/match'
import { FilterOptions, Matches } from '@/routes/admin/tournaments/$tournamentid/-components/matches'
import { UseGetTournamentTableQuery, UseGetTournamentTablesQuery } from '@/queries/tables'
import ErrorPage from '@/components/error'
import { CompactClassFilters } from '@/routes/admin/tournaments/-components/compact-class-filters'
import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute(
  '/admin/tournaments/$tournamentid/grupid/$groupid/mangud/',
)({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      openMatch: search.openMatch as string | undefined,
      filter: search.filter as string | undefined,
    }
  },
  errorComponent: () => <ErrorPage />,
  component: RouteComponent,
})

function RouteComponent() {
  const { tournamentid, groupid } = Route.useParams()
  const { openMatch } = Route.useSearch()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const tournamentId = Number(tournamentid)
  const groupId = Number(groupid)


  const { filter: filterParam } = Route.useSearch()
  const filterValue: FilterOptions[] = filterParam
    ? filterParam.split(',') as FilterOptions[]
    : ["all"];

  const { data: matches, isLoading: isLoading1 } = UseGetMatchesQuery(
    tournamentId,
    groupId,
  )

  const { data: tableData, isLoading: isLoading2 } = UseGetTournamentTableQuery(tournamentId, groupId)


  const {
    data: matchesForTimeChange, isLoading: isLoading3
  } = UseGetMatchesAllQuery(tournamentId, groupId,
  )

  const tablesQuery = UseGetTournamentTablesQuery(tournamentId)

  const handleGroupChange = (newGroupId: number) => {
    if (newGroupId == 0) {
      navigate({
        to: "/admin/tournaments/$tournamentid/mangud",
        params: {
          tournamentid: tournamentid,
        },
        search: {
          filter: filterValue.join(","),
          openMatch: undefined,
        },
        replace: true,
      });
    } else {
      navigate({
        to: "/admin/tournaments/$tournamentid/grupid/$groupid/mangud",
        params: {
          tournamentid: tournamentid,
          groupid: newGroupId.toString()
        },
        search: {
          filter: filterValue.join(","),
          openMatch: undefined,
        },
        replace: true,
      });

    }
  }

  if (tablesQuery.data && tablesQuery.data.data && tableData) {
    const availableTables = tablesQuery.data.data || [];
    const groupIds = tableData.data.stages?.map((stage) => stage.id) || [groupId];

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 px-2">
        <CompactClassFilters
          availableTables={availableTables}
          activeGroupId={[0, ...groupIds]}
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
                      search: { openMatch: undefined, filter: filterValue.join(",") }
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

        {tableData.data.group && matches && matches.data && matchesForTimeChange ? (<div className="pb-12">
          <Matches
            tournament_id={tournamentId}
            player_count={tableData.data.group.min_team_size}
            data={matches.data ?? []}
            all_matches={matchesForTimeChange.data ?? []}
            tournament_table={tableData.data.group}
            openMatchId={openMatch}
          />
        </div>
        ) : (isLoading1 || isLoading2 || isLoading3) ? (
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
            <div className="flex justify-center items-center h-[50vh]">
              <Loader2 className="animate-spin" />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-48">
            <span className="text-gray-400 text-base font-medium">
              {t('competitions.errors.no_games_found')}
            </span>
          </div>
        )}
      </div>
    )

  } else if (isLoading1 || isLoading2 || isLoading3) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
        <div className="flex justify-center items-center h-[50vh]">
          <Loader2 className='animate-spin' />
        </div>
      </div>
    )
  } else {
    return (
      <div className="flex items-center justify-center h-48">
        <span className="text-gray-400 text-base font-medium">
          {t('competitions.errors.no_games_found')}
        </span>
      </div>
    )
  }
}
