import { Link, useParams, useLocation } from "@tanstack/react-router";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn, formatDateString } from "@/lib/utils";
import { useTournament } from "./tournament-provider";
import { useTranslation } from "react-i18next";
import { TournamentTable } from "@/types/groups";
import { Calendar, MapPin } from "lucide-react";

interface Props {
  tournament_tables: TournamentTable[]
}

const Navbar = ({ tournament_tables }: Props) => {
  const { t } = useTranslation()
  
  // Get the first available tournament table for direct bracket navigation
  const firstTableId = tournament_tables.length > 0 ? tournament_tables[0].id : null;
  const resultsHref = firstTableId ? `/tulemused/${firstTableId}` : "/tulemused";
  
  const NavLinks = [
    { name: t("competitions.navbar.info"), href: "/" },
    { name: t("competitions.navbar.matches"), href: "/ajakava" },
    { name: t("competitions.navbar.results"), href: resultsHref },
    { name: t("competitions.navbar.participants"), href: "/mangijad" },
    { name: t("competitions.navbar.tables"), href: "/lauad" },
    { name: t("competitions.navbar.gallery"), href: "/galerii" },
    { name: t("competitions.navbar.guide"), href: "/juhend" },
    { name: t("competitions.navbar.sponsors"), href: "/sponsorid" },
    { name: t("competitions.navbar.media"), href: "/meedia" },
  ];
  const params = useParams({ strict: false });
  const location = useLocation();
  const tournament = useTournament();

  const currentPath = location.pathname;
  const baseUrl = `/voistlused/${params.tournamentid}`;

  let activeTab = "/";

  NavLinks.forEach(link => {
    if (link.href !== "/") {
      // Special handling for results (brackets) - match both /tulemused and /tulemused/{id}
      if (link.name === t("competitions.navbar.results")) {
        if (currentPath.includes(baseUrl + "/tulemused")) {
          activeTab = link.href;
        }
      } else if (currentPath.includes(baseUrl + link.href)) {
        activeTab = link.href;
      }
    }
  });

  // Filter out "Juhend" if no champions_league table exists
  const filteredNavLinks = NavLinks.filter(link => {
    if (link.name === t("competitions.navbar.guide") || link.name === t("competitions.navbar.sponsors")) {
      return tournament_tables.some(table => table.type === "champions_league");
    }
    return true;
  });

  return (
    <div className="self-start w-full">
      <div className="relative overflow-hidden bg-[#4C97F1] text-white shadow-lg rounded-bl-3xl rounded-br-3xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative pt-6 pb-4 px-6 md:px-12">
          <div className="flex flex-col space-y-2">
            <h1 className="text-2xl md:text-3xl text-center md:text-left font-bold tracking-tight">
              {tournament.name}
            </h1>
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 text-base md:text-lg text-blue-100 font-medium">
                <Calendar className="h-4 w-4" />
                <span>{`${formatDateString(tournament.start_date)} - ${formatDateString(tournament.end_date)}`}</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2 text-blue-200 text-sm md:text-base mt-1">
                <MapPin className="h-4 w-4" />
                <span>{tournament.location}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
      </div>
      <div className="bg-white border-b border-gray-200 shadow-sm mt-5 rounded-xl">
        <div className="px-6 md:px-8">
          <Tabs value={activeTab} className="w-full flex justify-center md:justify-start">
            <TabsList className="bg-transparent p-0 h-auto flex-wrap gap-0 border-b-0">
              {filteredNavLinks.map((link) => (
                <Link
                  className=""
                  to={`/voistlused/${params.tournamentid}${link.href}`}
                  key={link.name}
                >
                  <TabsTrigger
                    value={link.href}
                    className={cn(
                      "text-sm 2xl:text-base px-4 py-3 rounded-none border-b-4 border-transparent bg-white transition-all duration-200",
                      "w-auto lg:w-[100px] xl:w-[125px] 2xl:w-[150px]",
                      "hover:bg-gray-50",
                      "data-[state=active]:bg-white data-[state=active]:text-gray-600 data-[state=active]:border-[#4C97F1] data-[state=active]:font-semibold data-[state=active]:shadow-none",
                      activeTab === link.href &&
                      "text-gray-600 border-[#4C97F1] bg-white font-semibold shadow-none",
                      activeTab !== link.href &&
                      "text-gray-600"
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
    </div>
  );
};

export default Navbar;
