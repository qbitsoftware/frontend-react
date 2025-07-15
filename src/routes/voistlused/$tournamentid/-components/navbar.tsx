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
    <div className="self-start">
      <div className="pt-12 pb-10 px-2 md:px-12 text-[#363636] ">
        <div className="flex flex-col">
          <h1 className="text-3xl text-center md:text-left font-semibold mb-1">
            {tournament.name}
          </h1>
          <p className="text-center md:text-left">{`${formatDateString(tournament.start_date)} - ${formatDateString(tournament.end_date)} • ${tournament.location}`}</p>
        </div>
      </div>
      <div className="px-2 md:px-12 ">
        <Tabs value={activeTab} className="w-full flex justify-center md:justify-start pb-2">
          <TabsList className="flex-wrap space-x-2">
            {filteredNavLinks.map((link) => (
              <Link
                className=""
                to={`/voistlused/${params.tournamentid}${link.href}`}
                key={link.name}
              >
                <TabsTrigger
                  value={link.href}
                  className={cn(
                    "text-sm 2xl:text-base px-3 py-2 w-auto lg:-[100px] xl:w-[125px] 2xl:w-[150px]",
                    activeTab === link.href &&
                    "bg-white text-[#212121] shadow-selectedFilter",
                    activeTab !== link.href &&
                    "hover:bg-white",
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
  );
};

export default Navbar;
