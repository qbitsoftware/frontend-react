import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTranslation } from "react-i18next"
import { MatchWrapper, MatchState } from "@/types/matches"
import { TableNumberForm } from "./table-number-form"
import { ParticipantType } from "@/types/participants"
import { useState } from "react"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { axiosInstance } from "@/queries/axiosconf"
import { DialogType, TournamentTable } from "@/types/groups"

interface MatchesTableProps {
    matches: MatchWrapper[] | []
    handleRowClick: (match: MatchWrapper) => void
    tournament_id: number
    tournament_table: TournamentTable
    group_id: number
    active_participant: string[]
}

export const MatchesTable: React.FC<MatchesTableProps> = ({
    matches,
    handleRowClick,
    tournament_id,
    group_id,
    tournament_table,
    active_participant,
}: MatchesTableProps) => {
    const { t } = useTranslation()
    const queryClient = useQueryClient()
    const [loadingUpdates, setLoadingUpdates] = useState<Set<string>>(new Set())
    const [pendingScores, setPendingScores] = useState<Record<string, { p1: number | null, p2: number | null }>>({})

    const getScore = (match: MatchWrapper, player: ParticipantType) => {
        if (match.match.table_type === "champions_league" || tournament_table.dialog_type === DialogType.DT_TEAM_LEAGUES) {
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

    const isParticipantTaken = (participantId: string, currentMatchState: MatchState) => {
        return active_participant.includes(participantId) && currentMatchState !== MatchState.ONGOING && currentMatchState != MatchState.FINISHED
    }

    const renderPlayer = (match: MatchWrapper, player: ParticipantType) => {
        const playerId = player === ParticipantType.P1 ? match.match.p1_id : match.match.p2_id
        const playerName = player === ParticipantType.P1 ? match.p1.name : match.p2.name

        if (playerId === "empty") return <div className="text-gray-400">Bye Bye</div>
        if (playerId === "") return <div></div>
        const isPlayerTaken = isParticipantTaken(playerId, match.match.state)

        return (
            <div className={`flex items-center gap-2 ${isPlayerTaken ? 'text-red-600 font-medium' : ''}`}>
                {isPlayerTaken && (
                    <div
                        className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0"
                        title="Player is currently in another ongoing match"
                    />
                )}
                <span>{playerName}</span>
            </div>
        )
    }

    const getPendingScore = (matchId: string, player: ParticipantType) => {
        const pending = pendingScores[matchId]
        if (!pending) return null
        return player === ParticipantType.P1 ? pending.p1 : pending.p2
    }

    const updatePendingScore = (matchId: string, player: ParticipantType, score: number) => {
        setPendingScores(prev => ({
            ...prev,
            [matchId]: {
                p1: player === ParticipantType.P1 ? score : (prev[matchId]?.p1 ?? null),
                p2: player === ParticipantType.P2 ? score : (prev[matchId]?.p2 ?? null)
            }
        }))
    }

    const clearPendingScore = (matchId: string) => {
        setPendingScores(prev => {
            const newScores = { ...prev }
            delete newScores[matchId]
            return newScores
        })
    }

    const submitScore = async (match: MatchWrapper) => {
        const pending = pendingScores[match.match.id]
        if (!pending || (pending.p1 === null && pending.p2 === null)) return

        const updateKey = match.match.id
        setLoadingUpdates(prev => new Set(prev).add(updateKey))

        try {
            const p1Score = pending.p1 ?? getScore(match, ParticipantType.P1)
            const p2Score = pending.p2 ?? getScore(match, ParticipantType.P2)

            const scores = []

            for (let i = 0; i < p1Score; i++) {
                scores.push({
                    number: i + 1,
                    p1_score: 11,
                    p2_score: 0
                })
            }

            for (let i = 0; i < p2Score; i++) {
                scores.push({
                    number: p1Score + i + 1,
                    p1_score: 0,
                    p2_score: 11
                })
            }

            let winner_id = ""
            if (p1Score > p2Score) {
                winner_id = match.match.p1_id
            } else if (p2Score > p1Score) {
                winner_id = match.match.p2_id
            }

            const updatedMatch = {
                ...match.match,
                winner_id,
                state: winner_id ? MatchState.FINISHED : MatchState.ONGOING,
                use_sets: true,
                extra_data: {
                    ...match.match.extra_data,
                    score: scores
                }
            }

            await axiosInstance.patch(
                `/api/v1/tournaments/${tournament_id}/tables/${group_id}/match/${match.match.id}`,
                updatedMatch,
                { withCredentials: true }
            )

            queryClient.invalidateQueries({ queryKey: ['bracket', tournament_id] })
            queryClient.refetchQueries({ queryKey: ['bracket', tournament_id] })
            queryClient.invalidateQueries({ queryKey: ['matches', group_id] })
            queryClient.invalidateQueries({ queryKey: ['venues', tournament_id] })
            queryClient.invalidateQueries({ queryKey: ['tournament_table', group_id] })
            queryClient.refetchQueries({ queryKey: ['tournament_table', group_id] })

            setPendingScores(prev => {
                const newScores = { ...prev }
                delete newScores[match.match.id]
                return newScores
            })

            toast.success(t("admin.tournaments.matches.score_updated_success"))
        } catch (error) {
            toast.error(t("admin.tournaments.matches.score_update_error"))
        } finally {
            setLoadingUpdates(prev => {
                const newSet = new Set(prev)
                newSet.delete(updateKey)
                return newSet
            })
        }
    }

    const ScoreSelector: React.FC<{
        match: MatchWrapper
        player: ParticipantType
        currentScore: number
        isDisabled: boolean
    }> = ({ match, player, currentScore, isDisabled }) => {
        const hasScores = match.match.extra_data.score && match.match.extra_data.score.length > 0
        const pendingScore = getPendingScore(match.match.id, player)
        const displayScore = pendingScore !== null ? pendingScore : (hasScores ? currentScore : null)

        const handleScoreChange = (value: string) => {
            const newScore = parseInt(value)
            updatePendingScore(match.match.id, player, newScore)
        }

        const isLoading = loadingUpdates.has(match.match.id)

        return (
            <Select
                value={displayScore !== null ? displayScore.toString() : ""}
                onValueChange={handleScoreChange}
                disabled={isDisabled || isLoading}
            >
                <SelectTrigger className="w-16 h-8">
                    <SelectValue placeholder="-" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="0">0</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                </SelectContent>
            </Select>
        )
    }

    if (matches.length > 0) {
        return (
            <div className="rounded-md border my-2">
                <Table className="[&_td]:py-1 [&_th]:py-1 [&_td]:px-2 [&_th]:px-2 text-sm">
                    <TableHeader>
                        <TableRow className="bg-gray-50">
                            <TableHead className="min-w-[100px]">Actions</TableHead>
                            <TableHead>{t("admin.tournaments.matches.table.round")}</TableHead>
                            <TableHead>{t("admin.tournaments.matches.table.table")}</TableHead>
                            <TableHead className="min-w-[120px]">{t("admin.tournaments.matches.table.participant_1")}</TableHead>
                            <TableHead className="min-w-[80px]">{t("admin.tournaments.matches.table.participant_1_score")}</TableHead>
                            <TableHead className="min-w-[80px]">{""}</TableHead>
                            <TableHead className="min-w-[80px]">{t("admin.tournaments.matches.table.participant_2_score")}</TableHead>
                            <TableHead className="min-w-[120px]">{t("admin.tournaments.matches.table.participant_2")}</TableHead>
                            <TableHead>{t("admin.tournaments.matches.table.winner")}</TableHead>
                            <TableHead>{t("admin.tournaments.matches.table.bracket")}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {matches.map((match) => {
                            const hasPendingScores = pendingScores[match.match.id] &&
                                (pendingScores[match.match.id].p1 !== null || pendingScores[match.match.id].p2 !== null)
                            const isLoading = loadingUpdates.has(match.match.id)

                            return (
                                <TableRow key={`match-${match.match.id}`} className={getRowClassName(match)}>
                                    <TableCell>
                                        <Button
                                            disabled={match.p1.id === "" || match.p2.id === ""}
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleRowClick(match)}
                                        >
                                            {t("admin.tournaments.matches.table.modify")}
                                        </Button>
                                    </TableCell>
                                    <TableCell>
                                        {/* {match.p1.group_id} */}
                                        {match.match.round}
                                        {/* {new Date(match.match.start_date).toLocaleString()} */}
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
                                        {match.match.table_type === "champions_league" || tournament_table.dialog_type === DialogType.DT_TEAM_LEAGUES ? (
                                            getScore(match, ParticipantType.P1)
                                        ) : (
                                            <ScoreSelector
                                                match={match}
                                                player={ParticipantType.P1}
                                                currentScore={getScore(match, ParticipantType.P1)}
                                                isDisabled={match.p1.id === "" || match.p2.id === "" || match.match.state === MatchState.FINISHED}
                                            />
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {hasPendingScores && (
                                            <div className="mx-auto flex gap-1 justify-center">
                                                <Button
                                                    size="sm"
                                                    onClick={() => submitScore(match)}
                                                    disabled={isLoading}
                                                    className="bg-green-600 hover:bg-green-700 text-white w-8 h-8 p-0"
                                                >
                                                    {isLoading ? "..." : "✓"}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => clearPendingScore(match.match.id)}
                                                    disabled={isLoading}
                                                    className="text-red-600 hover:text-red-700 w-8 h-8 p-0"
                                                >
                                                    ✕
                                                </Button>
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {match.match.table_type === "champions_league" || tournament_table.dialog_type === DialogType.DT_TEAM_LEAGUES ? (
                                            getScore(match, ParticipantType.P2)
                                        ) : (
                                            <ScoreSelector
                                                match={match}
                                                player={ParticipantType.P2}
                                                currentScore={getScore(match, ParticipantType.P2)}
                                                isDisabled={match.p1.id === "" || match.p2.id === "" || match.match.state === MatchState.FINISHED}
                                            />
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {renderPlayer(match, ParticipantType.P2)}
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap">
                                        {getWinnerName(match)}
                                    </TableCell>
                                    <TableCell>
                                        {/* {match.match.type === "winner" ? t("admin.tournaments.matches.table.winner_bracket") : match.match.type === "loser" ? t("admin.tournaments.matches.table.loser_bracket") : ""} */}
                                        {/* {match.match.bracket != "" ? match.match.bracket : "-"} */}
                                        {/* {match.match.bracket !== ""
                                            ? match.match.bracket
                                            : match.match.table_type
                                                ? t(`admin.tournaments.matches.table.${match.match.table_type}`)
                                                : "-"} */}
                                        {match.match.bracket !== ""
                                            ? match.match.bracket
                                            : match.match.type === "winner"
                                                ? t("admin.tournaments.matches.table.winner_bracket")
                                                : match.match.type === "loser"
                                                    ? t("admin.tournaments.matches.table.loser_bracket")
                                                    : match.match.type === "bracket"
                                                        ? t("admin.tournaments.matches.table.bracket")
                                                        : "-"}
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                        {matches.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={10} className="h-24 text-center">
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
