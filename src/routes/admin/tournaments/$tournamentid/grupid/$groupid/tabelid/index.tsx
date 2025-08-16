import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { UseGetBracketQuery } from "@/queries/brackets";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import BracketComponent from "@/routes/admin/tournaments/-components/bracket";
import Loader from "@/components/loader";
import { useTranslation } from "react-i18next";
import {
  UseGetTournamentTableQuery,
  UseGetTournamentTablesQuery,
} from "@/queries/tables";
import ErrorPage from "@/components/error";
import { CompactClassFilters } from "@/routes/admin/tournaments/-components/compact-class-filters";

export const Route = createFileRoute(
  "/admin/tournaments/$tournamentid/grupid/$groupid/tabelid/"
)({
  component: RouteComponent,
  errorComponent: () => <ErrorPage />,
});

function RouteComponent() {
  const params = Route.useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const tournamentId = Number(params.tournamentid);
  const groupId = Number(params.groupid);

  const {
    data: bracketsData,
    error,
    refetch,
    isLoading,
  } = UseGetBracketQuery(tournamentId, groupId);

  const { data: tournamentTableData } = UseGetTournamentTableQuery(
    tournamentId,
    groupId
  );

  // const tt = useTournamentTable()

  const tablesQuery = UseGetTournamentTablesQuery(tournamentId);

  const handleGroupChange = (newGroupId: number) => {
    // Navigate to parent route with selectedGroup parameter
    navigate({
      to: "/admin/tournaments/$tournamentid/tabelid",
      params: {
        tournamentid: params.tournamentid,
      },
      search: {
        selectedGroup: newGroupId.toString(),
      },
    });
  };

  if (isLoading || tablesQuery.isLoading) {
    return (
      <div className="h-[50vh] flex items-center justify-center">
        <Loader />
      </div>
    );
  } else if (
    !bracketsData?.data ||
    error ||
    !tournamentTableData?.data ||
    !tablesQuery.data?.data ||
    !tournamentTableData.data.group
  ) {
    return (
      <div className="flex items-center justify-center">
        <Card className="">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-center text-red-600">
              <AlertCircle className="h-12 w-12 mx-auto mb-4" />
              {t("admin.tournaments.brackets.not_found")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-md text-center text-gray-700 mb-6">
              {t("admin.tournaments.brackets.not_found_description")}
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button size="lg" onClick={() => refetch()}>
              {t("admin.tournaments.brackets.refresh")}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  } else {
    const availableTables = tablesQuery.data.data || [];
    const groupIds = tournamentTableData.data.stages?.map((stage) => stage.id) || [groupId];

    return (
      <div className="min-h-screen px-2">
        <CompactClassFilters
          availableTables={availableTables}
          activeGroupId={groupIds}
          onGroupChange={handleGroupChange}
        />
        {tournamentTableData.data.stages && tournamentTableData.data.stages.length >= 1 && (
          <div className="border-b border-gray-200 mb-4">
            <nav className="-mb-px flex space-x-8">
              {tournamentTableData.data.stages?.map((stage) => {
                return (
                  <button
                    key={stage.id}
                    onClick={() => navigate({
                      to: "/admin/tournaments/$tournamentid/grupid/$groupid/tabelid",
                      params: {
                        tournamentid: params.tournamentid,
                        groupid: stage.id.toString()
                      },
                      search: { selectedGroup: undefined }
                    })}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${groupId === stage.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    {stage.class}
                  </button>
                )
              })}
            </nav>
          </div>
        )}

        <div className="flex justify-center">
          <div className="w-full">
            <BracketComponent
              bracket={bracketsData}
              tournament_table={tournamentTableData.data.group}
            />
          </div>
        </div>
      </div>
    );
  }
}
