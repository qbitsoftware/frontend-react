import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTranslation } from "react-i18next"
import { MatchWrapper, MatchState } from "@/types/matches"
import { TableNumberForm } from "./table-number-form"
import { ParticipantType } from "@/types/participants"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { axiosInstance } from "@/queries/axiosconf"
import { DialogType, TournamentTable } from "@/types/groups"
import { Edit } from "lucide-react"
import { AutoSizer, Column, Table } from "react-virtualized"
import 'react-virtualized/styles.css'
import { getRoundDisplayName } from "@/lib/match-utils"

interface MatchesTableProps {
    matches: MatchWrapper[] | []
    handleRowClick: (match: MatchWrapper) => void
    tournament_id: number
    tournament_table: TournamentTable[]
    active_participant: string[]
    all?: boolean
}

export const MatchesTable: React.FC<MatchesTableProps> = ({
    matches,
    handleRowClick,
    tournament_id,
    tournament_table,
    active_participant,
    all = false,
}: MatchesTableProps) => {
    const { t } = useTranslation()
    const queryClient = useQueryClient()
    const [loadingUpdates, setLoadingUpdates] = useState<Set<string>>(new Set())
    const [pendingScores, setPendingScores] = useState<Record<string, { p1: number | null, p2: number | null }>>({})
    const tableMap = useMemo(() => new Map(tournament_table.map(table => [table.id, table])), [tournament_table])

    const getScore = (match: MatchWrapper, player: ParticipantType) => {
        if (match.match.table_type === "champions_league" || tableMap.get(match.match.tournament_table_id)?.dialog_type === DialogType.DT_TEAM_LEAGUES) {
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

    const getRowClassName = (match: MatchWrapper) => {
        const state = match.match.state
        if (state === 'finished') return 'opacity-60 bg-gray-50'
        if (state === 'ongoing') {
            return 'bg-green-50 border-green-200'
        }
        return ''
    }

    const isParticipantTaken = (participantId: string, currentMatchState: MatchState) => {
        return active_participant.includes(participantId) && currentMatchState !== MatchState.ONGOING && currentMatchState != MatchState.FINISHED
    }

    const renderPlayer = (match: MatchWrapper, player: ParticipantType) => {
        const playerId = player === ParticipantType.P1 ? match.match.p1_id : match.match.p2_id
        const playerName = player === ParticipantType.P1 ? match.p1.name : match.p2.name
        const isForfeit = matches.find(m => (m.match.p1_id == playerId || m.match.p2_id == playerId) && m.match.forfeit && m.match.winner_id != playerId)

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
                <span>{playerName}
                    {isForfeit && (isForfeit.match.forfeit_type == "WO" ? (
                        <span className="text-red-500 text-xs ml-1">
                            (W-O)
                        </span>
                    ) : isForfeit && isForfeit.match.forfeit_type == "RET" ? (
                        <span className="text-red-500 text-xs ml-1">
                            (RET)
                        </span>
                    ) : isForfeit && isForfeit.match.forfeit_type == "DSQ" ? (
                        <span className="text-red-500 text-xs ml-1">
                            (DSQ)
                        </span>
                    ) : null)}
                </span>
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
                `/api/v1/tournaments/${tournament_id}/tables/${match.match.tournament_table_id}/match/${match.match.id}`,
                updatedMatch,
                { withCredentials: true }
            )

            queryClient.invalidateQueries({ queryKey: ['bracket', tournament_id] })
            queryClient.refetchQueries({ queryKey: ['bracket', tournament_id] })
            queryClient.invalidateQueries({ queryKey: ['matches', tournament_id] })
            // queryClient.resetQueries({ queryKey: ['matches_group', match.match.tournament_table_id] })
            queryClient.refetchQueries({ queryKey: ['matches_group', match.match.tournament_table_id] })
            queryClient.invalidateQueries({ queryKey: ['venues_free', tournament_id] })
            queryClient.invalidateQueries({ queryKey: ['venues_all', tournament_id] })
            queryClient.invalidateQueries({ queryKey: ['tournament_table', match.match.tournament_table_id] })
            queryClient.refetchQueries({ queryKey: ['tournament_table', match.match.tournament_table_id] })

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

        if (match.match.forfeit) {
            const playerId = player === ParticipantType.P1 ? match.match.p1_id : match.match.p2_id
            const isWinner = match.match.winner_id === playerId

            if (match.match.forfeit_type === "WO") {
                return (
                    <div className="w-16 h-8 flex items-center justify-center text-xs font-medium">
                        {isWinner ? "W" : "O"}
                    </div>
                )
            } else if (match.match.forfeit_type === "RET") {
                return (
                    <div className="w-16 h-8 flex items-center justify-center text-xs font-medium">
                        {isWinner ? "-" : "RET"}
                    </div>
                )
            } else if (match.match.forfeit_type === "DSQ") {
                return (
                    <div className="w-16 h-8 flex items-center justify-center text-xs font-medium">
                        {isWinner ? "-" : "DSQ"}
                    </div>
                )
            }
        }

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
                <SelectTrigger className="w-16 h-8 focus:outline-none focus:ring-0">
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

    // Cell renderers for each column
    const actionsCellRenderer = ({ rowData }: { rowData: MatchWrapper }) => (
        <div className="flex items-center h-full justify-center">
            <Button
                disabled={rowData.p1.id === "" || rowData.p2.id === ""}
                variant="outline"
                size="sm"
                onClick={() => handleRowClick(rowData)}
            >
                <Edit className="h-2 w-2" />
            </Button>
        </div>
    )

    const groupCellRenderer = ({ rowData }: { rowData: MatchWrapper }) => (
        <div className="flex items-center h-full px-2 text-[10px]">
            {tableMap.get(rowData.match.tournament_table_id)?.class || "N/A"}
        </div>
    )

    const tableCellRenderer = ({ rowData }: { rowData: MatchWrapper }) => (
        <div className="flex items-center h-full px-2">
            <TableNumberForm
                brackets={false}
                match={rowData.match}
                initialTableNumber={rowData.match.extra_data ? rowData.match.extra_data.table : "0"}
            />
        </div>
    )

    const participant1CellRenderer = ({ rowData }: { rowData: MatchWrapper }) => (
        <div className="flex items-center h-full px-2 text-sm">
            {renderPlayer(rowData, ParticipantType.P1)}
        </div>
    )

    const participant1ScoreCellRenderer = ({ rowData }: { rowData: MatchWrapper }) => (
        <div className="flex items-center h-full px-2">
            {rowData.match.table_type === "champions_league" || tableMap.get(rowData.match.tournament_table_id)?.dialog_type === DialogType.DT_TEAM_LEAGUES ? (
                getScore(rowData, ParticipantType.P1)
            ) : (
                <ScoreSelector
                    match={rowData}
                    player={ParticipantType.P1}
                    currentScore={getScore(rowData, ParticipantType.P1)}
                    isDisabled={rowData.p1.id === "" || rowData.p2.id === "" || rowData.match.state === MatchState.FINISHED}
                />
            )}
        </div>
    )

    const actionsCenterCellRenderer = ({ rowData }: { rowData: MatchWrapper }) => {
        const hasPendingScores = pendingScores[rowData.match.id] &&
            (pendingScores[rowData.match.id].p1 !== null || pendingScores[rowData.match.id].p2 !== null)
        const isLoading = loadingUpdates.has(rowData.match.id)

        return (
            <div className="flex items-center justify-center h-full px-2">
                {hasPendingScores && (
                    <div className="flex gap-1">
                        <Button
                            size="sm"
                            onClick={() => submitScore(rowData)}
                            disabled={isLoading}
                            className="bg-green-600 hover:bg-green-700 text-white w-8 h-8 p-0"
                        >
                            {isLoading ? "..." : "✓"}
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => clearPendingScore(rowData.match.id)}
                            disabled={isLoading}
                            className="text-red-600 hover:text-red-700 w-8 h-8 p-0"
                        >
                            ✕
                        </Button>
                    </div>
                )}
            </div>
        )
    }

    const participant2ScoreCellRenderer = ({ rowData }: { rowData: MatchWrapper }) => (
        <div className="flex items-center h-full px-2">
            {rowData.match.table_type === "champions_league" || tableMap.get(rowData.match.tournament_table_id)?.dialog_type === DialogType.DT_TEAM_LEAGUES ? (
                getScore(rowData, ParticipantType.P2)
            ) : (
                <ScoreSelector
                    match={rowData}
                    player={ParticipantType.P2}
                    currentScore={getScore(rowData, ParticipantType.P2)}
                    isDisabled={rowData.p1.id === "" || rowData.p2.id === "" || rowData.match.state === MatchState.FINISHED}
                />
            )}
        </div>
    )

    const participant2CellRenderer = ({ rowData }: { rowData: MatchWrapper }) => (
        <div className="flex items-center h-full px-2 text-sm">
            {renderPlayer(rowData, ParticipantType.P2)}
        </div>
    )

    const bracketCellRenderer = ({ rowData }: { rowData: MatchWrapper }) => (
        <div className="flex items-center h-full px-2 text-[10px]">
            {rowData.match.type === "winner"
                ? t("admin.tournaments.matches.table.winner_bracket")
                : rowData.match.type === "loser"
                    ? t("admin.tournaments.matches.table.loser_bracket")
                    : rowData.match.type === "bracket"
                        ? t("admin.tournaments.matches.table.bracket_bracket")
                        : "-"}
        </div>
    )

    const roundCellRenderer = ({ rowData }: { rowData: MatchWrapper }) => {
        const table = tableMap.get(rowData.match.tournament_table_id)
        const roundDisplayName = getRoundDisplayName(
            rowData.match.type,
            rowData.match.round,
            rowData.match.bracket,
            rowData.match.next_loser_bracket,
            table?.size || 0,
            t
        );

        return (
            <div className="flex items-center h-full px-2 text-sm">
                {roundDisplayName}
            </div>
        )
    }

    if (matches.length === 0) {
        return (
            <div className="flex items-center justify-center h-48">
                <span className="text-gray-400 text-base font-medium">
                    {t('competitions.errors.no_games_found')}
                </span>
            </div>

        )
    }

    const tableHeight = all ? "h-[90vh]" : "h-[90vh]";
    
    return (
        <div className={`rounded-md border my-2 overflow-x-auto ${tableHeight}`} >
            <AutoSizer>
                {({ height, width }) => (
                    <Table
                        key={JSON.stringify(matches.map(m => m.match.id + JSON.stringify(m.match)))}
                        width={Math.max(width, 750)}
                        height={height}
                        headerHeight={40}
                        rowHeight={40}
                        rowCount={matches.length}
                        rowGetter={({ index }) => matches[index]}
                        rowClassName={({ index }) =>
                            index !== -1 ? `border-b ${getRowClassName(matches[index])}` : "bg-gray-50"
                        }
                        headerClassName="bg-gray-50 font-semibold text-[10px] border-b"
                    >
                        <Column
                            label="Actions"
                            dataKey="actions"
                            headerClassName="text-center"
                            width={60}
                            flexGrow={0}
                            cellRenderer={actionsCellRenderer}
                        />

                        {all && (
                            <Column
                                label={t("admin.tournaments.matches.table.class")}
                                dataKey="group"
                                width={100}
                                flexGrow={0}
                                cellRenderer={groupCellRenderer}
                            />
                        )}

                        <Column
                            label={t("admin.tournaments.matches.table.table")}
                            dataKey="table"
                            headerClassName="text-center"
                            width={80}
                            flexGrow={0}
                            cellRenderer={tableCellRenderer}
                        />

                        <Column
                            label={t("admin.tournaments.matches.table.participant_1")}
                            dataKey="participant1"
                            width={100}
                            flexGrow={1}
                            cellRenderer={participant1CellRenderer}
                        />

                        <Column
                            label={t("admin.tournaments.matches.table.participant_1_score")}
                            dataKey="p1Score"
                            width={60}
                            flexGrow={0}
                            cellRenderer={participant1ScoreCellRenderer}
                        />

                        <Column
                            label=""
                            dataKey="actionsCenter"
                            width={80}
                            flexGrow={0}
                            cellRenderer={actionsCenterCellRenderer}
                        />

                        <Column
                            label={t("admin.tournaments.matches.table.participant_2_score")}
                            dataKey="p2Score"
                            width={60}
                            flexGrow={0}
                            cellRenderer={participant2ScoreCellRenderer}
                        />

                        <Column
                            label={t("admin.tournaments.matches.table.participant_2")}
                            dataKey="participant2"
                            width={100}
                            flexGrow={1}
                            cellRenderer={participant2CellRenderer}
                        />

                        <Column
                            label={t("admin.tournaments.matches.table.bracket")}
                            dataKey="bracket"
                            width={120}
                            flexGrow={0}
                            cellRenderer={bracketCellRenderer}
                        />

                        <Column
                            label={t("admin.tournaments.matches.table.round")}
                            dataKey="round"
                            width={100}
                            flexGrow={0}
                            cellRenderer={roundCellRenderer}
                        />
                    </Table>
                )}
            </AutoSizer>
        </div>
    )
}
