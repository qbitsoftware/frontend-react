import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useTranslation } from "react-i18next"
import { MatchWrapper } from "@/types/matches"
import { TableNumberForm } from "./table-number-form"
import { ParticipantType } from "@/types/participants"

interface MatchesTableProps {
    matches: MatchWrapper[] | []
    handleRowClick: (match: MatchWrapper) => void
}

export const MatchesTable: React.FC<MatchesTableProps> = ({
    matches,
    handleRowClick,
}: MatchesTableProps) => {
    const { t } = useTranslation()

    const getScore = (match: MatchWrapper, player: ParticipantType) => {
        if (match.match.table_type === "champions_league") {
            return player === ParticipantType.P1 ? match.match.extra_data.team_1_total || 0 : match.match.extra_data.team_2_total || 0
        }

        const scores = match.match.extra_data.score
        if (!scores) return 0

        return scores.filter(s => {
            const playerScore = player === 'p1' ? s.p1_score : s.p2_score
            const opponentScore = player === 'p1' ? s.p2_score : s.p1_score
            return playerScore >= 11 && playerScore - opponentScore >= 2
        }).length
    }

    const getWinnerName = (match: MatchWrapper) => {
        if (match.match.p1_id === "empty" && match.match.p2_id === "empty") return ""
        if (!match.match.winner_id) return t("admin.tournaments.matches.not_played")
        return match.match.winner_id === match.match.p1_id ? match.p1.name : match.p2.name
    }

    const getRowClassName = (match: MatchWrapper) => {
        const state = match.match.state
        if (state === 'finished') return 'opacity-60 bg-gray-50'
        if (state === 'ongoing') return 'bg-green-50 border-green-200'
        return ''
    }

    const renderPlayer = (match: MatchWrapper, player: ParticipantType) => {
        const playerId = player === ParticipantType.P1 ? match.match.p1_id : match.match.p2_id
        const playerName = player === ParticipantType.P1 ? match.p1.name : match.p2.name

        if (playerId === "empty") return <div className="text-gray-400">Bye Bye</div>
        if (playerId === "") return <div></div>
        return <>{playerName}</>
    }

    if (matches.length > 0) {
        return (
            <div className="rounded-md border my-2">
                <Table className="[&_td]:py-2 [&_th]:py-2">
                    <TableHeader>
                        <TableRow className="bg-gray-50">
                            <TableHead>Actions</TableHead>
                            <TableHead>{t("admin.tournaments.matches.table.serial_number")}</TableHead>
                            <TableHead>{t("admin.tournaments.matches.table.round")}</TableHead>
                            <TableHead>{t("admin.tournaments.matches.table.table")}</TableHead>
                            <TableHead className="min-w-[120px]">{t("admin.tournaments.matches.table.participant_1")}</TableHead>
                            <TableHead className="min-w-[120px]">{t("admin.tournaments.matches.table.participant_1_score")}</TableHead>
                            <TableHead className="min-w-[120px]">{t("admin.tournaments.matches.table.participant_2_score")}</TableHead>
                            <TableHead className="min-w-[120px]">{t("admin.tournaments.matches.table.participant_2")}</TableHead>
                            <TableHead>{t("admin.tournaments.matches.table.winner")}</TableHead>
                            <TableHead>{t("admin.tournaments.matches.table.bracket")}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {matches.map((match, index) => (
                            <TableRow key={`match-${match.match.id}`} className={getRowClassName(match)}>
                                <TableCell>
                                    <Button
                                        disabled={match.p1.id === "" || match.p2.id === ""}
                                        variant="outline"
                                        onClick={() => handleRowClick(match)}
                                    >
                                        {t("admin.tournaments.matches.table.modify")}
                                    </Button>
                                </TableCell>
                                <TableCell>
                                    {index + 1}
                                </TableCell>
                                <TableCell>
                                    {match.match.round}
                                </TableCell>
                                <TableCell>
                                    <TableNumberForm
                                        brackets={false}
                                        match={match.match}
                                        initialTableNumber={match.match.extra_data ? match.match.extra_data.table : "0"}
                                    />
                                </TableCell>
                                <TableCell>
                                    {renderPlayer(match, ParticipantType.P1)}
                                </TableCell>
                                <TableCell>
                                    {getScore(match, ParticipantType.P1)}
                                </TableCell>
                                <TableCell>
                                    {getScore(match, ParticipantType.P2)}
                                </TableCell>
                                <TableCell>
                                    {renderPlayer(match, ParticipantType.P2)}
                                </TableCell>
                                <TableCell className="whitespace-nowrap">
                                    {getWinnerName(match)}
                                </TableCell>
                                <TableCell>
                                    {match.match.type === "winner" ? t("admin.tournaments.matches.table.winner_bracket") : t("admin.tournaments.matches.table.loser_bracket")}
                                </TableCell>
                            </TableRow>
                        ))}
                        {matches.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={11} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        )
    }
}
