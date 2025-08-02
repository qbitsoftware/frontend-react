import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ReGrouping from "./regrouping";
import TimeEditingModal from "./time-editing-modal";
import { useTranslation } from "react-i18next";
import { MatchState, MatchWrapper } from "@/types/matches";
import { DialogType, TournamentTable } from "@/types/groups";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ProtocolModalProvider } from "@/providers/protocolProvider";
import { TableTennisProtocolModal } from "./tt-modal/tt-modal";
import MatchDialog from "@/components/match-dialog";
import { MatchesTable } from "./matches-table";

interface MatchesProps {
  data: MatchWrapper[] | [];
  all_matches: MatchWrapper[] | [];
  tournament_id: number;
  tournament_table: TournamentTable;
  player_count: number;
  openMatchId?: string;
}

type FilterOptions = MatchState | "all";

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
  const [filterValue, setFilterValue] = useState<FilterOptions>("all");
  const [initialTab, setInitialTab] = useState<"regrouping" | "finals">(
    "regrouping"
  );
  const { t } = useTranslation();

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

  const filteredData = useMemo(() => {
    let filtered;

    switch (filterValue) {
      case MatchState.FINISHED:
        filtered = data.filter(
          (match) => match.match.state === MatchState.FINISHED
        );
        break;
      case MatchState.ONGOING:
        filtered = data.filter(
          (match) => match.match.state === MatchState.ONGOING
        );
        break;
      case MatchState.CREATED:
        filtered = data.filter(
          (match) => match.match.state === MatchState.CREATED
        );
        break;
      case "all":
      default:
        filtered = data;
    }

    const validMatches = filtered.filter(
      (match) => match.p1.id !== "" && match.p2.id !== ""
    );

    return validMatches.sort((a, b) => {
      const stateOrder = {
        [MatchState.ONGOING]: 0,
        [MatchState.CREATED]: 1,
        [MatchState.FINISHED]: 2,
      };

      return stateOrder[a.match.state] - stateOrder[b.match.state];
    });
  }, [data, filterValue]);

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
          <div className="flex items-center gap-2">
            <Select
              value={filterValue}
              onValueChange={(value: FilterOptions) => setFilterValue(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter matches" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("admin.tournaments.filters.all_games")}
                </SelectItem>
                <SelectItem value={MatchState.FINISHED}>
                  {t("admin.tournaments.filters.winner_declared")}
                </SelectItem>
                <SelectItem value={MatchState.ONGOING}>
                  {t("admin.tournaments.filters.ongoing_games")}
                </SelectItem>
                <SelectItem value={MatchState.CREATED}>
                  {t("admin.tournaments.filters.upcoming_games")}
                </SelectItem>
              </SelectContent>
            </Select>
            <h3 className="text-lg font-bold text-gray-900">
              <span className="font-light text-base">
                {t("admin.tournaments.groups.layout.games_title")}
              </span>{" "}
              {tournament_table.class}
            </h3>
            <div className="flex items-center gap-4 ml-6 text-xs text-gray-600">
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

          {tournament_table.type === "champions_league" && (
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
            group_id={tournament_table.id}
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
            tournament_table.dialog_type == DialogType.DT_TEAM_LEAGUES && (
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
