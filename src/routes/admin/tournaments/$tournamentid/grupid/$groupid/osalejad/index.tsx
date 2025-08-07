import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { UseGetTournamentTableQuery, UseGetTournamentTablesQuery } from '@/queries/tables'
import Loader from '@/components/loader'
import ErrorPage from '@/components/error'
import { ErrorResponse } from '@/types/errors'
import { NewSolo } from './-components/new-solo'
import { NewTeams } from './-components/new-teams'
import { UseGetParticipantsQuery } from '@/queries/participants'
import SeedingHeader from './-components/seeding-header'
import { UseGetTournamentAdmin } from '@/queries/tournaments'
import { DialogType } from '@/types/groups'
import NewDouble from './-components/new-double'
import { CompactClassFilters } from '@/routes/admin/tournaments/-components/compact-class-filters'
import { GroupType } from '@/types/matches'

export const Route = createFileRoute(
  '/admin/tournaments/$tournamentid/grupid/$groupid/osalejad/',
)({
  component: RouteComponent,
  errorComponent: () => <ErrorPage />,
  loader: async ({ context: { queryClient }, params }) => {
    let tournament_data
    try {
      tournament_data = await queryClient.ensureQueryData(
        UseGetTournamentAdmin(Number(params.tournamentid)),
      )
    } catch (error) {
      const err = error as ErrorResponse
      if (err.response.status !== 404) {
        throw error
      }
    }

    return { tournament_data }
  },
})

function RouteComponent() {
  const { tournament_data } = Route.useLoaderData()
  const { tournamentid, groupid } = Route.useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const tournamentId = Number(tournamentid)
  const groupId = Number(groupid)

  const { data: participant_data } = UseGetParticipantsQuery(
    tournamentId,
    groupId,
    false,
  )
  const { data: table_data } = UseGetTournamentTableQuery(
    tournamentId,
    groupId,
  )

  const tablesQuery = UseGetTournamentTablesQuery(tournamentId)

  const [highlightInput, setHighlightInput] = useState(false)
  const [glowBracketTabs, setGlowBracketTabs] = useState(false)

  const handleHighlightInput = () => {
    setHighlightInput(true)
    // Reset after 3 seconds
    setTimeout(() => {
      setHighlightInput(false)
    }, 3000)
  }

  const handleGlowBracketTabs = () => {
    setGlowBracketTabs(true)
    // Reset after 3 seconds
    setTimeout(() => {
      setGlowBracketTabs(false)
    }, 3000)
  }

  const translateBracketName = (index: number) => {
    if (index === 1) {
      return t('common.winner');
    }

    if (index === 2) {
      return t('common.consolation');
    }

    return t('common.subgroups');
  }

  const handleGroupChange = (newGroupId: number) => {
    navigate({
      to: "/admin/tournaments/$tournamentid/osalejad",
      params: {
        tournamentid: tournamentid,
      },
      search: {
        selectedGroup: newGroupId.toString(),
      },
    });
  }

  if (
    tournament_data &&
    tournament_data.data &&
    table_data &&
    table_data.data &&
    tablesQuery.data?.data
  ) {
    const availableTables = tablesQuery.data.data || [];
    const groupIds = table_data.data.stages?.map((stage) => stage.id) || [groupId];

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="px-2">
          <CompactClassFilters
            availableTables={availableTables}
            activeGroupId={groupIds}
            onGroupChange={handleGroupChange}
          />
        </div>

        {tournament_data &&
          table_data &&
          participant_data &&
          participant_data.data &&
          table_data.data.group
          && (
            () => {

              return (
                <>
                  {table_data.data.stages && table_data.data.stages.length >= 1 && (
                    <div className="border-b border-gray-200 mb-4">
                      <nav className="-mb-px flex space-x-8">
                        {table_data.data.stages?.map((stage, index) => {
                          const isWinner = index == 1
                          const isConsolation = index == 2
                          const isWinnerOrConsolation = isWinner || isConsolation;

                          const getGlowClasses = () => {
                            if (!glowBracketTabs || !isWinnerOrConsolation) return '';

                            if (isWinner) {
                              return 'ring-2 ring-green-400 bg-green-50 shadow-lg rounded-md';
                            } else if (isConsolation) {
                              return 'ring-2 ring-orange-400 bg-orange-50 shadow-lg rounded-md';
                            }
                            return '';
                          };

                          // Get translated bracket name
                          const translatedName = translateBracketName(index);

                          return (
                            <button
                              key={stage.id}
                              onClick={() => navigate({
                                to: "/admin/tournaments/$tournamentid/grupid/$groupid/osalejad",
                                params: {
                                  tournamentid,
                                  groupid: stage.id.toString()
                                },
                                search: { selectedGroup: undefined }
                              })}
                              className={`py-2 px-2 border-b-2 font-medium text-sm transition-all duration-300 ${groupId === stage.id
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } ${getGlowClasses()}`}
                            >
                              {translatedName}
                            </button>
                          )
                        })}
                      </nav>
                    </div>
                  )}
                  <SeedingHeader
                    tournament_id={Number(tournamentid)}
                    table_data={table_data.data.group}
                    participants={participant_data.data}
                    onHighlightInput={handleHighlightInput}
                    onGlowBracketTabs={handleGlowBracketTabs}
                  />

                  {table_data.data.group.dialog_type === DialogType.DT_TEAM_LEAGUES ? (
                    <NewTeams
                      participant_data={participant_data}
                      tournament_id={Number(tournamentid)}
                      tournament_table={table_data.data.group}
                      highLightInput={highlightInput}
                    />
                  ) : table_data.data.group.type === GroupType.DYNAMIC ? (
                    <NewDouble
                      participant_data={participant_data}
                      tournament_id={Number(tournamentid)}
                      tournament_table={table_data.data.group}
                      highlightInput={highlightInput}
                    />
                  ) : table_data.data.group.solo ? (
                    <NewSolo
                      all_participants={participant_data.data}
                      participant_data={participant_data}
                      tournament_id={Number(tournamentid)}
                      tournament_table={table_data.data.group}
                      highlightInput={highlightInput}
                    />
                  ) : (
                    <NewDouble
                      participant_data={participant_data}
                      tournament_id={Number(tournamentid)}
                      tournament_table={table_data.data.group}
                      highlightInput={highlightInput}
                    />
                  )}
                </>
              )
            })()
        }
      </div>
    )
  } else {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader />
      </div>
    )
  }
}

