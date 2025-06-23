import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn, formatDateGetDayMonthYear, formatDateGetHours } from "@/lib/utils";
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
import { GroupType, MatchState, MatchWrapper } from "@/types/matches";
import { TournamentTable } from "@/types/groups";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ProtocolModalProvider } from "@/providers/protocolProvider";
import { TableTennisProtocolModal } from "./tt-modal/tt-modal";
import MatchDialog from "@/components/match-dialog";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { AvatarFallback } from "@radix-ui/react-avatar";
import placeholderImg from "@/assets/placheolderImg.svg";
import { Skeleton } from "@/components/ui/skeleton";
import { Participant } from "@/types/participants";
import { TableNumberForm } from "./table-number-form";
import { ClipboardPenLine } from "lucide-react";

interface MatchesTableProps {
  data: MatchWrapper[] | [];
  all_matches: MatchWrapper[] | [];
  tournament_id: number;
  tournament_table: TournamentTable;
  player_count: number;
}

type FilterOptions = MatchState | "all";

export const MatchesTable: React.FC<MatchesTableProps> = ({
  data,
  tournament_id,
  tournament_table,
  player_count,
  all_matches,
}: MatchesTableProps) => {
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

    const validMatches = filtered.filter((match) => match.p1.id !== "" && match.p2.id !== "");

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


  const MatchPlayer = ({
    participant,
    match,
    isWinner,
  }: {
    participant: Participant;
    match: MatchWrapper;
    isWinner: boolean;
  }) => {
    if (!participant || participant.id === "") {
      return (
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-6" />
          </div>
          <div className="flex gap-3">
            <div className="flex gap-2">
              {Array(5)
                .fill(0)
                .map((_, index) => (
                  <div key={index} className="flex gap-2">
                    <Skeleton className="h-4 w-4" />
                  </div>
                ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={
                tournament_table.solo
                  ? participant.players[0]?.extra_data?.image_url
                  : participant.extra_data?.image_url
              }
              className="cursor-pointer object-cover"
            />
            <AvatarFallback>
              <img
                src={placeholderImg}
                className="rounded-full h-8 w-8"
                alt="Player"
              />
            </AvatarFallback>
          </Avatar>
          <p className={cn(isWinner ? "font-bold" : "", "md:w-32")}>
            {participant.name}
          </p>
          {match.match.state !== MatchState.CREATED && (
            <span className={cn(isWinner ? "font-bold" : "")}>
              {/* {match.p1.id === participant.id
                ? match.match.extra_data.team_1_total
                : match.match.extra_data.team_2_total} */}
              {match.p1.id === participant.id ?
                tournament_table.solo ? match.match.extra_data.score
                  && `${match.match.extra_data.score.reduce(
                    (total, set) => total + (set.p1_score > set.p2_score ? 1 : 0),
                    0
                  )}`
                  :
                  <>
                    {match.match.extra_data.team_1_total}
                  </>
                :
                tournament_table.solo ? match.match.extra_data.score
                  && `${match.match.extra_data.score.reduce(
                    (total, set) => total + (set.p1_score < set.p2_score ? 1 : 0),
                    0
                  )}`
                  :
                  <>
                    {match.match.extra_data.team_2_total}
                  </>
              }
            </span>
          )}
        </div>
        <div className="flex">
          <div className={cn(match.match.use_sets ? "hidden" : "flex gap-2")}>
            {match.match.state !== MatchState.CREATED
              && match.match.extra_data
              && match.match.extra_data.score
              && match.match.extra_data.score.map((set, index) => (
                <div key={index} className="flex gap-2 justify-end">
                  {match.p1.id === participant.id ? (
                    <p>{set.p1_score}</p>
                  ) : (
                    <p>{set.p2_score}</p>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>
    );
  };

  if (data.length > 0) {
    return (
      <Card className="w-full border-stone-100">
        <CardHeader className="flex flex-row w-full items-center justify-between space-y-0">
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

          {tournament_table.type === "champions_league" && (
            <div className="flex gap-1 border bg-[#FAFCFE] py-1 px-1 rounded-md">
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
          <div className="grid grid-cols-1 lg:grid-cols-2  gap-4">
            {filteredData.length > 0 ? (
              filteredData.map((match) => (
                <Card
                  key={match.match.id}
                  className={cn(
                    "w-full sm:w-full p-4 hover:shadow-md transition-shadow",
                    match.match.state === MatchState.ONGOING &&
                    "bg-green-50 border-green-200"
                  )}
                >
                  <div className="flex flex-col gap-1">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="">
                        <div className="flex flex-row items-center mb-2">
                          {match.match.state !== MatchState.FINISHED && (
                            <TableNumberForm
                              match={match.match}
                              brackets={false}
                              initialTableNumber={
                                match.match.extra_data &&
                                match.match.extra_data.table
                              }
                            />
                          )}
                        </div>

                        {tournament_table.type ===
                          GroupType.CHAMPIONS_LEAGUE && (
                            <p className="text-xs">
                              {formatDateGetDayMonthYear(match.match.start_date)}{" "}
                              -
                              <span className="font-bold">
                                {formatDateGetHours(match.match.start_date)}
                              </span>
                            </p>
                          )}
                        <p className="text-xs pt-1">{match.match.location}</p>
                      </div>
                      {match.match.state === MatchState.CREATED ? (
                        <div className="flex items-center">
                          <Skeleton className="h-8 w-12" />
                        </div>
                      ) : (
                        <p className="text-3xl">
                          {tournament_table.solo ? match.match.extra_data.score
                            ? `${match.match.extra_data.score.reduce(
                              (total, set) => total + (set.p1_score > set.p2_score ? 1 : 0),
                              0
                            )}:${match.match.extra_data.score.reduce(
                              (total, set) => total + (set.p2_score > set.p1_score ? 1 : 0),
                              0
                            )}`
                            : "0:0"
                            :
                            <>
                              {match.match.extra_data.team_1_total}:{match.match.extra_data.team_2_total}
                            </>
                          }
                        </p>
                      )}
                    </div>

                    <div
                      className="flex flex-col gap-2"
                      onClick={() => handleCardClick(match)}
                    >
                      <MatchPlayer
                        participant={match.p1}
                        match={match}
                        isWinner={match.match.winner_id === match.p1.id}
                      />
                      <MatchPlayer
                        participant={match.p2}
                        match={match}
                        isWinner={match.match.winner_id === match.p2.id}
                      />
                    </div>

                    <div className="mt-4">
                      {match.match.state !== MatchState.FINISHED ? (
                        <Button
                          variant="outline"
                          className="w-full"
                          disabled={match.p1.id === "" || match.p2.id === ""}
                          onClick={() => handleCardClick(match)}
                        >
                          <ClipboardPenLine />
                        </Button>
                      ) : (<div className="flex items-center justify-center text-xs">Match ended</div>)
                      }
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="col-span-full p-12 text-center">
                <p className="text-stone-500">
                  {t("admin.tournaments.groups.no_results")}
                </p>
              </div>
            )}
          </div>
          {selectedMatch && tournament_table.solo ? (
            <MatchDialog
              open={isOpen}
              onClose={() => setIsOpen(false)}
              match={selectedMatch}
              tournament_id={tournament_id}
            />
          ) : (
            selectedMatch &&
            !tournament_table.solo && (
              <ProtocolModalProvider
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                tournament_id={tournament_id}
                match={selectedMatch}
                player_count={player_count}
              >
                <TableTennisProtocolModal />
              </ProtocolModalProvider>
            )
          )}
        </CardContent>
        <ReGrouping
          tournament_id={tournament_id}
          isOpen={isRegroupingModalOpen}
          onClose={() => setIsRegroupingModalOpen(false)}
          state={initialTab}
        />
        <TimeEditingModal
          matches={all_matches}
          tournament_table_id={tournament_table.id}
          tournament_id={tournament_id}
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
