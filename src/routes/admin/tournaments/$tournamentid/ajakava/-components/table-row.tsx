import { TournamentTable } from "@/types/groups";
import { Venue } from "@/types/venues";
import { useDroppable } from "@dnd-kit/core";
import { memo } from "react";
import { DraggableMatch } from "./draggable-match";
import { MatchWrapper } from "@/types/matches";

interface Props {
    table: Venue;
    timeSlots: string[];
    getMatchForCell: (table: string, timeSlot: string) => any;
    getRoundForTimeSlot: (timeSlot: string) => any;
    getGroupColor: (groupId: string) => string;
    isPlacementMatch: (match: any) => boolean;
    activeMatch: MatchWrapper | null;
    getPlacementLabel: (match: any) => string;
    tournamentClassesData: TournamentTable[] | null | undefined;
    hoveredCell: string | null;
    setHoveredCell: (cellKey: string | null) => void;
}
export default function TTRow({ table, timeSlots, getMatchForCell, getRoundForTimeSlot, getGroupColor, isPlacementMatch, getPlacementLabel, tournamentClassesData, hoveredCell, setHoveredCell, activeMatch }: Props) {

    return (
        <div className="flex border-b hover:bg-gray-50/50 min-h-12">
            <div className="w-16 bg-gray-50 border-r flex flex-col items-center justify-center p-0.5 min-h-12 sticky left-0 z-10">
                <div className="text-[10px] font-medium">{table.name}</div>
            </div>

            {timeSlots.map((timeSlot: string) => {
                const match = getMatchForCell(table.name, timeSlot)
                const cellKey = `${table.id}-${timeSlot}`
                const isHovered = hoveredCell === cellKey
                const round = getRoundForTimeSlot(timeSlot)

                return (
                    <DroppableCell
                        key={timeSlot}
                        table={table}
                        timeSlot={timeSlot}
                        match={match}
                        cellKey={cellKey}
                        isHovered={isHovered}
                        setHoveredCell={setHoveredCell}
                        round={round}
                    >
                        {match ? (
                            <DraggableMatch
                                match={match}
                                tournamentClassesData={tournamentClassesData}
                                isPlacementMatch={isPlacementMatch}
                                getPlacementLabel={getPlacementLabel}
                                getGroupColor={getGroupColor}
                                activeMatch={activeMatch}
                            />
                        ) : (
                            <div className="text-[10px] text-gray-400">
                                {isHovered && table.match_id === "" ? "+" : ""}
                            </div>
                        )}
                    </DroppableCell>
                )
            })}
        </div>)
}

const DroppableCell = memo(({
    table,
    timeSlot,
    match,
    cellKey,
    isHovered,
    setHoveredCell,
    round,
    children
}: any) => {
    const { isOver, setNodeRef } = useDroppable({
        id: cellKey,
        data: {
            type: 'cell',
            table: table.name,
            timeSlot: timeSlot
        }
    })

    return (
        <div
            ref={setNodeRef}
            className={`w-24 h-12 border-r flex items-center justify-center p-0.5 cursor-pointer transition-colors relative z-0 ${match
                ? "hover:opacity-80"
                : round
                    ? `${round.color} hover:opacity-80`
                    : "hover:bg-gray-50"
                } ${isHovered ? "ring-2 ring-blue-300" : ""} ${isOver ? "ring-2 ring-green-400 bg-green-50" : ""
                }`}
            onMouseEnter={() => setHoveredCell(cellKey)}
            onMouseLeave={() => setHoveredCell(null)}
        >
            {children}
        </div>
    )
})


