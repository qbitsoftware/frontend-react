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

  const resolveTies = (teams: RoundRobinBracket[]): RoundRobinBracket[] => {
    const initialSort = [...teams].sort(
      (a, b) => (b.total_points || 0) - (a.total_points || 0)
    );

    const tiedGroups: RoundRobinBracket[][] = [];
    let currentGroup: RoundRobinBracket[] = [];
    let currentPoints: number | undefined = undefined;

    initialSort.forEach((team) => {
      if (team.participant.group_id === "") return;

      if (currentPoints === team.total_points) {
        currentGroup.push(team);
      } else {
        if (currentGroup.length > 1) {
          tiedGroups.push([...currentGroup]);
        }
        currentGroup = [team];
        currentPoints = team.total_points;
      }
    });

    if (currentGroup.length > 1) {
      tiedGroups.push([...currentGroup]);
    }

    tiedGroups.forEach((tiedTeams) => {
      resolveSpecificTie(tiedTeams);
    });

    return initialSort;
  };

  // Function to resolve ties between specific teams
  const resolveSpecificTie = (tiedTeams: RoundRobinBracket[]): void => {
    const teamsForfeitStatus = checkForfeitMatches(tiedTeams);
    if (teamsForfeitStatus.resolved) return;

    const headToHeadResults = compareHeadToHead(tiedTeams);
    if (headToHeadResults.resolved) return;

    // 3. For 3+ teams, compare sets and points in matches between tied teams
    // if (tiedTeams.length >= 3) {
    //     const setComparison = compareSets(tiedTeams);
    //     if (setComparison.resolved) return;

    //     const pointComparison = comparePoints(tiedTeams);
    //     if (pointComparison.resolved) return;
    // }

    // 4. Final resort: check cards
    // compareCards(tiedTeams);
  };

  const checkForfeitMatches = (tiedTeams: RoundRobinBracket[]) => {
    // Count forfeit losses per team
    const forfeitLossCount: Record<string, number> = {};

    // Initialize all teams with 0 forfeits
    tiedTeams.forEach((team) => {
      if (team.participant.id) {
        forfeitLossCount[team.participant.id] = 0;
      }
    });

    // Count forfeit losses in all matches between tied teams
    tiedTeams.forEach((team) => {
      if (!team.matches) return;

      team.matches.forEach((match) => {
        // Only consider matches between tied teams
        const isMatchBetweenTiedTeams =
          tiedTeams.some((t) => t.participant.id === match.match.p1_id) &&
          tiedTeams.some((t) => t.participant.id === match.match.p2_id);

        if (isMatchBetweenTiedTeams && match.match.forfeit) {
          // Increment forfeit count for the team that lost
          if (match.match.winner_id === match.p1.id) {
            // p2 forfeited
            forfeitLossCount[match.p2.id] =
              (forfeitLossCount[match.p2.id] || 0) + 1;
          } else if (match.match.winner_id === match.p2.id) {
            // p1 forfeited
            forfeitLossCount[match.p1.id] =
              (forfeitLossCount[match.p1.id] || 0) + 1;
          }
        }
      });
    });

    // Sort teams based on their forfeit count (fewer forfeits ranks higher)
    tiedTeams.sort((a, b) => {
      const aForfeits = forfeitLossCount[a.participant.id] || 0;
      const bForfeits = forfeitLossCount[b.participant.id] || 0;

      return aForfeits - bForfeits; // Ascending order (fewer forfeits = better rank)
    });

    // Check if the forfeits criterion resolved the tie
    // This is true if at least two teams have different forfeit counts
    const uniqueForfeitCounts = new Set(Object.values(forfeitLossCount));
    return {
      resolved: uniqueForfeitCounts.size > 1,
      forfeitCounts: forfeitLossCount, // Optionally return this for debugging
    };
  };

  // const checkForfeitMatches = (tiedTeams: RoundRobinBracket[]) => {
  //     const forfeitTeams: Record<string, boolean> = {};

  //     tiedTeams.forEach(team => {
  //         if (!team.matches) return;

  //         team.matches.forEach(match => {
  //             if (match.match.forfeit) {
  //                 if (match.match.winner_id === match.p1.id) {
  //                     forfeitTeams[match.p2.id] = true;
  //                 } else {
  //                     forfeitTeams[match.p1.id] = true;
  //                 }
  //             }
  //         });
  //     });

  //     tiedTeams.sort((a, b) => {
  //         const aForfeited = forfeitTeams[a.participant.id] || false;
  //         const bForfeited = forfeitTeams[b.participant.id] || false;

  //         if (aForfeited && !bForfeited) return 1;
  //         if (!aForfeited && bForfeited) return -1;
  //         return 0;
  //     });

  //     return { resolved: Object.keys(forfeitTeams).length > 0 };
  // };

  const compareHeadToHead = (tiedTeams: RoundRobinBracket[]) => {
    if (tiedTeams.length !== 2) return { resolved: false };

    const teamA = tiedTeams[0];
    const teamB = tiedTeams[1];

    // Find matches between these two teams
    const matches = teamA.matches?.filter(
      (m) =>
        (m.match.p1_id === teamA.participant.id &&
          m.match.p2_id === teamB.participant.id) ||
        (m.match.p1_id === teamB.participant.id &&
          m.match.p2_id === teamA.participant.id)
    );

    if (!matches || matches.length === 0) return { resolved: false };

    let teamAWins = 0;
    let teamBWins = 0;

    matches.forEach((match) => {
      if (match.match.winner_id === teamA.participant.id) {
        teamAWins++;
      } else if (match.match.winner_id === teamB.participant.id) {
        teamBWins++;
      }
    });

    if (teamAWins > teamBWins) {
      // Team A wins the tiebreaker, already in correct order
      return { resolved: true };
    } else if (teamBWins > teamAWins) {
      // Team B wins the tiebreaker, swap positions
      [tiedTeams[0], tiedTeams[1]] = [tiedTeams[1], tiedTeams[0]];
      return { resolved: true };
    }

    return { resolved: false };
  };

  // Additional comparison functions would be implemented here
  // compareSets, comparePoints, compareCards...

  const renderMatchCell = (
    roundRobinBracket: RoundRobinBracket[],
    p1_id: string,
    p2_id: string
  ) => {
    const find_matches = findMatches(roundRobinBracket, p1_id, p2_id);

    return (
      <div className=" flex flex-col space-y-2">
        {[0].map((_, index) => (
          <div
            onClick={() =>
              find_matches[index] ? handleMatchClick(find_matches[index]) : null
            }
            key={index}
            className=" flex flex-col items-center justify-center cursor-pointer"
          >
            {find_matches[index] ? (
              <>
                {find_matches[index].match.forfeit ? (
                  <>
                    <span className="font-bold text-sm text-blue-600">
                      {find_matches[index].match.winner_id === p1_id
                        ? 2
                        : find_matches[index].match.winner_id !== ""
                          ? 1
                          : 0}
                    </span>
                    <div className="flex items-center space-x-1">
                      <p
                        className={`w-6 text-center ${find_matches[index].match.winner_id === p1_id ? "font-bold" : "font-normal"}`}
                      >
                        w
                      </p>
                      <span className="text-gray-500">-</span>
                      <p
                        className={`w-6 text-center ${find_matches[index].match.winner_id !== p1_id && find_matches[index].match.winner_id !== "" ? "font-bold" : "font-normal"}`}
                      >
                        o
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="font-bold text-sm text-blue-600">
                      {find_matches[index].match.winner_id === p1_id
                        ? 2
                        : find_matches[index].match.winner_id !== ""
                          ? 1
                          : 0}
                    </span>
                    <div className="flex items-center space-x-1">
                      <p className="w-6 text-center font-medium">
                        {find_matches[index].match.p1_id === p1_id
                          ? find_matches[index].match.extra_data.team_1_total
                          : find_matches[index].match.extra_data.team_2_total}
                      </p>
                      <span className="text-gray-500">-</span>
                      <p className="w-6 text-center font-medium">
                        {find_matches[index].match.p1_id === p1_id
                          ? find_matches[index].match.extra_data.team_2_total
                          : find_matches[index].match.extra_data.team_1_total}
                      </p>
                    </div>
                  </>
                )}
              </>
            ) : (
              <>
                <Skeleton className="h-4 w-8 mb-1" />
                <div className="flex items-center space-x-1">
                  <Skeleton className="h-4 w-6" />
                  <span>-</span>
                  <Skeleton className="h-4 w-6" />
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
        className="flex items-center pb-10 pt-5 mx-auto flex-col w-[70vw] overflow-x-auto px-4 rounded-lg"
      >
   
        <h3 className="font-bold mb-4">{group_name}</h3>
        <Table className="table-fixed min-w-max rounded-lg">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px] text-center bg-gray-600 text-primary-foreground">
                {tournament_table.solo
                  ? t("competitions.results.solo_team")
                  : t("competitions.results.teams")}
              </TableHead>
              {roundRobinBracket.map((team, index) => {
                if (team.participant.group_id === "") return null;
                return (
                  <TableHead
                    key={index}
                    className=" text-center bg-primary text-primary-foreground"
                  >
                    {team.participant.name || (
                      <Skeleton className="h-6 w-20 mx-auto" />
                    )}
                  </TableHead>
                );
              })}
              <TableHead className=" text-center bg-gray-600 text-primary-foreground">
                {t("competitions.results.total_points")}
              </TableHead>

              <TableHead className="text-center bg-gray-600 text-primary-foreground">
                {t("competitions.results.placement")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(() => {
              //if we have a tie

              // 1. check all the matches and if you have forfeit lose, and other team doesn't then you automatically lose
              // 2. check the game between the two teams and determine winner that way. with 3 and more teams its again their matches and sets and if sets are equal then check points
              // 3. if all else fails then check red or yellow cards, if those are also equal then we are fcked

              const sortedTeams = resolveTies(
                roundRobinBracket.filter((t) => t.participant.group_id !== "")
              );

              const rankMap: Record<string, number> = {};
              sortedTeams.forEach((team, index) => {
                if (team.participant.id) {
                  rankMap[team.participant.id] = index + 1;
                }
              });

              return roundRobinBracket.map((team, rowIndex) => {
                if (team.participant.group_id === "") return null;
                return (
                  <TableRow
                    key={rowIndex}
                    className={cn(
                      rowIndex % 2 === 0 ? "bg-secondary/20" : "bg-background"
                    )}
                  >
                    <TableCell className="font-medium border text-center">
                      {team.participant.name || (
                        <Skeleton className="h-6 w-20 mx-auto" />
                      )}
                    </TableCell>
                    {roundRobinBracket.map((colTeam, colIndex) => {
                      if (colTeam.participant.group_id === "") return null;
                      return (
                        <TableCell
                          key={colIndex}
                          className={cn(
                            "border",
                            rowIndex === colIndex ? "bg-gray-200" : ""
                          )}
                        >
                          {rowIndex === colIndex ? (
                            <div className="w-full h-full flex items-center justify-center p-2">
                              <img
                                src="/RLogo.png"
                                alt="Logo"
                                className="max-w-full max-h-full object-contain opacity-70"
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
                    <TableCell className="font-bold border text-center bg-secondary/30">
                      {team?.total_points !== undefined ? (
                        team.total_points
                      ) : (
                        <Skeleton className="h-6 w-12 mx-auto" />
                      )}
                    </TableCell>
                    <TableCell className="font-bold border text-center bg-secondary/30">
                      {team?.total_points !== undefined ? (
                        rankMap[team.participant.id]
                      ) : (
                        <Skeleton className="h-6 w-12 mx-auto" />
                      )}
                    </TableCell>
                  </TableRow>
                );
              });
            })()}
          </TableBody>
        </Table>

      </div>
    );
  };

  return (
    <div className="container mx-auto">
      <div className="flex justify-end mb-4">
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={handlePrint}
        >
          <Printer className="h-4 w-4" />
          <span>{t("admin.tournaments.groups.tables.print")}</span>
        </Button>
      </div>
      
      <div id="all-brackets-container">
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
