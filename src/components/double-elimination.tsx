import { BRACKET_CONSTANTS, BracketType, EliminationBracket } from "@/types/brackets";
import { TournamentTable } from "@/types/groups";
import { MatchWrapper } from "@/types/matches";
import EliminationMatch from "./elimination-match";
import { organizeMatchesByRound, calculateConnectorHeight, calculateRoundGap } from "./utils/utils"
import { cn } from "@/lib/utils";
import { useState } from "react";

interface BracketProps {
    admin: boolean
    tournament_table: TournamentTable
    data: EliminationBracket;
    handleSelectMatch?: (match: MatchWrapper) => void
    hoveredPlayerId?: string | null
    onPlayerHover?: (playerId: string | null) => void
}

export const DoubleElimination = ({
    admin = false,
    tournament_table,
    data,
    handleSelectMatch,
    hoveredPlayerId: externalHoveredPlayerId,
    onPlayerHover: externalOnPlayerHover
}: BracketProps) => {
    const matches = organizeMatchesByRound(data.matches);
    const [internalHoveredPlayerId, setInternalHoveredPlayerId] = useState<string | null>(null);

    // Use external state if provided, otherwise fall back to internal state
    const hoveredPlayerId = externalHoveredPlayerId !== undefined ? externalHoveredPlayerId : internalHoveredPlayerId;
    const setHoveredPlayerId = externalOnPlayerHover || setInternalHoveredPlayerId;

    const shouldHighlightConnector = (match: typeof data.matches[0]) => {
        if (!hoveredPlayerId) return false;

        const isPlayerInCurrentMatch = match.participant_1.id === hoveredPlayerId || match.participant_2.id === hoveredPlayerId;

        if (!isPlayerInCurrentMatch) return false;

        // Highlight if player won this match and advances
        if (match.match.winner_id === hoveredPlayerId) {
            return true;
        }

        // Also highlight if player lost this match but fell to this consolation bracket
        // This would show the path when a player drops from main bracket to consolation
        if (match.match.winner_id && match.match.winner_id !== hoveredPlayerId) {
            // Player lost this match - check if they have a next_loser_bracket path
            return !!match.match.next_loser_bracket;
        }

        return false;
    };

    return (
        <div className="flex h-full items-center">
            {Object.entries(matches).map(([round, roundMatches], roundIndex) => {
                const gap = calculateRoundGap(Number(round), matches, BracketType.MIINUSRING)
                const isLastRound = roundIndex === Object.entries(matches).length - 1;
                return (
                    <div className="flex h-full" key={`round-${round}`}>
                        {!isLastRound && Object.entries(matches).length > 1 ? (
                            <div key={round} className="h-full">
                                <div
                                    className={cn("flex flex-col h-full")}
                                    style={{ gap: `${gap}px` }}
                                >
                                    {roundMatches.map((match, key) => (
                                        <div key={key} className={`loser-bracket-match match-${match.match.readable_id}`}>
                                            <EliminationMatch
                                                admin={admin}
                                                handleSelectMatch={handleSelectMatch}
                                                tournamentTable={tournament_table}
                                                key={match.match.id}
                                                match={match}
                                                hoveredPlayerId={hoveredPlayerId}
                                                onPlayerHover={setHoveredPlayerId}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div
                                className={cn("relative")}
                                style={{ gap: `${gap}px` }}
                            >
                                {roundMatches.map((match, key) => {
                                    return (
                                        <div key={key} className={cn("absolute loser-bracket-match", `match-${match.match.readable_id}`, match.is_bronze_match ? 'top-[60px]' : '-translate-y-1/2')}>
                                            <EliminationMatch
                                                admin={admin}
                                                handleSelectMatch={handleSelectMatch}
                                                tournamentTable={tournament_table}
                                                key={match.match.id}
                                                match={match}
                                                hoveredPlayerId={hoveredPlayerId}
                                                onPlayerHover={setHoveredPlayerId}
                                            />
                                        </div>
                                    )
                                })}
                            </div>
                        )
                        }
                        {!isLastRound && (
                            <div
                                className="h-full flex flex-col items-start"
                                style={{ gap: `${BRACKET_CONSTANTS.CONNECTOR_SPACING}px` }}
                            >
                                {roundMatches.map((match, matchIndex) => {
                                    const isEven = matchIndex % 2 === 0;
                                    const connectorHeight = calculateConnectorHeight(gap);
                                    if (roundIndex % 2 != 0) {
                                        return (
                                            <div
                                                key={matchIndex}
                                                className={cn("flex flex-row items-center relative")}
                                                style={{
                                                    height: `${connectorHeight + BRACKET_CONSTANTS.BOX_HEIGHT - BRACKET_CONSTANTS.CONNECTOR_VERTICAL_OFFSET}px`,
                                                    marginTop: matchIndex > 0 && matchIndex % 2 === 0 ? `${gap}px` : undefined,
                                                }}
                                            >

                                                <div className={cn("py-[27px]", isEven ? 'self-start' : 'self-end')}>
                                                    <div className={cn("w-4 self-start loser-bracket-connector", isEven ? 'self-start' : 'self-end', shouldHighlightConnector(match) ? 'h-[2px] bg-blue-400' : 'h-[2px] bg-blue-200')} />
                                                </div>
                                                <div
                                                    className={cn(
                                                        !isEven ? "self-start" : "self-end",
                                                        "loser-bracket-connector",
                                                        shouldHighlightConnector(match) ? 'w-[2px] bg-blue-400' : 'w-[2px] bg-blue-200'
                                                    )}
                                                    style={{
                                                        height: connectorHeight - BRACKET_CONSTANTS.CONNECTOR_LINE_HEIGHT,
                                                    }}
                                                />
                                                <div className={cn("w-4 self-start loser-bracket-connector", isEven ? 'self-end' : 'self-start', shouldHighlightConnector(match) ? 'h-[2px] bg-blue-400' : 'h-[2px] bg-blue-200')} />
                                            </div>
                                        )
                                    } else {
                                        return (
                                            <div
                                                key={matchIndex}
                                                className={cn("flex flex-row items-center relative")}
                                                style={{
                                                    height: `${connectorHeight + BRACKET_CONSTANTS.BOX_HEIGHT - BRACKET_CONSTANTS.CONNECTOR_VERTICAL_OFFSET}px`,
                                                    marginTop: matchIndex > 0 && matchIndex % 2 === 0 ? `${gap}px` : undefined,
                                                }}
                                            >

                                                <div className={cn("py-[27px]", isEven ? 'self-start' : 'self-end')}>
                                                    <div className={cn("w-4 self-start loser-bracket-connector", isEven ? 'self-start' : 'self-end', shouldHighlightConnector(match) ? 'h-[2px] bg-blue-400' : 'h-[2px] bg-blue-200')} />
                                                </div>
                                                {roundIndex === Object.entries(matches).length - 2 && (
                                                    <>
                                                        <div
                                                            className={cn(
                                                                !isEven ? "self-start" : "self-end",
                                                                "loser-bracket-connector",
                                                                shouldHighlightConnector(match) ? 'w-[2px] bg-blue-400' : 'w-[2px] bg-blue-200'
                                                            )}
                                                            style={{
                                                                height: connectorHeight - BRACKET_CONSTANTS.CONNECTOR_LINE_HEIGHT,
                                                            }}
                                                        />
                                                        <div className={cn("w-4 self-start loser-bracket-connector", isEven ? 'self-end' : 'self-start', shouldHighlightConnector(match) ? 'h-[2px] bg-blue-400' : 'h-[2px] bg-blue-200')} />
                                                    </>
                                                )}

                                            </div>
                                        )
                                    }
                                })}
                            </div>
                        )
                        }
                    </div>
                );
            })}
        </div>
    );
};
