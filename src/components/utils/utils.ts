import { BracketType, TableMatch } from "@/types/brackets";
import { BRACKET_CONSTANTS } from "@/types/brackets";
import { Score } from "@/types/matches";

/**
 * Organizes tournament matches by their rounds
 * @param matches Array of all tournament matches
 * @returns Object with rounds as keys and arrays of matches as values
 */
export function organizeMatchesByRound(matches: TableMatch[]) {
  const matchesByRound: { [key: number]: TableMatch[] } = {};

  // Group matches by round
  for (let i = 0; i < matches.length; i++) {
    if (!matchesByRound[matches[i].match.round]) {
      matchesByRound[matches[i].match.round] = [];
    }
    matchesByRound[matches[i].match.round].push(matches[i]);
  }

  // Sort matches within each round by order
  for (const round in matchesByRound) {
    matchesByRound[round].sort((a, b) => (a.match.order || 0) - (b.match.order || 0));
  }

  return matchesByRound;
}

/**
 * Calculates the height of connector lines between bracket rounds
 * @param gap The gap size between matches
 * @returns Height of connector
 */
export function calculateConnectorHeight(gap: number) {
  return (gap / 2) + BRACKET_CONSTANTS.BOX_HEIGHT / 2;
}

/**
 * Calculate the gap between matches for a specific round
 * @param round The tournament round number
 * @param matches Object containing matches organized by round
 * @returns The calculated gap size for the round
 */
export function calculateRoundGap(
  round: number,
  matches: { [key: number]: TableMatch[] },
  bracketType: BracketType
): number {
  if (round === 0) {
    return BRACKET_CONSTANTS.INITIAL_GAP;
  }
  // Get previous round's gap
  const prevGap = calculateRoundGap(round - 1, matches, bracketType);
  // The vertical distance between the top of one match and the next in previous round:
  const prevBoxAndGap = BRACKET_CONSTANTS.BOX_HEIGHT + prevGap;
  // The gap between two matches in this round is the distance from the top of the first match
  // to the top of the second match in the previous round, which is (prevBoxAndGap * 2)
  // The new box will be centered between the two previous boxes, so the gap is:
  const shouldMultiply = (bracketType === "Plussring" || (bracketType === "Miinusring" && round % 2 == 0))

  return (shouldMultiply ? prevBoxAndGap * 2 : prevBoxAndGap) - BRACKET_CONSTANTS.BOX_HEIGHT;
}

/**
 * Calculate the height of connecting lines for a specific round
 * @param round The tournament round number
 * @param matches Object containing matches organized by round
 * @returns The calculated line height for the round
 */
export function calculateRoundLineHeight(
  round: number,
  matches: { [key: number]: TableMatch[] },
  bracketType: BracketType
) {
  return (2 ** (round))
    * (BRACKET_CONSTANTS.BOX_HEIGHT
      + BRACKET_CONSTANTS.INITIAL_GAP)
    - calculateConnectorHeight(calculateRoundGap(round, matches, bracketType));
}

/**
 * Extract match sets from match data
 * @param match The match to extract sets from
 * @returns Object containing sets won by each player/team
 */
export function extractMatchSets(match: TableMatch | undefined) {
  const score = match?.match?.extra_data?.score;
  const totals = match?.match?.extra_data;

  if (Array.isArray(score) && score.length > 0) {
    return score.reduce(
      (sets, { p1_score, p2_score }) => {
        if (p1_score >= 11 && p1_score - p2_score >= 2) {
          sets.p1_sets++;
        } else if (p2_score >= 11 && p2_score - p1_score >= 2) {
          sets.p2_sets++;
        }
        return sets;
      },
      { p1_sets: 0, p2_sets: 0 }
    );
  }

  return {
    p1_sets: totals?.team_1_total || 0,
    p2_sets: totals?.team_2_total || 0,
  };
}

export function extractSetsFromPoints(scores: { player1: number, player2: number }[] | undefined) {
  if (!scores) {
    return { p1_sets: 0, p2_sets: 0 };
  }
  return scores.reduce((acc, score) => {
    if (score.player1 >= 11 && score.player1 - score.player2 >= 2) {
      acc.p1_sets++;
    } else if (score.player2 >= 11 && score.player2 - score.player1 >= 2) {
      acc.p2_sets++;
    }
    return acc;
  }, { p1_sets: 0, p2_sets: 0 });
}
