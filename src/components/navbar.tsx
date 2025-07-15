import { Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { LanguageDropdown } from "./languageSelector";
import { useTranslation } from "react-i18next";
import { AuthButton } from "./ui/auth-button";
import { MobileMenuSidebarTrigger } from "./ui/sidebar";
import { useUser } from "@/providers/userProvider";

export default function Navbar() {
  const [activeItem, setActiveItem] = useState("");
  const { t } = useTranslation();
  const { user } = useUser();

  const menuItems = [
    {
      name: t("navbar.menu.news.name"),
      href: "/uudised",
      dropdownItems: [
        { name: t("navbar.menu.news.all"), href: "/uudised" },
        {
          name: t("navbar.menu.news.competitions"),
          href: `/uudised?category=competitions`,
        },
        { name: t("navbar.menu.news.name"), href: `/uudised?category=news` },
        {
          name: t("navbar.menu.news.good_read"),
          href: `/uudised?category=good_read`,
        },
        {
          name: t("navbar.menu.news.results"),
          href: `/uudised?category=results`,
        },
      ],
    },
    {
      name: t("navbar.menu.competition"),
      href: "/voistlused",
    },
    {
      name: t("navbar.menu.clubs"),
      href: "/klubid",
    },
    { name: t("navbar.menu.ratings"), href: "/reiting" },
    { name: t("navbar.menu.rules"), href: "/reeglid" },
    { name: t("navbar.menu.contact"), href: "/kontakt" },
    { name: t("navbar.menu.license"), href: "/litsents" },
  ];

  return (
    <header className="bg-white shadow-sm border-b border-[#E0E8F1]  sticky top-0 z-50">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-4 ">
        <div className="flex justify-between items-center gap-6 h-16">
          <div className="flex gap-8">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <img
                  className="h-10 lg:h-8 xl:h-8 w-auto"
                  src="/RLogo.png"
                  alt="ELTA Logo"
                />
              </Link>
            </div>
            <NavigationMenu className="hidden lg:flex z-50 items-center">
              <NavigationMenuList className="flex space-x-4 z-50">
                {menuItems.map((item) => (
                  <NavigationMenuItem key={item.name}>
                    {item.dropdownItems ? (
                      <NavigationMenuTrigger
                        className={cn(
                          "mt-[2px] text-sm font-medium transition-colors hover:text-primary bg-transparent",
                          activeItem === item.name
                            ? "text-blue-600"
                            : "text-gray-700 hover:text-blue-600",
                        )}
                      >
                        {item.name}
                      </NavigationMenuTrigger>
                    ) : (
                      <NavigationMenuLink
                        href={item.href}
                        className={cn(
                          "text-sm font-medium px-2 transition-colors hover:text-primary",
                          activeItem === item.name
                            ? "text-blue-600"
                            : "text-gray-700 hover:text-blue-600",
                        )}
                        onClick={() => setActiveItem(item.name)}
                      >
                        {item.name}
                      </NavigationMenuLink>
                    )}
                    {item.dropdownItems && (
                      <NavigationMenuContent className="">
                        <ul className="grid w-[200px] gap-3 p-4 md:w-[300px] md:grid-cols-1 lg:w-[400px]">
                          {item.dropdownItems.map((dropdownItem) => (
                            <li key={dropdownItem.name}>
                              <NavigationMenuLink asChild>
                                <Link
                                  href={dropdownItem.href}
                                  className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                >
                                  <div className="text-sm font-medium leading-none">
                                    {dropdownItem.name}
                                  </div>
                                </Link>
                              </NavigationMenuLink>
                            </li>
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    )}
                  </NavigationMenuItem>
                ))}
                {user?.role.includes("admin") && (
                  <NavigationMenuItem>
                    <NavigationMenuLink
                      href={"/admin/dashboard"}
                      className={
                        "text-sm font-medium px-3 py-2 transition-colors bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg border border-blue-200"
                      }
                    >
                      {t('navbar.menu.admin')}
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                )}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="hidden lg:flex items-center gap-2">
            <AuthButton />
            <LanguageDropdown />
          </div>

          <MobileMenuSidebarTrigger className="lg:hidden my-auto text-secondary" />
        </div>
      </div>
    </header>
  );
}
