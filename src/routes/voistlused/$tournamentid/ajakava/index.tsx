import { UseGetTournamentMatches } from "@/queries/match";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { UseGetTournamentTables } from "@/queries/tables";
import ErrorPage from "@/components/error";
import { useTranslation } from "react-i18next";
import { ErrorResponse } from "@/types/errors";
import ITTFMatchComponent from "./-components/new-match-comp";
import { MatchState, MatchWrapper } from "@/types/matches";
import {
  filterMatchesByGameday,
  getUniqueClasses,
  getUniqueGamedays,
  getUniqueMatches,
} from "./-components/schedule-utils";
import { Filters } from "./-components/filters";

export const Route = createFileRoute("/voistlused/$tournamentid/ajakava/")({
  errorComponent: () => <ErrorPage />,
  loader: async ({ context: { queryClient }, params }) => {
    try {
      const matchesData = await queryClient.ensureQueryData(
        UseGetTournamentMatches(Number(params.tournamentid)),
      );
      const tournamentTables = await queryClient.ensureQueryData(
        UseGetTournamentTables(Number(params.tournamentid)),
      );

      return { matchesData, tournamentTables };
    } catch (error) {
      const err = error as ErrorResponse;
      if (err.response?.status === 404) {
        return { matchesData: null, tournamentTables: null };
      }
      throw error;
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { matchesData, tournamentTables } = Route.useLoaderData();
  const [activeDay, setActiveDay] = useState<number | string>("all");
  const [activeClass, setActiveClass] = useState<string>("all");
  const [activeStatus, setActiveStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { t } = useTranslation();
  const initialSetupDone = useRef(false);

  // Memoize table lookup map for O(1) access
  const tableMap = useMemo(() => {
    if (!tournamentTables?.data) return new Map();

    return new Map(tournamentTables.data.map((table) => [table.id, table]));
  }, [tournamentTables?.data]);

  // Memoize unique matches to avoid recalculation
  const safeMatches = useMemo(() => {
    if (!matchesData?.data || !Array.isArray(matchesData.data)) return [];
    return getUniqueMatches(matchesData.data);
  }, [matchesData?.data]);

  // Memoize class-filtered matches
  const classFilteredMatches = useMemo(() => {
    if (activeClass === "all") return safeMatches;
    return safeMatches.filter((match) => match.class === activeClass);
  }, [safeMatches, activeClass]);

  // Memoize unique gamedays and classes
  const uniqueGamedays = useMemo(
    () => getUniqueGamedays(classFilteredMatches),
    [classFilteredMatches],
  );

  const uniqueClasses = useMemo(
    () => getUniqueClasses(safeMatches),
    [safeMatches],
  );

  // Memoize filtered and sorted matches
  const { displayMatches, displayMatchCount } = useMemo(() => {
    // Filter by date/gameday
    let matches = classFilteredMatches;
    
    if (activeDay !== "all") {
      // If activeDay is a number, filter by that specific date
      if (typeof activeDay === "number" && activeDay >= 0 && activeDay < uniqueGamedays.length) {
        matches = filterMatchesByGameday(matches, uniqueGamedays[activeDay]);
      }
    }
    // If activeDay is "all", don't filter by date - show all matches

    // Filter out matches without any players
    matches = matches.filter((match) => {
      // Check if both players exist and have valid IDs
      const hasPlayer1 = match.p1 && match.p1.id && match.p1.id !== "";
      const hasPlayer2 = match.p2 && match.p2.id && match.p2.id !== "";

      // Only show matches that have at least one player assigned
      return hasPlayer1 || hasPlayer2;
    });

    // Filter by status
    if (activeStatus !== "all") {
      matches = matches.filter((match) => {
        const hasWinner = match.match.winner_id && match.match.winner_id !== "";
        const hasStarted = match.match.state === MatchState.ONGOING;

        switch (activeStatus) {
          case "finished":
            return hasWinner;
          case "ongoing":
            return hasStarted && !hasWinner;
          case "created":
            return !hasStarted && !hasWinner;
          default:
            return true;
        }
      });
    }

    // Sort matches by time, then by table, then by match number
    matches.sort((a, b) => {
      // Primary sort: by scheduled time
      if (a.match.start_date && b.match.start_date) {
        const timeA = new Date(a.match.start_date).getTime();
        const timeB = new Date(b.match.start_date).getTime();
        if (timeA !== timeB) return timeA - timeB;
      }

      return (a.match.order || 0) - (b.match.order || 0);
    });

    // Store count before search filter
    const matchesBeforeSearch = matches.length;

    // Apply search filter if needed
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      matches = matches.filter(
        (match) =>
          match.p1?.name?.toLowerCase().includes(term) ||
          match.p2?.name?.toLowerCase().includes(term),
      );
    }

    return {
      displayMatches: matches,
      displayMatchCount: searchTerm ? matches.length : matchesBeforeSearch,
    };
  }, [
    classFilteredMatches,
    uniqueGamedays,
    activeDay,
    searchTerm,
    activeStatus,
  ]);

  // Optimized table lookup function
  const getMatchTTTable = (match: MatchWrapper) => {
    if (!match.match.tournament_table_id) return null;
    return tableMap.get(match.match.tournament_table_id) || null;
  };

  // Initialize active day to the nearest upcoming gameday
  useEffect(() => {
    if (initialSetupDone.current || uniqueGamedays.length === 0) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find the nearest upcoming gameday within 7 days
    const lookAheadDays = 7;
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + lookAheadDays);

    let bestDayIndex = 0;
    let closestFutureDate: Date | null = null;

    uniqueGamedays.forEach((day, index) => {
      const gameDate = new Date(day);
      gameDate.setHours(0, 0, 0, 0);

      // Skip today
      if (gameDate.getTime() === today.getTime()) return;

      // If it's within the look-ahead period
      if (gameDate > today && gameDate <= maxDate) {
        if (!closestFutureDate || gameDate < closestFutureDate) {
          closestFutureDate = gameDate;
          bestDayIndex = index;
        }
      }
    });

    // If no date found within look-ahead, find the next future date
    if (!closestFutureDate) {
      uniqueGamedays.forEach((day, index) => {
        const gameDate = new Date(day);
        if (
          gameDate > today &&
          (!closestFutureDate || gameDate < closestFutureDate)
        ) {
          closestFutureDate = gameDate;
          bestDayIndex = index;
        }
      });
    }

    setActiveDay(bestDayIndex);
    initialSetupDone.current = true;
  }, [uniqueGamedays]);

  // Early return for no data
  if (!matchesData?.data || !Array.isArray(matchesData.data)) {
    return (
      <div className="p-6 text-center rounded-sm">
        <p className="text-stone-500">{t("competitions.errors.no_groups")}</p>
      </div>
    );
  }

  if (matchesData.data.length === 0) {
    return (
      <div className="p-6 text-center rounded-sm">
        <p className="text-stone-500">{t("competitions.errors.no_schedule")}</p>
      </div>
    );
  }

  return (
    <div className="">
      <h4 className="font-bold mb-4 md:mb-8 text-center md:text-left text-gray-700">
        {t("competitions.timetable.matches")}
      </h4>

      <Filters
        gamedays={uniqueGamedays}
        activeClass={activeClass}
        activeDay={activeDay}
        setActiveDay={setActiveDay}
        totalDays={uniqueGamedays.length || 1}
        classes={uniqueClasses}
        setActiveClass={setActiveClass}
        activeStatus={activeStatus}
        setActiveStatus={setActiveStatus}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filteredMatchCount={displayMatchCount}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-3 gap-y-4 md:gap-y-12 gap-x-4 my-6">
        {displayMatches.map((match, index) => (
          <ITTFMatchComponent
            key={`${match.match.id}-${index}`}
            match={match}
            table_data={getMatchTTTable(match)}
          />
        ))}
      </div>
    </div>
  );
}

