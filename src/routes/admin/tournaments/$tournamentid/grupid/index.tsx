import { createFileRoute } from "@tanstack/react-router";
import { TournamentTables } from "./-components/tables";
import ErrorPage from "@/components/error";
import { useTournament } from "@/routes/voistlused/$tournamentid/-components/tournament-provider";

export const Route = createFileRoute(
  "/admin/tournaments/$tournamentid/grupid/"
)({
  component: RouteComponent,
  errorComponent: () => <ErrorPage />,
});

function RouteComponent() {
  const tournament = useTournament()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      <div className="p-4">
        <TournamentTables
          tables={tournament.tournamentTables}
          tournament={tournament.tournamentData}
        />
      </div>
    </div>
  );
}
