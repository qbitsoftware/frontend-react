import { Link, useParams, useLocation } from "@tanstack/react-router";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn, formatDateString } from "@/lib/utils";
import { useTournament } from "./tournament-provider";
import { useTranslation } from "react-i18next";
import { TournamentTable } from "@/types/groups";

interface Props {
  tournament_tables: TournamentTable[]
}

const Navbar = ({ tournament_tables }: Props) => {
  const { t } = useTranslation()
  const NavLinks = [
    { name: t("competitions.navbar.info"), href: "/" },
    { name: t("competitions.navbar.matches"), href: "/ajakava" },
    { name: "Lauad", href: "/lauad" },
    { name: t("competitions.navbar.results"), href: "/tulemused" },
    { name: t("competitions.navbar.participants"), href: "/mangijad" },
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
    if (link.href !== "/" && currentPath.includes(baseUrl + link.href)) {
      activeTab = link.href;
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
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 text-white shadow-lg rounded-bl-3xl rounded-br-3xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative pt-8 pb-6 px-6 md:px-12">
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl md:text-4xl text-center md:text-left font-bold tracking-tight">
              {tournament.name}
            </h1>
            <div className="text-center md:text-left">
              <p className="text-base md:text-lg text-blue-100 font-medium">
                {`${formatDateString(tournament.start_date)} - ${formatDateString(tournament.end_date)}`}
              </p>
              <p className="text-blue-200 text-sm md:text-base mt-1">
                {tournament.location}
              </p>
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
                      "text-sm 2xl:text-base px-4 py-3 rounded-none border-b-2 border-transparent bg-transparent transition-all duration-200",
                      "w-auto lg:w-[100px] xl:w-[125px] 2xl:w-[150px]",
                      "hover:bg-gray-50 hover:text-blue-700",
                      activeTab === link.href &&
                      "text-blue-700 border-blue-700 bg-[#4C97F1] font-semibold",
                      activeTab !== link.href &&
                      "text-gray-600 hover:border-gray-300"
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
