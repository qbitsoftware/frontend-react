import { useState, useEffect } from "react";
import ErrorPage from "@/components/error";
import GroupBracket from "@/components/group-bracket";
import { UseGetBracket } from "@/queries/brackets";
import { UseGetTournamentTable, UseGetTournamentTables } from "@/queries/tables";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";
import GroupStageBracket from "@/components/group-stage-bracket";
import { GroupType, MatchWrapper } from "@/types/matches";
import StandingsProtocol from "./-components/standings-protocol";
import Loader from "@/components/loader";
import Protocol from "./-components/protocol";
import { EliminationBrackets } from "@/components/elimination-brackets";
import { ResponsiveClassSelector } from "@/components/responsive-class-selector";

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
  const navigate = useNavigate();

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

  const tablesQuery = useQuery({
    ...UseGetTournamentTables(tournamentId),
    staleTime: 0,
  });

  useEffect(() => {
    if (tableQuery.data?.data && tableQuery.data.data.group) {
      const type = tableQuery.data.data.group.type;
      if (type === GroupType.CHAMPIONS_LEAGUE || type === GroupType.ROUND_ROBIN || type === GroupType.ROUND_ROBIN_FULL_PLACEMENT || type === GroupType.DYNAMIC) {
        setActiveTab("bracket");
      } else {
        setActiveTab("placement");
      }
    }
  }, [tableQuery.data?.data?.group?.type]);

  if (tableQuery.isLoading || bracketQuery.isLoading || tablesQuery.isLoading) {
    return (<Loader />)
  }

  if (tableQuery.isError || bracketQuery.isError || tablesQuery.isError) {
    return <div>{t("errors.general.description")}</div>;
  }

  if (!bracketQuery.data?.data || !tableQuery.data?.data || !tablesQuery.data?.data || !tableQuery.data.data.group) {
    return <div>{t("errors.general.title")}</div>;
  }

  const tournamentType = tableQuery.data.data.group?.type;
  const hasStages = tableQuery.data.data.stages && tableQuery.data.data.stages.length > 1;
  const isMeistrikad = tournamentType === GroupType.CHAMPIONS_LEAGUE;
  const isRoundRobinFull = tournamentType === GroupType.ROUND_ROBIN || tournamentType === GroupType.ROUND_ROBIN_FULL_PLACEMENT || tournamentType === GroupType.DYNAMIC;
  const isFreeForAll = tournamentType === GroupType.FREE_FOR_ALL;

  // Check if current stage is part of dynamic tournament
  const isDynamicTournamentStage = hasStages && tableQuery.data.data.stages &&
    tableQuery.data.data.stages[0]?.type === GroupType.DYNAMIC;

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

  const handleGroupChange = (newGroupId: number) => {
    navigate({
      to: "/voistlused/$tournamentid/tulemused/$groupid",
      params: {
        tournamentid: params.tournamentid,
        groupid: newGroupId.toString(),
      },
    });
  };

  const hasBracketData = isMeistrikad || isRoundRobinFull;
  const availableTables = tablesQuery.data.data || [];

  return (
    <div className="min-h-screen">
      {/* Consolidated Navigation */}
      <div className="space-y-3 mb-6">
        {/* Primary Class Navigation */}
        <ResponsiveClassSelector
          variant="tables"
          availableTables={availableTables}
          activeGroupId={groupId}
          onGroupChange={handleGroupChange}
        />

        {/* Secondary Stage Navigation - Only show if has stages */}
        {hasStages && tableQuery.data.data.stages && (
          <div className="border-l-2 border-gray-200 pl-4">
            <div className="flex flex-wrap gap-1">
              {tableQuery.data.data.stages.map((stage, index) => (
                <Link
                  key={stage.id}
                  to="/voistlused/$tournamentid/tulemused/$groupid"
                  params={{
                    tournamentid: params.tournamentid,
                    groupid: stage.id.toString(),
                  }}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${stage.id === groupId
                    ? 'bg-gray-600 text-white'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}
                >

                  {index === 1 && isDynamicTournamentStage
                    ? `${t('common.winner')}`
                    : index === 2 && isDynamicTournamentStage
                      ? `${t('common.consolation')}`
                      : `${t('common.subgroups')}`}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
          defaultValue={activeTab}
        >
          <div className="flex flex-col items-start">
            {/* Reduced visual weight of tab navigation */}
            <TabsList className="h-9 space-x-1 bg-gray-50 border border-gray-200 rounded-lg p-1">
              {isMeistrikad && (
                <>
                  <TabsTrigger
                    value="bracket"
                    className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600 text-xs px-3 py-1 rounded-md"
                  >
                    {t("competitions.bracket")}
                  </TabsTrigger>
                  <TabsTrigger
                    value="placement"
                    className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600 text-xs px-3 py-1 rounded-md"
                  >
                    {t("competitions.play_off")}
                  </TabsTrigger>
                  <TabsTrigger
                    value="leaderboard"
                    className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600 text-xs px-3 py-1 rounded-md"
                  >
                    {t("competitions.navbar.standings")}
                  </TabsTrigger>
                </>
              )}

              {isRoundRobinFull && (
                <>
                  <TabsTrigger
                    value="bracket"
                    className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600 text-xs px-3 py-1 rounded-md"
                  >
                    {t("competitions.bracket")}
                  </TabsTrigger>
                  <TabsTrigger
                    value="leaderboard"
                    className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600 text-xs px-3 py-1 rounded-md"
                  >
                    {t("competitions.navbar.standings")}
                  </TabsTrigger>
                </>
              )}

              {!isMeistrikad && !isRoundRobinFull && (
                <>
                  <TabsTrigger
                    value="placement"
                    className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600 text-xs px-3 py-1 rounded-md"
                  >
                    {t("competitions.play_off")}
                  </TabsTrigger>
                  <TabsTrigger
                    value="leaderboard"
                    className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600 text-xs px-3 py-1 rounded-md"
                  >
                    {t("competitions.navbar.standings")}
                  </TabsTrigger>
                </>
              )}
            </TabsList>
          </div>

          {hasBracketData && (
            <TabsContent value="bracket" className="w-full mt-2">
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
                  name={tableQuery.data.data.group.class}
                  tournament_table={tableQuery.data.data.group}
                />
              )}
            </TabsContent>
          )}

          <TabsContent value="placement" className="w-full mt-2">
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
                tournament_table={tableQuery.data.data.group}
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
            <StandingsProtocol group_id={groupId} tournament_table={tableQuery.data.data.group} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Match details modal */}
      {selectedMatch && !tableQuery.data.data.group.solo && (
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
      )}
    </div>
  );
}
