import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { UseGetBracketQuery } from "@/queries/brackets";
import BracketComponent from "@/routes/admin/tournaments/-components/bracket";
import ErrorPage from "@/components/error";
import { Loader2 } from "lucide-react";
import { useTournamentTable } from "@/routes/voistlused/$tournamentid/-components/tt-provider";

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
    data: bracketsData, isLoading: isLoading1
  } = UseGetBracketQuery(tournamentId, groupId);
  void isLoading1
  const tt = useTournamentTable()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 px-2">
      {tt.stages && tt.stages.length >= 1 && (
        <div className="border-b border-gray-200 mb-4">
          <nav className="-mb-px flex space-x-8">
            {tt.stages.map((stage) => {
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
          {bracketsData ? <BracketComponent
            bracket={bracketsData}
            tournament_table={tt.group}
          /> :
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
              <div className="flex justify-center items-center h-[50vh]">
                <Loader2 className="animate-spin" />
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  );
}
