import { type TFunction } from "i18next"

export const getClosestPowerOf2 = (num: number): number => {
    if (num <= 4) return 4;
    return Math.pow(2, Math.ceil(Math.log2(num)));
};

export const getRoundDisplayName = (
    matchType: string,
    round: number,
    bracket: string | undefined,
    nextLoserBracket: string | undefined,
    groupSize: number,
    t: TFunction
): string => {
    const roundNumber = getClosestPowerOf2(groupSize || 0) / Math.pow(2, round - 1);
    
    if (matchType === "winner") {
        return roundNumber > 8
            ? `R${roundNumber}`
            : roundNumber === 8
                ? t("admin.tournaments.matches.table.quarterfinal")
                : roundNumber === 4
                    ? t("admin.tournaments.matches.table.semifinal")
                    : roundNumber === 2
                        ? (bracket === '1-2'
                            ? t("admin.tournaments.matches.table.final")
                            : bracket === '3-4'
                                ? '3-4'
                                : t("admin.tournaments.matches.table.final"))
                        : roundNumber.toString();
    } else if (matchType === "loser") {
        return `-> ${nextLoserBracket}`;
    } else if (matchType === "bracket") {
        return bracket || "-";
    }
    
    return round.toString();
};
