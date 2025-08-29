import ErrorPage from '@/components/error'
import { UseGetTournamentTablesQuery } from '@/queries/tables'
import { createFileRoute, useNavigate, useParams, useSearch } from '@tanstack/react-router'
import { CompactClassFilters } from '../../-components/compact-class-filters'
import { useEffect, useMemo, useState } from 'react'
import { UseGetTournamentMatchesQuery } from '@/queries/match'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { MatchesTable } from '../-components/matches-table'
import { GroupType, MatchState, MatchWrapper } from '@/types/matches'
import { DialogType, TournamentTable } from '@/types/groups'
import MatchDialog from '@/components/match-dialog'
import { ProtocolModalProvider } from '@/providers/protocolProvider'
import { TableTennisProtocolModal } from '../-components/tt-modal/tt-modal'
import { FilterOptions } from '../-components/matches'
import { useTranslation } from 'react-i18next'
import LoadingScreen from '@/routes/-components/loading-screen'
import { useNavigationHelper } from '@/providers/navigationProvider'

export const Route = createFileRoute(
  '/admin/tournaments/$tournamentid/mangud/',
)({
  errorComponent: () => <ErrorPage />,
  component: RouteComponent,
  validateSearch: (search: { filter?: string; openMatch?: string }) => ({
    filter: search.filter,
    openMatch: search.openMatch,
  })
})

