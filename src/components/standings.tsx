import { Participant } from "@/types/participants"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { useTranslation } from "react-i18next"
import { TournamentTable } from "@/types/groups"
import { GroupType } from "@/types/matches"

interface Props {
  participants: Participant[]
  tournament_table: TournamentTable
}

const Standings = ({ participants, tournament_table }: Props) => {
  const { t } = useTranslation()

  const isRoundRobin = tournament_table.type === GroupType.ROUND_ROBIN || tournament_table.type === GroupType.ROUND_ROBIN_FULL_PLACEMENT

  if (isRoundRobin) {
    const groupNames = participants.filter(p => !p.group_id)

    const groupedParticipants = participants
      .filter(p => p.group_id)
      .reduce((acc, participant) => {
        const groupId = participant.group_id
        if (!acc[groupId]) {
          acc[groupId] = []
        }
        acc[groupId].push(participant)
        return acc
      }, {} as Record<string, Participant[]>)

    const groupIdToName = groupNames.reduce((acc, group) => {
      if (group.id) {
        acc[group.id.toString()] = group.name
      }
      return acc
    }, {} as Record<string, string>)

    const sortedGroupIds = Object.keys(groupedParticipants).sort((a, b) => Number(a) - Number(b))

    return (
      <div className="space-y-6">
        {sortedGroupIds && sortedGroupIds.map((groupId) => (
          <div key={groupId} className="bg-white rounded-lg shadow-sm border">
            <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg border-b">
              <h3 className="font-semibold text-gray-800">
                {groupIdToName[groupId] || `Alagrupp`}
              </h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">{t("competitions.standings.placement")}</TableHead>
                  <TableHead>{t("competitions.standings.participants")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groupedParticipants && groupedParticipants[groupId].map((participant, index) => (
                  <TableRow key={participant.id || index} className="hover:bg-gray-50">
                    <TableCell className="w-16 font-medium">{index + 1}</TableCell>
                    <TableCell>{participant.name}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ))}
      </div>
    )
  }

  // Original layout for non-round robin tournaments
  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">{t("competitions.standings.placement")}</TableHead>
            <TableHead>{t("competitions.standings.participants")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {participants.map((participant: Participant, index) => (
            <TableRow key={participant.id || index} className="hover:bg-gray-50">
              <TableCell className="w-16 font-medium">{index + 1}</TableCell>
              <TableCell>{participant.name}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default Standings
