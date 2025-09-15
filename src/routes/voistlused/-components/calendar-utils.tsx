import { useEffect, useState } from "react";
import { QueryClient } from "@tanstack/react-query";
import { UseGetTournamentTables } from "@/queries/tables";
import i18n from "@/i18n";
import { Tournament } from "@/types/tournaments";
import { UseGetTournamentMatchesQuery } from "@/queries/match";

export const getDaysInMonth = (year: number) => {
  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  return [31, isLeapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
};

export const getTournamentColor = (id: number | string) => {
  const hash =
    typeof id === "string"
      ? id.split("").reduce((a, b) => {
        a = (a << 5) - a + b.charCodeAt(0);
        return a & a;
      }, 0)
      : id;

  // Base colors with matching saturation and lightness levels
  const hues = [
    210, // blue
    195, // teal
    170, // seafoam
    145, // emerald
    270, // purple
    290, // violet
    320, // magenta
    340, // rose
    355, // red
    220, // indigo
  ];

  // Choose a hue based on the hash
  const hueIndex = Math.abs(hash) % hues.length;
  const hue = hues[hueIndex];

  // Create 2-3 variations per hue by slightly adjusting the saturation/lightness
  const variations = [
    { s: 70, l: 50 }, // Very light, subtle
    { s: 70, l: 40 }, // Medium light
    { s: 80, l: 30 }, // Slightly more saturated
  ];

  // Select a variation based on further hash manipulation
  const variationIndex = Math.floor(Math.abs(hash / 11)) % variations.length;
  const { s, l } = variations[variationIndex];

  // For browsers that support HSL in background-color
  return `hsl(${hue}, ${s}%, ${l}%)`;
};

// Format date for display
export const formatDate = (year: number, month: number, day: number) => {
  const date = new Date(year, month, day);
  const locale = i18n.language
  return date.toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Format event dates as XX - XX (e.g., 06 - 08)
export const formatDateRange = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Get the day in Estonian timezone
  const startDay = new Intl.DateTimeFormat('et-EE', {
    day: 'numeric',
    timeZone: 'Europe/Tallinn'
  }).format(start);

  const endDay = new Intl.DateTimeFormat('et-EE', {
    day: 'numeric',
    timeZone: 'Europe/Tallinn'
  }).format(end);

  return `${startDay.padStart(2, "0")} - ${endDay.padStart(2, "0")}`;
};

export const getAbbreviatedMonth = (dateString: string) => {
  const date = new Date(dateString);

  // Get the month in Estonian timezone
  const monthIndex = new Intl.DateTimeFormat('et-EE', {
    month: 'numeric',
    timeZone: 'Europe/Tallinn'
  }).format(date);

  const abbreviations = [
    'Jan.',
    'Feb.',
    'Mar.',
    'Apr.',
    'May',
    'June',
    'July',
    'Aug.',
    'Sept.',
    'Oct.',
    'Nov.',
    'Dec.'
  ];

  return abbreviations[parseInt(monthIndex) - 1];
};

export interface ProcessedEvent {
  id: string | number;
  name: string;
  start_date: string;
  end_date: string;
  sport: string;
  category: string;
  color: string;
  isGameday?: boolean;
  parentTournamentId?: number;
  eventType?: string;
  class?: string;
  order?: number;
  round?: number;
}

export const useTournamentEvents = (
  tournaments: Tournament[],
  queryClient: QueryClient
): ProcessedEvent[] => {
  const [processedEvents, setProcessedEvents] = useState<ProcessedEvent[]>([]);

  useEffect(() => {
    const processEvents = async () => {
      if (!tournaments || tournaments.length === 0) {
        setProcessedEvents([]);
        return;
      }

      try {
        const tournamentTablePromises = tournaments.map(tournament =>
          queryClient.ensureQueryData(UseGetTournamentTables(Number(tournament.id)))
            .catch(error => {
              return { data: [], error };
            })
        );

        const allTournamentTables = await Promise.all(tournamentTablePromises);

        const meistrikad = tournaments.filter((tournament, index) => {
          void tournament;
          const groupData = allTournamentTables[index];
          if (!groupData || !groupData.data) return false;

          let counter = 0;
          groupData.data.forEach((group) => {
            if (group.type === "champions_league") counter++;
          });

          return counter === groupData.data.length;
        });

        const matchesPromises = meistrikad.map(tournament =>
          UseGetTournamentMatchesQuery(Number(tournament.id))
        );

        const allMatchesData = await Promise.all(matchesPromises);

        const events: ProcessedEvent[] = [];

        // Process regular tournaments
        tournaments.forEach((tournament, index) => {
          const groupData = allTournamentTables[index];

          if (!groupData || !groupData.data) {
            // Add tournament directly if no table data
            events.push({
              ...tournament,
              color: getTournamentColor(tournament.id),
            });
            return;
          }

          let counter = 0;
          groupData.data.forEach((group) => {
            if (group.type === "champions_league") counter++;
          });

          if (counter !== groupData.data.length) {
            // other tournaments - add directly
            events.push({
              ...tournament,
              color: getTournamentColor(tournament.id),
            });
          }
        });

        // Process championship tournaments with match data
        meistrikad.forEach((tournament, index) => {
          const matchesData = allMatchesData[index];

          if (matchesData && matchesData.data) {
            const uniqueGamedays = new Map<string, ProcessedEvent>();

            matchesData.data.data.matches.forEach((match) => {
              const matchDate = match.match.start_date
                ? new Date(match.match.start_date)
                : null;

              if (matchDate) {
                const dateKey = matchDate.toISOString().split("T")[0];

                if (!uniqueGamedays.has(dateKey)) {
                  uniqueGamedays.set(dateKey, {
                    id: `${tournament.id}-${dateKey}`,
                    name: `${tournament.name} - ${match.class}`,
                    start_date: dateKey,
                    end_date: dateKey,
                    sport: tournament.sport,
                    category: tournament.category,
                    class: match.class,
                    order: match.match.order,
                    round: match.match.round,
                    color: getTournamentColor(`${tournament.id}`),
                    isGameday: true,
                    eventType: match.match.type,
                    parentTournamentId: tournament.id,
                  });
                }
              }
            });

            // Add gamedays as separate events
            events.push(...Array.from(uniqueGamedays.values()));
          }
        });

        setProcessedEvents(events);
      } catch (error) {
        setProcessedEvents([]);
      }
    };

    processEvents();
  }, [tournaments, queryClient]);

  return processedEvents;
};