import { Participant } from "@/types/participants"
import { Plus } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useParticipantUtils } from "@/hooks/useParticipantUtils"
import { useTranslation } from "react-i18next"
import { ParticipantsResponse } from "@/queries/participants"
import { TournamentTable } from "@/types/groups"
import { GroupType } from "@/types/matches"
import { filterGroups } from "./participant-utils"
import GroupInput from "./group-input"
import TeamParticipants from "./team-body"

interface NewTeamsProps {
    participant_data: ParticipantsResponse
    tournament_table: TournamentTable
    tournament_id: number
    activeTab?: number
}

export const NewTeams = ({ participant_data, tournament_table, tournament_id }: NewTeamsProps) => {
    const { addNewRoundRobinGroup } = useParticipantUtils(tournament_id, tournament_table.id)
    const [participants, setParticipantsState] = useState<Participant[]>([])

    const { t } = useTranslation()

    useEffect(() => {
        if (participant_data && participant_data.data) {
            const orderedParticipants = participant_data.data.map(participant => {
                if (!participant.players) {
                    return participant
                }
                const sortedPlayers = [...participant.players].sort((a, b) => {
                    if (a.rank === 0 && b.rank !== 0) return 1
                    if (b.rank === 0 && a.rank !== 0) return -1
                    if (a.rank === 0 && b.rank === 0) return 0
                    return a.rank - b.rank
                })
                return {
                    ...participant,
                    players: sortedPlayers
                }
            })
            setParticipantsState(orderedParticipants)
        }
    }, [participant_data])


    if (tournament_table.type === GroupType.ROUND_ROBIN || tournament_table.type === GroupType.ROUND_ROBIN_FULL_PLACEMENT) {
        const groups = filterGroups(participants)
        return (
            <div>
                {groups.map((p, key) => {
                    return (
                        <div key={key} className="mt-5">
                            <GroupInput group={p.groupParticipant} tournament_id={tournament_id} tournament_table_id={tournament_table.id} />
                            <TeamParticipants
                                participants={p.participants}
                                tournament_id={tournament_id}
                                tournament_table={tournament_table}
                                setParticipantsState={setParticipantsState}
                                group_participant={p.groupParticipant}
                            />
                        </div>
                    )
                })}
                {groups.length < tournament_table.size && <div className="mt-2">
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
        <TeamParticipants
            tournament_id={tournament_id}
            tournament_table={tournament_table}
            participants={participants}
            setParticipantsState={setParticipantsState}
        />
    )
}



