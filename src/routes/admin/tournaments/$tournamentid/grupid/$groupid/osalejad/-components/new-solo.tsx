import { Participant } from "@/types/participants"
import { Plus } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { useParticipantUtils } from "@/hooks/useParticipantUtils"
import { useTranslation } from "react-i18next"
import { DialogType, TournamentTable } from "@/types/groups"
import { GroupType, TTState } from "@/types/matches"
import { filterGroups } from "./participant-utils"
import GroupInput from "./group-input"
import SoloParticipants from "./solo-body"
import { selectedTeams } from "./new-double"
import { cn } from "@/lib/utils"


interface NewSoloProps {
    participants: Participant[]
    all_participants: Participant[] | null
    tournament_id: number
    tournament_table: TournamentTable
    selectedTeams?: selectedTeams | undefined
    setSelectedTeams?: (teams: selectedTeams) => void
    renderRR?: boolean
    isSecondary?: boolean
    highlightInput?: boolean
}

export const NewSolo = ({ participants, all_participants, tournament_id, tournament_table, selectedTeams, setSelectedTeams, renderRR = false, isSecondary, highlightInput }: NewSoloProps) => {
    const { addOrUpdateParticipant, addNewRoundRobinGroup } = useParticipantUtils(tournament_id, tournament_table.id)

    const [participantsState, setParticipantsState] = useState<Participant[]>(participants)
    useEffect(() => {
        setParticipantsState(participants)
    }, [participants])

    const isDisabledInput = useMemo(() => {
        if (all_participants && tournament_table.type === GroupType.DYNAMIC) {
            return all_participants.filter(p => p.group_name === "round_robin").length >= tournament_table.size
        } else if (all_participants && (tournament_table.dialog_type === DialogType.DT_DOUBLES || tournament_table.dialog_type === DialogType.DT_FIXED_DOUBLES)) {
            let counter = 0
            all_participants.map((p) => {
                if (p.players) {
                    counter += p.players.length
                }
            })
            return Math.floor(counter / 2) >= tournament_table.size
        }
        return false
    }, [all_participants, tournament_table.type, tournament_table.dialog_type, tournament_table.size])

    const handleTeamClick = (group_id: string) => {
        if (tournament_table.type !== GroupType.DYNAMIC) {
            return
        }
        if (setSelectedTeams) {
            if (selectedTeams && selectedTeams.p1_id !== "") {
                setSelectedTeams({ p1_id: selectedTeams.p1_id, p2_id: group_id, type: 'round_robin' })
            }
        }
    }


    const { t } = useTranslation()

    if (tournament_table.type == GroupType.ROUND_ROBIN || tournament_table.type == GroupType.ROUND_ROBIN_FULL_PLACEMENT || (tournament_table.type == GroupType.DYNAMIC && renderRR)) {
        const groups = filterGroups(participantsState)
        const sortedGroups = groups.sort((a, b) => {
            const nameA = a.groupParticipant.name.trim();
            const nameB = b.groupParticipant.name.trim();

            if (!nameA && nameB) return 1;
            if (!nameB && nameA) return -1;
            if (!nameA && !nameB) return 0;

            return nameA.localeCompare(nameB);
        });

        return (
            <div className="px-2">
                {sortedGroups.map((p, key) => {
                    return (
                        <div key={key} onClick={() => handleTeamClick(p.groupParticipant.id)} className={cn("mt-5", tournament_table.type === GroupType.DYNAMIC && selectedTeams && selectedTeams.p1_id != "" ? "cursor-pointer hover:bg-blue-100" : "")}>
                            <GroupInput group={p.groupParticipant} tournament_id={tournament_id} tournament_table={tournament_table} />
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
                                isSecondary={isSecondary}
                                highlightInput={highlightInput}
                            />
                        </div>
                    )
                })}
                {groups.length < tournament_table.size && tournament_table.type !== GroupType.DYNAMIC && tournament_table.state < TTState.TT_STATE_MATCHES_ASSIGNED && <div className="mt-2">
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
            participants={participantsState}
            tournament_id={tournament_id}
            tournament_table={tournament_table}
            setParticipantsState={setParticipantsState}
            addOrUpdateParticipant={addOrUpdateParticipant}
            selectedTeams={selectedTeams}
            setSelectedTeams={setSelectedTeams}
            disableInputForDynamic={isDisabledInput}
            isSecondary={isSecondary}
            highlightInput={highlightInput}
        />
    )
}