import { Participant } from "@/types/participants"
import { Plus } from "lucide-react"
import { useEffect, useState } from "react"
import { ParticipantsResponse } from "@/queries/participants"
import { Button } from "@/components/ui/button"
import { useParticipantUtils } from "@/hooks/useParticipantUtils"
import { useTranslation } from "react-i18next"
import { TournamentTable } from "@/types/groups"
import { GroupType } from "@/types/matches"
import { filterGroups } from "./participant-utils"
import GroupInput from "./group-input"
import SoloParticipants from "./solo-body"
import { selectedTeams } from "./new-double"
import { cn } from "@/lib/utils"


interface NewSoloProps {
    participant_data: ParticipantsResponse
    tournament_id: number
    tournament_table: TournamentTable
    selectedTeams?: selectedTeams | undefined
    setSelectedTeams?: (teams: selectedTeams) => void
    renderRR?: boolean
}

export const NewSolo = ({ participant_data, tournament_id, tournament_table, selectedTeams, setSelectedTeams, renderRR = false }: NewSoloProps) => {
    const { addOrUpdateParticipant, addNewRoundRobinGroup } = useParticipantUtils(tournament_id, tournament_table.id)

    const [participants, setParticipantsState] = useState<Participant[]>([])
    useEffect(() => {
        if (participant_data && participant_data.data) {
            setParticipantsState(participant_data.data)
        }
    }, [participant_data])

    const handleTeamClick = (group_id: string) => {
        if (tournament_table.type !== GroupType.DYNAMIC) {
            return
        }
        if (setSelectedTeams) {
            if (selectedTeams) {
                setSelectedTeams({ p1_id: selectedTeams.p1_id, p2_id: group_id, type: 'round_robin' })
            }
        }
    }

    const { t } = useTranslation()

    if (tournament_table.type == GroupType.ROUND_ROBIN || tournament_table.type == GroupType.ROUND_ROBIN_FULL_PLACEMENT || (tournament_table.type == GroupType.DYNAMIC && renderRR)) {
        const groups = filterGroups(participants)
        return (
            <div className="">
                {groups.map((p, key) => {
                    return (
                        <div key={key} onClick={() => handleTeamClick(p.groupParticipant.id)} className={cn("mt-5", tournament_table.type === GroupType.DYNAMIC && selectedTeams ? "cursor-pointer hover:bg-blue-100" : "")}>
                            <GroupInput group={p.groupParticipant} tournament_id={tournament_id} tournament_table_id={tournament_table.id} />
                            <SoloParticipants
                                participants={p.participants}
                                group_participant={p.groupParticipant}
                                tournament_id={tournament_id}
                                tournament_table={tournament_table}
                                setParticipantsState={setParticipantsState}
                                addOrUpdateParticipant={addOrUpdateParticipant}
                                selectedTeams={selectedTeams}
                                setSelectedTeams={setSelectedTeams}
                                renderRR={renderRR}
                            />
                        </div>
                    )
                })}
                {groups.length < tournament_table.size && tournament_table.type !== GroupType.DYNAMIC && <div className="mt-2">
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
        <SoloParticipants
            participants={participants}
            tournament_id={tournament_id}
            tournament_table={tournament_table}
            setParticipantsState={setParticipantsState}
            addOrUpdateParticipant={addOrUpdateParticipant}
            selectedTeams={selectedTeams}
            setSelectedTeams={setSelectedTeams}
        />
    )
}





