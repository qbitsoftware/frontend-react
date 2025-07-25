import { UseGetTournamentMatchesQuery } from '@/queries/match'
import { UseGetFreeVenues } from '@/queries/venues'
import { UseGetTournamentTablesQuery } from '@/queries/tables'
import { createFileRoute, useParams } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { MatchWrapper } from '@/types/matches'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute(
    '/admin/tournaments/$tournamentid/ajakava/',
)({
    component: RouteComponent,
})

function RouteComponent() {
    const { tournamentid } = useParams({ from: "/admin/tournaments/$tournamentid/ajakava/" })
    const { t } = useTranslation()
    // const [_, setSelectedMatch] = useState<any>(null)
    const [hoveredCell, setHoveredCell] = useState<string | null>(null)
    const { data: tournamentTables } = UseGetFreeVenues(
        Number(tournamentid),
        true
    );

    const { data: tournamentMatches } = UseGetTournamentMatchesQuery(Number(tournamentid))
    const { data: tournamentClassesData } = UseGetTournamentTablesQuery(Number(tournamentid))

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
            name: `${t('competitions.timetable.view.round_prefix')} ${index + 1}`,
            startTime: timeSlot,
            endTime: timeSlots[index + 1] || timeSlot,
            status: "upcoming",
            color: `bg-blue-${(index % 3 + 1) * 100}`
        }))
    }, [timeSlots, t])

    const tournamentClasses = useMemo(() => {
        if (!tournamentMatches?.data || !tournamentClassesData?.data) return []
        
        const colorPalette = [
            { bg: 'bg-yellow-100', border: 'border-yellow-400' },
            { bg: 'bg-blue-300', border: 'border-blue-400' },
            { bg: 'bg-green-100', border: 'border-green-400' },
            { bg: 'bg-red-100', border: 'border-red-400' },
            { bg: 'bg-purple-100', border: 'border-purple-400' },
            { bg: 'bg-pink-100', border: 'border-pink-400' },
            { bg: 'bg-indigo-300', border: 'border-indigo-400' },
            { bg: 'bg-orange-100', border: 'border-orange-400' }
        ]
        
        const classMap = new Map<number, string>()
        tournamentClassesData.data.forEach(table => {
            classMap.set(table.id, table.class)
        })
        
        const usedClasses = new Set<string>()
        const classColorMap = new Map<string, { bg: string, border: string, tableId: number }>()
        
        tournamentMatches.data.forEach(match => {
            const tableId = match.match.tournament_table_id
            const className = classMap.get(tableId)
            if (className && !usedClasses.has(className)) {
                usedClasses.add(className)
                let hash = 0
                for (let i = 0; i < String(tableId).length; i++) {
                    hash = String(tableId).charCodeAt(i) + ((hash << 5) - hash)
                }
                const colorIndex = Math.abs(hash) % colorPalette.length
                classColorMap.set(className, {
                    ...colorPalette[colorIndex],
                    tableId
                })
            }
        })
        
        return Array.from(classColorMap.entries()).map(([className, colorData]) => ({
            name: className,
            ...colorData
        }))
    }, [tournamentMatches, tournamentClassesData])

    const getGroupColor = (tournamentTableId: string) => {
        if (!tournamentClassesData?.data) return 'bg-gray-100 border-gray-400'
        
        const tableId = parseInt(tournamentTableId)
        const table = tournamentClassesData.data.find(t => t.id === tableId)
        if (!table) return 'bg-gray-100 border-gray-400'
        
        const classData = tournamentClasses.find(c => c.name === table.class)
        return classData ? `${classData.bg} ${classData.border}` : 'bg-gray-100 border-gray-400'
    }

    // Check if a match is a placement match (1-2 or 3-4) based on bracket positions
    const isPlacementMatch = (match: MatchWrapper) => {
        const bracket = match.match.bracket

        if (!bracket || typeof bracket !== 'string') return false

        // Check for exact placement matches: 1-2 (final) or 3-4 (3rd place)
        return bracket === '1-2' || bracket === '3-4'
    }

    // Get placement match label based on bracket
    const getPlacementLabel = (match: MatchWrapper) => {
        const bracket = match.match.bracket
        if (bracket === '1-2') return t('competitions.timetable.view.final_match')
        if (bracket === '3-4') return t('competitions.timetable.view.bronze_match')
        return ''
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
            <div className="bg-white border-b px-4 py-2">
                <h1 className="text-lg font-semibold text-gray-600">
                        {t('competitions.timetable.view.title')}
                </h1>
            </div>
            {/* Color Legend */}
            <div className="bg-gray-50 border-b p-3">
                <div className="flex flex-wrap gap-3">
                    {tournamentClasses.map((classData, index) => (
                        <div key={index} className="flex items-center gap-1">
                            <div className={`w-4 h-4 border-2 ${classData.bg} ${classData.border} rounded`}></div>
                            <span className="text-xs font-medium">{classData.name}</span>
                        </div>
                    ))}
                </div>
                <div className="flex items-center gap-4 mt-3 text-xs">
                    <div className="text-xs text-gray-600 font-medium">{t('competitions.timetable.view.match_status')}:</div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 border-l-4 border-yellow-500 bg-gray-100"></div>
                        <span>{t('competitions.timetable.view.scheduled')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 border-l-4 border-green-500 bg-gray-100"></div>
                        <span>{t('competitions.timetable.view.ongoing')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 border-l-4 border-blue-500 bg-gray-100"></div>
                        <span>{t('competitions.timetable.view.finished')}</span>
                    </div>
                </div>
            </div>
            <div className="flex-1 overflow-auto">
                <div className="min-w-max">
                    {/* Time Header Row */}
                    <div className="sticky top-0 bg-white border-b flex z-10">
                        <div className="w-16 bg-gray-50 border-r flex items-center justify-center text-xs font-medium p-1">
                            {t('competitions.timetable.view.tables')}
                        </div>
                        {timeSlots.map((timeSlot) => {
                            const round = getRoundForTimeSlot(timeSlot)
                            const isBreak = false
                            return (
                                <div
                                    key={timeSlot}
                                    className={`w-24 border-r flex flex-col items-center justify-center p-1 text-xs ${"bg-gray-100"
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
                        <div key={table.id} className="flex border-b hover:bg-gray-50/50 min-h-12">
                            <div className="w-16 bg-gray-50 border-r flex flex-col items-center justify-center p-0.5 min-h-12">
                                <div className="text-[10px] font-medium">{table.name}</div>
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
                                            className="w-24 h-12 border-r flex items-center justify-center bg-orange-50 text-orange-600"
                                        >
                                            <div className="text-[10px] font-medium">BREAK</div>
                                        </div>
                                    )
                                }

                                return (
                                    <div
                                        key={timeSlot}
                                        className={`w-24 h-12 border-r flex items-center justify-center p-0.5 cursor-pointer transition-colors ${match
                                            ? `${isPlacementMatch(match) ? 'border-red-200' : ""} hover:opacity-80 border-l-2 ${getGroupColor(String(match.match.tournament_table_id))} ${match.match.state === "ongoing"
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
                                            <div className="relative text-center w-full h-full flex flex-col justify-center">
                                                <div className="absolute top-0 right-0 text-[8px] text-gray-800 font-bold bg-white/80 px-1 rounded-bl">
                                                    {match.match.readable_id}
                                                </div>
                                                <div className="text-[10px] font-medium text-gray-600 leading-tight">
                                                    {tournamentClassesData?.data?.find(t => t.id === match.match.tournament_table_id)?.class || 'Class'}
                                                </div>
                                                {isPlacementMatch(match) && (
                                                    <div className="text-[8px] text-red-600 font-bold mt-0.5">{getPlacementLabel(match)}</div>
                                                )}
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
