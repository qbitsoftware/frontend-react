import { BRACKET_CONSTANTS, BracketType, EliminationBracket } from "@/types/brackets";
import { TournamentTable } from "@/types/groups";
import { MatchWrapper } from "@/types/matches";
import EliminationMatch from "./elimination-match";
import { organizeMatchesByRound, calculateConnectorHeight, calculateRoundGap } from "./utils/utils"
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface BracketProps {
    admin: boolean
    tournament_table: TournamentTable
    data: EliminationBracket;
    handleSelectMatch?: (match: MatchWrapper) => void
    hoveredPlayerId?: string | null
    onPlayerHover?: (playerId: string | null) => void
}

export const SingleElimination = ({
    admin = false,
    tournament_table,
    data,
    handleSelectMatch,
    hoveredPlayerId: externalHoveredPlayerId,
    onPlayerHover: externalOnPlayerHover
}: BracketProps) => {
    const matches = organizeMatchesByRound(data.matches);
    const [internalHoveredPlayerId, setInternalHoveredPlayerId] = useState<string | null>(null);
    const { t } = useTranslation();
    
    // Use external state if provided, otherwise fall back to internal state
    const hoveredPlayerId = externalHoveredPlayerId !== undefined ? externalHoveredPlayerId : internalHoveredPlayerId;
    const setHoveredPlayerId = externalOnPlayerHover || setInternalHoveredPlayerId;

    const shouldHighlightConnector = (match: typeof data.matches[0]) => {
        if (!hoveredPlayerId) return false;
        
        const isPlayerInCurrentMatch = match.participant_1.id === hoveredPlayerId || match.participant_2.id === hoveredPlayerId;
        
        if (!isPlayerInCurrentMatch) return false;
        
        // Highlight if player won this match and advances in the main bracket
        if (match.match.winner_id === hoveredPlayerId) {
            return true;
        }
        
        // Also highlight if player lost this match and falls to consolation bracket
        // This shows the connection point where they drop out of the main bracket
        if (match.match.winner_id && match.match.winner_id !== hoveredPlayerId) {
            // Player lost this match - check if they have a next_loser_bracket path
            return !!match.match.next_loser_bracket;
        }
        
        return false;
    };

    // Calculate round names based on bracket size
    const getRoundName = (roundIndex: number, totalRounds: number): string => {
        const roundsFromEnd = totalRounds - roundIndex - 1;
        
        switch (roundsFromEnd) {
            case 0:
                return t("competitions.timetable.final");
            case 1:
                return t("competitions.timetable.semifinal");
            case 2:
                return t("competitions.timetable.quarterfinal");
            case 3:
                return "ROUND OF 16";
            case 4:
                return "ROUND OF 32";
            case 5:
                return "ROUND OF 64";
            case 6:
                return "ROUND OF 128";
            case 7:
                return "ROUND OF 256";
            default: {
                const participantCount = Math.pow(2, roundsFromEnd + 1);
                return `Round of ${participantCount}`;
            }
        }
    };

    const totalRounds = Object.entries(matches).length;

    const isMainChampionshipBracket = (roundMatches: typeof data.matches, roundIndex: number) => {
        const hasChampionshipPath = roundMatches.some(match => {
            const bracket = match.match.bracket;
            
            if (!bracket) return true; 
            if (bracket === "1-1" || bracket === "1-2") return true; 
            if (bracket.endsWith("-1")) return true; 
            
            return false;
        });
        
        const isLastRound = roundIndex === Object.entries(matches).length - 1;
        if (isLastRound && hasChampionshipPath) {
            return true;
        }
        
        const hasNoPlacementMatches = roundMatches.every(match => {
            if (match.is_bronze_match) return false; // Bronze matches are not championship
            
            const bracket = match.match.bracket;
            if (bracket) {
                if (bracket.match(/^[3-9]+-[3-9]+$/)) return false; // 3-4, 5-6, 7-8, etc.
                if (bracket.includes("-") && !bracket.includes("1") && !bracket.includes("2")) return false;
            }
            
            return true;
        });
        
        return hasChampionshipPath && hasNoPlacementMatches;
    };

    const hasMainBracketRounds = Object.entries(matches).some(([, roundMatches], roundIndex) => 
        isMainChampionshipBracket(roundMatches, roundIndex)
    );

    return (
        <div className="flex flex-col h-full">
            {hasMainBracketRounds && (
            <div className="flex mb-8">
                {Object.entries(matches).map(([, roundMatches], roundIndex) => {
                    const isLastRound = roundIndex === Object.entries(matches).length - 1;
                        const isMainBracket = isMainChampionshipBracket(roundMatches, roundIndex);
                        
                    const headerWidth = !isLastRound || (isLastRound && roundMatches.length === 1) 
                        ? "w-[240px]" 
                        : "w-[240px]";
                    
                        if (!isMainBracket) {
                            return <div key={`spacer-${roundIndex}`} className={`${headerWidth} flex-shrink-0`}></div>;
                        }
                        
                    return (
                        <div key={`header-${roundIndex}`} className={`text-left ${headerWidth} flex-shrink-0`}>
                            <h3 className="text-lg font-black text-gray-700">
                                {getRoundName(roundIndex, totalRounds)}
                            </h3>
                        </div>
                    );
                })}
            </div>
            )}

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
        </div>
    );
};
