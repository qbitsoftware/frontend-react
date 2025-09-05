import {
  createFileRoute,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTranslation } from "react-i18next";
import ErrorPage from "@/components/error";
import { useState, useRef, useEffect } from "react";
import { UseGetTournamentTablesQuery } from "@/queries/tables";
import GroupDropdown from "../-components/group-dropdown";
import { UseGetTournamentAdminQuery } from "@/queries/tournaments";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TournamentProvider } from "@/routes/voistlused/$tournamentid/-components/tournament-provider";
import { useNavigationHelper } from "@/providers/navigationProvider";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/tournaments/$tournamentid")({
  component: RouteComponent,
  errorComponent: () => <ErrorPage />,
});

function RouteComponent() {
  const location = useLocation();
  const params = useParams({ from: "/admin/tournaments/$tournamentid" })
  const navigate = useNavigate()
  const { data: tournament_data, isLoading: isLoadingTournament } = UseGetTournamentAdminQuery(Number(params.tournamentid))
  const { tournamentid } = Route.useParams();
  const { t } = useTranslation();
  const { data, isLoading } = UseGetTournamentTablesQuery(Number(tournamentid));
  const { groupId } = useNavigationHelper();

  const [showGroupsDropdown, setShowGroupsDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({
    left: "7.5rem",
    right: "auto",
  });
  const groupsHoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  let first_tournament_table: number | undefined = undefined;
  if (!isLoading && data && data.data && data.data.length > 0) {
    first_tournament_table = data.data[0].id;
  }
  useEffect(() => {
    if (!isLoadingTournament && (!tournament_data || !tournament_data.data)) {
      navigate({ to: "/admin/tournaments" });
    }
  }, [isLoadingTournament, tournament_data, navigate]);

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
          : location.pathname.includes("/kohad")
            ? "finalplacement"
            : location.pathname.includes("/grupid")
              ? "groups"
              : location.pathname.includes("/pildid")
                ? "images"
                : "info";


  return (
    <>
      <TooltipProvider delayDuration={300}>
        <TournamentProvider tournamentData={tournament_data?.data!}>
          <div className="mx-auto min-h-[95vh] h-full lg:mr-64">
            <div className="w-full relative">
              <div className="py-3 sm:py-4 px-4 md:px-8 flex flex-col xl:flex-row gap-3 lg:gap-4 justify-between items-start w-full bg-gradient-to-b from-white via-white/50 to-[#fafafa] border-b relative z-20 overflow-visible">
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
                    {tournament_data?.data?.name}
                  </h5>
                </div>
                <div
                  className={`relative w-full lg:w-auto ${showGroupsDropdown ? "overflow-visible" : "overflow-visible overflow-x-auto"}`}
                >
                  <Tabs value={currentTab} className="w-full lg:w-auto">
                    <div
                      className={`w-full ${showGroupsDropdown ? "overflow-visible" : "overflow-x-auto overflow-y-visible"}`}
                    >
                      <TabsList className="p-1 md:p-0 flex flex-row justify-start items-center gap-1 px-1 min-w-max">
                        <Link to={`/admin/tournaments/${tournamentid}`}>
                          <TabsTrigger
                            value="info"
                            className="py-[6px] flex-shrink-0 text-xs sm:text-sm bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-[#03326B] data-[state=active]:text-[#03326B] text-gray-600 hover:text-[#03326B] transition-colors rounded-none"
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
                              className="py-[6px] flex-shrink-0 text-xs sm:text-sm bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-[#03326B] data-[state=active]:text-[#03326B] text-gray-600 hover:text-[#03326B] transition-colors rounded-none"
                            >
                              {t("admin.layout.groups")}
                            </TabsTrigger>
                          </Link>
                        </div>
                        <Tooltip open={!first_tournament_table ? undefined : false}>
                          <TooltipTrigger asChild>
                            <Link
                              to={
                                groupId
                                  ? `/admin/tournaments/${tournamentid}/grupid/${groupId}/osalejad`
                                  : `/admin/tournaments/${tournamentid}/grupid/${first_tournament_table}/osalejad`
                              }
                              onClick={(e) => {
                                if (!first_tournament_table) {
                                  e.preventDefault();
                                  toast.error(
                                    t(
                                      "admin.tournaments.create_tournament.errors.create_tournament_class"
                                    )
                                  );
                                }
                              }}
                            >
                              <TabsTrigger
                                value="participants"
                                className={`py-[6px] flex-shrink-0 text-xs sm:text-sm bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-[#03326B] data-[state=active]:text-[#03326B] transition-colors rounded-none ${!first_tournament_table
                                  ? "text-gray-300 hover:text-gray-300 cursor-not-allowed"
                                  : "text-gray-600 hover:text-[#03326B]"
                                  }`}
                              >
                                {t(
                                  "admin.tournaments.groups.layout.participants",
                                  "Osalejad"
                                )}
                              </TabsTrigger>
                            </Link>
                          </TooltipTrigger>
                          {!first_tournament_table && (
                            <TooltipContent>
                              {t("admin.tournaments.create_tournament.errors.create_tournament_class")}
                            </TooltipContent>
                          )}
                        </Tooltip>

                        <Tooltip open={!first_tournament_table ? undefined : false}>
                          <TooltipTrigger asChild>
                            <Link
                              to={
                                groupId
                                  ? `/admin/tournaments/${tournamentid}/grupid/${groupId}/mangud`
                                  : `/admin/tournaments/${tournamentid}/mangud`
                              }
                              onClick={(e) => {
                                if (!first_tournament_table) {
                                  e.preventDefault();
                                  toast.error(
                                    t(
                                      "admin.tournaments.create_tournament.errors.create_tournament_class"
                                    )
                                  );
                                }
                              }}
                            >
                              <TabsTrigger
                                value="matches"
                                className={`py-[6px] flex-shrink-0 text-xs sm:text-sm bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-[#03326B] data-[state=active]:text-[#03326B] transition-colors rounded-none ${!first_tournament_table
                                  ? "text-gray-300 hover:text-gray-300 cursor-not-allowed"
                                  : "text-gray-600 hover:text-[#03326B]"
                                  }`}
                              >
                                {t(
                                  "admin.tournaments.groups.layout.games",
                                  "Mängud"
                                )}
                              </TabsTrigger>
                            </Link>
                          </TooltipTrigger>
                          {!first_tournament_table && (
                            <TooltipContent>
                              {t("admin.tournaments.create_tournament.errors.create_tournament_class")}
                            </TooltipContent>
                          )}
                        </Tooltip>

                        <Tooltip open={!first_tournament_table ? undefined : false}>
                          <TooltipTrigger asChild>
                            <Link
                              to={
                                groupId
                                  ? `/admin/tournaments/${tournamentid}/grupid/${groupId}/tabelid`
                                  : `/admin/tournaments/${tournamentid}/grupid/${first_tournament_table}/tabelid`
                              }
                              onClick={(e) => {
                                if (!first_tournament_table) {
                                  e.preventDefault();
                                  toast.error(
                                    t(
                                      "admin.tournaments.create_tournament.errors.create_tournament_class"
                                    )
                                  );
                                }
                              }}
                            >
                              <TabsTrigger
                                value="brackets"
                                className={`py-[6px] flex-shrink-0 text-xs sm:text-sm bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-[#03326B] data-[state=active]:text-[#03326B] transition-colors rounded-none ${!first_tournament_table
                                  ? "text-gray-300 hover:text-gray-300 cursor-not-allowed"
                                  : "text-gray-600 hover:text-[#03326B]"
                                  }`}
                              >
                                {t(
                                  "admin.tournaments.groups.layout.tables",
                                  "Tabelid"
                                )}
                              </TabsTrigger>
                            </Link>
                          </TooltipTrigger>
                          {!first_tournament_table && (
                            <TooltipContent>
                              {t("admin.tournaments.create_tournament.errors.create_tournament_class")}
                            </TooltipContent>
                          )}
                        </Tooltip>
                        <Tooltip open={!first_tournament_table ? undefined : false}>
                          <TooltipTrigger asChild>
                            <Link
                              to={
                                groupId
                                  ? `/admin/tournaments/${tournamentid}/grupid/${groupId}/kohad`
                                  : `/admin/tournaments/${tournamentid}/kohad`
                              }
                              onClick={(e) => {
                                if (!first_tournament_table) {
                                  e.preventDefault();
                                  toast.error(
                                    t(
                                      "admin.tournaments.create_tournament.errors.create_tournament_class"
                                    )
                                  );
                                }
                              }}
                            >
                              <TabsTrigger
                                value="finalplacement"
                                className={`py-[6px] flex-shrink-0 text-xs sm:text-sm bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-[#03326B] data-[state=active]:text-[#03326B] transition-colors rounded-none ${!first_tournament_table
                                  ? "text-gray-300 hover:text-gray-300 cursor-not-allowed"
                                  : "text-gray-600 hover:text-[#03326B]"
                                  }`}
                              >
                                {t("competitions.navbar.standings")}
                              </TabsTrigger>
                            </Link>
                          </TooltipTrigger>
                          {!first_tournament_table && (
                            <TooltipContent>
                              {t("admin.tournaments.create_tournament.errors.create_tournament_class")}
                            </TooltipContent>
                          )}
                        </Tooltip>

                        <Link to={`/admin/tournaments/${tournamentid}/ajakava`}>
                          <TabsTrigger
                            value="schedule"
                            className="py-[6px] flex-shrink-0 text-xs sm:text-sm bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-[#03326B] data-[state=active]:text-[#03326B] text-gray-600 hover:text-[#03326B] transition-colors rounded-none"
                          >
                            {t("admin.layout.schedule")}
                          </TabsTrigger>
                        </Link>
                        <Link to={`/admin/tournaments/${tournamentid}/pildid`}>
                          <TabsTrigger
                            value="images"
                            className="py-[6px] flex-shrink-0 text-xs sm:text-sm bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-[#03326B] data-[state=active]:text-[#03326B] text-gray-600 hover:text-[#03326B] transition-colors rounded-none"
                          >
                            {t("admin.layout.images")}
                          </TabsTrigger>
                        </Link>
                      </TabsList>
                    </div>
                  </Tabs>

                  {showGroupsDropdown && data && data.data && (
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
                        groups={data.data || []}
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
        </TournamentProvider>
      </TooltipProvider>
    </>
  );
}
