import { TournamentTable } from "@/types/groups"
import { MatchWrapper } from "@/types/matches"
import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { memo } from "react"

interface Props {
    match: MatchWrapper,
    activeMatch: MatchWrapper | null,
    tournamentClassesData: TournamentTable[] | null | undefined,
    isPlacementMatch: (match: MatchWrapper) => boolean,
    getPlacementLabel: (match: MatchWrapper) => string,
    getGroupColor: (groupId: string) => string,
}

export const DraggableMatch = memo(({ match, tournamentClassesData, isPlacementMatch, getPlacementLabel, getGroupColor, activeMatch }: Props) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable(
        {
            id: `match-${match.match.id}`,
            data: {
                type: 'match',
                match: match
            }
        })

    const style = {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : 1,
    }

    const isNextMatch = activeMatch &&
        (activeMatch.match.id === match.match.next_loser_match_id ||
            activeMatch.match.id === match.match.next_winner_match_id)

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={`relative text-center w-full h-full flex flex-col justify-center cursor-grab active:cursor-grabbing border-l-2 ${getGroupColor(String(match.match.tournament_table_id))} ${match.match.state === "ongoing"
                ? "border-l-green-500"
                : match.match.state === "finished"
                    ? "border-l-blue-500"
                    : "border-l-yellow-500"
                } ${isPlacementMatch(match) ? 'border-red-200' : ""} ${isNextMatch ? 'outline outline-2 outline-red-500' : ''}`}
        >
            <div className="absolute top-0 right-0 text-[8px] text-gray-800 font-bold bg-white/80 px-1 rounded-bl">
                {match.match.readable_id}
            </div>
            <div className="text-[10px] font-medium text-gray-600 leading-tight">
                {tournamentClassesData && tournamentClassesData.find((t) => t.id === match.match.tournament_table_id)?.class || 'Class'}
            </div>
            {isPlacementMatch(match) && (
                <div className="text-[8px] text-red-600 font-bold mt-0.5">{getPlacementLabel(match)}</div>
            )}
        </div>
    )
})

