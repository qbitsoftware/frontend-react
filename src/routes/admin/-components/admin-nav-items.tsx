import {
  FileText,
  LayoutDashboard,
  MessageCircleQuestion,
  MessagesSquare,
  PersonStanding,
  Trophy,
} from "lucide-react";

export const getAdminNavigationItems = (t: any) => [
  {
    id: "dashboard",
    label: t("admin.layout.sidebar.dashboard"),
    icon: <LayoutDashboard className="h-5 w-5" />,
    to: "/admin/dashboard",
  },
  {
    id: "tournaments",
    label: t("admin.layout.sidebar.tournaments"),
    icon: <Trophy className="h-5 w-5" />,
    to: "/admin/tournaments",
  },
  {
    id: "blog",
    label: t("admin.layout.sidebar.blogs"),
    icon: <FileText className="h-5 w-5" />,
    to: "/admin/blog",
  },
  {
    id: "clubs",
    label: t("admin.layout.sidebar.clubs"),
    icon: <PersonStanding className="h-5 w-5" />,
    to: "/admin/clubs",
  },
  {
    id: "feedback",
    label: t("admin.layout.sidebar.feedback"),
    icon: <MessagesSquare className="h-5 w-5" />,
    to: "/admin/feedback",
  },
  {
    id: "tutorial",
    label: t("admin.layout.sidebar.tutorial"),
    icon: <MessageCircleQuestion className="h-5 w-5" />,
    to: "/admin/tutorial",
  },
];