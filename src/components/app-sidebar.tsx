import { useState } from "react"
import { Link } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"
import { AuthButton } from "./ui/auth-button"
import { LanguageDropdown } from "./languageSelector"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, useSidebar } from "./ui/sidebar"
import { useUser } from "@/providers/userProvider"

export function AppSidebar() {
    const { setOpen, setOpenMobile } = useSidebar()
    const { t } = useTranslation()
    const [activeItem, setActiveItem] = useState<string>("")
    const [openDropdown, setOpenDropdown] = useState<string | null>(null)
    const menuItems = [
        {
            name: t('navbar.menu.news.name'),
            href: '/uudised',
            dropdownItems: [
                { name: t('navbar.menu.news.all'), href: '/uudised' },
                { name: t('navbar.menu.news.competitions'), href: `/uudised?category=competitions` },
                { name: t('navbar.menu.news.name'), href: `/uudised?category=news` },
                { name: t('navbar.menu.news.good_read'), href: `/uudised?category=good_read` },
                { name: t('navbar.menu.news.results'), href: `/uudised?category=results` },
            ]
        },
        {
            name: t('navbar.menu.competition'),
            href: '/voistlused',
        },
        {
            name: t('navbar.menu.clubs'),
            href: '/klubid',
        },
        { name: t('navbar.menu.ratings'), href: '/reiting' },
        { name: t('navbar.menu.rules'), href: '/reeglid' },
        { name: t('navbar.menu.contact'), href: '/kontakt' },
        { name: t('navbar.menu.license'), href: '/litsents' },
    ]

    const toggleDropdown = (item: string) => {
        setOpenDropdown(openDropdown === item ? null : item)
    }

    const handleNavigation = (name: string) => {
        setActiveItem(name)
        setOpen(false)
        setOpenMobile(false)
    }

    const { user } = useUser()

    return (
        <Sidebar
            className="bg-white border-r w-60 border-gray-200 flex flex-col lg:hidden"
            side="right"
        >
            <SidebarHeader className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                    <Link href="/">
                        <img className="h-8 w-auto" src="/RLogo.png" alt="ELTL Logo" />
                    </Link>
                    <LanguageDropdown />
                </div>
            </SidebarHeader>

            <SidebarContent className="flex-1 overflow-y-auto p-2">
                <ul className="space-y-2">
                    {menuItems.map((item) => (
                        <li key={item.name} className="border-b">
                            {item.dropdownItems ? (
                                <button
                                    onClick={() => toggleDropdown(item.name)}
                                    className={cn(
                                        "w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors",
                                        activeItem === item.name && "bg-gray-100 font-semibold"
                                    )}
                                >
                                    {item.name}
                                </button>
                            ) : (
                                <Link
                                    href={item.href}
                                    onClick={() => handleNavigation(item.name)}
                                    className={cn(
                                        "block px-4 py-2 hover:bg-gray-50 transition-colors",
                                        activeItem === item.name && "bg-gray-100 font-semibold"
                                    )}
                                >
                                    {item.name}
                                </Link>
                            )}
                            {item.dropdownItems && openDropdown === item.name && (
                                <ul className="ml-4 mb-2">
                                    {item.dropdownItems.map((subItem) => (
                                        <li key={subItem.name}>
                                            <Link
                                                href={subItem.href}
                                                onClick={() => {
                                                    setActiveItem(subItem.name)
                                                    setOpenDropdown(null)
                                                    setOpen(false)
                                                    setOpenMobile(false)
                                                }}
                                                className={cn(
                                                    "block px-4 py-1 hover:bg-gray-100 transition-colors",
                                                    activeItem === subItem.name && "bg-gray-200 font-semibold"
                                                )}
                                            >
                                                {subItem.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}

                        </li>

                    ))}
                    {user?.role.includes("admin") && (
                        <li className="border-b">
                            <Link
                                href={"/admin/dashboard"}
                                onClick={() => {
                                    setActiveItem("Admin")
                                    setOpenDropdown(null)
                                    setOpen(false)
                                    setOpenMobile(false)
                                }}
                                className={cn(
                                    "block px-4 py-2 transition-colors rounded-lg mx-2 mb-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200",
                                    activeItem === "Admin" && "bg-blue-100 font-semibold"
                                )}
                            >
                                {t('navbar.menu.admin')}
                            </Link>
                        </li>
                    )}
                </ul>
                <AuthButton className="w-full mt-4 rounded-md" />
            </SidebarContent>

            <SidebarFooter className="p-4 border-t text-center border-gray-200">
                <div className="text-sm text-gray-500">© {new Date().getFullYear()} ELTL</div>
            </SidebarFooter>
        </Sidebar>
    )
}
