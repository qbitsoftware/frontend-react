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
    allMatches: MatchWrapper[] | null | undefined,
    isMatchTimeInvalid: (activeMatch: MatchWrapper, currentMatch: MatchWrapper, allMatches: MatchWrapper[]) => boolean,
    showParticipants: boolean,
}

export const DraggableMatch = memo(({ match, tournamentClassesData, isPlacementMatch, getPlacementLabel, getGroupColor, activeMatch, allMatches, isMatchTimeInvalid, showParticipants }: Props) => {
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

    const isNextMatch = activeMatch && !isDragging &&
        (activeMatch.match.id === match.match.next_loser_match_id ||
            activeMatch.match.id === match.match.next_winner_match_id)

    const isPreviousMatch = activeMatch && !isDragging &&
        (activeMatch.match.next_winner_match_id === match.match.id ||
            match.match.id === activeMatch.match.next_loser_match_id)

    const shouldGreyOut = activeMatch && !isDragging && allMatches 
        ? isMatchTimeInvalid(activeMatch, match, allMatches) 
        : false

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={`relative text-center w-full h-full flex flex-col justify-center cursor-grab active:cursor-grabbing border-l-2 ${!isDragging ? 'transition-all' : ''} ${getGroupColor(String(match.match.tournament_table_id))} ${match.match.state === "ongoing"
                ? "border-l-green-500"
                : match.match.state === "finished"
                    ? "border-l-blue-500"
                    : "border-l-yellow-500"
                } ${isPlacementMatch(match) ? 'border-red-200' : ""} ${
                    isNextMatch 
                        ? 'ring-2 ring-black ring-opacity-80 shadow-md shadow-red-200/50' 
                        : ''
                } ${
                    isPreviousMatch 
                        ? 'ring-2 ring-black ring-opacity-80 shadow-md shadow-blue-200/50' 
                        : ''
                } ${
                    shouldGreyOut 
                        ? 'opacity-30 grayscale cursor-not-allowed' 
                        : ''
                }`}
        >
            {match.match.readable_id !== 0 && (
                <div className="absolute top-0 right-0 text-[8px] text-gray-800 font-bold bg-white/80 px-1 rounded-bl">
                    {match.match.readable_id}
                </div>
            )}
            {!showParticipants ? (
                <div className="text-[10px] font-medium text-gray-600 leading-tight">
                    {tournamentClassesData && tournamentClassesData.find((t) => t.id === match.match.tournament_table_id)?.class || 'Class'}
                </div>
            ) : (
                <div className="text-[8px] font-medium text-gray-700 leading-tight px-0.5 w-full overflow-hidden">
                    <div className="truncate">{match.p1?.name || 'TBD'}</div>
                    <div className="text-[6px] text-gray-500">vs</div>
                    <div className="truncate">{match.p2?.name || 'TBD'}</div>
                </div>
            )}
            {isPlacementMatch(match) && (
                <div className="text-[8px] text-red-600 font-bold mt-0.5">{getPlacementLabel(match)}</div>
            )}
        </div>
    )
})

