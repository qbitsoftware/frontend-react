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
}

export const SingleElimination = ({
    admin = false,
    tournament_table,
    data,
    handleSelectMatch
}: BracketProps) => {
    const matches = organizeMatchesByRound(data.matches);
    const [hoveredPlayerId, setHoveredPlayerId] = useState<string | null>(null);

    const shouldHighlightConnector = (match: typeof data.matches[0]) => {
        if (!hoveredPlayerId) return false;
        
        const isPlayerInCurrentMatch = match.participant_1.id === hoveredPlayerId || match.participant_2.id === hoveredPlayerId;
        
        if (!isPlayerInCurrentMatch) return false;
        
        // Check if the player won this match and would advance
        return match.match.winner_id === hoveredPlayerId;
    };

    return (
        <div className="flex h-full items-center">
            {Object.entries(matches).map(([round, roundMatches], roundIndex) => {
                const gap = calculateRoundGap(Number(round), matches, BracketType.PLUSSRRING)
                const isLastRound = roundIndex === Object.entries(matches).length - 1;
                return (
                    <div className="flex h-full" key={`round-${round}`}>
                        {!isLastRound || isLastRound && roundMatches.length == 1 ? (
                            <div key={round} className="h-full">
                                <div
                                    className={cn("flex flex-col h-full")}
                                    style={{ gap: `${gap}px` }}
                                >
                                    {roundMatches.map((match, key) => (
                                        <div key={key}>
                                            <EliminationMatch
                                                admin={admin}
                                                tournamentTable={tournament_table}
                                                key={match.match.id}
                                                match={match}
                                                handleSelectMatch={handleSelectMatch}
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
                                        <div
                                            key={key}
                                            className={cn("absolute", match.is_bronze_match ? 'top-[60px]' : '-translate-y-1/2')}>
                                            <EliminationMatch
                                                admin={admin}
                                                tournamentTable={tournament_table}
                                                key={match.match.id}
                                                match={match}
                                                handleSelectMatch={handleSelectMatch}
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

                                    return (
                                        <div key={matchIndex}
                                            className={cn("flex flex-row items-center relative")}
                                            style={{
                                                height: `${connectorHeight + BRACKET_CONSTANTS.BOX_HEIGHT - BRACKET_CONSTANTS.CONNECTOR_VERTICAL_OFFSET}px`,
                                                marginTop: matchIndex > 0 && matchIndex % 2 === 0 ? `${gap}px` : undefined,
                                            }}
                                        >
                                            <div className={cn("absolute text-[8px]", isEven ? 'top-4' : "bottom-7")}>{match.match.readable_id > 0 ? match.match.readable_id : ""}</div>
                                            <div className={cn("py-[27px]", isEven ? 'self-start' : 'self-end')}>
                                                <div className={cn("w-4 self-start", isEven ? 'self-start' : 'self-end', shouldHighlightConnector(match) ? 'h-[2px] bg-blue-400' : 'h-[2px] bg-blue-200')} />
                                            </div>
                                            <div
                                                className={cn(
                                                    !isEven ? "self-start" : "self-end",
                                                    shouldHighlightConnector(match) ? 'w-[2px] bg-blue-400' : 'w-[2px] bg-blue-200'
                                                )}
                                                style={{
                                                    height: connectorHeight - BRACKET_CONSTANTS.CONNECTOR_LINE_HEIGHT,
                                                }}
                                            />
                                            <div className={cn("w-4 self-start", isEven ? 'self-end' : 'self-start', shouldHighlightConnector(match) ? 'h-[2px] bg-blue-400' : 'h-[2px] bg-blue-200')} />
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
