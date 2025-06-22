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
import { useState, useRef, useEffect } from "react";
import { UseGetTournamentTablesQuery } from "@/queries/tables";
import GroupDropdown from "../-components/group-dropdown";
import { UseGetTournamentAdmin } from "@/queries/tournaments";
import TableStatusSidebar from "./-components/table-status-sidebar";

export const Route = createFileRoute("/admin/tournaments/$tournamentid")({
  component: RouteComponent,
  errorComponent: () => <ErrorPage />,
  loader: async ({ context: { queryClient }, params }) => {
    let tournament_data = undefined;
    try {
      tournament_data = await queryClient.ensureQueryData(
        UseGetTournamentAdmin(Number(params.tournamentid)),
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
  const { t } = useTranslation();
  const tournament_tables = UseGetTournamentTablesQuery(Number(tournamentid));

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
    }, 150);
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

  const currentTab = location.pathname.includes("/grupid")
    ? "groups"
    : location.pathname.includes("/meedia")
      ? "media"
      : location.pathname.includes("/pildid")
        ? "images"
        : "info";

  return (
    <div className="mx-auto min-h-[95vh] h-full">
      <div className="w-full relative">
        <div className="py-4 sm:py-auto md:px-8 flex flex-col lg:flex-row gap-4 justify-between items-center w-full bg-gradient-to-b from-white via-white/50 to-[#fafafa] border-b relative z-20">
          <h5 className="font-semibold text-[#03326B]">
            {tournament_data.data?.name}
          </h5>
          <div className="relative w-full lg:w-auto">
            <Tabs value={currentTab} className="w-full lg:w-auto">
              <TabsList className="p-2 md:p-0 flex flex-row justify-start items-center w-full gap-1 px-1">
                <Link to={`/admin/tournaments/${tournamentid}`}>
                  <TabsTrigger
                    value="info"
                    className="w-[8rem] py-[6px] flex-shrink-0"
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
                      className="w-[7rem] py-[6px] flex-shrink-0"
                    >
                      {t("admin.layout.groups")}
                    </TabsTrigger>
                  </Link>
                </div>
              </TabsList>
            </Tabs>

            {/* Groups Dropdown - positioned absolutely relative to the tabs container */}
            {showGroupsDropdown &&
              tournament_tables &&
              tournament_tables.data &&
              tournament_tables.data.data && (
                <div
                  ref={dropdownRef}
                  className="absolute top-full mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-2xl z-[9999] animate-in fade-in-0 zoom-in-95 duration-200 overflow-hidden flex flex-col"
                  style={{
                    left: dropdownPosition.left,
                    right: dropdownPosition.right,
                    maxHeight: "400px",
                  }}
                  onMouseEnter={handleGroupsMouseEnter}
                  onMouseLeave={handleGroupsMouseLeave}
                >
                  <GroupDropdown
                    groups={tournament_tables.data.data}
                    tournament_id={Number(tournamentid)}
                  />
                </div>
              )}
          </div>
        </div>

        <div className="">
          <div className="flex flex-col md:flex-row h-full">
            <TableStatusSidebar />
            <div className="flex-1 px-4 md:px-9 pb-8">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
