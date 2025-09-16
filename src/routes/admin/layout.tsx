import {
  createFileRoute,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
  useRouter,
  useRouterState,
} from "@tanstack/react-router";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import AdminSidebar from "./-components/admin-sidebar";
import AdminBottomNav from "./-components/admin-bottom-nav";
import { useEffect, useState, useRef, useCallback } from "react";
import ErrorPage from "@/components/error";
import { UseGetCurrentUser } from "@/queries/users";
import { useUser } from "@/providers/userProvider";
import TableStatusSidebarWrapper from "./tournaments/$tournamentid/-components/table-status-sidebar-wrapper";
import TableStatusSidebarSkeleton from "./tournaments/$tournamentid/-components/table-status-skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { WSMessage, WSMsgType, WSParticipantsData, WSTableInfo, WSTournamentData, WSTournamentsData, WSTournamentTableData, WSTournamentTablesData } from "@/types/ws_message";
import { WSProvider } from "@/providers/wsProvider";
import { TableSidebarContextProvider } from "@/providers/tableSidebarContext";
import { TournamentTablesResponse, TournamentTableWithStagesResponse } from "@/queries/tables";
import { TableInfoResponse } from "@/queries/match";
import { VenuesResponse } from "@/queries/venues";
import { BracketReponse, TournamentResponse, TournamentsResponse } from "@/queries/tournaments";

// Helper function to get cookie value
function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return undefined;
}

export const Route = createFileRoute("/admin")({
  component: RouteComponent,
  errorComponent: () => <ErrorPage />,
  loader: async ({ context: { queryClient } }) => {
    await queryClient.ensureQueryData(UseGetCurrentUser());
  },
});

// Component to handle auto-collapse logic inside SidebarProvider
function SidebarController() {
  const location = useLocation();
  const { setOpen } = useSidebar();
  const previousLocation = useRef<string>("");

  useEffect(() => {
    const isTournamentAdminRoute = /^\/admin\/tournaments\/\d+/.test(location.pathname);
    const wasOnTournamentRoute = /^\/admin\/tournaments\/\d+/.test(previousLocation.current);

    // Only auto-collapse when entering a tournament route from a non-tournament route
    if (isTournamentAdminRoute && !wasOnTournamentRoute) {
      setOpen(false);
    }

    previousLocation.current = location.pathname;
  }, [location.pathname, setOpen]);

  return null;
}

