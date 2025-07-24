import { UseGetTournamentMatchesQuery } from '@/queries/match'
import { UseGetFreeVenues } from '@/queries/venues'
import { createFileRoute, useParams } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { MatchWrapper } from '@/types/matches'

export const Route = createFileRoute(
    '/admin/tournaments/$tournamentid/ajakava/',
)({
    component: RouteComponent,
})

function RouteComponent() {
    const { tournamentid } = useParams({ from: "/admin/tournaments/$tournamentid/ajakava/" })
    // const [_, setSelectedMatch] = useState<any>(null)
    const [hoveredCell, setHoveredCell] = useState<string | null>(null)
    const { data: tournamentTables } = UseGetFreeVenues(
        Number(tournamentid),
        true
    );

    const { data: tournamentMatches } = UseGetTournamentMatchesQuery(Number(tournamentid))

    const timeSlots = useMemo(() => {
        if (!tournamentMatches?.data) return []

        const times = new Set<string>()
        tournamentMatches.data.forEach(match => {
            if (match.match.start_date && new Date(match.match.start_date).getTime() > 0) {
                const date = new Date(match.match.start_date)
                const timeString = date.toLocaleTimeString('en-US', {
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit'
                })
                times.add(timeString)
            }
        })

        return Array.from(times).sort()
    }, [tournamentMatches])

    console.log("time slots", timeSlots)

    const rounds = useMemo(() => {
        if (timeSlots.length === 0) return []

        return timeSlots.map((timeSlot, index) => ({
            id: index + 1,
            name: `Round ${index + 1}`,
            startTime: timeSlot,
            endTime: timeSlots[index + 1] || timeSlot,
            status: "upcoming",
            color: `bg-blue-${(index % 3 + 1) * 100}`
        }))
    }, [timeSlots])

    const getGroupColor = (tournamentTableId: string) => {
        const colors = [
            'bg-yellow-100 border-yellow-400',
            'bg-blue-300 border-blue-400',
            'bg-green-100 border-green-400',
            'bg-red-100 border-red-400',
            'bg-purple-100 border-purple-400',
            'bg-pink-100 border-pink-400',
            'bg-indigo-300 border-indigo-400',
            'bg-orange-100 border-orange-400'
        ]

        let hash = 0
        for (let i = 0; i < tournamentTableId.length; i++) {
            hash = tournamentTableId.charCodeAt(i) + ((hash << 5) - hash)
        }
        return colors[Math.abs(hash) % colors.length]
    }

    // Check if a match is a final match based on bracket positions
    const isFinalMatch = (match: MatchWrapper) => {
        const bracket = match.match.bracket

        if (!bracket || typeof bracket !== 'string') return false

        const parts = bracket.split('-')

        if (parts.length !== 2) return false

        const num1 = parseInt(parts[0], 10)
        const num2 = parseInt(parts[1], 10)

        // Check if both numbers are valid
        if (isNaN(num1) || isNaN(num2)) return false

        // Calculate absolute difference - if it's 1, it's a final match
        return Math.abs(num1 - num2) === 1
    }

    const getMatchForCell = (tableId: string, timeSlot: string) => {
        if (!tournamentMatches?.data) return null

        return tournamentMatches.data.find((match) => {
            if (!match.match.start_date) return false

            // Extract time from the full date string
            const matchDate = new Date(match.match.start_date)
            const matchTime = matchDate.toLocaleTimeString('en-US', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit'
            })

            return match.match.extra_data.table === tableId && matchTime === timeSlot
        })
    }

    const getRoundForTimeSlot = (timeSlot: string) => {
        return rounds.find((round) => {
            const slotTime = timeSlot.split(":").map(Number)
            const startTime = round.startTime.split(":").map(Number)
            const endTime = round.endTime.split(":").map(Number)

            const slotMinutes = slotTime[0] * 60 + slotTime[1]
            const startMinutes = startTime[0] * 60 + startTime[1]
            const endMinutes = endTime[0] * 60 + endTime[1]

            return slotMinutes >= startMinutes && slotMinutes < endMinutes
        })
    }


    return (
        <div className="h-screen bg-white flex flex-col">
            <div className="flex-1 overflow-auto">
                <div className="min-w-max">
                    {/* Time Header Row */}
                    <div className="sticky top-0 bg-white border-b flex z-10">
                        <div className="w-20 bg-gray-50 border-r flex items-center justify-center text-xs font-medium p-1">
                            Tables
                        </div>
                        {timeSlots.map((timeSlot) => {
                            const round = getRoundForTimeSlot(timeSlot)
                            const isBreak = false
                            return (
                                <div
                                    key={timeSlot}
                                    className={`w-28 border-r flex flex-col items-center justify-center p-1 text-xs ${"bg-gray-100"
                                        } ${isBreak ? "bg-orange-50 border-orange-200" : ""}`}
                                >
                                    <div className="font-medium">{timeSlot}</div>
                                    {round && <div className="text-[10px] text-gray-600 truncate w-full text-center">{round.name}</div>}
                                    {isBreak && <div className="text-[10px] text-orange-600 font-medium">BREAK</div>}
                                </div>
                            )
                        })}
                    </div>

                    {tournamentTables && tournamentTables.data && tournamentTables.data.map((table) => (
                        <div key={table.id} className="flex border-b hover:bg-gray-50/50">
                            <div className="w-20 bg-gray-50 border-r flex flex-col items-center justify-center p-1">
                                <div className="text-xs font-medium">{table.name}</div>
                            </div>

                            {timeSlots.map((timeSlot) => {
                                const match = getMatchForCell(table.name, timeSlot)
                                const cellKey = `${table.id}-${timeSlot}`
                                const isHovered = hoveredCell === cellKey
                                const round = getRoundForTimeSlot(timeSlot)
                                const isBreak = false

                                if (isBreak) {
                                    return (
                                        <div
                                            key={timeSlot}
                                            className="w-28 h-14 border-r flex items-center justify-center bg-orange-50 text-orange-600"
                                        >
                                            <div className="text-[10px] font-medium">BREAK</div>
                                        </div>
                                    )
                                }

                                return (
                                    <div
                                        key={timeSlot}
                                        className={`w-28 h-16 border-r flex items-center justify-center p-1 cursor-pointer transition-colors ${match
                                            ? `${isFinalMatch(match) ? 'border-red-200' : ""} hover:opacity-80 border-l-2 ${getGroupColor(String(match.match.tournament_table_id))} ${match.match.state === "ongoing"
                                                ? "border-l-green-500"
                                                : match.match.state === "finished"
                                                    ? "border-l-blue-500"
                                                    : "border-l-yellow-500"
                                            }`
                                            : round
                                                ? `${round.color} hover:opacity-80`
                                                : "hover:bg-gray-50"
                                            } ${isHovered ? "ring-2 ring-blue-300" : ""}`}
                                        onMouseEnter={() => setHoveredCell(cellKey)}
                                        onMouseLeave={() => setHoveredCell(null)}
                                    // onClick={() => match && setSelectedMatch(match)}
                                    >
                                        {match ? (
                                            <div className="text-center w-full">
                                                <div className="text-[8px] text-red-grey font-bold">{match.match.readable_id}</div>
                                                <div className="text-[10px] font-medium truncate">{match.p1.name}</div>
                                                <div className="text-[8px] text-gray-600">vs</div>
                                                <div className="text-[10px] font-medium truncate">{match.p2.name}</div>
                                                {match.match.extra_data.score && <div className="text-[8px] text-gray-700 font-medium mt-1">{match.match.extra_data.team_1_total} : {match.match.extra_data.team_2_total}</div>}
                                                {isFinalMatch(match) && <div className="text-[8px] text-red-600 font-bold">Kohamäng</div>}
                                            </div>
                                        ) : (
                                            <div className="text-[10px] text-gray-400">
                                                {isHovered && table.match_id === "" ? "+" : ""}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* Match Details Dialog */}
            {/* <Dialog open={!!selectedMatch} onOpenChange={() => setSelectedMatch(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Match Details
                        </DialogTitle>
                    </DialogHeader>

                    {selectedMatch && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Badge variant="outline">Table {selectedMatch.tableId}</Badge>
                                <Badge className={getStatusColor(selectedMatch.status)}>{selectedMatch.status}</Badge>
                            </div>

                            <div className="text-center space-y-2">
                                <div className="text-lg font-semibold">{selectedMatch.team1}</div>
                                <div className="text-sm text-gray-500">vs</div>
                                <div className="text-lg font-semibold">{selectedMatch.team2}</div>
                                {selectedMatch.score && (
                                    <div className="text-xl font-bold text-blue-600 mt-2">{selectedMatch.score}</div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-3 w-3" />
                                    <span>Start: {selectedMatch.startTime}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-3 w-3" />
                                    <span>Duration: 30min</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Trophy className="h-3 w-3" />
                                    <span>Round: {rounds.find((r) => r.id === selectedMatch.roundId)?.name}</span>
                                </div>
                            </div>

                            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                                Match includes 25 minutes of play time plus 5 minutes buffer for setup and transitions.
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog> */}
        </div>
    )
}
