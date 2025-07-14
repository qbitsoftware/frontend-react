import { ParticipantsResponse, UsePostParticipantMerge } from "@/queries/participants"
import { TournamentTable } from "@/types/groups"
import { NewSolo } from "./new-solo"
import { NewTeams } from "./new-teams"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export interface selectedTeams {
    p1_id: string
    p2_id: string
}

interface Props {
    participant_data: ParticipantsResponse
    tournament_id: number
    tournament_table: TournamentTable
}

export default function NewDouble({ participant_data, tournament_id, tournament_table }: Props) {
    const mergeMutation = UsePostParticipantMerge(tournament_id, tournament_table.id)
    const soloParticipants = participant_data.data?.filter(p => p.players && p.players.length === 1) || []
    const teamParticipants = participant_data.data?.filter(p => p.players && p.players.length > 1) || []
    const soloData: ParticipantsResponse = {
        ...participant_data,
        data: soloParticipants,
    }

    const [selectedTeams, setSelectedTeams] = useState<selectedTeams>()
    useEffect(() => {
        const mergeTeams = async () => {
            if (selectedTeams && selectedTeams.p1_id !== "" && selectedTeams.p2_id !== "") {
                console.log("Selected teams:", selectedTeams)
                console.log("firing request to backend")
                try {
                    if (selectedTeams) {
                        await mergeMutation.mutateAsync(selectedTeams)
                    }
                    toast.message("Teams merged successfully")
                } catch (error) {
                    toast.error("Error merging teams")
                } finally {
                    setSelectedTeams({ p1_id: "", p2_id: "" })
                }
            }
        }

        mergeTeams()
    }, [selectedTeams])

    const teamData: ParticipantsResponse = {
        ...participant_data,
        data: teamParticipants,
    }

    return (
        <div className="flex gap-3">
            <div className="max-w-[600px] overflow-x-auto">
                <NewSolo
                    participant_data={soloData}
                    tournament_id={tournament_id}
                    tournament_table={tournament_table}
                    selectedTeams={selectedTeams}
                    setSelectedTeams={setSelectedTeams}
                />

            </div>
            <div className="max-w-[600px] overflow-x-auto">
                <NewTeams
                    participant_data={teamData}
                    tournament_id={tournament_id}
                    tournament_table={tournament_table}
                />
            </div>
        </div>
    )
}