function RouteComponent() {
  const router = useRouter();
  const location = useLocation();
  const { user } = useUser();
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const params = useParams({ strict: false })

  const isTournamentAdminRoute = /^\/admin\/tournaments\/\d+/.test(location.pathname);
  const defaultOpen = getCookie("sidebar:state") !== "false" && !isTournamentAdminRoute;
  const [hasSidebarLoaded, setHasSidebarLoaded] = useState(false);
  const [isTableSidebarCollapsed, setIsTableSidebarCollapsed] = useState(false);
  const previousTournamentId = useRef<string | null>(null);

  if (!user?.role.includes('admin')) {
    router.navigate({ to: "/" });
  }

  useEffect(() => {
    if (location.pathname === "/admin" || location.pathname === "/admin/") {
      router.navigate({
        to: "/admin/dashboard",
      });
    }
  }, [location.pathname, router]);

  const { status } = useRouterState()
  const isLoading = status === "pending"

  const isTournamentRoute = location.pathname.includes('/tournaments/') && !location.pathname.includes("/new") &&
    location.pathname.split('/tournaments/')[1]?.split('/')[0];

  const currentTournamentId = isTournamentRoute ?
    location.pathname.split('/tournaments/')[1]?.split('/')[0] : null;

  useEffect(() => {
    if (currentTournamentId && currentTournamentId !== previousTournamentId.current) {
      setHasSidebarLoaded(false);
      previousTournamentId.current = currentTournamentId;
    }
  }, [currentTournamentId]);

  useEffect(() => {
    if (isTournamentRoute && !isLoading && !hasSidebarLoaded) {
      setHasSidebarLoaded(true);
    }
  }, [isTournamentRoute, isLoading, hasSidebarLoaded]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleWSMessage = useCallback((data: WSMessage) => {
    switch (data.type) {
      case WSMsgType.WSMsgTypeParticipants:
        const new_data = data.data as WSParticipantsData
        if (Number(params.tournamentid) === data.tournament_id) {
          if (data.group_id && data.group_id === Number(params.groupid)) {
            queryClient.setQueryData(["tournament_table", Number(data.group_id)], (oldData: TournamentTableWithStagesResponse) => {
              if (oldData && new_data.participants) {
                return {
                  ...oldData,
                  data: {
                    ...oldData.data,
                    participants: new_data.participants
                  }
                }
              } else if (oldData) {
                return {
                  ...oldData,
                  data: {
                    ...oldData.data,
                    participants: [],
                  }
                }
              }
            })
          }
        }
        break;
      case WSMsgType.WSMsgTypeTableInfo:
        const new_data_matches = data.data as WSTableInfo
        if (Number(params.tournamentid) === data.tournament_id) {
          queryClient.setQueryData(['matches_info_tournament', data.tournament_id], (oldData: TableInfoResponse) => {
            if (oldData && oldData.data && oldData.data.matches) {
              const updatedMatches = oldData.data.matches.map((m) => {
                const updatedMatch = new_data_matches.info?.matches.find((um) => um.match.id === m.match.id);
                return updatedMatch ? updatedMatch : m;
              });

              const output = {
                ...oldData,
                data: {
                  ...oldData.data,
                  matches: updatedMatches,
                }
              }

              return output
            }
          })
          queryClient.setQueryData(['venues_all', data.tournament_id], (oldData: VenuesResponse) => {
            return {
              ...oldData,
              data: new_data_matches.info?.all_tables,
            }
          })
          queryClient.setQueryData(['venues_free', data.tournament_id], (oldData: VenuesResponse) => {
            return {
              ...oldData,
              data: new_data_matches.info?.free_tables,
            }
          })
          if (data.group_id && Number(params.groupid) === data.group_id) {
            queryClient.setQueryData(['matches_info', data.group_id], (oldData: TableInfoResponse) => {
              if (!oldData) return data;
              const output = {
                ...oldData,
                data: {
                  ...oldData.data,
                  matches: new_data_matches.info?.matches,
                  free_tables: new_data_matches.info?.free_tables,
                  tournament_table: new_data_matches.info?.tournament_table
                }
              }

              return output
            })
            if (new_data_matches.info?.brackets) {
              queryClient.setQueryData(['bracket', data.tournament_id, data.group_id], (oldData: BracketReponse) => {
                if (!oldData) return { data: new_data_matches.info?.brackets, message: "", error: null };
                const output = {
                  ...oldData,
                  data: new_data_matches.info?.brackets
                }
                return output
              })
            }
            queryClient.setQueryData(["tournament_table", data.group_id], (oldData: TournamentTableWithStagesResponse) => {
              if (!oldData) return oldData;
              const output = {
                ...oldData,
                data: {
                  ...oldData.data,
                  group: new_data_matches.info?.tournament_table,
                }
              }
              return output
            })
          }

        }

        break;
      case WSMsgType.WSMsgTypeTournamentCreated:
        const data_trnment = data.data as WSTournamentData
        if (window.location.pathname.includes("/admin/tournaments")) {
          queryClient.setQueryData(
            ["tournaments_admin_query"],
            (oldData: TournamentsResponse) => {
              if (oldData?.data && data.data && data_trnment.tournament) {
                return {
                  ...oldData,
                  data: [...oldData.data, data_trnment.tournament],
                };
              } else if (data_trnment.tournament) {
                const newData: TournamentsResponse = {
                  message: "",
                  error: null,
                  data: [data_trnment.tournament],
                }
                return newData;
              } else {
                return {
                  message: "",
                  error: null,
                  data: [],
                }
              }
            },
          );
          if (data_trnment.tournament) {
            queryClient.setQueryData(["tournament_admin_query", data_trnment.tournament.id], (oldData: TournamentResponse) => {
              if (!oldData) {
                return { data: data_trnment.tournament, message: "", error: null }
              } else {
                return oldData
              }
            })
          }

        }
        break
      case WSMsgType.WSMsgTypeTournamentUpdated:
        const data_trnments = data.data as WSTournamentsData
        if (data_trnments.tournaments && window.location.pathname.includes("/admin/tournaments")) {
          queryClient.setQueryData(["tournaments_admin_query"], (oldData: TournamentsResponse) => {
            if (data_trnments.tournaments) {
              return {
                ...oldData,
                data: [...data_trnments.tournaments]
              }
            }
            return oldData;
          })

          let seen = false
          data_trnments.tournaments.map((trnment) => {
            if (trnment.id === Number(params.tournamentid)) {
              queryClient.setQueryData(["tournament_admin_query", trnment.id], (oldData: TournamentResponse) => {
                return { data: trnment, message: oldData.message, error: oldData.error };
              });
              queryClient.invalidateQueries({ queryKey: ['venues_all', trnment.id] })
              seen = true
            }
          })
          if (!seen) {
            navigate({ to: "/admin/tournaments" })
          }
        }
        break;
      case WSMsgType.WSMsgTypeTournamentTableCreated:
        const data_tt = data.data as WSTournamentTableData
        if (params.tournamentid && Number(params.tournamentid) === data.tournament_id) {
          if (data_tt.tournament_table) {
            queryClient.setQueryData(["tournament_tables_query", data.tournament_id], (oldData: TournamentTablesResponse) => {
              if (oldData) {
                if (oldData.data) {
                  let seen = false
                  oldData.data.map((tt) => {
                    if (tt.group.id === data_tt.tournament_table?.group.id) {
                      seen = true
                      return {
                        ...oldData,
                      }
                    }
                  })
                  if (!seen) {
                    return {
                      ...oldData,
                      data: [...oldData.data, data_tt.tournament_table]
                    }
                  }
                } else {
                  return {
                    ...oldData,
                    data: [data_tt.tournament_table]
                  }
                }
              }
            })
          }
        }
        break;
      case WSMsgType.WSMsgTypeTournamentTableUpdated:
        const data_tts = data.data as WSTournamentTablesData
        if (data_tts.tournament_tables) {
          let seen = false
          data_tts.tournament_tables.map((tt) => {
            if (params.groupid && Number(params.groupid) == Number(tt.group.id)) {
              queryClient.setQueryData(["tournament_table", tt.group.id], (oldData: TournamentTableWithStagesResponse) => {
                return { ...oldData, data: tt }
              })
              seen = true
            }
          })
          if (!seen) {
            navigate({ to: `/admin/tournaments/${params.tournamentid}/grupid` })
          }
        }

        queryClient.setQueryData(["tournament_tables_query", data.tournament_id], (oldData: TournamentTablesResponse) => {
          return { ...oldData, data: data_tts.tournament_tables }
        })

        break
      default:
        console.log("Unhandled WS message type:", data.type);
        break;
    }

  }, [location.pathname, queryClient, navigate, params]);




  return (
    <div className="flex flex-col mx-auto bg-[#F7F7F7]">
      <div className="overflow-hidden">
        <WSProvider url={import.meta.env.VITE_BACKEND_API_URL_WS + "ws/v1/admin"} onMessage={handleWSMessage}>
          <TableSidebarContextProvider isCollapsed={isTableSidebarCollapsed}>
            <SidebarProvider defaultOpen={defaultOpen}>
              <SidebarController />
              <AdminSidebar />
              <div className="w-full overflow-x-auto pb-20 lg:pb-0">
                <Outlet />
              </div>
              {isTournamentRoute && (
                (isLoading && !hasSidebarLoaded) ?
                  <TableStatusSidebarSkeleton /> :
                  <TableStatusSidebarWrapper onStateChange={setIsTableSidebarCollapsed} />
              )}
            </SidebarProvider>
            <AdminBottomNav />
          </TableSidebarContextProvider>
        </WSProvider>
      </div>
    </div>
  );
}
