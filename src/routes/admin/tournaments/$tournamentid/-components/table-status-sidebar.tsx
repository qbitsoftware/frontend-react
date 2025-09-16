import { UseGetTournamentTablesQuery } from "@/queries/tables";
import { useMemo, useState, useEffect } from "react";
import { useParams, useRouter } from "@tanstack/react-router";
import { UseGetFreeVenuesAll } from "@/queries/venues";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  useSidebar,
  SidebarTrigger
} from "@/components/ui/sidebar";

interface TableStatus {
  id: string;
  number: string;
  isOccupied: boolean;
  tournament_table_id?: number;
  match?: {
    participant1: string;
    participant2: string;
    groupName: string;
    startTime?: string;
  };
}

const MatchTimer = ({ startTime }: { startTime: string }) => {
  const [duration, setDuration] = useState<string>("");
  const [minutes, setMinutes] = useState<number>(0);

  useEffect(() => {
    const updateDuration = () => {
      const start = new Date(startTime);
      const now = new Date();
      const diffMs = now.getTime() - start.getTime();

      if (diffMs < 0) {
        setDuration("0:00");
        setMinutes(0);
        return;
      }

      const diffMinutes = Math.floor(diffMs / 60000);
      const diffSeconds = Math.floor((diffMs % 60000) / 1000);

      setDuration(`${diffMinutes}:${diffSeconds.toString().padStart(2, '0')}`);
      setMinutes(diffMinutes);
    };

    updateDuration();
    const interval = setInterval(updateDuration, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const getTimerStyle = () => {
    if (minutes >= 30) {
      return "text-[8px] font-mono bg-red-200 text-red-700 px-1 py-0.5 rounded";
    } else if (minutes >= 20) {
      return "text-[8px] font-mono bg-orange-200 text-orange-700 px-1 py-0.5 rounded";
    } else {
      return "text-[8px] font-mono bg-gray-200 text-gray-600 px-1 py-0.5 rounded";
    }
  };

  return (
    <div className={getTimerStyle()}>
      {duration}
    </div>
  );
};

const formatPlayerName = (fullName: string): string => {
  const parts = fullName.trim().split(' ').filter(part => part.length > 0);
  if (parts.length === 0) return fullName;
  if (parts.length === 1) return parts[0];

  // Take all parts except the last one as first names, convert to initials
  const firstNames = parts.slice(0, -1).map(name => name.charAt(0).toUpperCase() + '.');
  const lastName = parts[parts.length - 1];

  return `${firstNames.join('')} ${lastName}`;
};

const TableStatusSidebar = () => {
  const { t } = useTranslation();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const { tournamentid } = useParams({ strict: false });
  const router = useRouter();


  const { data: tournamentTables } = UseGetFreeVenuesAll(
    Number(tournamentid),
  );
  const { data: tournamentGroups } = UseGetTournamentTablesQuery(
    Number(tournamentid),
  );


  const tableStatuses = useMemo((): TableStatus[] => {
    if (!tournamentTables?.data) return [];

    const groupsMap = new Map(
      tournamentGroups?.data?.map((group) => [group.group.id, group.group.class]) || [],
    );

    return tournamentTables.data.map((table) => {
      const match = table.match;
      const tournamentTableId = match?.match?.tournament_table_id;

      return {
        id: table.id.toString(),
        number: table.name || `Table ${table.id}`,
        isOccupied: table.match_id !== null,
        tournament_table_id: tournamentTableId,
        match:
          match?.p1?.name && match?.p2?.name
            ? {
              participant1: match.p1.name,
              participant2: match.p2.name,
              groupName: tournamentTableId
                ? groupsMap.get(tournamentTableId) || ""
                : "",
              startTime: match.match?.start_date,
            }
            : undefined,
      };
    });
  }, [tournamentTables?.data, tournamentGroups?.data]);

  if (!tableStatuses.length) {
    return null;
  }

  const handleRowClick = (table: TableStatus) => {
    if (table.tournament_table_id) {
      // Get the match ID from the table data
      const matchId = tournamentTables?.data?.find(t => t.id.toString() === table.id)?.match?.match?.id;

      const searchParams = matchId ? { openMatch: matchId.toString() } : {};

      router.navigate({
        to: `/admin/tournaments/${tournamentid}/grupid/${table.tournament_table_id}/mangud`,
        search: searchParams,
      });
    }
  };

  return (
    <Sidebar side="right" collapsible="icon" className="border-l bg-[#F8F9FA] data-[state=collapsed]:w-24 data-[state=expanded]:w-64">
      <SidebarHeader className="h-[4.2rem] px-2 border-b flex items-center justify-center">
        {isCollapsed ? (
          <div className="flex justify-center w-full">
            <SidebarTrigger />
          </div>
        ) : (
          <div className="flex items-center justify-start gap-2 w-full">
            <SidebarTrigger />
            <h3 className="text-lg font-semibold">
              {t("admin.tournaments.tables.title")}{" "}
              {tableStatuses.filter((t) => t.isOccupied).length}/
              {tableStatuses.length}
            </h3>
          </div>
        )}
      </SidebarHeader>
      <SidebarContent className="overflow-y-auto">
        <div className="flex flex-col w-full h-full">
          {tableStatuses.map((table) => (
            <div
              onClick={() => handleRowClick(table)}
              key={table.id}
              className={cn(
                "w-full flex items-center gap-2 h-10 min-h-10 px-2 overflow-hidden border-b relative flex-shrink-0 justify-between",
                table.tournament_table_id && "cursor-pointer",
              )}
            >
              <h3 className={cn(
                "text-xs font-semibold flex-shrink-0",
                isCollapsed ? "text-xs" : ""
              )}>{table.number}</h3>

              {isCollapsed ? (
                table.match && table.match.startTime ? (
                  <MatchTimer startTime={table.match.startTime} />
                ) : !table.isOccupied ? (
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                ) : null
              ) : (
                <>
                  {table.match && (
                    <div className="flex-1 flex items-center justify-end gap-2 text-[11px] overflow-hidden">
                      <span className="truncate">{formatPlayerName(table.match.participant1)}</span>
                      <span className="flex-shrink-0">vs</span>
                      <span className="truncate">{formatPlayerName(table.match.participant2)}</span>
                      {table.match.startTime && (
                        <MatchTimer startTime={table.match.startTime} />
                      )}
                    </div>
                  )}
                  {!table.isOccupied && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </SidebarContent>
    </Sidebar>
  );
};

export default TableStatusSidebar;

