import ErrorPage from "@/components/error";
import { TournamentTableWithStages } from "@/queries/tables";
import {
  createFileRoute,
  useNavigate,
  useParams,
  useSearch,
} from "@tanstack/react-router";
import { CompactClassFilters } from "../../-components/compact-class-filters";
import { useEffect, useMemo, useState } from "react";
import { UseGetTournamentMatchesQuery } from "@/queries/match";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MatchesTable } from "../-components/matches-table";
import { GroupType, MatchState, MatchWrapper } from "@/types/matches";
import { Leagues } from "@/types/groups";
import MatchDialog from "@/components/match-dialog";
import { ProtocolModalProvider } from "@/providers/protocolProvider";
import { TableTennisProtocolModal } from "../-components/tt-modal/tt-modal";
import { FilterOptions } from "../-components/matches";
import { useTranslation } from "react-i18next";
import LoadingScreen from "@/routes/-components/loading-screen";
import PlacementCompletionModal from "../-components/placement-completion-modal";
import { useTournament } from "@/routes/voistlused/$tournamentid/-components/tournament-provider";
import { TournamentProgress } from "../-components/tournament-progress";
import { SearchInput } from "@/components/search-input";
import {
  filterAndSortMatches,
} from "@/lib/match-sorting";

export const Route = createFileRoute(
  "/admin/tournaments/$tournamentid/mangud/"
)({
  errorComponent: () => <ErrorPage />,
  component: RouteComponent,
  validateSearch: (search: {
    filter?: string;
    openMatch?: string;
    activeGroups?: string;
  }) => ({
    filter: search.filter,
    openMatch: search.openMatch,
    activeGroups: search.activeGroups,
  }),
});

