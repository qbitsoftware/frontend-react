import { useState, useEffect } from "react";
import ErrorPage from "@/components/error";
import { UseGetTournamentTable, UseGetTournamentTables } from "@/queries/tables";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import StandingsProtocol from "../tulemused/$groupid/-components/standings-protocol";
import Loader from "@/components/loader";
import { ResponsiveClassSelector } from "@/components/responsive-class-selector";
import { GroupType } from "@/types/matches";

export const Route = createFileRoute("/voistlused/$tournamentid/kohad/")({
  loader: ({ params }) => {
    return { params };
  },
  errorComponent: () => <ErrorPage />,
  component: RouteComponent,
});

function RouteComponent() {
  const { params } = Route.useLoaderData();
  const { t } = useTranslation();

  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

  const tournamentId = Number(params.tournamentid);

  const tablesQuery = useQuery({
    ...UseGetTournamentTables(tournamentId),
    staleTime: 0,
  });

  // Query for the selected group's table data
  const tableQuery = useQuery({
    ...UseGetTournamentTable(tournamentId, selectedGroupId || 0),
    enabled: selectedGroupId !== null,
    staleTime: 0,
  });

  // Set default group on initial load
  useEffect(() => {
    if (tablesQuery.data?.data && tablesQuery.data.data.length > 0 && selectedGroupId === null) {
      const firstTable = tablesQuery.data.data[0];
      setSelectedGroupId(firstTable.id);
    }
    if (tableQuery.data?.data.group?.type === GroupType.DYNAMIC) {
      if (tableQuery.data.data.stages && tableQuery.data.data.stages.length > 1) {
        setSelectedGroupId(tableQuery.data.data.stages[1].id);
      }
    }
  }, [tablesQuery.data, selectedGroupId]);

  if (tablesQuery.isLoading) {
    return <Loader />;
  }

  if (tablesQuery.isError) {
    return <div>{t("errors.general.description")}</div>;
  }

  if (!tablesQuery.data?.data || tablesQuery.data.data.length === 0) {
    return <div>{t("competitions.errors.standings_missing")}</div>;
  }

  const translateBracketName = (index: number) => {
    if (index === 1) {
      return t('common.winner')
    }

    if (index === 2) {
      return t('common.consolation')
    }

    return t('common.subgroups')
  }

  const availableTables = tablesQuery.data.data;

  const handleGroupChange = (newGroupId: number) => {
    setSelectedGroupId(newGroupId);
  };

  // Don't render standings until we have a selected group and its data
  if (!selectedGroupId || tableQuery.isLoading) {
    return (
      <div className="min-h-screen w-full">
        <div className="space-y-3 mb-4">
          <ResponsiveClassSelector
            variant="tables"
            availableTables={availableTables}
            activeGroupId={selectedGroupId || availableTables[0]?.id}
            onGroupChange={handleGroupChange}
          />
        </div>
        <Loader />
      </div>
    );
  }

  if (tableQuery.isError) {
    return <div>{t("errors.general.description")}</div>;
  }

  if (!tableQuery.data?.data?.group) {
    return <div>{t("competitions.errors.standings_missing")}</div>;
  }

  return (
    <div className="min-h-screen w-full">
      <div className="space-y-3 mb-4">
        <ResponsiveClassSelector
          variant="tables"
          availableTables={availableTables}
          activeGroupId={selectedGroupId}
          onGroupChange={handleGroupChange}
        />
      </div>

      {tableQuery.data.data.stages && tableQuery.data.data.stages.length >= 1 && (
        <div className="border-b border-gray-200 mb-4">
          <nav className="-mb-px flex space-x-8">
            {tableQuery.data.data.stages?.map((stage, index) => {
              if (index === 0) { return null }
              const translatedName = translateBracketName(index)

              return (
                <button
                  key={stage.id}
                  onClick={() =>
                    setSelectedGroupId(stage.id)
                  }
                  className={`py-2 px-2 border-b-2 font-medium text-sm transition-all duration-300 ${selectedGroupId === stage.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  {translatedName}
                </button>
              )
            })}
          </nav>
        </div>
      )}



      <div className="w-full">
        <StandingsProtocol
          group_id={selectedGroupId}
          tournament_table={tableQuery.data.data.group}
        />
      </div>
    </div>
  );
}
