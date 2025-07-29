import { createFileRoute, useNavigate } from '@tanstack/react-router'
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
import { GroupType } from '@/types/matches'
import { useState } from 'react'
import { CompactClassFilters } from '@/routes/admin/tournaments/-components/compact-class-filters'

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
  const [activeTab, setActiveTab] = useState<number>(1)

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

  const handleGroupChange = (newGroupId: number) => {
    // Navigate to parent route with selectedGroup parameter
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

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="px-2">
          <CompactClassFilters
            availableTables={availableTables}
            activeGroupId={groupId}
            onGroupChange={handleGroupChange}
          />
        </div>
        
        {tournament_data &&
          table_data &&
          participant_data &&
          participant_data.data && (
            () => {
              const first_participants = {
                ...participant_data,
                data: participant_data.data?.filter((p) => p.group === 1) || []
              }

              const second_participants = {
                ...participant_data,
                data: participant_data.data?.filter((p) => p.group === 2) || []
              }

              return (
                <>
                  {table_data.data.type === GroupType.DYNAMIC && (
                    <div className="border-b border-gray-200 mb-4">
                      <nav className="-mb-px flex space-x-8">
                        <button
                          onClick={() => setActiveTab(1)}
                          className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 1
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                          First (Round Robin)
                        </button>
                        <button
                          onClick={() => setActiveTab(2)}
                          className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 2
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                          {table_data.data.second_class}
                        </button>
                      </nav>
                    </div>
                  )}
                  <SeedingHeader
                    tournament_id={Number(tournamentid)}
                    table_data={table_data.data}
                    participants={participant_data.data}
                  />

                  {table_data.data.dialog_type === DialogType.DT_TEAM_LEAGUES ? (
                    <NewTeams
                      participant_data={participant_data}
                      tournament_id={Number(tournamentid)}
                      tournament_table={table_data.data}
                    />
                  ) : table_data.data.type === GroupType.DYNAMIC ? (
                    activeTab === 1 ? (
                      <NewDouble
                        participant_data={first_participants}
                        tournament_id={Number(tournamentid)}
                        tournament_table={table_data.data}
                        acitveTab={activeTab}
                      />
                    ) : (
                      table_data.data.solo ? (
                        <NewSolo
                          participant_data={second_participants}
                          tournament_id={Number(tournamentid)}
                          tournament_table={table_data.data}
                          activeTab={activeTab}
                        />
                      ) : (
                        <NewTeams
                          participant_data={second_participants}
                          tournament_id={Number(tournamentid)}
                          tournament_table={table_data.data}
                          activeTab={activeTab}
                        />
                      )
                    )
                  ) : table_data.data.solo ? (
                    <NewSolo
                      participant_data={participant_data}
                      tournament_id={Number(tournamentid)}
                      tournament_table={table_data.data}
                    />
                  ) : (
                    <NewDouble
                      participant_data={participant_data}
                      tournament_id={Number(tournamentid)}
                      tournament_table={table_data.data}
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

