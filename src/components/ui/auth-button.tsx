import { useLogout } from "@/queries/users";
import { Button } from "./button";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useRouter } from "@tanstack/react-router";
import { useUser } from "@/providers/userProvider";
import { useSidebar } from "./sidebar";
import { User, LogOut, LogIn } from "lucide-react";

interface AuthButtonProps {
  className?: string;
}

export const AuthButton: React.FC<AuthButtonProps> = ({ className }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const logout = useLogout();
  const { user, setUser } = useUser();

  const { setOpenMobile } = useSidebar();
  const handleLogout = async () => {
    try {
      setUser(null);
      router.navigate({
        to: "/",
        replace: true,
      });
      await logout.mutateAsync();
    } catch (error) {
      console.error(error);
    }
  };

  if (user?.role.includes("admin")) {
    return (
      <>
        <Button
          variant="ghost"
          className="rounded-[6px] px-2 xl:px-3"
          onClick={() => {
            setOpenMobile(false);
            router.navigate({ to: "/profile" });
          }}
          title={t("navbar.profile")}
        >
          <User className="h-4 w-4" />
          <span className="hidden xl:inline ml-1">{t("navbar.profile")}</span>
        </Button>
        <Button
          variant="ghost"
          className="rounded-[6px] px-2 xl:px-3"
          onClick={handleLogout}
          title={t("navbar.logout")}
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden xl:inline ml-1">{t("navbar.logout")}</span>
        </Button>
      </>
    );
  } else {
    return (
      <Link to="/login">
        <Button
          variant="ghost"
          className={cn("rounded-[6px] text-stone-700 px-2 xl:px-3", className)}
          title={t("navbar.login")}
        >
          <LogIn className="h-4 w-4" />
          <span className="hidden xl:inline ml-1">{t("navbar.login")}</span>
        </Button>
      </Link>
    );
  }
};

