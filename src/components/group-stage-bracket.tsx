import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { RoundRobinBracket, RoundRobins } from "@/types/brackets";
import { Button } from "./ui/button";
import { MatchWrapper } from "@/types/matches";
import { Printer } from "lucide-react";
import { TournamentTable } from "@/types/groups";
import { PDFPreviewModal } from "./pdf-preview-modal";

interface GroupStageBracketProps {
  brackets: RoundRobins;
  tournament_table: TournamentTable;
  onMatchSelect?: (match: MatchWrapper) => void;
  name: string;
}

export default function GroupStageBracket({
  brackets,
  onMatchSelect,
  tournament_table,
}: GroupStageBracketProps) {
  const { t } = useTranslation();
  const [showPreview, setShowPreview] = useState(false);
  const handlePrint = () => {
    setShowPreview(true);
  };

  if (!brackets.round_robin || !brackets.round_robin.length) {
    return (
      <div className="flex items-center justify-center h-64 w-full">
        <p className="text-lg font-medium text-gray-500">
          {t("competitions.errors.no_table")}
        </p>
      </div>
    );
  }

  // Get all round robin brackets
  const roundRobins = brackets.round_robin;

  const findMatches = (
    roundRobinBracket: RoundRobinBracket[],
    participant_1_id: string,
    participant_2_id: string
  ) => {
    const team1 = roundRobinBracket.find(
      (t) => t.participant.id === participant_1_id
    );
    const team2 = roundRobinBracket.find(
      (t) => t.participant.id === participant_2_id
    );

    if (!team1 || !team2 || !team1.matches) return [];

    return team1.matches
      .filter(
        (m) =>
          (m.match.p1_id === participant_1_id &&
            m.match.p2_id === participant_2_id) ||
          (m.match.p1_id === participant_2_id &&
            m.match.p2_id === participant_1_id)
      )
      .sort((a) => (a.match.round >= roundRobinBracket.length ? 1 : -1));
  };

  const handleMatchClick = (match: MatchWrapper | null): void => {
    if (onMatchSelect && match) {
      onMatchSelect(match);
    }
  };


  const renderMatchCell = (
    roundRobinBracket: RoundRobinBracket[],
    p1_id: string,
    p2_id: string
  ) => {
    const find_matches = findMatches(roundRobinBracket, p1_id, p2_id);

    return (
      <div className="flex flex-col items-center justify-center py-2">
        {[0].map((_, index) => (
          <div
            onClick={() =>
              find_matches[index] ? handleMatchClick(find_matches[index]) : null
            }
            key={index}
            className="flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 rounded-md p-1 transition-colors w-full"
          >
            {find_matches[index] ? (
              <>
                {find_matches[index].match.forfeit ? (
                  <>
                    <span className="font-bold text-xs sm:text-sm text-gray-700 mb-1">
                      {find_matches[index].match.winner_id === p1_id
                        ? 2
                        : find_matches[index].match.winner_id !== ""
                          ? 1
                          : 0}
                    </span>
                    <div className="flex items-center space-x-1 text-xs">
                      <span
                        className={`w-4 text-center ${find_matches[index].match.winner_id === p1_id ? "font-bold text-green-600" : "font-normal text-gray-500"}`}
                      >
                        w
                      </span>
                      <span className="text-gray-400">-</span>
                      <span
                        className={`w-4 text-center ${find_matches[index].match.winner_id !== p1_id && find_matches[index].match.winner_id !== "" ? "font-bold text-green-600" : "font-normal text-gray-500"}`}
                      >
                        o
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="font-bold text-xs sm:text-sm text-gray-700 mb-1">
                      {find_matches[index].match.winner_id === p1_id
                        ? 2
                        : find_matches[index].match.winner_id !== ""
                          ? 1
                          : 0}
                    </span>
                    <div className="flex items-center space-x-1 text-xs sm:text-sm">
                      <span className="w-4 text-center font-medium text-gray-700">
                        {find_matches[index].match.p1_id === p1_id
                          ? find_matches[index].match.extra_data.team_1_total
                          : find_matches[index].match.extra_data.team_2_total}
                      </span>
                      <span className="text-gray-400">-</span>
                      <span className="w-4 text-center font-medium text-gray-700">
                        {find_matches[index].match.p1_id === p1_id
                          ? find_matches[index].match.extra_data.team_2_total
                          : find_matches[index].match.extra_data.team_1_total}
                      </span>
                    </div>
                  </>
                )}
              </>
            ) : (
              <>
                <Skeleton className="h-3 w-6 mb-1 bg-gray-200" />
                <div className="flex items-center space-x-1">
                  <Skeleton className="h-3 w-4 bg-gray-200" />
                  <span className="text-gray-400">-</span>
                  <Skeleton className="h-3 w-4 bg-gray-200" />
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderGroupTable = (
    roundRobinBracket: RoundRobinBracket[],
    groupIndex: number
  ) => {
    const group_participant = roundRobinBracket.find(
      (bracket) => bracket.participant.group_id === ""
    );
    const group_name = group_participant
      ? group_participant.participant.name
      : `Group ${groupIndex + 1}`;
    return (

      <div
        key={groupIndex}
        id={`bracket-container-${groupIndex}`}
        className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 w-full max-w-6xl mx-auto overflow-hidden relative"
      >
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-300">
          <h3 className="text-lg font-semibold text-gray-900 text-center">{group_name}</h3>
        </div>
        <div className="overflow-x-auto">
          <Table className="table-auto min-w-max sm:min-w-full rounded-lg border-separate border-spacing-0">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[140px] min-w-[140px] text-center bg-gray-100 text-gray-900 font-bold text-sm border-r border-gray-400 border-b px-3">
                  {tournament_table.solo
                    ? t("competitions.results.solo_team")
                    : t("competitions.results.teams")}
                </TableHead>
                {roundRobinBracket.map((team, index) => {
                  if (team.participant.group_id === "") return null;
                  return (
                    <TableHead
                      key={index}
                      className="text-center bg-gray-100 text-gray-900 font-bold text-sm w-[100px] min-w-[100px] px-3 border-r border-gray-400 border-b"
                    >
                      <div className="whitespace-nowrap" title={team.participant.name}>
                        {team.participant.name || (
                          <Skeleton className="h-4 w-16 mx-auto bg-white/20" />
                        )}
                      </div>
                    </TableHead>
                  );
                })}
                <TableHead className="text-center bg-gray-100 text-gray-900 font-bold text-sm w-[90px] min-w-[90px] px-3 border-b border-gray-400">
                  {t("competitions.results.total_points")}
                </TableHead>

              </TableRow>
            </TableHeader>
            <TableBody>
              {(() => {
                return roundRobinBracket.map((team, rowIndex) => {
                  if (team.participant.group_id === "") return null;
                  return (
                    <TableRow
                      key={rowIndex}
                      className={cn(
                        "hover:bg-gray-50 transition-colors",
                        rowIndex % 2 === 0 ? "bg-gray-50/50" : "bg-white"
                      )}
                    >
                      <TableCell className="font-semibold text-center py-2 px-3 border-r border-b border-gray-200 w-[160px] min-w-[160px]">
                        <div className="whitespace-nowrap text-sm" title={team.participant.name}>
                          {team.participant.name || (
                            <Skeleton className="h-4 w-20 mx-auto" />
                          )}
                        </div>
                      </TableCell>
                      {roundRobinBracket.map((colTeam, colIndex) => {
                        if (colTeam.participant.group_id === "") return null;
                        return (
                          <TableCell
                            key={colIndex}
                            className={cn(
                              "text-center py-2 px-3 border-r  border-b border-gray-200 w-[100px] min-w-[100px]",
                              rowIndex === colIndex ? "bg-gray-50 border border-gray-300" : "hover:bg-gray-50"
                            )}
                          >
                            {rowIndex === colIndex ? (
                              <div className="w-full h-full flex items-center justify-center">
                                <img
                                  src="/ELTL_icon.png"
                                  alt="ELTL"
                                  className="w-12 h-8 opacity-100"
                                />
                              </div>
                            ) : (
                              renderMatchCell(
                                roundRobinBracket,
                                team.participant.id,
                                colTeam.participant.id
                              )
                            )}
                          </TableCell>
                        );
                      })}
                      <TableCell className="font-bold text-center py-2 px-3 border-b border-gray-200 bg-gray-50 text-gray-900 w-[90px] min-w-[90px]">
                        {team?.total_points !== undefined ? (
                          <span className="text-base">{team.total_points}</span>
                        ) : (
                          <Skeleton className="h-4 w-8 mx-auto" />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                });
              })()}
            </TableBody>
          </Table>
        </div>

      </div>
    );
  };

  return (
    <div className="w-full px-2 sm:px-4 lg:px-6">
      <div className="flex justify-end mb-6">
        <Button
          variant="outline"
          className="hidden sm:flex items-center gap-2 bg-white hover:bg-gray-50 border-gray-300"
          onClick={handlePrint}
        >
          <Printer className="h-4 w-4" />
          <span>{t("admin.tournaments.groups.tables.print")}</span>
        </Button>
      </div>

      <div id="all-brackets-container" className="w-full">
        {roundRobins
          .sort((a, b) => {
            const groupA = a.find(
              (bracket) => bracket.participant.group_id === ""
            );
            const groupB = b.find(
              (bracket) => bracket.participant.group_id === ""
            );

            const orderA = groupA?.participant.order ?? 0;
            const orderB = groupB?.participant.order ?? 0;

            return orderA - orderB;
          })
          .map((roundRobinBracket, index) =>
            renderGroupTable(roundRobinBracket, index)
          )}
      </div>

      <PDFPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        containerId="all-brackets-container"
        title={tournament_table ? `${tournament_table.class} Tournament` : "Tournament Bracket"}
      />
    </div>
  );
}
