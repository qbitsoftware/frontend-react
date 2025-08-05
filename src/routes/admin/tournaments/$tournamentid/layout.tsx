import {
  createFileRoute,
  Outlet,
  redirect,
  useLocation,
} from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";
import ErrorPage from "@/components/error";
import { ErrorResponse } from "@/types/errors";
import React, { useState, useRef, useEffect } from "react";
import { UseGetTournamentTablesQuery } from "@/queries/tables";
import GroupDropdown from "../-components/group-dropdown";
import { UseGetTournamentAdmin } from "@/queries/tournaments";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/tournaments/$tournamentid")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      selectedGroup: search.selectedGroup as string | undefined,
    }
  },
  component: RouteComponent,
  errorComponent: () => <ErrorPage />,
  loader: async ({ context: { queryClient }, params }) => {
    let tournament_data = undefined;
    try {
      tournament_data = await queryClient.ensureQueryData(
        UseGetTournamentAdmin(Number(params.tournamentid))
      );
    } catch (error) {
      const err = error as ErrorResponse;
      if (err.response.status === 404) {
        throw redirect({
          to: "/admin/tournaments",
        });
      }
      throw error;
    }

    return { tournament_data };
  },
});

function RouteComponent() {
  const location = useLocation();
  const { tournament_data } = Route.useLoaderData();
  const { tournamentid } = Route.useParams();
  const { selectedGroup } = Route.useSearch();
  const { t } = useTranslation();
  const tournament_tables = UseGetTournamentTablesQuery(Number(tournamentid));
  
  // Extract current group ID from URL path if we're on a group-specific route
  const currentGroupId = React.useMemo(() => {
    const pathMatch = location.pathname.match(/\/grupid\/(\d+)/);
    return pathMatch ? pathMatch[1] : selectedGroup;
  }, [location.pathname, selectedGroup]);

  const [showGroupsDropdown, setShowGroupsDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({
    left: "7.5rem",
    right: "auto",
  });
  const groupsHoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleGroupsMouseEnter = () => {
    if (groupsHoverTimeoutRef.current) {
      clearTimeout(groupsHoverTimeoutRef.current);
    }
    setShowGroupsDropdown(true);
  };

  const handleGroupsMouseLeave = () => {
    groupsHoverTimeoutRef.current = setTimeout(() => {
      setShowGroupsDropdown(false);
    }, 200);
  };

  useEffect(() => {
    if (showGroupsDropdown && dropdownRef.current) {
      const dropdown = dropdownRef.current;
      const rect = dropdown.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let newPosition = { left: "0rem", right: "auto" };

      if (rect.right > viewportWidth - 20) {
        newPosition = { left: "auto", right: "0rem" };
      }

      setDropdownPosition(newPosition);

      const spaceBelow = viewportHeight - rect.top;
      const maxHeight = Math.min(400, spaceBelow - 40);
      dropdown.style.maxHeight = `${maxHeight}px`;
    }
  }, [showGroupsDropdown]);

  const currentTab = location.pathname.includes("/osalejad")
    ? "participants"
    : location.pathname.includes("/mangud")
      ? "matches"
      : location.pathname.includes("/tabelid")
        ? "brackets"
        : location.pathname.includes("/ajakava")
          ? "schedule"
          : location.pathname.includes("/grupid")
            ? "groups"
            : location.pathname.includes("/meedia")
              ? "media"
              : location.pathname.includes("/pildid")
                ? "images"
                : "info";

  return (
    <div className="mx-auto min-h-[95vh] h-full">
      <div className="w-full relative">
        <div className="py-3 sm:py-4 px-4 md:px-8 flex flex-col lg:flex-row gap-3 lg:gap-4 justify-between items-start lg:items-center w-full bg-gradient-to-b from-white via-white/50 to-[#fafafa] border-b relative z-20 overflow-visible">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link to="/admin/tournaments">
              <Button
                variant="ghost"
                size="lg"
                className="p-0 h-8 w-8 hover:bg-gray-300"
              >
                <ArrowLeft className="h-4 w-4 text-[#03326B]" />
              </Button>
            </Link>
            <h5 className="font-semibold text-[#03326B] text-sm sm:text-base truncate">
              {tournament_data.data?.name}
            </h5>
          </div>
          <div className="relative w-full lg:w-auto overflow-visible">
            <Tabs value={currentTab} className="w-full lg:w-auto">
              <div className="w-full overflow-x-auto overflow-y-visible">
                <TabsList className="p-1 md:p-0 flex flex-row justify-start items-center gap-1 px-1 min-w-max">
                  <Link to={`/admin/tournaments/${tournamentid}`}>
                    <TabsTrigger
                      value="info"
                      className="w-[5.5rem] sm:w-[7rem] py-[6px] flex-shrink-0 text-xs sm:text-sm"
                    >
                      {t("admin.layout.info")}
                    </TabsTrigger>
                  </Link>
                  <div
                    className="relative flex-shrink-0"
                    onMouseEnter={handleGroupsMouseEnter}
                    onMouseLeave={handleGroupsMouseLeave}
                  >
                    <Link to={`/admin/tournaments/${tournamentid}/grupid`}>
                      <TabsTrigger
                        value="groups"
                        className="w-[5.5rem] sm:w-[7rem] py-[6px] flex-shrink-0 text-xs sm:text-sm"
                      >
                        {t("admin.layout.groups")}
                      </TabsTrigger>
                    </Link>
                  </div>

                  <Link to={`/admin/tournaments/${tournamentid}/osalejad`} search={{ selectedGroup: currentGroupId }}>
                    <TabsTrigger
                      value="participants"
                      className="w-[5.5rem] sm:w-[7rem] py-[6px] flex-shrink-0 text-xs sm:text-sm"
                    >
                      {t(
                        "admin.tournaments.groups.layout.participants",
                        "Osalejad"
                      )}
                    </TabsTrigger>
                  </Link>

                  <Link to={`/admin/tournaments/${tournamentid}/mangud`} search={{ selectedGroup: currentGroupId }}>
                    <TabsTrigger
                      value="matches"
                      className="w-[5rem] sm:w-[6rem] py-[6px] flex-shrink-0 text-xs sm:text-sm"
                    >
                      {t("admin.tournaments.groups.layout.games", "Mängud")}
                    </TabsTrigger>
                  </Link>

                  <Link to={`/admin/tournaments/${tournamentid}/tabelid`} search={{ selectedGroup: currentGroupId }}>
                    <TabsTrigger
                      value="brackets"
                      className="w-[5rem] sm:w-[6rem] py-[6px] flex-shrink-0 text-xs sm:text-sm"
                    >
                      {t("admin.tournaments.groups.layout.tables", "Tabelid")}
                    </TabsTrigger>
                  </Link>
                  <Link to={`/admin/tournaments/${tournamentid}/ajakava`}>
                    <TabsTrigger
                      value="schedule"
                      className="w-[5rem] sm:w-[6rem] py-[6px] flex-shrink-0 text-xs sm:text-sm"
                    >
                      {t("admin.layout.schedule")}
                    </TabsTrigger>
                  </Link>
                </TabsList>
              </div>
            </Tabs>

            {showGroupsDropdown &&
              tournament_tables &&
              tournament_tables.data &&
              tournament_tables.data.data && (
                <div
                  ref={dropdownRef}
                  className="absolute top-full mt-2 pt-2 w-100 bg-white border border-gray-200 rounded-xl shadow-2xl z-[999999] animate-in fade-in-0 zoom-in-95 duration-200 overflow-visible flex flex-col"
                  style={{
                    left: dropdownPosition.left,
                    right: dropdownPosition.right,
                    maxHeight: "400px",
                  }}
                  onMouseEnter={handleGroupsMouseEnter}
                  onMouseLeave={handleGroupsMouseLeave}
                >
                  <GroupDropdown
                    groups={tournament_tables.data?.data || []}
                    tournament_id={Number(tournamentid)}
                  />
                </div>
              )}
          </div>
        </div>
        <div className="px-0 md:px-0 pb-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
