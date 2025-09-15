import { Participant } from "@/types/participants"
import { Plus } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useParticipantUtils } from "@/hooks/useParticipantUtils"
import { useTranslation } from "react-i18next"
import { TournamentTable } from "@/types/groups"
import { GroupType, TTState } from "@/types/matches"
import { filterGroups } from "./participant-utils"
import GroupInput from "./group-input"
import TeamParticipants from "./team-body"

interface NewTeamsProps {
    participants: Participant[]
    tournament_table: TournamentTable
    tournament_id: number
    activeTab?: number
    highLightInput?: boolean
}

export const NewTeams = ({ participants, tournament_table, tournament_id, highLightInput }: NewTeamsProps) => {
    const { addNewRoundRobinGroup } = useParticipantUtils(tournament_id, tournament_table.id)
    const [participantsState, setParticipantsState] = useState<Participant[]>(participants)
    const { t } = useTranslation()
    useEffect(() => {
        setParticipantsState(participants)
    }, [participants])


    if (tournament_table.type === GroupType.ROUND_ROBIN || tournament_table.type === GroupType.ROUND_ROBIN_FULL_PLACEMENT) {
        const groups = filterGroups(participantsState)
        return (
            <div className="px-2">
                {groups.map((p, key) => {
                    return (
                        <div key={key} className="mt-5">
                            <GroupInput group={p.groupParticipant} tournament_id={tournament_id} tournament_table={tournament_table} />
                            <TeamParticipants
                                participants={p.participants}
                                tournament_id={tournament_id}
                                tournament_table={tournament_table}
                                setParticipantsState={setParticipantsState}
                                group_participant={p.groupParticipant}
                                highLightInput={highLightInput}
                            />
                        </div>
                    )
                })}
                {groups.length < tournament_table.size && tournament_table.state < TTState.TT_STATE_MATCHES_CREATED && <div className="mt-2">
                    <Button
                        className="w-full h-24"
                        variant="outline"
                        onClick={() => addNewRoundRobinGroup(groups.length + 1, tournament_id)}
                    >
                        {t('admin.tournaments.groups.participants.new_group')} <Plus />
                    </Button>
                </div>
                }
            </div>

        )
    }

    return (
        <div className="px-3">
            <TeamParticipants
                tournament_id={tournament_id}
                tournament_table={tournament_table}
                participants={participantsState}
                setParticipantsState={setParticipantsState}
                highLightInput={highLightInput}
            />
        </div>
    )
}



