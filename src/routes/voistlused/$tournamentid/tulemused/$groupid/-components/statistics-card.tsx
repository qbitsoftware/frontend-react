import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn, formatDateGetDayMonth, formatDateGetHours } from '@/lib/utils'
import { Protocol } from '@/queries/match'
import Notes from '@/routes/voistlused/-components/notes'
import { useTranslation } from 'react-i18next'
import { useTournament } from '../../../-components/tournament-provider'
import { useParams } from '@tanstack/react-router'
import { getPlayerLabels } from '@/types/groups'

interface StatisticsProps {
    protocol: Protocol | undefined
    index: number
    onClose?: () => void
}

export const StatisticsCard = ({ protocol, index }: StatisticsProps) => {
    const { t } = useTranslation()
    const tt = useTournament()
    const params = useParams({ strict: false })

    const currentTable = tt.tournamentTables.find(t => t.group.id === Number(params.groupid))

    const labels = getPlayerLabels(currentTable?.group.dialog_type);

    if (protocol) {
        const match = protocol.match
        const parent_matches = protocol.parent_matches
        return (
            <Card key={index} className="w-full max-w-6xl mx-auto">
                <CardHeader className="pb-3">
                    <div className="flex flex-col gap-2 relative">
                        <div className="text-lg sm:text-xl font-semibold text-center flex items-center justify-center gap-3">
                            <div className="flex items-center text-gray-600">
                                <div className='w-3 h-3 bg-gray-600 rounded-full mr-2' />
                                <span className="text-base sm:text-lg">{match.p1.name}</span>
                            </div>
                            <div className="bg-gray-100 px-3 py-1 rounded-lg">
                                <span className="text-xl sm:text-2xl font-bold text-gray-900">
                                    {match.match.extra_data && match.match.extra_data.score && match.match.extra_data.score.length >= 1 ? match.match.extra_data.score[0].p1_score : '0'}
                                    -
                                    {match.match.extra_data && match.match.extra_data.score && match.match.extra_data.score.length >= 1 ? match.match.extra_data.score[0].p2_score : '0'}
                                </span>
                            </div>
                            <div className="flex items-center text-gray-600">
                                <span className="text-base sm:text-lg">{match.p2.name}</span>
                                <div className='w-3 h-3 bg-blue-600 rounded-full ml-2' />
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-1 sm:gap-4 text-xs text-muted-foreground">
                            <span>
                                {t("protocol.date")}: {match.match.start_date ? formatDateGetDayMonth(match.match.start_date) : 'Invalid date'}
                            </span>
                            <span>
                                {t("protocol.time")}: {match.match.start_date ? formatDateGetHours(match.match.start_date) : 'Invalid time'}
                            </span>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-0 flex flex-col">
                    {/* Mobile view */}
                    <div className="flex sm:hidden flex-col h-full">
                        {/* Scrollable matches */}
                        <div className="flex-1 space-y-3 overflow-y-auto min-h-0 mb-4">
                            {parent_matches.map((parent_match, index) => (
                                <div key={index} className="bg-gray-50 rounded-lg p-3 space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold text-sm">{t("protocol.table.game")} {index + 1}</span>
                                        <div className="text-base font-bold">
                                            {(() => {
                                                const matchesPlayed = parent_matches.slice(0, index + 1);
                                                const team1Wins = matchesPlayed.reduce((count, currMatch) =>
                                                    count + (currMatch.match.winner_id === currMatch.match.p1_id ? 1 : 0), 0);
                                                const team2Wins = matchesPlayed.reduce((count, currMatch) =>
                                                    count + (currMatch.match.winner_id === currMatch.match.p2_id ? 1 : 0), 0);
                                                return `${team1Wins} - ${team2Wins}`;
                                            })()}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className="space-y-1">
                                            <div className="font-medium">
                                                {labels.left[index] ? `${labels.left[index]}: ` : ""}
                                                {parent_match.p1.name}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="font-medium">
                                                {labels.right[index] ? `${labels.right[index]}: ` : ""}
                                                {parent_match.p2.name}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="flex gap-1 flex-wrap">
                                            {parent_match.match.extra_data.score && parent_match.match.extra_data.score.map((set, gameIndex) => {
                                                if (set.p1_score !== 0 || set.p2_score !== 0) {
                                                    if (!match.match.forfeit) {
                                                        return (
                                                            <span
                                                                key={gameIndex}
                                                                className={cn(
                                                                    "px-2 py-1 rounded text-xs font-medium",
                                                                    set.p1_score > set.p2_score ? "bg-gray-600 text-white" : "bg-blue-600 text-white"
                                                                )}
                                                            >
                                                                {set.p1_score} - {set.p2_score}
                                                            </span>
                                                        )
                                                    }
                                                }
                                                return null
                                            })}
                                        </div>
                                        <div className="text-xs text-gray-500 ">
                                            {parent_match.match.forfeit && parent_match.match.forfeit_type == "WO" ?
                                                (parent_match.match.winner_id === parent_match.match.p1_id ? "w" : "o") + " - " +
                                                (parent_match.match.winner_id === parent_match.match.p2_id ? "w" : "o")
                                                : parent_match.match.forfeit && parent_match.match.forfeit_type == "RET" ?
                                                    (parent_match.match.winner_id === parent_match.match.p1_id ? "w" : "RET") + " - " +
                                                    (parent_match.match.winner_id === parent_match.match.p2_id ? "w" : "RET")
                                                    : parent_match.match.forfeit && parent_match.match.forfeit_type == "DSQ" ?
                                                        (parent_match.match.winner_id === parent_match.match.p1_id ? "w" : "DQ") + " - " +
                                                        (parent_match.match.winner_id === parent_match.match.p2_id ? "w" : "DQ") :
                                                        (() => {
                                                            if (!parent_match.match.extra_data?.score || !Array.isArray(parent_match.match.extra_data.score)) {
                                                                return "0 - 0";
                                                            }
                                                            const p1Sets = parent_match.match.extra_data.score.reduce((count, set) =>
                                                                count + (set.p1_score > set.p2_score ? 1 : 0), 0);
                                                            const p2Sets = parent_match.match.extra_data.score.reduce((count, set) =>
                                                                count + (set.p2_score > set.p1_score ? 1 : 0), 0);
                                                            return `${p1Sets} - ${p2Sets}`;
                                                        })()
                                            }
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Notes and Referees - Fixed at bottom */}
                        <div className="border-t pt-3">
                            <Notes content={match.match.extra_data.notes} />
                            <div className='flex flex-col gap-1 text-xs text-gray-600 mt-2'>
                                <p><span className="font-medium">{t("protocol.table_referee")}: </span>{match.match.extra_data.table_referee}</p>
                                <p><span className="font-medium">{t("protocol.head_referee")}: </span>{match.match.extra_data.head_referee}</p>
                            </div>
                        </div>
                    </div>

                    {/* Desktop view */}
                    <div className="hidden sm:block overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="text-xs">
                                    <TableHead className="w-8 p-2">#</TableHead>
                                    <TableHead className="p-2">{match.p1.name}</TableHead>
                                    <TableHead className="p-2">{match.p2.name}</TableHead>
                                    <TableHead className="text-center p-2 min-w-[120px]">{t("protocol.table.sets")}</TableHead>
                                    <TableHead className="text-center p-2 w-16">{t("protocol.table.score")}</TableHead>
                                    <TableHead className="text-center p-2 w-16">{t("protocol.table.total")}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {parent_matches.map((parent_match, index) => (
                                    <TableRow key={index} className="text-xs">
                                        <TableCell className="p-2 font-medium">{index + 1}</TableCell>
                                        <TableCell className="p-2">
                                            <div className="truncate max-w-[200px]">
                                                {labels.left[index] ? `${labels.left[index]}: ` : ""}
                                                {parent_match.p1.name}
                                            </div>
                                        </TableCell>
                                        <TableCell className="p-2">
                                            <div className="truncate max-w-[200px]">
                                                {labels.right[index] ? `${labels.right[index]}: ` : ""}
                                                {parent_match.p2.name}
                                            </div>
                                        </TableCell>
                                        <TableCell className="p-2">
                                            <div className="flex flex-wrap gap-1">
                                                {parent_match.match.extra_data.score && parent_match.match.extra_data.score.map((set, gameIndex) => {
                                                    if (set.p1_score !== 0 || set.p2_score !== 0) {
                                                        if (!match.match.forfeit) {
                                                            return (
                                                                <span
                                                                    key={gameIndex}
                                                                    className={cn(
                                                                        "px-1.5 py-0.5 rounded text-xs font-medium min-w-[35px] text-center",
                                                                        set.p1_score > set.p2_score ? "bg-gray-600 text-white" : "bg-blue-600 text-white"
                                                                    )}
                                                                >
                                                                    {set.p1_score}-{set.p2_score}
                                                                </span>
                                                            )
                                                        }
                                                    }
                                                    return null
                                                })}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center p-2 font-medium">
                                            {parent_match.match.forfeit && parent_match.match.forfeit_type == "WO" ?
                                                (parent_match.match.winner_id === parent_match.match.p1_id ? "w" : "o") + "-" +
                                                (parent_match.match.winner_id === parent_match.match.p2_id ? "w" : "o")
                                                : parent_match.match.forfeit && parent_match.match.forfeit_type == "RET" ?
                                                    (parent_match.match.winner_id === parent_match.match.p1_id ? "w" : "RET") + "-" +
                                                    (parent_match.match.winner_id === parent_match.match.p2_id ? "w" : "RET")
                                                    : parent_match.match.forfeit && parent_match.match.forfeit_type == "DSQ" ?
                                                        (parent_match.match.winner_id === parent_match.match.p1_id ? "w" : "DQ") + "-" +
                                                        (parent_match.match.winner_id === parent_match.match.p2_id ? "w" : "DQ") :
                                                        (() => {
                                                            if (!parent_match.match.extra_data?.score || !Array.isArray(parent_match.match.extra_data.score)) {
                                                                return "0-0";
                                                            }
                                                            const p1Sets = parent_match.match.extra_data.score.reduce((count, set) =>
                                                                count + (set.p1_score > set.p2_score ? 1 : 0), 0);
                                                            const p2Sets = parent_match.match.extra_data.score.reduce((count, set) =>
                                                                count + (set.p2_score > set.p1_score ? 1 : 0), 0);
                                                            return `${p1Sets}-${p2Sets}`;
                                                        })()
                                            }
                                        </TableCell>
                                        <TableCell className="text-center p-2 font-semibold">
                                            {(() => {
                                                const matchesPlayed = parent_matches.slice(0, index + 1);
                                                const team1Wins = matchesPlayed.reduce((count, currMatch) => {
                                                    if (currMatch.match.winner_id === currMatch.match.p1_id) {
                                                        return count + 1;
                                                    }
                                                    return count;
                                                }, 0);
                                                const team2Wins = matchesPlayed.reduce((count, currMatch) => {
                                                    if (currMatch.match.winner_id === currMatch.match.p2_id) {
                                                        return count + 1;
                                                    }
                                                    return count;
                                                }, 0);
                                                return `${team1Wins}-${team2Wins}`;
                                            })()}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <div className='hidden sm:block'>
                        <Separator className='w-full mb-4 h-[1px] bg-black/10' />
                        <Notes content={match.match.extra_data.notes} />
                        <div className='flex flex-col sm:flex-row justify-between text-xs text-gray-600 py-3'>
                            <p><span className="font-medium">{t("protocol.table_referee")}: </span>{match.match.extra_data.table_referee}</p>
                            <p><span className="font-medium">{t("protocol.head_referee")}: </span>{match.match.extra_data.head_referee}</p>
                        </div>

                    </div>
                </CardContent>
            </Card>
        )
    }
}