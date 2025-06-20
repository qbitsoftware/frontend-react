import { UserRoles } from "@/types/enums";
import {
  FileText,
  LayoutDashboard,
  MessagesSquare,
  PersonStanding,
  Trophy,
} from "lucide-react";

export const getAdminNavigationItems = (t: any, userRole?: string) => {
  const menuItems = [
    {
      id: "dashboard",
      label: t("admin.layout.sidebar.dashboard"),
      icon: <LayoutDashboard className="h-5 w-5" />,
      to: "/admin/dashboard",
      requiredRole: [UserRoles.ROLE_ROOT_ADMIN, UserRoles.ROLE_ORG_ADMIN, UserRoles.ROLE_SOLO_ADMIN],
    },
    {
      id: "tournaments",
      label: t("admin.layout.sidebar.tournaments"),
      icon: <Trophy className="h-5 w-5" />,
      to: "/admin/tournaments",
      requiredRole: [UserRoles.ROLE_ROOT_ADMIN, UserRoles.ROLE_ORG_ADMIN, UserRoles.ROLE_SOLO_ADMIN],
    },
    {
      id: "blog",
      label: t("admin.layout.sidebar.blogs"),
      icon: <FileText className="h-5 w-5" />,
      to: "/admin/blog",
      requiredRole: [UserRoles.ROLE_ROOT_ADMIN, UserRoles.ROLE_MEDIA_ADMIN],
    },
    {
      id: "clubs",
      label: t("admin.layout.sidebar.clubs"),
      icon: <PersonStanding className="h-5 w-5" />,
      to: "/admin/clubs",
      requiredRole: [UserRoles.ROLE_ROOT_ADMIN],
    },
    {
      id: "feedback",
      label: t("admin.layout.sidebar.feedback"),
      icon: <MessagesSquare className="h-5 w-5" />,
      to: "/admin/feedback",
    },
  ];

  return menuItems.filter((item) => {
    if (!item.requiredRole) return true;

    if (!userRole) return false;

    return item.requiredRole.includes(userRole as UserRoles);
  });
};