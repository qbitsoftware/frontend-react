import i18n from '@/i18n';
import { TournamentTable } from '@/types/groups';
import { MatchWrapper } from '@/types/matches';

/**
 * Remove duplicate matches based on match ID
 */
export function getUniqueMatches(matches: MatchWrapper[]): MatchWrapper[] {
  const uniqueMatches = new Map<string, MatchWrapper>();

  matches.forEach(match => {
    if (match.match && match.match.id) {
      uniqueMatches.set(match.match.id, match);
    }
  });

  return Array.from(uniqueMatches.values());
}

/**
 * Extracts the date portion (YYYY-MM-DD) from a datetime string
 */
export function extractDateOnly(dateTimeStr: string | null | undefined): string {
  if (!dateTimeStr) return '';
  // Extract only the date part
  return dateTimeStr.split('T')[0] || dateTimeStr.substring(0, 10);
}

/**
 * Get unique gamedays from matches based on round and type
 * Returns an array of strings in YYYY-MM-DD format
 */
export function getUniqueGamedays(matches: MatchWrapper[]): string[] {
  // Extract dates from winner type matches with valid rounds
  // const winnerDates = matches
  //   .filter(match => match.match.type === "winner" && match.match.round)
  //   .map(match => extractDateOnly(match.match.start_date))
  //   .filter(Boolean);

  // // Extract dates from round type matches with valid rounds
  // const roundDates = matches
  //   .filter(match => match.match.type === "round" && match.match.round)
  //   .map(match => extractDateOnly(match.match.start_date))
  //   .filter(Boolean);

  // for all
  const dates = matches.filter(match => match.match.round).map(match => extractDateOnly(match.match.start_date)).filter(Boolean);

  // Combine both sets and remove duplicates
  // const allDates = [...winnerDates, ...roundDates];
  const allDates = [...dates]
  return [...new Set(allDates)].filter(Boolean).sort();
}

/**
 * Get a round identifier in the format "type-round" (e.g., "W-1" or "R-2")
 */
export function getRoundId(match: MatchWrapper): string {
  const prefix = match.match.type === "winner" ? "W-" : "R-";
  return prefix + match.match.round;
}

/**
 * Filter matches by gameday, comparing only the date portion (YYYY-MM-DD)
 */
export function filterMatchesByGameday(matches: MatchWrapper[], gameday: string): MatchWrapper[] {
  return matches.filter(match => {
    if (!match.match.start_date) return false;
    return extractDateOnly(match.match.start_date) === gameday;
  });
}

/**
 * Get unique classes from matches
 */
// export function getUniqueClasses(matches: MatchWrapper[]): string[] {
//   return [...new Set(
//     matches
//       .filter(match => match.class)
//       .map(match => match.class)
//   )]
//     .filter(Boolean)
//     .sort();
// }
export function getUniqueClasses(groups: TournamentTable[]): string[] {
  return [...new Set(
    groups
      .filter(group => group.class)
      .map(group => group.class)
  )]
    .filter(Boolean)
    .sort();
}

/**
 * Generate formatted date from a match date string
 */
export function getFormattedDate(dateString: string): string {
  if (!dateString) return 'TBD';
  const locale = i18n.language || 'en';

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch (error) {
    void error;
    console.error('Invalid date format:', dateString);
    return 'Invalid date';
  }
}

/**
 * Extract time (HH:MM) from a datetime string
 */
export function extractTimeOnly(dateTimeStr: string | null | undefined): string {
  if (!dateTimeStr) return '12:00';

  try {
    const date = new Date(dateTimeStr);
    if (isNaN(date.getTime())) return '12:00';

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  } catch (error) {
    void error;
    return '12:00';
  }
}

/**
 * Generate time slots for a specific gameday
 */
export function generateTimeSlotsForGameday(matches: MatchWrapper[]): {
  key: string;
  displayTime: string;
  timestamp: number;
}[] {
  if (!matches || matches.length === 0) return [];

  // Extract all start times
  const times = matches
    .filter(match => match.match && match.match.start_date)
    .map(match => {
      const date = new Date(match.match.start_date);
      return {
        hours: date.getHours(),
        minutes: date.getMinutes(),
        timestamp: date.getTime()
      };
    });

  // Create unique time slots
  const uniqueTimes = new Map();

  times.forEach(time => {
    const key = `${time.hours.toString().padStart(2, '0')}:${time.minutes.toString().padStart(2, '0')}`;
    uniqueTimes.set(key, {
      key,
      displayTime: key,
      timestamp: time.timestamp
    });
  });

  // Sort time slots by timestamp
  return Array.from(uniqueTimes.values()).sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * Get all unique table IDs from matches
 */
export function getUniqueTables(matches: MatchWrapper[]): string[] {
  const tables = matches
    .filter(match => match.match && match.match.extra_data && match.match.extra_data.table)
    .map(match => match.match.extra_data.table)
    .filter(Boolean);

  return [...new Set(tables)].sort((a, b) => Number(a) - Number(b));
}
//

/**
 * Distribute matches by table and time slot
 */
export function distributeMatchesByTable(
  matches: MatchWrapper[]
): Record<string, Record<string, MatchWrapper[]>> {
  const distribution: Record<string, Record<string, MatchWrapper[]>> = {};

  matches.forEach(match => {
    if (!match.match || !match.match.start_date || !match.match.extra_data || !match.match.extra_data.table) {
      return;
    }

    const tableId = match.match.extra_data.table;
    const date = new Date(match.match.start_date);
    const timeKey = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

    // Initialize table if needed
    if (!distribution[tableId]) {
      distribution[tableId] = {};
    }

    // Initialize time slot for table if needed
    if (!distribution[tableId][timeKey]) {
      distribution[tableId][timeKey] = [];
    }

    // Add match to appropriate slot
    distribution[tableId][timeKey].push(match);
  });

  return distribution;
}