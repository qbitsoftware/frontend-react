import { createFileRoute } from "@tanstack/react-router";
import { UseGetTournamentTables } from "@/queries/tables";
import Group from "./-components/group";
import { ChevronDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import ErrorPage from "@/components/error";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ErrorResponse } from "@/types/errors";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/voistlused/$tournamentid/mangijad/")({
  component: RouteComponent,
  errorComponent: () => <ErrorPage />,
  loader: async ({ context: { queryClient }, params }) => {
    try {
      const tables_data = await queryClient.ensureQueryData(
        UseGetTournamentTables(Number(params.tournamentid))
      );
      return { tables_data };
    } catch (error) {
      const err = error as ErrorResponse;
      if (err.response?.status === 404) {
        return { tables_data: null };
      }
      throw error;
    }
  },
});

function RouteComponent() {
  const { tables_data } = Route.useLoaderData();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeClass, setActiveClass] = useState<string>("all");
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());
  const { t } = useTranslation();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const originalData = tables_data?.data || [];

  // Extract unique classes from tables data
  const getUniqueClasses = (tables: any[]) => {
    const classes = new Set<string>();
    tables.forEach((table) => {
      if (table.class) {
        classes.add(table.class);
      }
    });
    return Array.from(classes).sort();
  };

  // Calculate total number of unique players
  const getTotalPlayers = (tables: any[]) => {
    const uniquePlayerIds = new Set();
    tables.forEach((table) => {
      if (table.participants) {
        table.participants.forEach((player: any) => {
          const playerId = player.id || player.name;
          if (playerId) {
            uniquePlayerIds.add(playerId);
          }
        });
      }
    });
    return uniquePlayerIds.size;
  };

  const classes = getUniqueClasses(originalData);

  let filteredData = originalData;

  // Filter by class first
  if (activeClass !== "all") {
    filteredData = filteredData.filter((table) => table.class === activeClass);
  }

  const filteredPlayerCount = getTotalPlayers(filteredData);

  // Then filter by search query
  if (searchQuery && filteredData.length > 0) {
    const searchBy = searchQuery.toLowerCase();

    filteredData = filteredData
      .map((table) => {
        const filteredParticipants = table.participants.filter((player) =>
          player.name?.toLowerCase().includes(searchBy)
        );

        return {
          ...table,
          participants: filteredParticipants,
        };
      })
      .filter((table) => table.participants.length > 0);
  }

  // Determine how many groups to open based on screen size and total groups
  const getGroupsToOpen = (totalGroups: number, screenWidth: number) => {
    if (screenWidth < 1024) {
      // Mobile/tablet (< lg)
      return totalGroups >= 1 ? 1 : 0;
    } else if (screenWidth < 1280) {
      // Large screens (lg, < xl)
      if (totalGroups === 1) return 1;
      if (totalGroups === 2) return 2;
      return 2; // For 3+ groups, open first 2
    } else {
      // Extra large screens (xl+)
      if (totalGroups === 1) return 1;
      if (totalGroups === 2) return 2;
      if (totalGroups === 3) return 3;
      return 3; // For 4+ groups, open first 3
    }
  };

  // Update open groups when filtered data changes
  useEffect(() => {
    if (filteredData.length > 0) {
      const screenWidth = window.innerWidth;
      const groupsToOpen = getGroupsToOpen(filteredData.length, screenWidth);

      const newOpenGroups = new Set<string>();
      for (let i = 0; i < Math.min(groupsToOpen, filteredData.length); i++) {
        newOpenGroups.add(filteredData[i].id.toString());
      }
      setOpenGroups(newOpenGroups);
    }
  }, [filteredData]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (filteredData.length > 0) {
        const screenWidth = window.innerWidth;
        const groupsToOpen = getGroupsToOpen(filteredData.length, screenWidth);

        const newOpenGroups = new Set<string>();
        for (let i = 0; i < Math.min(groupsToOpen, filteredData.length); i++) {
          newOpenGroups.add(filteredData[i].id.toString());
        }
        setOpenGroups(newOpenGroups);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [filteredData]);

  const handleGroupToggle = (groupId: string) => {
    setOpenGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  return (
    <>
      {tables_data &&
        tables_data.data &&
        tables_data.data.some(
          (table) => table.participants && table.participants.length > 0
        ) ? (
        <div className="">
          <h4 className="font-bold mb-4 md:mb-8 text-center md:text-left text-gray-700">
            {t("competitions.participants.title")}
          </h4>
          <div className="pb-8">
            <div className="px-2 flex flex-col md:flex-row items-start md:items-center md:justify-between space-y-2 md:space-y-0 space-x-0 md:space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className=" md:mx-0 flex items-center space-x-2 px-4 py-2 rounded-lg border text-sm bg-[#f1f2f7]/70"
                  >
                    <span>{activeClass === "all" ? "Kõik" : activeClass}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="space-y-1">
                  <DropdownMenuItem
                    onClick={() => setActiveClass("all")}
                    className={activeClass === "all" ? "bg-slate-100" : ""}
                  >
                    {t("competitions.timetable.all_groups")}
                  </DropdownMenuItem>
                  {classes.map((classValue) => (
                    <DropdownMenuItem
                      key={classValue}
                      onClick={() => setActiveClass(classValue)}
                      className={
                        activeClass === classValue ? "bg-slate-100" : ""
                      }
                    >
                      {classValue}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="flex items-start md:items-center flex-col gap-4 md:flex-row md:gap-2 md:px-2 pt-2 md:pt-0">
                {" "}
                <div className="relative w-full md:w-auto">
                  <Input
                    type="text"
                    placeholder={t("competitions.participants.search")}
                    className="h-10 pl-4 pr-10 py-2 text-slate-900 bg-[#FCFCFD] focus:outline-none focus:ring-1 focus:ring-gray-300 border-[#EBEEF4]"
                    value={searchQuery}
                    onChange={handleSearch}
                  />

                  <Search className="absolute right-3 top-1/2 -translate-y-1/2  text-gray-400" />
                </div>
                <p className="text-[#15803D] bg-[#EBFEF2] py-1 px-4 flex items-center rounded-lg font-medium text-sm">
                  {searchQuery
                    ? `${getTotalPlayers(filteredData)} osalejat`
                    : `${filteredPlayerCount} osalejat`}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-4 md:gap-6 my-2 py-5">
              {filteredData.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredData.map((table) => (
                    <Group
                      key={table.id}
                      group={table}
                      isOpen={openGroups.has(table.id.toString())}
                      onToggle={() => handleGroupToggle(table.id.toString())}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                  <div className="max-w-md mx-auto">
                    <p className="text-lg font-medium mb-2">
                      {t("competitions.participants.no_players_found_search")}
                    </p>
                    <p className="text-sm text-gray-400">"{searchQuery}"</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 text-center rounded-sm">
          <p className="text-stone-500">
            {t("competitions.participants.no_players")}
          </p>
        </div>
      )}
    </>
  );
}
