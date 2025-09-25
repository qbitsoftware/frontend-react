import { MatchWrapper, GroupType, MatchState } from "@/types/matches";
import { TournamentTableWithStages } from "@/queries/tables";
import { FilterOptions } from "@/routes/admin/tournaments/$tournamentid/-components/matches";

export interface FilterMatchesOptions {
  matchData: { data: { matches: MatchWrapper[] } } | undefined;
  filterValue: FilterOptions[];
  activeGroups?: string;
  searchQuery: string;
  tableMap: Map<number, TournamentTableWithStages>;
}

// ONGOING SORTING LOGIC
export const sortOngoingByTable = (matches: MatchWrapper[]) => {
  return matches.slice().sort((a, b) => {
    const tableStrA = a.match.extra_data?.table || "0";
    const tableStrB = b.match.extra_data?.table || "0";

    const tableA = Number(tableStrA);
    const tableB = Number(tableStrB);

    const numA = isNaN(tableA) ? 0 : tableA;
    const numB = isNaN(tableB) ? 0 : tableB;

    if (numA !== numB) {
      return numA - numB;
    }

    return a.match.id.localeCompare(b.match.id);
  });
};

// FINISHED MATCHES SORTING LOGIC
export const sortFinishedMatches = (matches: MatchWrapper[]) => {
  return matches.slice().sort((a, b) => {
    if (a.match.finish_date && b.match.finish_date) {
      return (
        new Date(b.match.finish_date).getTime() -
        new Date(a.match.finish_date).getTime()
      );
    }

    return 0;
  });
};

// UPCOMING MATCHES SORTING
export const sortIfTimetable = (
  matches: MatchWrapper[],
  tableMap: Map<number, TournamentTableWithStages>
) => {
  return matches.slice().sort((a, b) => {
    const tableA = tableMap.get(a.match.tournament_table_id);
    const tableB = tableMap.get(b.match.tournament_table_id);
    const isTimetableA = tableA?.group.time_table === true;
    const isTimetableB = tableB?.group.time_table === true;

    if (isTimetableA && isTimetableB) {
      return (
        new Date(a.match.start_date).getTime() -
        new Date(b.match.start_date).getTime()
      );
    }

    if (isTimetableA && !isTimetableB) return -1;
    if (!isTimetableA && isTimetableB) return 1;

    if (!isTimetableA && !isTimetableB) {
      const roundA = a.match.round || 0;
      const roundB = b.match.round || 0;

      if (roundA !== roundB) {
        return roundA - roundB;
      }

      if (a.match.type === "winner" && b.match.type === "loser") return -1;
      if (a.match.type === "loser" && b.match.type === "winner") return 1;

      const typeOrder = { winner: 1, loser: 2 };
      const orderA = typeOrder[a.match.type as keyof typeof typeOrder] || 3;
      const orderB = typeOrder[b.match.type as keyof typeof typeOrder] || 3;

      if (orderA !== orderB) {
        return orderA - orderB;
      }

      return a.match.id.localeCompare(b.match.id);
    }

    return 0;
  });
};

