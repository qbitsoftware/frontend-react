import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import ErrorPage from '@/components/error'
import { NewSolo } from './-components/new-solo'
import { NewTeams } from './-components/new-teams'
import SeedingHeader from './-components/seeding-header'
import { DialogType } from '@/types/groups'
import NewDouble from './-components/new-double'
import { GroupType } from '@/types/matches'
import { useTournamentTable } from '@/routes/voistlused/$tournamentid/-components/tt-provider'

export const Route = createFileRoute(
  '/admin/tournaments/$tournamentid/grupid/$groupid/osalejad/',
)({
  component: RouteComponent,
  errorComponent: () => <ErrorPage />,
})

function RouteComponent() {
  const { tournamentid, groupid } = Route.useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const groupId = Number(groupid)

  const tt = useTournamentTable()

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {tt.group &&
        <>
          {tt.stages && tt.stages.length >= 1 &&
            <div className="border-b border-gray-200 mb-4">
              <nav className="-mb-px flex space-x-8">
                {tt.stages.map((stage, index) => {
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
          }
          <SeedingHeader
            tournament_id={Number(tournamentid)}
            data={tt}
            onHighlightInput={handleHighlightInput}
            onGlowBracketTabs={handleGlowBracketTabs}
          />
        </>
      }

      {tt.participants &&
        tt.group &&
        (
          () => {
            return (
              <>
                {tt.group.dialog_type === DialogType.DT_TEAM_LEAGUES ? (
                  <NewTeams
                    participants={tt.participants}
                    tournament_id={Number(tournamentid)}
                    tournament_table={tt.group}
                    highLightInput={highlightInput}
                  />
                ) : tt.group.type === GroupType.DYNAMIC ? (
                  <NewDouble
                    participants={tt.participants}
                    tournament_id={Number(tournamentid)}
                    tournament_table={tt.group}
                    highlightInput={highlightInput}
                  />
                ) : tt.group.solo ? (
                  <NewSolo
                    all_participants={tt.participants}
                    participants={tt.participants}
                    tournament_id={Number(tournamentid)}
                    tournament_table={tt.group}
                    highlightInput={highlightInput}
                  />
                ) : (
                  <NewDouble
                    participants={tt.participants}
                    tournament_id={Number(tournamentid)}
                    tournament_table={tt.group}
                    highlightInput={highlightInput}
                  />
                )}
              </>
            )
          })()
      }
    </div>
  )
}

