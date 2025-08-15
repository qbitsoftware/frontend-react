import { createFileRoute } from "@tanstack/react-router";
import ErrorPage from "@/components/error";
import { useUser } from "@/providers/userProvider";
import { UserRoles } from "@/types/enums";
import AdminDashboard from "./-components/admin-db";
import ClubAdminDashboard from "./-components/club-admin.db";


export const Route = createFileRoute("/admin/dashboard/")({
  component: RouteComponent,
  errorComponent: () => <ErrorPage />,
});

export default function RouteComponent() {
  const { user } = useUser();

  switch (user?.role) {
    case UserRoles.ROLE_CLUB_ADMIN:
      return (<ClubAdminDashboard user={user} />)
    default:
      return (<AdminDashboard user={user} />)
  }
}

