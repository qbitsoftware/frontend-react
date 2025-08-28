import { createFileRoute } from "@tanstack/react-router";
import ErrorPage from "@/components/error";
import ImageComp from "../../-components/images-comp";
import { useTournament } from "@/routes/voistlused/$tournamentid/-components/tournament-provider";

export const Route = createFileRoute("/admin/tournaments/$tournamentid/pildid/")({
  errorComponent: () => <ErrorPage />,
  component: RouteComponent,
});

function RouteComponent() {
  const { tournamentData } = useTournament()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      <div className="p-2">
        {tournamentData && <ImageComp tournament_id={tournamentData.id} />}
      </div>
    </div>
  );
}