import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
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
          <div className="flex items-center gap-6 max-w-md">
            <Link to={`/admin/tournaments/${tournamentid}/ajakava`}>
              <div className={`pl-2 text-sm font-medium transition-colors border-l-2 ${currentTab === "schedule"
                ? "text-[#03326B] border-[#03326B]"
                : "text-gray-500 border-transparent hover:text-[#03326B]"
                }`}>
                {t("admin.tournaments.timetable.schedule")}
              </div>
            </Link>
            <Link to={`/admin/tournaments/${tournamentid}/ajakava/seaded`}>
              <div className={`pl-2 text-sm font-medium transition-colors border-l-2 ${currentTab === "configurations"
                ? "text-[#03326B] border-[#03326B]"
                : "text-gray-500 border-transparent hover:text-[#03326B]"
                }`}>
                {t("admin.tournaments.timetable.configurations")}
              </div>
            </Link>
          </div>
        </div>

        <div className="px-0 md:px-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
