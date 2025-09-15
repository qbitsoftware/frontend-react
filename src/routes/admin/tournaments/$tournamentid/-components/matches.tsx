import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import ReGrouping from "./regrouping";
import TimeEditingModal from "./time-editing-modal";
import { useTranslation } from "react-i18next";
import { GroupType, MatchState, MatchWrapper } from "@/types/matches";
import { DialogType, TournamentTable } from "@/types/groups";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ProtocolModalProvider } from "@/providers/protocolProvider";
import { TableTennisProtocolModal } from "./tt-modal/tt-modal";
import MatchDialog from "@/components/match-dialog";
import { MatchesTable } from "./matches-table";
import { useNavigate, useSearch } from "@tanstack/react-router";
import PlacementCompletionModal from "./placement-completion-modal";

interface MatchesProps {
  data: MatchWrapper[] | [];
  all_matches: MatchWrapper[] | [];
  tournament_id: number;
  tournament_table: TournamentTable;
  player_count: number;
  openMatchId?: string;
}

export type FilterOptions = MatchState | "all";

export const Matches: React.FC<MatchesProps> = ({
  data,
  tournament_id,
  tournament_table,
  player_count,
  all_matches,
  openMatchId,
}: MatchesProps) => {
  const [isRegroupingModalOpen, setIsRegroupingModalOpen] = useState(false);
  const [isTimeEditingModalOpen, setIsTimeEditingModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<MatchWrapper | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeParticipant, setActiveParticipant] = useState<string[]>([]);
  const search = useSearch({ from: "/admin/tournaments/$tournamentid/grupid/$groupid/mangud/" })

  // Change filterValue to array
  const [filterValue, setFilterValue] = useState<FilterOptions[]>(["all"]);
  const [initialTab, setInitialTab] = useState<"regrouping" | "finals">(
    "regrouping"
  );
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const activeParticipantIds: string[] = [];

    data.forEach((match) => {
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
  }, [data]);

  useEffect(() => {
    const urlFilterValue: FilterOptions[] = search.filter
      ? search.filter.split(',') as FilterOptions[]
      : ["all"];
    setFilterValue(urlFilterValue);
  }, [search.filter]);

  useEffect(() => {
    if (selectedMatch) {
      const updatedMatch = data.find(
        (match) => match.match.id === selectedMatch.match.id
      );
      if (updatedMatch) {
        setSelectedMatch(updatedMatch);
      }
    }
  }, [data]);

  useEffect(() => {
    if (openMatchId && data.length > 0) {
      const matchToOpen = data.find(match => match.match.id.toString() === openMatchId);
      if (matchToOpen) {
        setSelectedMatch(matchToOpen);
        setIsOpen(true);
      }
    }
  }, [openMatchId, data]);

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
        to: '/admin/tournaments/$tournamentid/grupid/$groupid/mangud',
        params: { tournamentid: String(tournament_id), groupid: String(tournament_table.id) },
        search: {
          openMatch: undefined,
          filter: next.join(","),
        },
        replace: true,
      });
      return next;
    });
  };

  const filteredData = useMemo(() => {
    let filtered;

    if (filterValue.includes("all")) {
      filtered = data;
    } else {
      filtered = data.filter(
        (match) => filterValue.includes(match.match.state)
      );
    }

    const validMatches = filtered.filter(
      (match) => match.p1.id !== "" && match.p2.id !== ""
    );


    // Sort by state order first
    const sortedByState = validMatches.sort((a, b) => {
      const stateOrder = {
        [MatchState.ONGOING]: 0,
        [MatchState.CREATED]: 1,
        [MatchState.FINISHED]: 2,
      };
      return stateOrder[a.match.state] - stateOrder[b.match.state];
    });

    // Apply sorting logic similar to the main tournament view
    const sortMatches = (matches: MatchWrapper[]) => {
      return matches.slice().sort((a, b) => {
        const isTimetableA = tournament_table.time_table === true;
        const isTimetableB = tournament_table.time_table === true;

        if (isTimetableA && isTimetableB) {
          return new Date(a.match.start_date).getTime() - new Date(b.match.start_date).getTime();
        }

        // Both matches are non-timetabled - sort by round and type
        if (!isTimetableA && !isTimetableB) {
          const roundA = a.match.round || 0;
          const roundB = b.match.round || 0;

          // Primary sort: by base round number
          if (roundA !== roundB) {
            return roundA - roundB;
          }

          // Secondary sort: by match type - "winner" above "loser" when rounds are equal
          if (a.match.type === "winner" && b.match.type === "loser") return -1;
          if (a.match.type === "loser" && b.match.type === "winner") return 1;

          // Tertiary sort: other types go after winner/loser
          const typeOrder = { "winner": 1, "loser": 2 };
          const orderA = typeOrder[a.match.type as keyof typeof typeOrder] || 3;
          const orderB = typeOrder[b.match.type as keyof typeof typeOrder] || 3;

          if (orderA !== orderB) {
            return orderA - orderB;
          }

          // Quaternary sort: stable sort by match ID to keep new matches at bottom within same tier
          // Higher IDs (newer matches) appear after lower IDs (older matches)
          return a.match.id.localeCompare(b.match.id);
        }

        return 0;
      });
    };

    const sortOngoingByTable = (matches: MatchWrapper[]) => {
      return matches.slice().sort((a, b) => {
        const tableStrA = a.match.extra_data?.table || "0";
        const tableStrB = b.match.extra_data?.table || "0";

        // Convert to numbers with explicit base 10
        const tableA = Number(tableStrA);
        const tableB = Number(tableStrB);

        // Ensure they're valid numbers
        const numA = isNaN(tableA) ? 0 : tableA;
        const numB = isNaN(tableB) ? 0 : tableB;

        if (numA !== numB) {
          return numA - numB;
        }


        return a.match.id.localeCompare(b.match.id);
      });
    };

    const ongoing = sortOngoingByTable(validMatches.filter(m => m.match.state === MatchState.ONGOING));
    const created = sortMatches(validMatches.filter(m => m.match.state === MatchState.CREATED));
    const finished = sortMatches(validMatches.filter(m => m.match.state === MatchState.FINISHED));

    // Return early for non-round-robin tournaments
    if (tournament_table.type !== GroupType.DYNAMIC && tournament_table.type !== GroupType.ROUND_ROBIN) {
      return [...ongoing, ...created, ...finished];
    }

    // If round-robin, apply additional sorting for participant spacing and group alternation
    if (tournament_table.type === GroupType.DYNAMIC || tournament_table.type === GroupType.ROUND_ROBIN) {
      const grouped = sortedByState.reduce((acc, match) => {
        const state = match.match.state;
        if (!acc[state]) acc[state] = [];
        acc[state].push(match);
        return acc;
      }, {} as Record<MatchState, MatchWrapper[]>);

      const sortRoundRobinMatches = (matches: MatchWrapper[]) => {
        if (matches.length <= 1) return matches;

        const result: MatchWrapper[] = [];
        const remaining = [...matches];
        const usedGroups = new Set<string>();

        while (remaining.length > 0) {
          let bestMatch: MatchWrapper | null = null;
          let bestIndex = -1;

          for (let i = 0; i < remaining.length; i++) {
            const match = remaining[i];
            const lastMatch = result[result.length - 1];

            // Check if this match can be placed next
            const canPlace = !lastMatch || (
              // No participant overlap with previous match
              match.p1.id !== lastMatch.p1.id &&
              match.p1.id !== lastMatch.p2.id &&
              match.p2.id !== lastMatch.p1.id &&
              match.p2.id !== lastMatch.p2.id &&
              // Different group from previous match (if groups exist)
              (!match.p1.group_id || !lastMatch.p1.group_id ||
                match.p1.group_id !== lastMatch.p1.group_id)
            );

            if (canPlace) {
              // Prefer matches from groups we haven't used recently
              if (!match.p1.group_id || !usedGroups.has(match.p1.group_id)) {
                bestMatch = match;
                bestIndex = i;
                break;
              } else if (!bestMatch) {
                bestMatch = match;
                bestIndex = i;
              }
            }
          }

          // If no ideal match found, take the first available
          if (!bestMatch) {
            bestMatch = remaining[0];
            bestIndex = 0;
          }

          result.push(bestMatch);
          remaining.splice(bestIndex, 1);

          // Track used group
          if (bestMatch.p1.group_id) {
            usedGroups.add(bestMatch.p1.group_id);
            // Clear used groups periodically to allow alternation
            if (usedGroups.size > 3) {
              usedGroups.clear();
            }
          }
        }

        return result;
      };

      // Apply round-robin sorting to each state group
      const finalResult: MatchWrapper[] = [];
      [MatchState.ONGOING, MatchState.CREATED, MatchState.FINISHED].forEach(state => {
        if (grouped[state] && state !== MatchState.ONGOING) {
          finalResult.push(...sortRoundRobinMatches(grouped[state]));
        } else if (grouped[state]) {
          finalResult.push(...sortOngoingByTable(grouped[state]));
        }
      });

      return finalResult;
    }

    return sortedByState;
  }, [data, filterValue, tournament_table]);

  const handleCardClick = (match: MatchWrapper) => {
    setSelectedMatch(match);
    setIsOpen(true);
  };

  const handleModalClose = () => {
    setIsOpen(false);
    if (openMatchId) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  };

  if (data.length > 0) {
    return (
      <Card className="w-full border-stone-100">
        <CardHeader className="flex flex-row w-full items-center justify-between space-y-0">
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
                <h3 className="text-lg font-bold text-gray-900">
                  <span className="font-light text-base">
                    {t("admin.tournaments.groups.layout.games_title")}
                  </span>{" "}
                  {tournament_table.class}
                </h3>
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

          {tournament_table.type === GroupType.CHAMPIONS_LEAGUE && (
            <div className="flex gap-1 border bg-[#FAFCFE] py-1 px-0 rounded-md">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setInitialTab("regrouping");
                  setIsRegroupingModalOpen(true);
                }}
              >
                {t("admin.tournaments.groups.regroup")}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setInitialTab("finals");
                  setIsRegroupingModalOpen(true);
                }}
              >
                {t("admin.tournaments.groups.finals")}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsTimeEditingModalOpen(true)}
              >
                {t("admin.tournaments.groups.change_time")}
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <MatchesTable
            matches={filteredData}
            handleRowClick={handleCardClick}
            tournament_id={tournament_id}
            tournament_table={[tournament_table]}
            active_participant={activeParticipant}
          />
          {selectedMatch &&
            (tournament_table.solo ||
              (!tournament_table.solo &&
                tournament_table.dialog_type != DialogType.DT_TEAM_LEAGUES)) ? (
            <MatchDialog
              open={isOpen}
              onClose={handleModalClose}
              match={selectedMatch}
              tournamentId={tournament_id}
            />
          ) : (
            selectedMatch &&
            (tournament_table.dialog_type == DialogType.DT_TEAM_LEAGUES || tournament_table.type === GroupType.CHAMPIONS_LEAGUE) && (
              <ProtocolModalProvider
                isOpen={isOpen}
                onClose={handleModalClose}
                tournamentId={tournament_id}
                match={selectedMatch}
                playerCount={player_count}
              >
                <TableTennisProtocolModal />
              </ProtocolModalProvider>
            )
          )}
        </CardContent>
        <ReGrouping
          tournamentId={tournament_id}
          isOpen={isRegroupingModalOpen}
          onClose={() => setIsRegroupingModalOpen(false)}
          state={initialTab}
        />
        <TimeEditingModal
          matches={all_matches}
          tournamentTableId={tournament_table.id}
          tournamentId={tournament_id}
          isOpen={isTimeEditingModalOpen}
          onClose={() => setIsTimeEditingModalOpen(false)}
        />
        <PlacementCompletionModal
          matches={data}
          isOpen={true}
          onClose={() => { }}
        />
      </Card>
    );
  } else {
    return (
      <div className="p-6 text-center rounded-sm">
        <p className="text-stone-500">{t("competitions.errors.no_games")}</p>
      </div>
    );
  }
};
