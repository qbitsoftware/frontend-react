import {
  createFileRoute,
  Outlet,
  useLocation,
  useNavigate,
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
import TableStatusSidebar from "./tournaments/$tournamentid/-components/table-status-sidebar";
import TableStatusSidebarSkeleton from "./tournaments/$tournamentid/-components/table-status-skeleton";
import { WSProvider } from "@/providers/wsProvider";
import { WSMessage, WSMsgType } from "@/types/ws_message";
import { useQueryClient } from "@tanstack/react-query";

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
    // try {
    await queryClient.ensureQueryData(UseGetCurrentUser());
    // } catch (error) {
    //   const err = error as ErrorResponse;
    //   if (err.response.status === 401) {
    //     throw redirect({
    //       to: "/",
    //     });
    //   }
    //   throw error;
    // }
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

  const isTournamentAdminRoute = /^\/admin\/tournaments\/\d+/.test(location.pathname);
  const defaultOpen = getCookie("sidebar:state") !== "false" && !isTournamentAdminRoute;
  const [hasSidebarLoaded, setHasSidebarLoaded] = useState(false);
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
  const queryClient = useQueryClient()

  const isTournamentRoute = location.pathname.includes('/tournaments/') &&
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
    if (data.type === WSMsgType.ParticipantUpdated || data.type === WSMsgType.ParticipantCreated || data.type === WSMsgType.ParticipantDeleted) {
      const { tournament_id, table_id } = data.data;
      const path = window.location.pathname;
      if (path.includes(tournament_id) && path.includes(table_id)) {
        queryClient.invalidateQueries({ queryKey: ["participants", Number(table_id)] });
      }
    } else if (data.type === WSMsgType.TournamentCreated) {
      queryClient.invalidateQueries({ queryKey: ['tournaments_admin_query'] })
    } else if (data.type === WSMsgType.TournamentDeleted) {
      const { tournament_id } = data.data;
      const path = window.location.pathname;
      queryClient.invalidateQueries({ queryKey: ['tournaments_admin_query'] })
      if (path.includes(tournament_id)) {
        navigate({ to: `/admin/tournaments` });
      }
    } else if (data.type === WSMsgType.TournamentUpdated) {
      const { tournament_id } = data.data
      queryClient.invalidateQueries({ queryKey: ['tournaments_admin_query'] })
      queryClient.invalidateQueries({ queryKey: ['tournament_admin_query', Number(tournament_id)] })
      queryClient.invalidateQueries({ queryKey: ['venues_all', Number(tournament_id)] })
      queryClient.invalidateQueries({ queryKey: ['venues_free', Number(tournament_id)] })
    } else if (data.type === WSMsgType.MatchUpdated) {
      const { tournament_id, table_id } = data.data;
      queryClient.invalidateQueries({ queryKey: ['bracket', Number(tournament_id), Number(table_id)] })
      queryClient.invalidateQueries({ queryKey: ['matches', Number(tournament_id)] })
      queryClient.invalidateQueries({ queryKey: ['matches_group', Number(table_id)] })
      queryClient.invalidateQueries({ queryKey: ['venues_all', Number(tournament_id)] })
      queryClient.invalidateQueries({ queryKey: ['venues_free', Number(tournament_id)] })
    } else if (data.type === WSMsgType.TournamentTableCreated || data.type === WSMsgType.TournamentTableUpdated) {
      const { tournament_id } = data.data;
      const path = window.location.pathname;
      if (path.includes(tournament_id)) {
        queryClient.invalidateQueries({ queryKey: ['tournament_tables_query', Number(tournament_id)] })
      }
    } else if (data.type === WSMsgType.TournamentTableDeleted) {
      const { tournament_id, table_id } = data.data;
      const path = window.location.pathname;

      if (path.includes(tournament_id)) {
        queryClient.invalidateQueries({ queryKey: ['tournament_tables_query', Number(tournament_id)] })
        if (path.includes(String(table_id))) {
          navigate({ to: `/admin/tournaments/${Number(tournament_id)}/grupid` });
        }
      }
    } else if (data.type === WSMsgType.MatchStarted) {
      const { tournament_id, table_id } = data.data;
      const path = window.location.pathname;

      if (path.includes(tournament_id) && path.includes(table_id)) {
        queryClient.invalidateQueries({ queryKey: ['matches_group', Number(table_id)] })
        queryClient.invalidateQueries({ queryKey: ['bracket', Number(tournament_id)] })
      }
    } else if (data.type === WSMsgType.MatchReset) {
      const { tournament_id, table_id } = data.data;
      const path = window.location.pathname;

      if (path.includes(tournament_id) && path.includes(table_id)) {
        queryClient.invalidateQueries({ queryKey: ['matches_group', Number(table_id)] })
        queryClient.invalidateQueries({ queryKey: ['bracket', Number(tournament_id)] })
      }
      queryClient.invalidateQueries({ queryKey: ['venues_all', Number(tournament_id)] })
      queryClient.invalidateQueries({ queryKey: ['venues_free', Number(tournament_id)] })
    } else if (data.type === WSMsgType.MatchResetSolo) {
      const { tournament_id, table_id } = data.data;
      const path = window.location.pathname;

      if (path.includes(tournament_id) && path.includes(table_id)) {
        queryClient.invalidateQueries({ queryKey: ['matches_group', Number(table_id)] })
        queryClient.invalidateQueries({ queryKey: ['bracket', Number(tournament_id)] })
        queryClient.invalidateQueries({ queryKey: ['matches', Number(table_id)] })
        queryClient.invalidateQueries({ queryKey: ['venues_all', Number(tournament_id)] })
        queryClient.invalidateQueries({ queryKey: ['venues_free', Number(tournament_id)] })
        queryClient.invalidateQueries({ queryKey: ['tournament_table', Number(table_id)] })

      }
    }
  }, [location.pathname, queryClient, navigate]);




  return (
    <div className="flex flex-col mx-auto bg-[#F7F7F7]">
      <div className="overflow-hidden">
<<<<<<< HEAD
        <WSProvider url={import.meta.env.VITE_BACKEND_API_URL_WS + "ws/v1/admin"} onMessage={handleWSMessage}>
          <SidebarProvider defaultOpen={defaultOpen}>
            <AdminSidebar />
            <div className="w-full overflow-x-auto pb-20 lg:pb-0">
              <Outlet />
            </div>
            {isTournamentRoute && (
              (isLoading && !hasSidebarLoaded) ? <TableStatusSidebarSkeleton /> : <TableStatusSidebar />
            )}
          </SidebarProvider>
          <AdminBottomNav />
        </WSProvider>
=======
        <SidebarProvider defaultOpen={defaultOpen}>
          <SidebarController />
          <AdminSidebar />
          <div className="w-full overflow-x-auto pb-20 lg:pb-0">
            <Outlet />
          </div>
          {isTournamentRoute && (
            (isLoading && !hasSidebarLoaded) ? <TableStatusSidebarSkeleton /> : <TableStatusSidebar />
          )}
        </SidebarProvider>
        <AdminBottomNav />
>>>>>>> main
      </div>
    </div>
  );
}
