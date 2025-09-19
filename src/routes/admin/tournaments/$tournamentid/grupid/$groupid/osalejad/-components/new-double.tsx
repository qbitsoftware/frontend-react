import { UsePostParticipantMerge } from "@/queries/participants"
import { TournamentTable } from "@/types/groups"
import { NewSolo } from "./new-solo"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { GroupType } from "@/types/matches"
import { NewTeams } from "./new-teams"
import { Participant } from "@/types/participants"

export interface selectedTeams {
    type: 'double' | 'round_robin'
    p1_id: string
    p2_id: string
}

interface Props {
    participants: Participant[]
    tournament_id: number
    tournament_table: TournamentTable
    highlightInput?: boolean
}

export default function NewDouble({ participants, tournament_id, tournament_table, highlightInput }: Props) {
    const { t } = useTranslation()
    const mergeMutation = UsePostParticipantMerge(tournament_id, tournament_table.id)
    const soloParticipants = tournament_table.type === GroupType.DYNAMIC ? participants.filter(p => p.group_id === "" && p.type !== "round_robin") || [] : participants.filter(p => p.players && p.players.length === 1) || []
    const teamParticipants = tournament_table.type === GroupType.DYNAMIC ? participants.filter(p => p.group_id !== "" || p.type === "round_robin") || [] : participants.filter(p => p.players && p.players.length > 1) || []

    const [selectedTeams, setSelectedTeams] = useState<selectedTeams>()
    useEffect(() => {
        const mergeTeams = async () => {
            if (selectedTeams && selectedTeams.p1_id !== "" && selectedTeams.p2_id !== "") {
                try {
                    if (selectedTeams) {
                        await mergeMutation.mutateAsync(selectedTeams)
                    }
                    toast.message(t("admin.tournaments.groups.participants.doubles.teams_merged_successfully"))
                } catch (error) {
                    toast.error(t("admin.tournaments.groups.participants.doubles.teams_merge_error"))
                } finally {
                    setSelectedTeams({ p1_id: "", p2_id: "", type: tournament_table.type === GroupType.DYNAMIC ? 'round_robin' : 'double' })
                }
            }
        }

        mergeTeams()
    }, [selectedTeams])

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        {tournament_table.type === GroupType.DYNAMIC ?
                            t("admin.tournaments.groups.participants.dynamic.individual_participants") :
                            t("admin.tournaments.groups.participants.doubles.individual_participants")}
                    </h3>
                    <p className="text-sm text-gray-600">
                        {tournament_table.type === GroupType.DYNAMIC ?
                            t("admin.tournaments.groups.participants.dynamic.individual_participants_description") :
                            t("admin.tournaments.groups.participants.doubles.individual_participants_description")}
                    </p>
                </div>
                <div className="overflow-x-auto">
                    <NewSolo
                        all_participants={participants}
                        participants={soloParticipants}
                        tournament_id={tournament_id}
                        tournament_table={tournament_table}
                        selectedTeams={selectedTeams}
                        setSelectedTeams={setSelectedTeams}
                        highlightInput={highlightInput}
                    />
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        {tournament_table.type === GroupType.DYNAMIC ?
                            t("admin.tournaments.groups.participants.dynamic.pairs_participants") :
                            t("admin.tournaments.groups.participants.doubles.pairs_participants")}
                    </h3>
                    <p className="text-sm text-gray-600">
                        {tournament_table.type === GroupType.DYNAMIC ?
                            t("admin.tournaments.groups.participants.dynamic.pairs_participants_description") :
                            t("admin.tournaments.groups.participants.doubles.pairs_participants_description")}
                    </p>
                </div>
                <div className="overflow-x-auto">
                    {tournament_table.type === GroupType.DYNAMIC ? (
                        <NewSolo
                            all_participants={participants}
                            participants={teamParticipants}
                            tournament_id={tournament_id}
                            tournament_table={tournament_table}
                            selectedTeams={selectedTeams}
                            setSelectedTeams={setSelectedTeams}
                            highlightInput={highlightInput}
                            renderRR
                        />
                    ) : (
                        <NewTeams
                            participants={teamParticipants}
                            tournament_id={tournament_id}
                            tournament_table={tournament_table}
                            highLightInput={highlightInput}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}