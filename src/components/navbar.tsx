import { Link, useLocation } from "@tanstack/react-router";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { LanguageDropdown } from "./languageSelector";
import { useTranslation } from "react-i18next";
import { AuthButton } from "./ui/auth-button";
import { MobileMenuSidebarTrigger } from "./ui/sidebar";
import { useUser } from "@/providers/userProvider";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { t } = useTranslation();
  const { user } = useUser();
  const location = useLocation();
  const [scrollY, setScrollY] = useState(0);
  
  // Check if we're on a bracket route
  const isBracketRoute = location.pathname.includes('/tulemused/');
  
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    
    if (isBracketRoute) {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [isBracketRoute]);
  
  // Make navbar non-sticky after 100px scroll on bracket routes
  const shouldBeSticky = !isBracketRoute || scrollY < 200;

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
      name: t("navbar.menu.tournaments"),
      href: "#",
      dropdownItems: [
        { name: t("navbar.menu.competition"), href: "/voistlused" },
      ],
    },
    {
      name: t("navbar.menu.clubs"),
      href: "/klubid",
    },
    { name: t("navbar.menu.ratings"), href: "/reiting" },
    { name: t("navbar.menu.license"), href: "/litsents" },
    {
      name: t("navbar.menu.eltl"),
      href: "#",
      dropdownItems: [
        { name: t("navbar.menu.contact"), href: "/kontakt" },
        { name: t("navbar.menu.rules"), href: "/reeglid" },
      ],
    },

    { name: t("navbar.menu.feedback"), href: "/tagasiside" },
  ];

  return (
    <header className={`bg-white shadow-sm border-b border-[#E0E8F1] ${shouldBeSticky ? 'sticky top-0' : ''} z-50`}>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-4 ">
        <div className="flex justify-between items-center gap-6 h-16">
          <div className="flex gap-8">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <img
                  className="h-9 sm:h-10 w-auto object-contain"
                  src="/RLogo.png"
                  alt="ELTL Logo"
                  width="193"
                  height="50"
                  loading="eager"
                />
              </Link>
            </div>
            <div className="hidden lg:flex items-center space-x-2 xl:space-x-4">
              {menuItems.map((item) => (
                <div key={item.name} className="relative">
                  {item.dropdownItems ? (
                    <NavigationMenu>
                      <NavigationMenuList>
                        <NavigationMenuItem>
                          <NavigationMenuTrigger className="mt-[2px] text-sm font-medium transition-colors hover:text-primary bg-transparent text-gray-700 hover:text-blue-600">
                            {item.name}
                          </NavigationMenuTrigger>
                          <NavigationMenuContent className="z-[100]">
                            <ul className="grid w-[150px] gap-3 p-4 md:w-[200px] md:grid-cols-1 lg:w-[250px]">
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
                        </NavigationMenuItem>
                      </NavigationMenuList>
                    </NavigationMenu>
                  ) : (
                    <Link
                      href={item.href}
                      className="text-sm font-medium px-2 transition-colors hover:text-primary text-gray-700 hover:text-blue-600"
                    >
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
              {user?.role.includes("admin") && (
                <div className="ml-4">
                  <Link
                    href={"/admin/dashboard"}
                    className="text-sm font-medium px-2 xl:px-3 py-2 transition-colors bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg border border-blue-200 whitespace-nowrap"
                  >
                    {t("navbar.menu.admin")}
                  </Link>
                </div>
              )}
            </div>
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
