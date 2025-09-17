import ErrorPage from '@/components/error'
import { TournamentTableWithStages } from '@/queries/tables'
import { createFileRoute, useNavigate, useParams, useSearch } from '@tanstack/react-router'
import { CompactClassFilters } from '../../-components/compact-class-filters'
import { useEffect, useMemo, useState } from 'react'
import { UseGetTournamentMatchesQuery } from '@/queries/match'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { MatchesTable } from '../-components/matches-table'
import { GroupType, MatchState, MatchWrapper } from '@/types/matches'
import { DialogType } from '@/types/groups'
import MatchDialog from '@/components/match-dialog'
import { ProtocolModalProvider } from '@/providers/protocolProvider'
import { TableTennisProtocolModal } from '../-components/tt-modal/tt-modal'
import { FilterOptions } from '../-components/matches'
import { useTranslation } from 'react-i18next'
import LoadingScreen from '@/routes/-components/loading-screen'
import PlacementCompletionModal from '../-components/placement-completion-modal'
import { useTournament } from '@/routes/voistlused/$tournamentid/-components/tournament-provider'
import { TournamentProgress } from '../-components/tournament-progress'

export const Route = createFileRoute(
  '/admin/tournaments/$tournamentid/mangud/',
)({
  errorComponent: () => <ErrorPage />,
  component: RouteComponent,
  validateSearch: (search: { filter?: string; openMatch?: string, activeGroups?: string }) => ({
    filter: search.filter,
    openMatch: search.openMatch,
    activeGroups: search.activeGroups,
  })
})

