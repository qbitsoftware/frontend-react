import { createFileRoute } from '@tanstack/react-router'
import { UseGetTournamentTableQuery } from '@/queries/tables'
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
  const [activeTab, setActiveTab] = useState<string>('roundrobin')
  const { data: participant_data } = UseGetParticipantsQuery(
    Number(tournamentid),
    Number(groupid),
    false,
  )
  const { data: table_data } = UseGetTournamentTableQuery(
    Number(tournamentid),
    Number(groupid),
  )

  if (
    tournament_data &&
    tournament_data.data &&
    table_data &&
    table_data.data
  ) {
    return (
      <div className="min-h-screen bg-gray-50">
        {tournament_data &&
          table_data &&
          participant_data &&
          participant_data.data && (
            <>
              <SeedingHeader
                tournament_id={Number(tournamentid)}
                table_data={table_data.data}
                participants={participant_data.data}
              />
              <div className="border-b border-gray-200 mb-4">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab('roundrobin')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'roundrobin'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    Round Robin Participants
                  </button>
                  <button
                    onClick={() => setActiveTab('doubleelim')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'doubleelim'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    Double Elimination Participants
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              {activeTab === 'roundrobin' ? (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Round Robin Participants</h3>
                  <p className="text-gray-600">Round Robin participants content will go here...</p>
                </div>
              ) : (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Double Elimination Participants</h3>
                  <p className="text-gray-600">Double Elimination participants content will go here...</p>
                </div>
              )}

              {table_data.data.dialog_type === DialogType.DT_TEAM_LEAGUES || table_data.data.type === GroupType.ROUND_ROBIN || table_data.data.type === GroupType.ROUND_ROBIN_FULL_PLACEMENT ? (
                <NewTeams
                  participant_data={participant_data}
                  tournament_id={Number(tournamentid)}
                  tournament_table={table_data.data}
                />
              )
                : table_data.data.solo ? (
                  <NewSolo
                    participant_data={participant_data}
                    tournament_id={Number(tournamentid)}
                    tournament_table={table_data.data}
                  />
                )
                  : <NewDouble
                    participant_data={participant_data}
                    tournament_id={Number(tournamentid)}
                    tournament_table={table_data.data}
                  />
              }
            </>
          )}
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
