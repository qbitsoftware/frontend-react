import { Link, useLocation } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { getAdminNavigationItems } from "./admin-nav-items";
import { useUser } from "@/providers/userProvider";

const AdminBottomNav = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { user } = useUser();
  const menuItems = getAdminNavigationItems(t, user?.role);

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 pb-safe">
      <div className="flex justify-around items-center h-16">
        {menuItems.map((item) => {
          const isActive = location.pathname.includes(item.to);
          return (
            <Link
              key={item.id}
              to={item.to}
              className={`flex flex-col items-center justify-center flex-1 h-full ${
                isActive
                  ? "text-primary"
                  : "text-gray-500"
              }`}
            >
              <div className={`${isActive ? "text-primary" : "text-gray-500"}`}>
                {item.icon}
              </div>
              <span className="text-xs mt-1 text-center">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default AdminBottomNav;