function RouteComponent() {
  const navigate = useNavigate()

  const [activeParticipant, setActiveParticipant] = useState<string[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<MatchWrapper | null>(null);
  const [selectedTournamentTable, setSelectedTournamentTable] = useState<TournamentTableWithStages | null>(null);
  const [filterValue, setFilterValue] = useState<FilterOptions[]>(["all"]);
  const [isOpen, setIsOpen] = useState(false);
  const params = useParams({ from: "/admin/tournaments/$tournamentid" })
  const search = useSearch({ from: "/admin/tournaments/$tournamentid/mangud/" });
  // const { data: tablesQuery, isLoading: isLoadingTables } = UseGetTournamentTablesQuery(Number(params.tournamentid))
  const { t } = useTranslation()
  const { data: matchData, isLoading: isLoadingMatches } = UseGetTournamentMatchesQuery(Number(params.tournamentid))
  const { tournamentTables } = useTournament()

  const tableMap = useMemo(() => {
    return new Map(
      (tournamentTables).map(table => [table.group.id, table])
    );
  }, [tournamentTables]);

  useEffect(() => {
    const urlFilterValue: FilterOptions[] = search.filter
      ? search.filter.split(',') as FilterOptions[]
      : ["all"];
    setFilterValue(urlFilterValue);
  }, [search.filter]);


  const filteredData = useMemo(() => {
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

    setActiveParticipant(activeParticipantIds);

    // Filter by match state
    let filtered;
    if (filterValue.includes("all")) {
      filtered = matchData.data.matches || [];
    } else {
      filtered = matchData.data.matches.filter(
        (match) => filterValue.includes(match.match.state)
      );
    }

    // Filter by active groups if specified
    if (search.activeGroups) {
      const activeGroupIds = search.activeGroups.split(',').map(id => parseInt(id));
      if (activeGroupIds && activeGroupIds.length > 0) {
        activeGroupIds.map((id) => {
          const tt = tableMap.get(id)
          if (tt && tt.stages) {
            activeGroupIds.push(...tt.stages.map(stage => stage.id))
          }
        })
      }
      filtered = filtered.filter(match =>
        activeGroupIds.includes(match.match.tournament_table_id)
      );
    }

    const validMatches = filtered.filter(
      (match) => match.p1.id !== "" && match.p2.id !== ""
    );

    const ongoing = validMatches.filter(m => m.match.state === MatchState.ONGOING);
    const created = validMatches.filter(m => m.match.state === MatchState.CREATED);
    const finished = validMatches.filter(m => m.match.state === MatchState.FINISHED);

    const sortWithRoundRobinInterleave = (matches: MatchWrapper[]) => {
      // Separate round-robin matches based on both match type AND tournament table type
      const roundRobinMatches = matches.filter(match => {
        const table = tableMap.get(match.match.tournament_table_id);
        const isRoundRobinMatchType = match.match.type === "roundrobin";
        const isRoundRobinTableType = table?.group.type === GroupType.ROUND_ROBIN ||
          table?.group.type === GroupType.ROUND_ROBIN_FULL_PLACEMENT ||
          table?.group.type === GroupType.CHAMPIONS_LEAGUE ||
          table?.group.type === GroupType.DYNAMIC;

        return isRoundRobinMatchType && isRoundRobinTableType;
      });

      const otherMatches = matches.filter(match => {
        const table = tableMap.get(match.match.tournament_table_id);
        const isRoundRobinMatchType = match.match.type === "roundrobin";
        const isRoundRobinTableType = table?.group.type === GroupType.ROUND_ROBIN ||
          table?.group.type === GroupType.ROUND_ROBIN_FULL_PLACEMENT ||
          table?.group.type === GroupType.CHAMPIONS_LEAGUE ||
          table?.group.type === GroupType.DYNAMIC;

        return !(isRoundRobinMatchType && isRoundRobinTableType);
      });

      if (roundRobinMatches.length === 0) {
        return sortIfTimetable(matches);
      }

      const groupedRR = new Map<string, MatchWrapper[]>();
      roundRobinMatches.forEach(match => {
        const groupId = match.p1.group_id || match.p2.group_id || 'default';
        if (!groupedRR.has(groupId)) {
          groupedRR.set(groupId, []);
        }
        groupedRR.get(groupId)!.push(match);
      });

      groupedRR.forEach(group => {
        group.sort((a, b) => {
          return a.match.id.localeCompare(b.match.id);
        });
      });

      const interleavedRR: MatchWrapper[] = [];
      const groupKeys = Array.from(groupedRR.keys());
      const groupCounters = new Map(groupKeys.map(key => [key, 0]));

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

      // Combine with other matches sorted normally
      const sortedOthers = sortIfTimetable(otherMatches);
      return [...interleavedRR, ...sortedOthers];
    };

    const sortIfTimetable = (matches: MatchWrapper[]) => {
      return matches.slice().sort((a, b) => {
        const tableA = tableMap.get(a.match.tournament_table_id);
        const tableB = tableMap.get(b.match.tournament_table_id);
        const isTimetableA = tableA?.group.time_table === true;
        const isTimetableB = tableB?.group.time_table === true;

        if (isTimetableA && isTimetableB) {
          return new Date(a.match.start_date).getTime() - new Date(b.match.start_date).getTime();
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

          const typeOrder = { "winner": 1, "loser": 2 };
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

    const sortOngoingByTable = (matches: MatchWrapper[]) => {
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

    const ongoingSorted = sortOngoingByTable(ongoing);
    const createdSorted = sortWithRoundRobinInterleave(created);
    const finishedSorted = sortIfTimetable(finished);

    return [...ongoingSorted, ...createdSorted, ...finishedSorted];
  }, [matchData?.data, filterValue, tableMap, search.activeGroups]);


  const handleCardClick = (match: MatchWrapper) => {
    setSelectedMatch(match);
    setSelectedTournamentTable(tableMap.get(match.match.tournament_table_id) || null);
    setIsOpen(true);
  };

  const handleModalClose = () => {
    setIsOpen(false);
  };

  const handleFilterChange = (value: FilterOptions) => {
    setFilterValue(prev => {
      let next: FilterOptions[];
      if (value === "all") {
        next = ["all"];
      } else {
        const filtered = prev.filter(v => v !== "all");
        if (filtered.includes(value)) {
          next = filtered.length === 1 ? ["all"] : filtered.filter(v => v !== value);
        } else {
          next = [...filtered, value];
        }
      }
      navigate({
        to: '/admin/tournaments/$tournamentid/mangud',
        params: { tournamentid: params.tournamentid },
        search: {
          openMatch: undefined,
          filter: next.join(","),
          activeGroups: search.activeGroups
        },
        replace: true,
      });
      return next;
    });
  };


  if (isLoadingMatches) {
    return (
      <div className=''>
        < CompactClassFilters
          availableTables={tournamentTables}
          activeGroupId={[0]}
        />
        <LoadingScreen />
      </div>
    )
  }
  return (
    <div>
      < CompactClassFilters
        availableTables={tournamentTables}
        activeGroupId={[0]}
      />

      <Card>
        <CardHeader>
          <div className="flex gap-4 flex-col">
            <TournamentProgress tournamentId={Number(params.tournamentid)} />
            <div className="flex flex-col sm:flex-row">
              <label className="flex items-center gap-1 px-1 py-0 text-xs font-normal">
                <input
                  type="checkbox"
                  checked={filterValue.includes("all")}
                  onChange={() => handleFilterChange("all")}
                  className="w-3 h-3"
                />
                <span className="text-xs">{t("admin.tournaments.filters.all_games")}</span>
              </label>
              <label className="flex items-center gap-1 px-1 py-0 text-xs font-normal">
                <input
                  type="checkbox"
                  checked={filterValue.includes(MatchState.FINISHED)}
                  onChange={() => handleFilterChange(MatchState.FINISHED)}
                  className="w-3 h-3"
                />
                <div className="w-2 h-2 rounded-full bg-gray-100 border border-gray-300"></div>
                <span className="text-xs">{t("admin.tournaments.filters.winner_declared")}</span>
              </label>
              <label className="flex items-center gap-1 px-1 py-0 text-xs font-normal">
                <input
                  type="checkbox"
                  checked={filterValue.includes(MatchState.ONGOING)}
                  onChange={() => handleFilterChange(MatchState.ONGOING)}
                  className="w-3 h-3"
                />
                <div className="w-2 h-2 rounded-full bg-green-100 border border-green-200"></div>
                <span className="text-xs">{t("admin.tournaments.filters.ongoing_games")}</span>
              </label>
              <label className="flex items-center gap-1 px-1 py-0 text-xs font-normal">
                <input
                  type="checkbox"
                  checked={filterValue.includes(MatchState.CREATED)}
                  onChange={() => handleFilterChange(MatchState.CREATED)}
                  className="w-3 h-3"
                />
                <div className="w-2 h-2 rounded-full bg-white border border-gray-300"></div>
                <span className="text-xs">{t("admin.tournaments.filters.upcoming_games")}</span>
              </label>
            </div>
          </div>

        </CardHeader>
        <CardContent>
          <MatchesTable
            matches={filteredData}
            handleRowClick={handleCardClick}
            tournament_id={Number(params.tournamentid)}
            tournament_table={tournamentTables}
            active_participant={activeParticipant}
            all={true}
          />
          {selectedMatch &&
            (selectedTournamentTable?.group.solo ||
              (!selectedTournamentTable?.group.solo &&
                selectedTournamentTable?.group.dialog_type != DialogType.DT_TEAM_LEAGUES)) ? (
            <MatchDialog
              open={isOpen}
              onClose={handleModalClose}
              match={selectedMatch}
              tournamentId={Number(params.tournamentid)}
            />
          ) : (
            selectedMatch &&
            (selectedTournamentTable?.group.dialog_type == DialogType.DT_TEAM_LEAGUES || selectedTournamentTable?.group.type === GroupType.CHAMPIONS_LEAGUE) && (
              <ProtocolModalProvider
                isOpen={isOpen}
                onClose={handleModalClose}
                tournamentId={Number(params.tournamentid)}
                match={selectedMatch}
                playerCount={selectedTournamentTable?.group.min_team_size || 1}
              >
                <TableTennisProtocolModal />
              </ProtocolModalProvider>
            )
          )}
        </CardContent>
        <PlacementCompletionModal
          matches={filteredData}
          isOpen={true}
          onClose={() => { }}
        />
      </Card>
    </div>
  )
}
