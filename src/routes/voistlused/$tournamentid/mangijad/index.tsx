import { createFileRoute } from "@tanstack/react-router";
import Group from "./-components/group";
import ErrorPage from "@/components/error";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ResponsiveClassSelector } from "@/components/responsive-class-selector";
import { SearchWithResults } from "@/components/search-with-results";
import { Player } from "@/types/players";
import { cn } from "@/lib/utils";
import { useTournament } from "../-components/tournament-provider";

export const Route = createFileRoute("/voistlused/$tournamentid/mangijad/")({
  component: RouteComponent,
  errorComponent: () => <ErrorPage />,
});

function RouteComponent() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeClass, setActiveClass] = useState<string>("all");
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());
  const { t } = useTranslation();
  const { tournamentTables } = useTournament()

  const originalData = tournamentTables || [];

  const getUniqueClasses = (tables: any[]) => {
    const classes = new Set<string>();
    tables.forEach((table) => {
      if (table.class) {
        classes.add(table.class);
      }
    });
    return Array.from(classes).sort();
  };

  const classes = getUniqueClasses(originalData);

  let filteredData = originalData;

  if (activeClass !== "all") {
    filteredData = filteredData.filter((table) => table.class === activeClass);
  }

  if (searchQuery && filteredData.length > 0) {
    const searchBy = searchQuery.toLowerCase();

    filteredData = filteredData
      .map((table) => {
        const filteredParticipants = table.participants.filter((player) => {
          // Check name
          const nameMatch = player.name?.toLowerCase().includes(searchBy);

          // Check nested players array for eltl_id or clubname
          const nestedMatch = Array.isArray(player.players)
            ? player.players.some(
              (p: Player) =>
                (p.extra_data.eltl_id && p.extra_data.eltl_id.toString().toLowerCase().includes(searchBy)) ||
                (p.extra_data.club && p.extra_data.club.toLowerCase().includes(searchBy))
            )
            : false;

          return nameMatch || nestedMatch;
        });

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
      {tournamentTables &&
        tournamentTables.some(
          (table) => table.participants && table.participants.length > 0
        ) ? (
        <div className="min-h-screen">
          <ResponsiveClassSelector
            variant="classes"
            classes={classes}
            activeClass={activeClass}
            onClassChange={setActiveClass}
          />

          <SearchWithResults
            searchTerm={searchQuery}
            setSearchTerm={setSearchQuery}
            placeholder={t("competitions.participants.search")}
            className="mb-6"
          />

          {filteredData.length > 0 ? (
            <div className={cn("grid grid-cols-1 gap-6", filteredData.length !== 1 && "lg:grid-cols-2 xl:grid-cols-3")}>
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
