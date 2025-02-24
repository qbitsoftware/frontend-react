"use client"

import { Link, useParams, useLocation } from "@tanstack/react-router"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

const NavLinks = [
  { name: "Info", href: "/" },
  { name: "Ajakava", href: "/ajakava" },
  { name: "Tulemused", href: "/tulemused" },
  { name: "Osalejad", href: "/osalejad" },
  { name: "Galerii", href: "/galerii" },
  { name: "Juhend", href: "/juhend" },
  { name: "Sponsorid", href: "/sponsorid" },
  { name: "Meedia", href: "/meedia" },
]

const Navbar = () => {
  const params = useParams({ strict: false })
  const location = useLocation()

  const currentTab = location.pathname.split("/").pop() || "/"

  return (
    <div className="">
      <div className="pt-12 pb-4 text-[#363636] bg-[#FBFCFD]">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl text-center font-semibold mb-4">Eesti Lauatennise Meistrivõistlused 2025</h1>
          <p className="text-xl text-center">27. - 29. Jaanuar 2025 • Tallinna Spordihoone</p>
        </div>
      </div>
      <div className="shadow-lg bg-[#F2F7FD]">
        <Tabs value={currentTab} className="w-full flex justify-center">
          <TabsList className="flex-wrap w-[80%] mx-auto">
            {NavLinks.map((link) => (
              <Link className="" to={`/voistlused/${params.tournamentid}${link.href}`} key={link.name}>
                <TabsTrigger
                  value={link.href.replace("/", "")}
                  className={cn(
                    "text-sm sm:text-base px-3 py-2 m-1 w-auto lg:-[100px] xl:w-[125px] 2xl:w-[150px]",
                    currentTab === link.href.replace("/", "") && "bg-[#3C83F6] text-white",
                    currentTab !== link.href.replace("/", "") && "hover:bg-[#3C83F6]/10",
                  )}
                >
                  {link.name}
                </TabsTrigger>
              </Link>
            ))}
          </TabsList>
        </Tabs>
      </div>
    </div>
  )
}

export default Navbar

