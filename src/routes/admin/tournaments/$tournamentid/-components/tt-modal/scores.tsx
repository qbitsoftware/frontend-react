import { ScrollArea } from '@/components/ui/scroll-area'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useProtocolModal } from '@/providers/protocolProvider'
import { MatchSets } from '../match-sets'
import { generateMatchOrderLabels } from './utils'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import { useTournament } from '@/routes/voistlused/$tournamentid/-components/tournament-provider'
import { useMemo } from 'react'

const Scores = () => {
    const {
        match,
        childMatches,
        isLoading,
        playerCount,
        handleForfeitMatch
    } = useProtocolModal()


    const tt = useTournament()

    const currentTable = useMemo(() =>
        tt.tournamentTables.find(t => t.group.id === match.match.tournament_table_id),
        [tt.tournamentTables, match.match.tournament_table_id]
    );

    const order = useMemo(() =>
        generateMatchOrderLabels(playerCount, currentTable),
        [playerCount, currentTable]
    );

    const { t } = useTranslation()

    const maxSets = 5

    return (
        <ScrollArea className="flex-grow overflow-auto">
            <div className="p-3 md:p-4">
                {/* Team Score Summary */}
                <div className="flex justify-around items-center mb-4 px-1">
                    <div className="flex flex-col items-center">
                        <span className="text-sm font-medium">
                            {isLoading ? (
                                <div className="h-[20px] w-20 bg-gray-200 rounded animate-pulse"></div>
                            ) : (
                                match.p1.name
                            )}
                        </span>
                        <span className="text-2xl font-bold">
                            {isLoading ? (
                                <div className="h-[32px] w-8 bg-gray-200 rounded animate-pulse"></div>
                            ) : (
                                childMatches && childMatches.data && childMatches.data.matches
                                    ? childMatches.data.matches.reduce(
                                        (total, match) =>
                                            total +
                                            (match.match.winner_id === match.p1.id
                                                && match.match.winner_id != ""
                                                ? 1
                                                : 0),
                                        0
                                    )
                                    : 0
                            )}
                        </span>
                    </div>

                    <div className="text-center">
                        <span className="text-xl font-bold">VS</span>
                    </div>

                    <div className="flex flex-col items-center">
                        <span className="text-sm font-medium">
                            {isLoading ? (
                                <div className="h-[20px] w-20 bg-gray-200 rounded animate-pulse"></div>
                            ) : (
                                match.p2.name
                            )}
                        </span>
                        <span className="text-2xl font-bold">
                            {isLoading ? (
                                <div className="h-[32px] w-8 bg-gray-200 rounded animate-pulse"></div>
                            ) : (
                                childMatches && childMatches.data && childMatches.data.matches
                                    ? childMatches.data.matches.reduce(
                                        (total, match) =>
                                            total +
                                            (match.match.winner_id === match.p2.id &&
                                                match.match.winner_id != ""
                                                ? 1
                                                : 0),
                                        0
                                    )
                                    : 0
                            )}
                        </span>
                    </div>
                </div>

                <div className="overflow-auto border rounded-lg shadow-sm">
                    <Table
                        className="w-full overflow-auto"
                        style={{ minWidth: "500px" }}
                    >
                        <TableHeader>
                            <TableRow className="bg-gray-50 hover:bg-gray-50">
                                <TableHead className="text-xs font-medium p-2 text-left w-16">
                                    {t('protocol.table.game')}
                                </TableHead>
                                {Array.from({ length: maxSets }).map((_, idx) => (
                                    <TableHead key={idx} className="text-xs font-medium p-2 text-center w-12">
                                        {`S${idx + 1}`}
                                    </TableHead>
                                ))}
                                <TableHead className="text-xs font-medium p-2 text-center w-24">
                                    {t('protocol.actions.title')}
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                // Skeleton rows
                                Array.from({ length: 5 }).map((_, idx) => (
                                    <TableRow key={idx} className="hover:bg-gray-50">
                                        <TableCell className="text-xs font-medium p-2">
                                            <div className="h-[14px] w-8 bg-gray-200 rounded animate-pulse"></div>
                                        </TableCell>
                                        {Array.from({ length: maxSets }).map((_, setIdx) => (
                                            <TableCell key={setIdx} className="p-2 text-center">
                                                <div className="h-[20px] w-full bg-gray-200 rounded animate-pulse mx-auto"></div>
                                            </TableCell>
                                        ))}
                                        <TableCell className="p-2">
                                            <div className="h-6 w-full bg-gray-200 rounded animate-pulse text-xs px-2"></div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                childMatches &&
                                childMatches.data &&
                                childMatches.data.matches &&
                                childMatches.data.matches.map((player_match) => (
                                    <TableRow
                                        key={player_match.match.id}
                                        className="hover:bg-gray-50"
                                    >
                                        <TableCell className="text-xs font-medium p-2">
                                            {order[player_match.match.order - 1]}
                                        </TableCell>
                                        <MatchSets
                                            key={player_match.match.id}
                                            match={player_match}
                                        />
                                        <TableCell className="p-2">
                                            <Button
                                                onClick={() =>
                                                    handleForfeitMatch(player_match)
                                                }
                                                className="text-xs h-6 px-2 w-full"
                                                size="sm"
                                                variant="outline"
                                            >
                                                {t('protocol.table.forfeit')}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {match.match.winner_id && (
                    <div className="flex justify-center items-center gap-2 my-4 bg-green-50 p-2 rounded-md">
                        <span className="font-semibold text-sm">{t('protocol.winner')}:</span>
                        <span className="font-bold text-sm">
                            {match.match.winner_id === match.p1.id
                                ? match.p1.name
                                : match.p2.name}
                        </span>
                    </div>
                )}
            </div>
        </ScrollArea>
    )
}

export default Scores