function RouteComponent() {
  const navigate = useNavigate()

  const [activeParticipant, setActiveParticipant] = useState<string[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<MatchWrapper | null>(null);
  const [selectedTournamentTable, setSelectedTournamentTable] = useState<TournamentTable | null>(null);
  const [filterValue, setFilterValue] = useState<FilterOptions[]>(["all"]);
  const [isOpen, setIsOpen] = useState(false);
  const params = useParams({ from: "/admin/tournaments/$tournamentid" })
  const search = useSearch({ from: "/admin/tournaments/$tournamentid/mangud/" });
  const { data: tablesQuery, isLoading: isLoadingTables } = UseGetTournamentTablesQuery(Number(params.tournamentid))
  const { t } = useTranslation()
  const { groupId } = useNavigationHelper();
  const { data: matchData, isLoading: isLoadingMatches } = UseGetTournamentMatchesQuery(Number(params.tournamentid))

  const tableMap = useMemo(() => {
    return new Map(
      (tablesQuery?.data || []).map(table => [table.id, table])
    );
  }, [tablesQuery?.data]);

  useEffect(() => {
    const urlFilterValue: FilterOptions[] = search.filter
      ? search.filter.split(',') as FilterOptions[]
      : ["all"];
    setFilterValue(urlFilterValue);
  }, [search.filter]);

  const handleGroupChange = (newGroupId: number) => {
    navigate({
      to: "/admin/tournaments/$tournamentid/grupid/$groupid/mangud",
      params: {
        tournamentid: String(params.tournamentid),
        groupid: groupId ? String(groupId) : String(newGroupId),
      },
      search: {
        filter: filterValue.join(','),
        openMatch: undefined,
      },
      replace: true,
    });
  }

  useEffect(() => {
    const activeParticipantIds: string[] = [];

    matchData?.data?.forEach((match) => {
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
  }, [matchData?.data]);


  const filteredData = useMemo(() => {
    if (!matchData?.data) return [];

    let filtered;
    if (filterValue.includes("all")) {
      filtered = matchData.data || [];
    } else {
      filtered = matchData.data.filter(
        (match) => filterValue.includes(match.match.state)
      );
    }

    const validMatches = filtered.filter(
      (match) => match.p1.id !== "" && match.p2.id !== ""
    );

    const ongoing = validMatches.filter(m => m.match.state === MatchState.ONGOING);
    const created = validMatches.filter(m => m.match.state === MatchState.CREATED);
    const finished = validMatches.filter(m => m.match.state === MatchState.FINISHED);

    const sortIfTimetable = (matches: MatchWrapper[]) => {
      return matches.slice().sort((a, b) => {
        const tableA = tableMap.get(a.match.tournament_table_id);
        const tableB = tableMap.get(b.match.tournament_table_id);
        const isTimetableA = tableA?.time_table === true;
        const isTimetableB = tableB?.time_table === true;

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

    const ongoingSorted = sortIfTimetable(ongoing);
    const createdSorted = sortIfTimetable(created);
    const finishedSorted = sortIfTimetable(finished);

    return [...ongoingSorted, ...createdSorted, ...finishedSorted];
  }, [matchData, matchData?.data, filterValue, tableMap]);


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
        },
        replace: true,
      });
      return next;
    });
  };

  if (isLoadingTables) {
    return (
      <div className=''>
        <LoadingScreen />
      </div>
    )
  }

  if (isLoadingMatches) {
    return (
      <div className=''>
        < CompactClassFilters
          availableTables={tablesQuery?.data || []}
          activeGroupId={[0]}
          onGroupChange={handleGroupChange}
        />
        <LoadingScreen />
      </div>
    )
  }
  return (
    <div>
      < CompactClassFilters
        availableTables={tablesQuery?.data || []}
        activeGroupId={[0]}
        onGroupChange={handleGroupChange}
      />

      <Card>
        <CardHeader>
          <div className="flex gap-4 flex-col">
            {/* Compact filter checkboxes */}
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
                <span className="text-xs">{t("admin.tournaments.filters.winner_declared")}</span>
              </label>
              <label className="flex items-center gap-1 px-1 py-0 text-xs font-normal">
                <input
                  type="checkbox"
                  checked={filterValue.includes(MatchState.ONGOING)}
                  onChange={() => handleFilterChange(MatchState.ONGOING)}
                  className="w-3 h-3"
                />
                <span className="text-xs">{t("admin.tournaments.filters.ongoing_games")}</span>
              </label>
              <label className="flex items-center gap-1 px-1 py-0 text-xs font-normal">
                <input
                  type="checkbox"
                  checked={filterValue.includes(MatchState.CREATED)}
                  onChange={() => handleFilterChange(MatchState.CREATED)}
                  className="w-3 h-3"
                />
                <span className="text-xs">{t("admin.tournaments.filters.upcoming_games")}</span>
              </label>
            </div>
            <div>
              <div className="flex gap-4  text-xs text-gray-600">
                <div className="flex flex-col sm:flex-row">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-white border border-gray-300"></div>
                    <span>{t("admin.tournaments.matches.legend.upcoming")}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-100 border border-green-200"></div>
                    <span>{t("admin.tournaments.matches.legend.ongoing")}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-gray-100 border border-gray-300"></div>
                    <span>{t("admin.tournaments.matches.legend.finished")}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </CardHeader>
        <CardContent>
          <MatchesTable
            matches={filteredData}
            handleRowClick={handleCardClick}
            tournament_id={Number(params.tournamentid)}
            tournament_table={tablesQuery?.data || []}
            active_participant={activeParticipant}
            all={true}
          />
          {selectedMatch &&
            (selectedTournamentTable?.solo ||
              (!selectedTournamentTable?.solo &&
                selectedTournamentTable?.dialog_type != DialogType.DT_TEAM_LEAGUES)) ? (
            <MatchDialog
              open={isOpen}
              onClose={handleModalClose}
              match={selectedMatch}
              tournamentId={Number(params.tournamentid)}
            />
          ) : (
            selectedMatch &&
            (selectedTournamentTable?.dialog_type == DialogType.DT_TEAM_LEAGUES || selectedTournamentTable?.type === GroupType.CHAMPIONS_LEAGUE) && (
              <ProtocolModalProvider
                isOpen={isOpen}
                onClose={handleModalClose}
                tournamentId={Number(params.tournamentid)}
                match={selectedMatch}
                playerCount={selectedTournamentTable?.min_team_size || 1}
              >
                <TableTennisProtocolModal />
              </ProtocolModalProvider>
            )
          )}
        </CardContent>

      </Card>
    </div>
  )
}