export const sortWithRoundRobinInterleave = (
  matches: MatchWrapper[],
  tableMap: Map<number, TournamentTableWithStages>
) => {
  const roundRobinMatches = matches.filter((match) => {
    const table = tableMap.get(match.match.tournament_table_id);
    const isRoundRobinMatchType = match.match.type === "roundrobin";
    const isRoundRobinTableType =
      table?.group.type === GroupType.ROUND_ROBIN ||
      table?.group.type === GroupType.ROUND_ROBIN_FULL_PLACEMENT ||
      table?.group.type === GroupType.CHAMPIONS_LEAGUE ||
      table?.group.type === GroupType.DYNAMIC;

    return isRoundRobinMatchType && isRoundRobinTableType;
  });

  const otherMatches = matches.filter((match) => {
    const table = tableMap.get(match.match.tournament_table_id);
    const isRoundRobinMatchType = match.match.type === "roundrobin";
    const isRoundRobinTableType =
      table?.group.type === GroupType.ROUND_ROBIN ||
      table?.group.type === GroupType.ROUND_ROBIN_FULL_PLACEMENT ||
      table?.group.type === GroupType.CHAMPIONS_LEAGUE ||
      table?.group.type === GroupType.DYNAMIC;

    return !(isRoundRobinMatchType && isRoundRobinTableType);
  });

  if (roundRobinMatches.length === 0) {
    return sortIfTimetable(matches, tableMap);
  }

  const groupedRR = new Map<string, MatchWrapper[]>();
  roundRobinMatches.forEach((match) => {
    const groupId = match.p1.group_id || match.p2.group_id || "default";
    if (!groupedRR.has(groupId)) {
      groupedRR.set(groupId, []);
    }
    groupedRR.get(groupId)!.push(match);
  });

  groupedRR.forEach((group) => {
    group.sort((a, b) => {
      return a.match.id.localeCompare(b.match.id);
    });
  });

  const interleavedRR: MatchWrapper[] = [];
  const groupKeys = Array.from(groupedRR.keys());
  const groupCounters = new Map(groupKeys.map((key) => [key, 0]));

  while (interleavedRR.length < roundRobinMatches.length) {
    for (const groupId of groupKeys) {
      const counter = groupCounters.get(groupId)!;
      const groupMatches = groupedRR.get(groupId)!;

      if (counter < groupMatches.length) {
        interleavedRR.push(groupMatches[counter]);
        groupCounters.set(groupId, counter + 1);
      }
    }
  }

  const sortedOthers = sortIfTimetable(otherMatches, tableMap);
  return [...interleavedRR, ...sortedOthers];
};

export const filterAndSortMatches = ({
  matchData,
  filterValue,
  activeGroups,
  searchQuery,
  tableMap,
}: FilterMatchesOptions): MatchWrapper[] => {
  if (!matchData) return [];

  const activeParticipantIds: string[] = [];

  matchData?.data?.matches.forEach((match) => {
    if (match.match.state === MatchState.ONGOING) {
      if (match.p1.id !== "") {
        activeParticipantIds.push(match.p1.id);
      }
      if (match.p2.id !== "") {
        activeParticipantIds.push(match.p2.id);
      }
    }
  });

  let filtered;
  if (filterValue.includes("all")) {
    filtered = matchData.data.matches || [];
  } else {
    filtered = matchData.data.matches.filter((match) =>
      filterValue.includes(match.match.state)
    );
  }

  if (activeGroups) {
    const activeGroupIds = activeGroups.split(",").map((id) => parseInt(id));
    if (activeGroupIds && activeGroupIds.length > 0) {
      activeGroupIds.map((id) => {
        const tt = tableMap.get(id);
        if (tt && tt.stages) {
          activeGroupIds.push(...tt.stages.map((stage) => stage.id));
        }
      });
    }
    filtered = filtered.filter((match) =>
      activeGroupIds.includes(match.match.tournament_table_id)
    );
  }

  let validMatches = filtered.filter(
    (match) => match.p1.id !== "" && match.p2.id !== ""
  );

  if (searchQuery.trim()) {
    const searchLower = searchQuery.toLowerCase().trim();
    validMatches = validMatches.filter((match) => {
      const p1NameLower = match.p1.name.toLowerCase();
      const p2NameLower = match.p2.name.toLowerCase();

      return (
        p1NameLower.includes(searchLower) || p2NameLower.includes(searchLower)
      );
    });
  }

  const ongoing = validMatches.filter(
    (m) => m.match.state === MatchState.ONGOING
  );
  const created = validMatches.filter(
    (m) => m.match.state === MatchState.CREATED
  );
  const finished = validMatches.filter(
    (m) => m.match.state === MatchState.FINISHED
  );

  const ongoingSorted = sortOngoingByTable(ongoing);
  const createdSorted = sortWithRoundRobinInterleave(created, tableMap);
  const finishedSorted = sortFinishedMatches(finished);

  return [...ongoingSorted, ...createdSorted, ...finishedSorted];
};
