import {
  createFileRoute,
  Outlet,
  redirect,
  useLocation,
  useRouter,
  useRouterState,
} from "@tanstack/react-router";
import { SidebarProvider } from "@/components/ui/sidebar";
import AdminSidebar from "./-components/admin-sidebar";
import AdminBottomNav from "./-components/admin-bottom-nav";
import { useEffect, useState, useRef } from "react";
import ErrorPage from "@/components/error";
import { UseGetCurrentUser } from "@/queries/users";
import { ErrorResponse } from "@/types/errors";
import { useUser } from "@/providers/userProvider";
import TableStatusSidebar from "./tournaments/$tournamentid/-components/table-status-sidebar";
import TableStatusSidebarSkeleton from "./tournaments/$tournamentid/-components/table-status-skeleton";

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
    try {
      await queryClient.ensureQueryData(UseGetCurrentUser());
    } catch (error) {
      const err = error as ErrorResponse;
      if (err.response.status === 401) {
        throw redirect({
          to: "/",
        });
      }
      throw error;
    }
  },
});

function RouteComponent() {
  const router = useRouter();
  const location = useLocation();
  const { user } = useUser();

  const defaultOpen = getCookie("sidebar:state") !== "false";
  
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

  return (
    <div className="flex flex-col mx-auto bg-[#F7F7F7]">
      <div className="overflow-hidden">
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
      </div>
    </div>
  );
}
