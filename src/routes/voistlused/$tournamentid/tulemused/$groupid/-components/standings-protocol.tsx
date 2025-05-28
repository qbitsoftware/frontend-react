import ErrorPage from "@/components/error";
import Standings from "@/components/standings";
import { UseGetPlacements } from "@/queries/brackets";
import EmptyComponent from "@/routes/-components/empty-component";
import LoadingScreen from "@/routes/-components/loading-screen";
import { TournamentTable } from "@/types/groups";
import { useParams } from "@tanstack/react-router";

interface Props {
  group_id: number;
  tournament_table: TournamentTable
}

const StandingsProtocol = ({ group_id, tournament_table }: Props) => {
  const { tournamentid } = useParams({ strict: false });
  const {
    data: participants,
    isLoading,
    isError,
  } = UseGetPlacements(Number(tournamentid), group_id);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isError) {
    <div>
      <ErrorPage />
    </div>;
  }

  if (participants && participants.data) {
    return (
      <>
        <Standings participants={participants.data} tournament_table={tournament_table} />
      </>
    );
  }

  return (
    <div>
      <EmptyComponent errorMessage="competitions.errors.standings_missing" />
    </div>
  );
};

export default StandingsProtocol;
