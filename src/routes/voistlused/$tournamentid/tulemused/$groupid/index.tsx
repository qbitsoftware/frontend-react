import { useState, useEffect } from "react";
import ErrorPage from "@/components/error";
import GroupBracket from "@/components/group-bracket";
import { UseGetBracket } from "@/queries/brackets";
import { UseGetTournamentTable, UseGetTournamentTables } from "@/queries/tables";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";
import GroupStageBracket from "@/components/group-stage-bracket";
import { GroupType, MatchWrapper } from "@/types/matches";
import Loader from "@/components/loader";
import Protocol from "./-components/protocol";
import { EliminationBrackets } from "@/components/elimination-brackets";
import { ResponsiveClassSelector } from "@/components/responsive-class-selector";
import { DialogType } from "@/types/groups";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, X } from "lucide-react";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

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
  }, [tableQuery.data?.data, tableQuery.data?.data?.group?.type]);

  // Reset match index when search term changes
  useEffect(() => {
    setCurrentMatchIndex(0);
  }, [searchTerm]);

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

  const handleNavigateMatches = (direction: 'next' | 'prev') => {
    if (direction === 'next') {
      setCurrentMatchIndex(prev => prev + 1);
    } else {
      setCurrentMatchIndex(prev => Math.max(0, prev - 1));
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      handleNavigateMatches('next');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      handleNavigateMatches('prev');
    }
  };

  const hasBracketData = isMeistrikad || isRoundRobinFull;
  const availableTables = tablesQuery.data.data || [];

  return (
    <div className="min-h-screen w-full">
      {/* Consolidated Navigation */}
      <div className="space-y-3 mb-2">
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

      <div className="w-full">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
          defaultValue={activeTab}
        >
          <div className="flex flex-col items-start">
              <div className="sticky top-0 z-[100] pb-2 w-full max-w-full sm:max-w-md">
                <div className="flex gap-2 items-center pt-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder={t("competitions.navbar.search_player")}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={handleSearchKeyDown}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm pr-8"
                      style={{ fontSize: '16px' }}
                    />
                    {searchTerm.trim() && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSearchTerm("")}
                        className="absolute right-1 top-1/2 -translate-y-1/2 px-1 py-1 h-6 w-6 hover:bg-gray-50 text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  {searchTerm.trim() && searchTerm.trim().length >= 3 && (
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleNavigateMatches('prev')}
                        className="px-2 py-1 h-8 shadow-sm"
                        disabled={currentMatchIndex === 0}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleNavigateMatches('next')}
                        className="px-2 py-1 h-8 shadow-sm"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            {/* <TabsList className="h-9 space-x-1 bg-gray-50 border border-gray-200 rounded-lg p-1">
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
                </>
              )}

              {isRoundRobinFull && (
                <TabsTrigger
                  value="bracket"
                  className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600 text-xs px-3 py-1 rounded-md"
                >
                  {t("competitions.bracket")}
                </TabsTrigger>
              )}

              {!isMeistrikad && !isRoundRobinFull && (
                <TabsTrigger
                  value="placement"
                  className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600 text-xs px-3 py-1 rounded-md"
                >
                  {t("competitions.play_off")}
                </TabsTrigger>
              )}
            </TabsList> */}
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

          <TabsContent value="placement" className="w-full mt-2 px-0">
            {isFreeForAll ? (
              <div className="text-center text-stone-700 px-4">
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
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                currentMatchIndex={currentMatchIndex}
                onNavigateMatches={handleNavigateMatches}
              />
            ) : (
              <div className="text-center text-stone-700 px-4">
                {/* No data available yet */}
                {t('competitions.results.no_results')}
              </div>
            )}
          </TabsContent>

        </Tabs>
      </div>

      {/* Match details modal */}
      {selectedMatch && !tableQuery.data.data.group.solo && tableQuery.data.data.group.dialog_type != DialogType.DT_FIXED_DOUBLES && tableQuery.data.data.group.dialog_type !== DialogType.DT_DOUBLES && (
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
