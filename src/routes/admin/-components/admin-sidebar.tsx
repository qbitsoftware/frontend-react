import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "@tanstack/react-router";
import { House } from "lucide-react";
import { useTranslation } from "react-i18next";
import sidebarLogo from "@/assets/sidebar-logo.png";
import { Button } from "@/components/ui/button";
import { LanguageDropdown } from "@/components/languageSelector";
import { getAdminNavigationItems } from "./admin-nav-items";
import { useUser } from "@/providers/userProvider";

const AdminSidebar = () => {
  const { t } = useTranslation();
  const { state } = useSidebar();
  const location = useLocation();
  const isCollapsed = state === "collapsed";
  const { user } = useUser()
  const menuItems = getAdminNavigationItems(t, user?.role);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        {isCollapsed ? (
          <div className="flex justify-center py-2">
            <SidebarTrigger />
          </div>
        ) : (
          <div className="flex items-center">
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-transparent"
            >
              <Link to="/" className="flex">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-white text-sidebar-primary-foreground">
                  <img src={sidebarLogo} alt="ELTL" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">ELTL</span>
                  <span className="truncate text-xs">Admin</span>
                </div>
              </Link>
            </SidebarMenuButton>

            <SidebarTrigger className="ml-2" />
          </div>
        )}
      </SidebarHeader>
      <SidebarContent>
        <nav
          className={`p-2 flex flex-col w-full gap-1 ${isCollapsed && "gap-4"}`}
        >
          {menuItems.map((item) => (
            <Link
              key={item.id}
              to={item.to}
              className={`w-full flex items-center rounded-md text-sm transition-colors duration-150 
                ${isCollapsed
                  ? "justify-center p-2"
                  : "justify-start px-3 py-2.5"
                }
                ${location.pathname.includes(item.to)
                  ? "bg-sidebar-accent "
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }
              `}
            >
              <div
                className={`flex items-center ${!isCollapsed ? "mr-3" : ""}`}
              >
                {item.icon}
              </div>
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>
      </SidebarContent>
      <SidebarFooter className="flex-row justify-between items-center">
        {!isCollapsed && (
          <>
            <Link to="/">
              <Button
                variant="ghost"
                className="w-full flex flex-row items-center justify-center mt-1 "
              >
                <House />
              </Button>
            </Link>
            <LanguageDropdown />
          </>
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};

export default AdminSidebar;
