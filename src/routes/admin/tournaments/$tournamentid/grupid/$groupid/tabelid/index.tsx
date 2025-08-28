import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { UseGetBracketQuery } from "@/queries/brackets";
import BracketComponent from "@/routes/admin/tournaments/-components/bracket";
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

  const tournamentId = Number(params.tournamentid);
  const groupId = Number(params.groupid);

  const {
    data: bracketsData,
  } = UseGetBracketQuery(tournamentId, groupId);

  const { data: tournamentTableData } = UseGetTournamentTableQuery(
    tournamentId,
    groupId
  );

  const tablesQuery = UseGetTournamentTablesQuery(tournamentId);

  const handleGroupChange = (newGroupId: number) => {
    navigate({
      to: "/admin/tournaments/$tournamentid/grupid/$groupid/tabelid",
      params: {
        tournamentid: params.tournamentid,
        groupid: newGroupId.toString(),
      },
    });
  };

  if (tablesQuery && tablesQuery.data && tournamentTableData) {
    const availableTables = tablesQuery.data.data || [];
    const groupIds = tournamentTableData.data.stages?.map((stage) => stage.id) || [groupId];

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 px-2">
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
                      search: { selectedGroup: undefined },
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
            {bracketsData && <BracketComponent
              bracket={bracketsData}
              tournament_table={tournamentTableData.data.group}
            />
            }
          </div>
        </div>
      </div>
    );

  }
}
