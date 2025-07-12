import { useState, useEffect } from "react";
import ErrorPage from "@/components/error";
import GroupBracket from "@/components/group-bracket";
import { UseGetBracket } from "@/queries/brackets";
import { UseGetTournamentTable, UseGetTournamentTables } from "@/queries/tables";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";
import GroupStageBracket from "@/components/group-stage-bracket";
import { GroupType, MatchWrapper } from "@/types/matches";
import StandingsProtocol from "./-components/standings-protocol";
import Loader from "@/components/loader";
import Protocol from "./-components/protocol";
import { EliminationBrackets } from "@/components/elimination-brackets";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";

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
    if (tableQuery.data?.data) {
      const type = tableQuery.data.data.type;
      if (type === GroupType.CHAMPIONS_LEAGUE || type === GroupType.ROUND_ROBIN || type === GroupType.ROUND_ROBIN_FULL_PLACEMENT) {
        setActiveTab("bracket");
      } else {
        setActiveTab("placement");
      }
    }
  }, [tableQuery.data?.data?.type]);

  if (tableQuery.isLoading || bracketQuery.isLoading || tablesQuery.isLoading) {
    return (<Loader />)
  }

  if (tableQuery.isError || bracketQuery.isError || tablesQuery.isError) {
    return <div>{t("errors.general.description")}</div>;
  }

  if (!bracketQuery.data?.data || !tableQuery.data?.data || !tablesQuery.data?.data) {
    return <div>{t("errors.general.title")}</div>;
  }

  const tournamentType = tableQuery.data.data.type;
  const isMeistrikad = tournamentType === GroupType.CHAMPIONS_LEAGUE;
  const isRoundRobinFull = tournamentType === GroupType.ROUND_ROBIN || tournamentType === GroupType.ROUND_ROBIN_FULL_PLACEMENT;
  const isFreeForAll = tournamentType === GroupType.FREE_FOR_ALL;

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
    <div className="min-h-screen p-2">
      <div className="flex justify-center">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
          defaultValue={activeTab}
        >
          <div className="flex flex-col items-start">
            <TabsList className="h-10 space-x-2 bg-transparent">
              {isMeistrikad && (
                <>
                  <TabsTrigger
                    value="bracket"
                    className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-700"
                  >
                    {t("competitions.bracket")}
                  </TabsTrigger>
                  <TabsTrigger
                    value="placement"
                    className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-700"
                  >
                    {t("competitions.play_off")}
                  </TabsTrigger>
                  <TabsTrigger
                    value="leaderboard"
                    className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-700"
                  >
                    {t("competitions.navbar.standings")}
                  </TabsTrigger>
                </>
              )}

              {isRoundRobinFull && (
                <>
                  <TabsTrigger
                    value="bracket"
                    className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-700"
                  >
                    {t("competitions.bracket")}
                  </TabsTrigger>
                  <TabsTrigger
                    value="leaderboard"
                    className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-700"
                  >
                    {t("competitions.navbar.standings")}
                  </TabsTrigger>
                </>
              )}

              {!isMeistrikad && !isRoundRobinFull && (
                <>
                  <TabsTrigger
                    value="placement"
                    className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-700"
                  >
                    {t("competitions.play_off")}
                  </TabsTrigger>
                  <TabsTrigger
                    value="leaderboard"
                    className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-700"
                  >
                    {t("competitions.navbar.standings")}
                  </TabsTrigger>
                </>
              )}
            </TabsList>
          </div>

          {hasBracketData && (
            <TabsContent value="bracket" className="w-full mt-2">
              {/* Group Selection Navbar - only show for bracket tabs */}
              {availableTables.length > 1 && (
                <div className="bg-white border-b border-gray-200 shadow-sm mb-9 rounded-lg">
                  <div className="px-1">
                    <div className="flex overflow-x-auto scrollbar-hide">
                      <div className="flex space-x-1 py-3">
                        {availableTables.map((table) => (
                          <button
                            key={table.id}
                            onClick={() => handleGroupChange(table.id)}
                            className={cn(
                              "flex-shrink-0 px-3 py-2 text-sm font-medium transition-all duration-200 border-b-2",
                              groupId === table.id
                                ? "border-[#4C97F1] text-gray-800"
                                : "border-transparent text-gray-600 hover:text-gray-800"
                            )}
                          >
                            <div className="flex flex-col items-center">
                              <span className="font-medium">{table.class}</span>
                              <div className="flex items-center gap-1 mt-0.5">
                                <User className="h-3 w-3 text-gray-500" />
                                <span className="text-xs text-gray-500">
                                  {table.participants.length}
                                </span>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
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

          <TabsContent value="placement" className="w-full mt-2">
            {availableTables.length > 1 && (
              <div className="bg-white border-x border-gray-200 shadow-sm rounded-t-lg">
                <div className="">
                  <div className="flex overflow-x-auto scrollbar-hide">
                    <div className="flex space-x-1 py-0">
                      {availableTables.map((table) => (
                        <button
                          key={table.id}
                          onClick={() => handleGroupChange(table.id)}
                          className={cn(
                            "flex-shrink-0 px-3 py-2 text-sm font-medium transition-all duration-200 border-b-2",
                            groupId === table.id
                              ? "border-[#4C97F1] text-gray-800"
                              : "border-transparent text-gray-600 hover:text-gray-800"
                          )}
                        >
                          <div className="flex flex-col items-center">
                            <span className="font-medium">{table.class}</span>
                            <div className="flex items-center gap-1 mt-0.5">
                              <User className="h-3 w-3 text-gray-500" />
                              <span className="text-xs text-gray-500">
                                {table.participants.length}
                              </span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
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
            <StandingsProtocol group_id={groupId} tournament_table={tableQuery.data.data}/>
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
      )}
    </div>
  );
}
