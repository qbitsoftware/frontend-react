import { createFileRoute } from "@tanstack/react-router";
import { TournamentForm } from "../-components/tournament-form";
import ErrorPage from "@/components/error";
import { UseGetTournamentAdmin } from "@/queries/tournaments";

export const Route = createFileRoute("/admin/tournaments/$tournamentid/")({
  loader: async ({ context: { queryClient }, params }) => {
    const tournamentId = Number(params.tournamentid);
    let tournament = queryClient.getQueryData(
      UseGetTournamentAdmin(tournamentId).queryKey,
    );
    if (!tournament) {
      tournament = await queryClient.fetchQuery(UseGetTournamentAdmin(tournamentId));
    }
    return { tournament };
  },
  errorComponent: () => <ErrorPage />,
  component: RouteComponent,
});

function RouteComponent() {
  const { tournament } = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      <div className="p-2">
        <TournamentForm initial_data={tournament.data} />
      </div>
    </div>
  )
}

