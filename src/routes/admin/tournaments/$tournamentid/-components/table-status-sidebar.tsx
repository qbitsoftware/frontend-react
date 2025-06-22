import { UseGetTournamentTablesQuery } from "@/queries/tables";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { UseGetFreeVenues } from "@/queries/venues";

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
    const { tournamentid } = useParams({ strict: false });
    const { data: tournamentTables } = UseGetFreeVenues(
        Number(tournamentid),
        true
    );
    const { data: tournamentGroups } = UseGetTournamentTablesQuery(
        Number(tournamentid)
    );

    const tableStatuses = useMemo((): TableStatus[] => {
        if (!tournamentTables?.data) return [];

        return tournamentTables.data.map((table) => {
            const isOccupied = table.match_id !== null

            const currentMatch = table.match;

            return {
                id: table.id.toString(),
                number: table.name || `Table ${table.id}`,
                isOccupied,
                tournament_table_id: currentMatch?.match?.tournament_table_id,
                match: currentMatch && currentMatch.p1.name && currentMatch.p2.name ? {
                    participant1: currentMatch.p1.name,
                    participant2: currentMatch.p2.name,
                    groupName: tournamentGroups?.data?.find(g => g.id === currentMatch.match?.tournament_table_id)?.class || "",
                } : undefined
            };
        });
    }, [tournamentTables?.data]);

    if (!tableStatuses.length) {
        return null;
    }

    function CompRender({ table }: { table: TableStatus }) {
        return (<div
            key={table.id}
            className={cn(
                "p-1.5 border-l-3",
                table.isOccupied
                    ? "border-l-red-500 bg-red-50"
                    : "border-l-green-500 bg-green-50"
            )}
        >
            <div className="flex items-center justify-center gap-3">
                <div className="text-sm font-bold text-gray-900 min-w-fit">
                    {table.number}
                </div>

                <div className="text-[11px] text-gray-700 truncate text-center flex-1">
                    {table.match ?
                        `${table.match.participant1} vs ${table.match.participant2}`
                        : ""
                    }
                </div>
            </div>
        </div>
        )
    }

    return (
        <>
            <div className="md:hidden w-full bg-gray-50 border-b border-gray-200 overflow-x-auto mb-4">
                <div className="flex gap-1.5 p-2 min-w-max">
                    {tableStatuses.map((table) => (
                        <div
                            key={table.id}
                            className={cn(
                                "flex-shrink-0 w-28 p-1 border-l-2 rounded border-gray-100",
                                table.isOccupied
                                    ? "border-l-red-500 bg-red-50"
                                    : "border-l-green-500 bg-green-50"
                            )}
                        >
                            <div className="text-[11px] font-bold text-gray-900 text-center mb-1">
                                {table.number}
                            </div>

                            <div className="text-[9px] text-gray-700 text-center truncate">
                                {table.match ?
                                    `${table.match.participant1} vs ${table.match.participant2}`
                                    : ""
                                }
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="hidden md:block w-48 bg-gray-50 border-r border-gray-200 h-full overflow-y-auto flex-shrink-0">
                <div className="bg-gray-100 border-b border-gray-300 p-1 sticky top-0">
                    <h3 className="text-[11px] font-semibold text-gray-700 uppercase tracking-wide">
                        Tables ({tableStatuses.filter(t => t.isOccupied).length}/{tableStatuses.length})
                    </h3>
                </div>

                <div className="divide-y divide-gray-300">
                    {tableStatuses.map((table) => {
                        if (table.tournament_table_id) {
                            return (
                                <Link to={`/admin/tournaments/${tournamentid}/grupid/${table.tournament_table_id}/mangud`} key={table.id}>
                                    <CompRender table={table} />
                                </Link>
                            );
                        } else {
                            return <CompRender table={table} key={table.id} />;
                        }
                    })}
                </div>
            </div>
        </>
    );
};

export default TableStatusSidebar;