function RouteComponent() {
  const navigate = useNavigate();

  const [activeParticipant, setActiveParticipant] = useState<string[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<MatchWrapper | null>(null);
  const [selectedTournamentTable, setSelectedTournamentTable] =
    useState<TournamentTableWithStages | null>(null);
  const [filterValue, setFilterValue] = useState<FilterOptions[]>(["all"]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const params = useParams({ from: "/admin/tournaments/$tournamentid" });
  const search = useSearch({
    from: "/admin/tournaments/$tournamentid/mangud/",
  });
  const { t } = useTranslation();
  const { data: matchData, isLoading: isLoadingMatches } =
    UseGetTournamentMatchesQuery(Number(params.tournamentid));
  const { tournamentTables } = useTournament();

  const tableMap = useMemo(() => {
    return new Map(tournamentTables.map((table) => [table.group.id, table]));
  }, [tournamentTables]);

  useEffect(() => {
    const urlFilterValue: FilterOptions[] = search.filter
      ? (search.filter.split(",") as FilterOptions[])
      : ["all"];
    setFilterValue(urlFilterValue);
  }, [search.filter]);

  useEffect(() => {
    if (search.openMatch && matchData) {
      const match = matchData.data?.matches.find(
        (m) => m.match.id === search.openMatch
      );
      if (match) {
        setSelectedMatch(match);
        setSelectedTournamentTable(
          tableMap.get(match.match.tournament_table_id) || null
        );
        setIsOpen(true);
      }
    } else {
      setIsOpen(false);
      setSelectedMatch(null);
      setSelectedTournamentTable(null);
    }
  }, [search.openMatch, matchData, tableMap]);

  const filteredData = useMemo(() => {
    const result = filterAndSortMatches({
      matchData,
      filterValue,
      activeGroups: search.activeGroups,
      searchQuery,
      tableMap,
    });

    const activeParticipantIds: string[] = [];
    if (matchData) {
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
    }
    setActiveParticipant(activeParticipantIds);

    return result;
  }, [matchData, filterValue, tableMap, search.activeGroups, searchQuery]);

  const handleCardClick = (match: MatchWrapper) => {
    navigate({
      to: "/admin/tournaments/$tournamentid/mangud",
      params: { tournamentid: params.tournamentid },
      search: {
        filter: search.filter,
        openMatch: match.match.id,
        activeGroups: search.activeGroups,
      },
      replace: true,
    });
  };

  const handleModalClose = () => {
    setIsOpen(false);
    navigate({
      to: "/admin/tournaments/$tournamentid/mangud",
      params: { tournamentid: params.tournamentid },
      search: {
        filter: search.filter,
        openMatch: undefined,
        activeGroups: search.activeGroups,
      },
      replace: true,
    });
  };

  const handleFilterChange = (value: FilterOptions) => {
    setFilterValue((prev) => {
      let next: FilterOptions[];
      if (value === "all") {
        next = ["all"];
      } else {
        const filtered = prev.filter((v) => v !== "all");
        if (filtered.includes(value)) {
          next =
            filtered.length === 1
              ? ["all"]
              : filtered.filter((v) => v !== value);
        } else {
          next = [...filtered, value];
        }
      }
      navigate({
        to: "/admin/tournaments/$tournamentid/mangud",
        params: { tournamentid: params.tournamentid },
        search: {
          openMatch: undefined,
          filter: next.join(","),
          activeGroups: search.activeGroups,
        },
        replace: true,
      });
      return next;
    });
  };

  if (isLoadingMatches) {
    return (
      <div className="flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>
        <CompactClassFilters
          availableTables={tournamentTables}
          activeGroupId={[0]}
        />
        <div className="flex-1 flex items-center justify-center">
          <LoadingScreen />
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>
      <CompactClassFilters
        availableTables={tournamentTables}
        activeGroupId={[0]}
      />

      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader>
          <div className="flex gap-2 flex-col">
            <TournamentProgress tournamentId={Number(params.tournamentid)} />
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <div className="flex flex-wrap gap-1 order-1 sm:order-1">
                <label className="flex items-center gap-1 px-1 py-0 text-xs font-normal">
                  <input
                    type="checkbox"
                    checked={filterValue.includes("all")}
                    onChange={() => handleFilterChange("all")}
                    className="w-3 h-3"
                  />
                  <span className="text-xs">
                    {t("admin.tournaments.filters.all_games")}
                  </span>
                </label>
                <label className="flex items-center gap-1 px-1 py-0 text-xs font-normal">
                  <input
                    type="checkbox"
                    checked={filterValue.includes(MatchState.FINISHED)}
                    onChange={() => handleFilterChange(MatchState.FINISHED)}
                    className="w-3 h-3"
                  />
                  <div className="w-2 h-2 rounded-full bg-gray-100 border border-gray-300"></div>
                  <span className="text-xs">
                    {t("admin.tournaments.filters.winner_declared")}
                  </span>
                </label>
                <label className="flex items-center gap-1 px-1 py-0 text-xs font-normal">
                  <input
                    type="checkbox"
                    checked={filterValue.includes(MatchState.ONGOING)}
                    onChange={() => handleFilterChange(MatchState.ONGOING)}
                    className="w-3 h-3"
                  />
                  <div className="w-2 h-2 rounded-full bg-green-100 border border-green-200"></div>
                  <span className="text-xs">
                    {t("admin.tournaments.filters.ongoing_games")}
                  </span>
                </label>
                <label className="flex items-center gap-1 px-1 py-0 text-xs font-normal">
                  <input
                    type="checkbox"
                    checked={filterValue.includes(MatchState.CREATED)}
                    onChange={() => handleFilterChange(MatchState.CREATED)}
                    className="w-3 h-3"
                  />
                  <div className="w-2 h-2 rounded-full bg-white border border-gray-300"></div>
                  <span className="text-xs">
                    {t("admin.tournaments.filters.upcoming_games")}
                  </span>
                </label>
              </div>
              <div className="flex-1 max-w-xs order-2 sm:order-2">
                <SearchInput
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  placeholder={t("admin.tournaments.filters.search")}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          <MatchesTable
            all_matches={matchData ? matchData.data.matches : []}
            matches={filteredData}
            handleRowClick={handleCardClick}
            tournament_id={Number(params.tournamentid)}
            tournament_table={tournamentTables}
            active_participant={activeParticipant}
            all={true}
          />
          {selectedMatch &&
          selectedTournamentTable &&
          (selectedTournamentTable.group.solo ||
            (!selectedTournamentTable.group.solo &&
              !Leagues.includes(selectedTournamentTable.group.dialog_type))) ? (
            <MatchDialog
              open={isOpen}
              onClose={handleModalClose}
              match={selectedMatch}
              tournamentId={Number(params.tournamentid)}
            />
          ) : (
            selectedMatch &&
            selectedTournamentTable &&
            (Leagues.includes(selectedTournamentTable.group.dialog_type) ||
              selectedTournamentTable.group.type ===
                GroupType.CHAMPIONS_LEAGUE) && (
              <ProtocolModalProvider
                isOpen={isOpen}
                onClose={handleModalClose}
                tournamentId={Number(params.tournamentid)}
                match={selectedMatch}
                playerCount={selectedTournamentTable.group.min_team_size || 1}
              >
                <TableTennisProtocolModal />
              </ProtocolModalProvider>
            )
          )}
        </CardContent>
        <PlacementCompletionModal
          matches={filteredData}
          isOpen={true}
          onClose={() => {}}
        />
      </Card>
    </div>
  );
}
