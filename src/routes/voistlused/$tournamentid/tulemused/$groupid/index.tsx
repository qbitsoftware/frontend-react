import { useState, useEffect } from "react";
import ErrorPage from "@/components/error";
import GroupBracket from "@/components/group-bracket";
import { Window } from "@/components/window";
import { UseGetBracket } from "@/queries/brackets";
import { UseGetTournamentTable } from "@/queries/tables";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatisticsCard } from "./-components/protocol";
import { GroupStatisticsCard } from "./-components/group-stage-protocol";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";
import GroupStageBracket from "@/components/group-stage-bracket";
import { MatchWrapper } from "@/types/matches";
import StandingsProtocol from "./-components/standings-protocol";

export const Route = createFileRoute(
  "/voistlused/$tournamentid/tulemused/$groupid/"
)({
  loader: ({ params }) => {
    return { params };
  },
  errorComponent: () => <ErrorPage />,
  component: RouteComponent,
});

function RouteComponent() {
  const { params } = Route.useLoaderData();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<string>("bracket");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<MatchWrapper | null>(null);

  const tournamentId = Number(params.tournamentid);
  const groupId = Number(params.groupid);
  
  const tableQuery = useQuery({
    ...UseGetTournamentTable(tournamentId, groupId),
    staleTime: 0,
  });

  const bracketQuery = useQuery({
    ...UseGetBracket(tournamentId, groupId),
    staleTime: 0,
  });

  useEffect(() => {
    if (tableQuery.data?.data) {
      const type = tableQuery.data.data.type;
      if (type === "champions_league" || type === "round_robin_full_placement") {
        setActiveTab("bracket");
      } else {
        setActiveTab("placement");
      }
    }
  }, [tableQuery.data?.data?.type]);

  if (tableQuery.isLoading || bracketQuery.isLoading) {
    return <div>{t("news.loading")}</div>;
  }

  if (tableQuery.isError || bracketQuery.isError) {
    return <div>{t("errors.general.description")}</div>;
  }

  if (!bracketQuery.data?.data || !tableQuery.data?.data) {
    return <div>{t("errors.general.title")}</div>;
  }

  const tournamentType = tableQuery.data.data.type;
  const isMeistrikad = tournamentType === "champions_league";
  const isRoundRobinFull = tournamentType === "round_robin_full_placement";
  const isFreeForAll = tournamentType === "free_for_all";
  const groupName = tableQuery.data.data.class;

  const handleSelectMatch = (match: MatchWrapper) => {
    if (match.match.winner_id !== "") {
      setSelectedMatch(match);
      setIsModalOpen(true);
    }
  };

  const handleModalChange = (open: boolean) => {
    setIsModalOpen(open);
    if (!open) {
      setSelectedMatch(null);
    }
  };

  const hasBracketData = isMeistrikad || isRoundRobinFull;
  
  return (
    <div className="min-h-screen p-2">
      <div className="flex justify-center">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
          defaultValue={activeTab}
        >
          <div className="flex flex-col items-center">
            <h4 className="text-center font-medium pt-4 pb-2">{groupName}</h4>

            <TabsList className="h-10 space-x-2">
              {isMeistrikad && (
                <>
                  <TabsTrigger
                    value="bracket"
                    className="data-[state=active]:bg-stone-800"
                  >
                    {t("competitions.bracket")}
                  </TabsTrigger>
                  <TabsTrigger
                    value="placement"
                    className="data-[state=active]:bg-stone-800"
                  >
                    {t("competitions.play_off")}
                  </TabsTrigger>
                  <TabsTrigger
                    value="leaderboard"
                    className="data-[state=active]:bg-stone-800"
                  >
                    {t("competitions.navbar.standings")}
                  </TabsTrigger>
                </>
              )}

              {isRoundRobinFull && (
                <>
                  <TabsTrigger
                    value="bracket"
                    className="data-[state=active]:bg-stone-800"
                  >
                    {t("competitions.bracket")}
                  </TabsTrigger>
                  <TabsTrigger
                    value="leaderboard"
                    className="data-[state=active]:bg-stone-800"
                  >
                    {t("competitions.navbar.standings")}
                  </TabsTrigger>
                </>
              )}

              {!isMeistrikad && !isRoundRobinFull && (
                <>
                  <TabsTrigger
                    value="placement"
                    className="data-[state=active]:bg-stone-800"
                  >
                    {t("competitions.play_off")}
                  </TabsTrigger>
                  <TabsTrigger
                    value="leaderboard"
                    className="data-[state=active]:bg-stone-800"
                  >
                    {t("competitions.navbar.standings")}
                  </TabsTrigger>
                </>
              )}
            </TabsList>
          </div>

          {/* Bracket tab content */}
          {hasBracketData && (
            <TabsContent value="bracket" className="w-full mt-6">
              {isMeistrikad && bracketQuery.data?.data?.round_robins?.[0] && (
                <GroupBracket
                  brackets={bracketQuery.data.data.round_robins[0]}
                  onMatchSelect={handleSelectMatch}
                />
              )}
              {isRoundRobinFull && bracketQuery.data?.data?.round_robins?.[0] && (
                <GroupStageBracket
                  brackets={bracketQuery.data.data.round_robins[0]}
                  onMatchSelect={handleSelectMatch}
                  name={tableQuery.data.data.class}
                />
              )}
            </TabsContent>
          )}

          {/* Placement tab content */}
          <TabsContent value="placement" className="w-full mt-6">
            {isFreeForAll ? (
              <div className="text-center text-stone-700">
                {t("competitions.errors.no_groups")}
              </div>
            ) : bracketQuery.data?.data?.eliminations && 
               Array.isArray(bracketQuery.data.data.eliminations) && 
               bracketQuery.data.data.eliminations.length > 0 && 
               bracketQuery.data.data.eliminations[0]?.elimination ? (
              <Window
                data={bracketQuery.data.data}
                tournament_table={tableQuery.data.data}
              />
            ) : (
              <div className="text-center text-stone-700">
                No data available yet
              </div>
            )}
          </TabsContent>

          {/* Leaderboard tab content */}
          <TabsContent value="leaderboard" className="w-full mt-6">
            <StandingsProtocol group_id={groupId} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Match details modal */}
      <Dialog open={isModalOpen} onOpenChange={handleModalChange}>
        <DialogContent
          aria-describedby={`match-protocol-${selectedMatch?.match.id}`}
          className="max-w-[1200px] h-[90vh] px-1 md:p-4 mx-auto flex flex-col"
        >
          <DialogTitle className="text-lg text-center font-semibold">
            {t("competitions.timetable.match_details")}
          </DialogTitle>

          <div className="flex-1 overflow-auto">
            {isRoundRobinFull && selectedMatch && (
              <GroupStatisticsCard
                tournament_id={tournamentId}
                group_id={groupId}
                match_id={selectedMatch.match.id}
                index={selectedMatch.match.round}
              />
            )}
            {isMeistrikad && selectedMatch && (
              <StatisticsCard
                tournament_id={tournamentId}
                group_id={groupId}
                match_id={selectedMatch.match.id}
                index={selectedMatch.match.round}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}