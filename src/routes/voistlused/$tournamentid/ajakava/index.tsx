import { UseGetTournamentMatches } from "@/queries/match";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { UseGetTournamentTables } from "@/queries/tables";
import ErrorPage from "@/components/error";
import { useTranslation } from "react-i18next";
import { ErrorResponse } from "@/types/errors";
import ITTFMatchComponent from "./-components/new-match-comp";
import { GroupType, MatchState, MatchWrapper } from "@/types/matches";
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

  const tableMap = useMemo(() => {
    const map = new Map();

    if (!tournamentTables?.data) return map;

    tournamentTables.data.forEach((table) => {
      // Add the main table
      map.set(table.id, table);

      // Add each stage if its id is not already in the map
      if (Array.isArray(table.stages)) {
        table.stages.forEach((stage) => {
          if (!map.has(stage.id)) {
            map.set(stage.id, stage);
          }
        });
      }
    });

    return map;
  }, [tournamentTables?.data]);

  // Memoize unique matches to avoid recalculation
  const safeMatches = useMemo(() => {
    if (!matchesData?.data || !Array.isArray(matchesData.data)) return [];
    return getUniqueMatches(matchesData.data);
  }, [matchesData?.data]);

  const classFilteredMatches = useMemo(() => {
    if (activeClass === "all") return safeMatches;

    // Find all table and stage IDs that match the activeClass
    const relevantTableIds = new Set<string | number>();
    if (tournamentTables?.data) {
      tournamentTables.data.forEach((table) => {
        if (table.class === activeClass) {
          relevantTableIds.add(table.id);
          if (Array.isArray(table.stages)) {
            table.stages.forEach((stage) => {
              relevantTableIds.add(stage.id);
            });
          }
        }
      });
    }

    // Filter matches whose tournament_table_id is in relevantTableIds
    return safeMatches.filter(
      (match) => relevantTableIds.has(match.match.tournament_table_id)
    );
  }, [safeMatches, activeClass, tournamentTables?.data]);

  // Memoize unique gamedays and classes
  const uniqueGamedays = useMemo(
    () => getUniqueGamedays(classFilteredMatches),
    [classFilteredMatches],
  );

  const uniqueClasses = useMemo(
    () => getUniqueClasses(tournamentTables?.data || []),
    [],
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

    matches = matches.filter((match) => {
      const hasPlayer1 = match.p1 && match.p1.id && match.p1.id !== "";
      const hasPlayer2 = match.p2 && match.p2.id && match.p2.id !== "";

      if (!hasPlayer1 || !hasPlayer2) {
        return false;
      }

      const isByeGame = match.p1?.name?.toLowerCase().includes("bye") ||
        match.p2?.name?.toLowerCase().includes("bye");

      return !isByeGame;
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

    const table = tournamentTables?.data?.find((tbl) => tbl.class === activeClass);

    if (table?.type === GroupType.CHAMPIONS_LEAGUE) {
      setActiveDay(bestDayIndex);
    } else {
      setActiveDay("all");
    }

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
    <div className="px-2 sm:px-4 lg:px-6">
      <h4 className="font-bold mb-3 sm:mb-4 md:mb-8 text-center md:text-left text-gray-700 text-lg sm:text-xl">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 my-4 sm:my-6">
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

