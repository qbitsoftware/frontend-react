import { createFileRoute, useParams } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { UseGetTournamentTablesQuery } from "@/queries/tables";
import { UseGetTournamentAdmin } from "@/queries/tournaments";
import TimetableConfigurationsForm from "./-components/timetable-configurations-form";

export const Route = createFileRoute(
  "/admin/tournaments/$tournamentid/ajakava/seaded/"
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { tournamentid } = useParams({
    from: "/admin/tournaments/$tournamentid/ajakava/seaded/",
  });
  const { t } = useTranslation();

  const tournamentTablesQuery = UseGetTournamentTablesQuery(Number(tournamentid));
  const tournamentQuery = useQuery(UseGetTournamentAdmin(Number(tournamentid)));

  if (tournamentTablesQuery.isLoading || tournamentQuery.isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-500">
          {t("common.loading")}
        </div>
      </div>
    );
  }

  if (!tournamentTablesQuery.data?.data || !tournamentQuery.data?.data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-500">
          {t("admin.tournaments.timetable.no_data")}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <TimetableConfigurationsForm
        tournamentTables={tournamentTablesQuery.data.data}
        tournament={tournamentQuery.data.data}
      />
    </div>
  );
}
