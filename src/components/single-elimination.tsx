import { BRACKET_CONSTANTS, BracketType, EliminationBracket } from "@/types/brackets";
import { TournamentTable } from "@/types/groups";
import { MatchWrapper } from "@/types/matches";
import EliminationMatch from "./elimination-match";
import { organizeMatchesByRound, calculateConnectorHeight, calculateRoundGap } from "./utils/utils"
import { cn } from "@/lib/utils";

interface BracketProps {
    tournament_table: TournamentTable
    data: EliminationBracket;
    handleSelectMatch?: (match: MatchWrapper) => void
}

export const SingleElimination = ({
    tournament_table,
    data,
    handleSelectMatch
}: BracketProps) => {
    const matches = organizeMatchesByRound(data.matches);

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
                                                tournamentTable={tournament_table}
                                                key={match.match.id}
                                                match={match}
                                                handleSelectMatch={handleSelectMatch}
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
                                                tournamentTable={tournament_table}
                                                key={match.match.id}
                                                match={match}
                                                handleSelectMatch={handleSelectMatch}
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
                                                <div className={cn("w-4 h-[1px] bg-gray-500 self-start", isEven ? 'self-start' : 'self-end')} />
                                            </div>
                                            <div
                                                className={cn(
                                                    "w-[1px] bg-gray-500",
                                                    !isEven ? "self-start" : "self-end"
                                                )}
                                                style={{
                                                    height: connectorHeight - BRACKET_CONSTANTS.CONNECTOR_LINE_HEIGHT,
                                                }}
                                            />
                                            <div className={cn("w-4 h-[1px] bg-gray-500 self-start", isEven ? 'self-end' : 'self-start')} />
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