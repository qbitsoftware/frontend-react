import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/admin/tournaments/$tournamentid/ajakava")({
  component: RouteComponent,
});

function RouteComponent() {
  const location = useLocation();
  const { tournamentid } = Route.useParams();
  const { t } = useTranslation();

  const currentTab = location.pathname.includes("/seaded")
    ? "configurations"
    : "schedule";

  return (
    <div className="mx-auto min-h-[95vh] h-full">
      <div className="w-full">
        <div className="bg-white border-b px-4 py-2">
          <Tabs value={currentTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <Link to={`/admin/tournaments/${tournamentid}/ajakava`}>
                <TabsTrigger value="schedule" className="w-full">
                  {t("admin.tournaments.timetable.schedule")}
                </TabsTrigger>
              </Link>
              <Link to={`/admin/tournaments/${tournamentid}/ajakava/seaded`}>
                <TabsTrigger value="configurations" className="w-full">
                  {t("admin.tournaments.timetable.configurations")}
                </TabsTrigger>
              </Link>
            </TabsList>
          </Tabs>
        </div>

        <div className="px-0 md:px-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
