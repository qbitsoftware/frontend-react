import ErrorPage from "@/components/error";
import { useUser } from "@/providers/userProvider";
import {
  Link,
  Outlet,
  createFileRoute,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { Settings, Trophy, User } from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/profile")({
  component: RouteComponent,
  errorComponent: () => {
    return <ErrorPage />;
  },
});

function RouteComponent() {
  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    if (!user) {
      navigate({ to: "/login" });
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const navItems = [
    { path: "/profile", label: "overview", icon: User },
    { path: "/profile/tournaments", label: "tournaments", icon: Trophy },
    { path: "/profile/settings", label: "settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Profile Header - Redesigned */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-[#4C97F1] rounded-full blur-2xl opacity-25 group-hover:opacity-40 transition-opacity duration-300" />
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#4C97F1] flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shadow-xl">
                {user.email?.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-3 border-white rounded-full shadow-md" />
            </div>

            <div className="text-center sm:text-left flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                {t("profile.header.greeting")}, {user.email?.split("@")[0]}
              </h1>
              <p className="text-gray-500 text-sm mb-4">{user.email}</p>

              <div className="flex flex-wrap justify-center sm:justify-start gap-6">
                <div className="group cursor-pointer">
                  <div className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    12
                  </div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">
                    {t("profile.header.tournaments")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <nav className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1.5 mb-8">
          <div className="flex gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    relative flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 flex-1
                    ${
                      isActive
                        ? "text-white"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }
                  `}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-[#4C97F1] rounded-xl shadow-md" />
                  )}

                  <div className="relative flex items-center gap-2.5 justify-center sm:justify-start w-full">
                    <Icon
                      className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? "text-white" : ""}`}
                    />
                    <span className="hidden sm:inline text-sm">
                      {t(`profile.navbar.${item.label}`)}
                    </span>
                  </div>

                  {isActive && (
                    <div className="sm:hidden absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        <Outlet />
      </div>
    </div>
  );
}
