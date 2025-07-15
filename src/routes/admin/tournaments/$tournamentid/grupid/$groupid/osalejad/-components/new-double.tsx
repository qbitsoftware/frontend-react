import { ParticipantsResponse, UsePostParticipantMerge } from "@/queries/participants"
import { TournamentTable } from "@/types/groups"
import { NewSolo } from "./new-solo"
import { NewTeams } from "./new-teams"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"

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
    const { t } = useTranslation()
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
                    toast.message(t("admin.tournaments.groups.participants.doubles.teams_merged_successfully"))
                } catch (error) {
                    toast.error(t("admin.tournaments.groups.participants.doubles.teams_merge_error"))
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        {t("admin.tournaments.groups.participants.doubles.individual_participants")}
                    </h3>
                    <p className="text-sm text-gray-600">
                        {t("admin.tournaments.groups.participants.doubles.individual_participants_description")}
                    </p>
                </div>
                <div className="overflow-x-auto">
                    <NewSolo
                        participant_data={soloData}
                        tournament_id={tournament_id}
                        tournament_table={tournament_table}
                        selectedTeams={selectedTeams}
                        setSelectedTeams={setSelectedTeams}
                    />
                </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        {t("admin.tournaments.groups.participants.doubles.pairs_participants")}
                    </h3>
                    <p className="text-sm text-gray-600">
                        {t("admin.tournaments.groups.participants.doubles.pairs_participants_description")}
                    </p>
                </div>
                <div className="overflow-x-auto">
                    <NewTeams
                        participant_data={teamData}
                        tournament_id={tournament_id}
                        tournament_table={tournament_table}
                    />
                </div>
            </div>
        </div>
    )
}