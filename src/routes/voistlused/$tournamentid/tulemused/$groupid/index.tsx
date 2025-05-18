import { useState, useEffect } from "react";
import ErrorPage from "@/components/error";
import GroupBracket from "@/components/group-bracket";
import { UseGetBracket } from "@/queries/brackets";
import { UseGetTournamentTable } from "@/queries/tables";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";
import GroupStageBracket from "@/components/group-stage-bracket";
import { GroupType, MatchWrapper } from "@/types/matches";
import StandingsProtocol from "./-components/standings-protocol";
import Loader from "@/components/loader";
import Protocol from "./-components/protocol";
import { EliminationBrackets } from "@/components/elimination-brackets";

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
      if (type === GroupType.CHAMPIONS_LEAGUE || type === GroupType.ROUND_ROBIN || type === GroupType.ROUND_ROBIN_FULL_PLACEMENT) {
        setActiveTab("bracket");
      } else {
        setActiveTab("placement");
      }
    }
  }, [tableQuery.data?.data?.type]);

  if (tableQuery.isLoading || bracketQuery.isLoading) {
    return (<Loader />)
  }

  if (tableQuery.isError || bracketQuery.isError) {
    return <div>{t("errors.general.description")}</div>;
  }

  if (!bracketQuery.data?.data || !tableQuery.data?.data) {
    return <div>{t("errors.general.title")}</div>;
  }

  const tournamentType = tableQuery.data.data.type;
  const isMeistrikad = tournamentType === GroupType.CHAMPIONS_LEAGUE;
  const isRoundRobinFull = tournamentType === GroupType.ROUND_ROBIN || tournamentType === GroupType.ROUND_ROBIN_FULL_PLACEMENT;
  const isFreeForAll = tournamentType === GroupType.FREE_FOR_ALL;
  const groupName = tableQuery.data.data.class;

  const handleSelectMatch = (match: MatchWrapper) => {
    if ((match.match.p1_id === "" || match.match.p1_id === "empty") || (match.match.p2_id === "" || match.match.p2_id === "empty")) {
      return
    }
    if (match.match.winner_id !== "") {
      setSelectedMatch(match);
      setIsModalOpen(true)
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
                  tournament_table={tableQuery.data.data}
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
              <EliminationBrackets
                data={bracketQuery.data.data}
                tournament_table={tableQuery.data.data}
                handleSelectMatch={handleSelectMatch}
              />
            ) : (
              <div className="text-center text-stone-700">
                {/* No data available yet */}
                {t('competitions.results.no_results')}
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
      {selectedMatch && !tableQuery.data.data.solo && (
        <Protocol
          key={selectedMatch.match.id}
          tournamentId={tournamentId}
          groupId={groupId}
          isRoundRobinFull={isRoundRobinFull}
          isMeistrikad={isMeistrikad}
          isModalOpen={isModalOpen}
          handleModalChange={handleModalChange}
          selectedMatch={selectedMatch}
        />
      )
      }
    </div>
  );
}