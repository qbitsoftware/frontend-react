import { UseGetTournamentTablesQuery } from "@/queries/tables";
import { useMemo } from "react";
import { useParams, useRouter } from "@tanstack/react-router";
import { UseGetFreeVenues } from "@/queries/venues";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface TableStatus {
  id: string;
  number: string;
  isOccupied: boolean;
  tournament_table_id?: number;
  match?: {
    participant1: string;
    participant2: string;
    groupName: string;
  };
}

const TableStatusSidebar = () => {
  const { t } = useTranslation();

  const { tournamentid } = useParams({ strict: false });
  const router = useRouter();

  const { data: tournamentTables } = UseGetFreeVenues(
    Number(tournamentid),
    true,
  );
  const { data: tournamentGroups } = UseGetTournamentTablesQuery(
    Number(tournamentid),
  );

  const tableStatuses = useMemo((): TableStatus[] => {
    if (!tournamentTables?.data) return [];

    const groupsMap = new Map(
      tournamentGroups?.data?.map((group) => [group.id, group.class]) || [],
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
      router.navigate({
        to: `/admin/tournaments/${tournamentid}/grupid/${table.tournament_table_id}/mangud`,
      });
    }
  };

  return (
    <div className="hidden min-w-[16rem] lg:flex flex-col border-l h-screen z-10">
      <div className="flex items-center justify-between h-[68px] px-2 border-b">
        <h3 className="text-lg font-semibold">
          {t("admin.tournaments.tables.title")}{" "}
          {tableStatuses.filter((t) => t.isOccupied).length}/
          {tableStatuses.length}
        </h3>
      </div>
      <div className="flex flex-col overflow-y-auto w-full h-full">
        {tableStatuses.map((table) => (
          <div
            onClick={() => handleRowClick(table)}
            key={table.id}
            className={cn(
              "w-full flex items-center gap-4 justify-between h-10 px-2 overflow-hidden border-b",
              table.tournament_table_id && "cursor-pointer",
            )}
          >
            <h3 className="text-lg font-semibold">{table.number}</h3>
            {table.match && (
              <div className="flex-1 flex items-center justify-center gap-2 text-sm overflow-hidden">
                <span className="truncate">{table.match.participant1}</span>
                <span className="flex-shrink-0">vs</span>
                <span className="truncate">{table.match.participant2}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "w-2 h-2 rounded-full",
                  table.isOccupied ? "bg-red-500" : "bg-green-500",
                )}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableStatusSidebar;

