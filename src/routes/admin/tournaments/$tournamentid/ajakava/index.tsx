import { UseGetTournamentMatchesQuery } from '@/queries/match'
import { UseGetFreeVenues } from '@/queries/venues'
import { UseGetTournamentTablesQuery } from '@/queries/tables'
import { createFileRoute, useParams } from '@tanstack/react-router'
import { useMemo, useState, useCallback, memo } from 'react'
import { MatchWrapper } from '@/types/matches'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute(
    '/admin/tournaments/$tournamentid/ajakava/',
)({
    component: RouteComponent,
})

// Memoized table row component to prevent unnecessary re-renders
const TableRow = memo(({
    table,
    timeSlots,
    getMatchForCell,
    getRoundForTimeSlot,
    getGroupColor,
    isPlacementMatch,
    getPlacementLabel,
    tournamentClassesData,
    hoveredCell,
    setHoveredCell
}: any) => (
    <div className="flex border-b hover:bg-gray-50/50 min-h-12">
        <div className="w-16 bg-gray-50 border-r flex flex-col items-center justify-center p-0.5 min-h-12">
            <div className="text-[10px] font-medium">{table.name}</div>
        </div>

        {timeSlots.map((timeSlot: string) => {
            const match = getMatchForCell(table.name, timeSlot)
            const cellKey = `${table.id}-${timeSlot}`
            const isHovered = hoveredCell === cellKey
            const round = getRoundForTimeSlot(timeSlot)

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
                >
                    {match ? (
                        <div className="relative text-center w-full h-full flex flex-col justify-center">
                            <div className="absolute top-0 right-0 text-[8px] text-gray-800 font-bold bg-white/80 px-1 rounded-bl">
                                {match.match.readable_id}
                            </div>
                            <div className="text-[10px] font-medium text-gray-600 leading-tight">
                                {tournamentClassesData?.data?.find((t: any) => t.id === match.match.tournament_table_id)?.class || 'Class'}
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
))

function RouteComponent() {
    const { tournamentid } = useParams({ from: "/admin/tournaments/$tournamentid/ajakava/" })
    const { t } = useTranslation()
    // const [_, setSelectedMatch] = useState<any>(null)
    const [hoveredCell, setHoveredCell] = useState<string | null>(null)
    const [selectedDay, setSelectedDay] = useState<string>('')

    const { data: tournamentTables } = UseGetFreeVenues(
        Number(tournamentid),
        true
    );

    const { data: tournamentMatches } = UseGetTournamentMatchesQuery(Number(tournamentid))
    const { data: tournamentClassesData } = UseGetTournamentTablesQuery(Number(tournamentid))

    // Extract unique days from tournament matches
    const tournamentDays = useMemo(() => {
        if (!tournamentMatches?.data) return []

        const daysSet = new Set<string>()
        tournamentMatches.data.forEach(match => {
            if (match.match.start_date && new Date(match.match.start_date).getTime() > 0) {
                const date = new Date(match.match.start_date)
                const dayString = date.toISOString().split('T')[0] // YYYY-MM-DD format
                daysSet.add(dayString)
            }
        })

        const sortedDays = Array.from(daysSet).sort()

        // Set the first day as selected if no day is selected yet
        if (sortedDays.length > 0 && !selectedDay) {
            setSelectedDay(sortedDays[0])
        }

        return sortedDays
    }, [tournamentMatches, selectedDay])

    // Filter matches for the selected day
    const dayMatches = useMemo(() => {
        if (!tournamentMatches?.data || !selectedDay) return []

        return tournamentMatches.data.filter(match => {
            if (!match.match.start_date) return false
            const matchDay = new Date(match.match.start_date).toISOString().split('T')[0]
            return matchDay === selectedDay
        })
    }, [tournamentMatches, selectedDay])

    const timeSlots = useMemo(() => {
        if (dayMatches.length === 0) return []

        const times = new Set<string>()
        dayMatches.forEach(match => {
            if (match.match.start_date && new Date(match.match.start_date).getTime() > 0) {
                const date = new Date(match.match.start_date)
                const hours = String(date.getUTCHours()).padStart(2, '0')
                const minutes = String(date.getUTCMinutes()).padStart(2, '0')
                const timeString = `${hours}:${minutes}`

                times.add(timeString)
            }
        })

        return Array.from(times).sort()
    }, [dayMatches])

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
        if (!dayMatches.length || !tournamentClassesData?.data) return []

        const colorPalette = [
            // Primary vibrant colors
            { bg: 'bg-gradient-to-br from-cyan-100 to-blue-200', border: 'border-cyan-400' },
            { bg: 'bg-gradient-to-br from-emerald-100 to-green-200', border: 'border-emerald-400' },
            { bg: 'bg-gradient-to-br from-violet-100 to-purple-200', border: 'border-violet-400' },
            { bg: 'bg-gradient-to-br from-rose-100 to-pink-200', border: 'border-rose-400' },
            { bg: 'bg-gradient-to-br from-amber-100 to-yellow-200', border: 'border-amber-400' },
            { bg: 'bg-gradient-to-br from-orange-100 to-red-200', border: 'border-orange-400' },
            
            { bg: 'bg-gradient-to-br from-teal-100 to-cyan-200', border: 'border-teal-400' },
            { bg: 'bg-gradient-to-br from-indigo-100 to-blue-200', border: 'border-indigo-400' },
            { bg: 'bg-gradient-to-br from-purple-100 to-indigo-200', border: 'border-purple-400' },
            { bg: 'bg-gradient-to-br from-fuchsia-100 to-pink-200', border: 'border-fuchsia-400' },
            { bg: 'bg-gradient-to-br from-pink-100 to-rose-200', border: 'border-pink-400' },
            { bg: 'bg-gradient-to-br from-lime-100 to-green-200', border: 'border-lime-400' },
            
            { bg: 'bg-gradient-to-br from-sky-100 to-cyan-200', border: 'border-sky-400' },
            { bg: 'bg-gradient-to-br from-blue-100 to-indigo-200', border: 'border-blue-400' },
            { bg: 'bg-gradient-to-br from-green-100 to-emerald-200', border: 'border-green-400' },
            { bg: 'bg-gradient-to-br from-red-100 to-rose-200', border: 'border-red-400' },
            { bg: 'bg-gradient-to-br from-yellow-100 to-amber-200', border: 'border-yellow-400' },
            { bg: 'bg-gradient-to-br from-slate-100 to-gray-200', border: 'border-slate-400' },
            
            { bg: 'bg-gradient-to-br from-cyan-50 to-teal-150', border: 'border-cyan-300' },
            { bg: 'bg-gradient-to-br from-emerald-50 to-lime-150', border: 'border-emerald-300' },
            { bg: 'bg-gradient-to-br from-violet-50 to-purple-150', border: 'border-violet-300' },
            { bg: 'bg-gradient-to-br from-rose-50 to-pink-150', border: 'border-rose-300' },
            { bg: 'bg-gradient-to-br from-amber-50 to-orange-150', border: 'border-amber-300' },
            { bg: 'bg-gradient-to-br from-sky-50 to-blue-150', border: 'border-sky-300' },
            
            { bg: 'bg-gradient-to-br from-teal-200 to-cyan-300', border: 'border-teal-500' },
            { bg: 'bg-gradient-to-br from-indigo-200 to-purple-300', border: 'border-indigo-500' },
            { bg: 'bg-gradient-to-br from-emerald-200 to-green-300', border: 'border-emerald-500' },
            { bg: 'bg-gradient-to-br from-rose-200 to-red-300', border: 'border-rose-500' },
            { bg: 'bg-gradient-to-br from-amber-200 to-yellow-300', border: 'border-amber-500' },
            { bg: 'bg-gradient-to-br from-purple-200 to-fuchsia-300', border: 'border-purple-500' },
            
            { bg: 'bg-gradient-to-br from-gray-100 to-slate-200', border: 'border-gray-400' },
            { bg: 'bg-gradient-to-br from-zinc-100 to-gray-200', border: 'border-zinc-400' },
            { bg: 'bg-gradient-to-br from-neutral-100 to-stone-200', border: 'border-neutral-400' },
            { bg: 'bg-gradient-to-br from-stone-100 to-amber-200', border: 'border-stone-400' },
            
            { bg: 'bg-gradient-to-br from-lime-200 to-green-300', border: 'border-lime-500' },
            { bg: 'bg-gradient-to-br from-cyan-200 to-blue-300', border: 'border-cyan-500' },
            { bg: 'bg-gradient-to-br from-pink-200 to-fuchsia-300', border: 'border-pink-500' },
            { bg: 'bg-gradient-to-br from-orange-200 to-red-300', border: 'border-orange-500' },
            
            { bg: 'bg-gradient-to-br from-blue-50 to-indigo-100', border: 'border-blue-300' },
            { bg: 'bg-gradient-to-br from-green-50 to-teal-100', border: 'border-green-300' },
            { bg: 'bg-gradient-to-br from-purple-50 to-violet-100', border: 'border-purple-300' },
            { bg: 'bg-gradient-to-br from-red-50 to-rose-100', border: 'border-red-300' },
            { bg: 'bg-gradient-to-br from-yellow-50 to-amber-100', border: 'border-yellow-300' },
            { bg: 'bg-gradient-to-br from-pink-50 to-fuchsia-100', border: 'border-pink-300' },
            
            { bg: 'bg-gradient-to-br from-violet-50 to-indigo-100', border: 'border-violet-300' },
            { bg: 'bg-gradient-to-br from-rose-50 to-orange-100', border: 'border-rose-300' },
            { bg: 'bg-gradient-to-br from-sky-50 to-teal-100', border: 'border-sky-300' },
            { bg: 'bg-gradient-to-br from-lime-50 to-emerald-100', border: 'border-lime-300' },
            { bg: 'bg-gradient-to-br from-fuchsia-50 to-pink-100', border: 'border-fuchsia-300' }
        ]

        const classMap = new Map<number, string>()
        tournamentClassesData.data.forEach(table => {
            classMap.set(table.id, table.class)
        })

        const usedClasses = new Set<string>()
        const classColorMap = new Map<string, { bg: string, border: string, tableId: number }>()
        let colorIndex = 0

        dayMatches.forEach(match => {
            const tableId = match.match.tournament_table_id
            const className = classMap.get(tableId)
            if (className && !usedClasses.has(className)) {
                usedClasses.add(className)
                // Assign colors sequentially to ensure uniqueness
                classColorMap.set(className, {
                    ...colorPalette[colorIndex % colorPalette.length],
                    tableId
                })
                colorIndex++
            }
        })

        return Array.from(classColorMap.entries()).map(([className, colorData]) => ({
            name: className,
            ...colorData
        }))
    }, [dayMatches, tournamentClassesData])

    const getGroupColor = useCallback((tournamentTableId: string) => {
        if (!tournamentClassesData?.data) return 'bg-gray-100 border-gray-400'

        const tableId = parseInt(tournamentTableId)
        const table = tournamentClassesData.data.find(t => t.id === tableId)
        if (!table) return 'bg-gray-100 border-gray-400'

        const classData = tournamentClasses.find(c => c.name === table.class)
        return classData ? `${classData.bg} ${classData.border}` : 'bg-gray-100 border-gray-400'
    }, [tournamentClassesData?.data, tournamentClasses])

    // Check if a match is a placement match (1-2 or 3-4) based on bracket positions
    const isPlacementMatch = useCallback((match: MatchWrapper) => {
        const bracket = match.match.bracket

        if (!bracket || typeof bracket !== 'string') return false

        // Check for exact placement matches: 1-2 (final) or 3-4 (3rd place)
        return bracket === '1-2' || bracket === '3-4'
    }, [])

    // Get placement match label based on bracket
    const getPlacementLabel = useCallback((match: MatchWrapper) => {
        const bracket = match.match.bracket
        if (bracket === '1-2') return t('competitions.timetable.view.final_match')
        if (bracket === '3-4') return t('competitions.timetable.view.bronze_match')
        return ''
    }, [t])

    const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 })
    const ITEM_HEIGHT = 48 // 12 * 4px (min-h-12)
    const BUFFER_SIZE = 5

    // Create a match lookup map for O(1) access instead of O(n) array.find
    const dayMatchesMap = useMemo(() => {
        if (!dayMatches.length) return new Map()

        const map = new Map<string, MatchWrapper>()
        dayMatches.forEach(match => {
            if (match.match.start_date) {
                const date = new Date(match.match.start_date)
                const hours = String(date.getUTCHours()).padStart(2, '0')
                const minutes = String(date.getUTCMinutes()).padStart(2, '0')
                const timeString = `${hours}:${minutes}`

                const key = `${match.match.extra_data.table}-${timeString}`
                map.set(key, match)
            }
        })
        return map
    }, [dayMatches])

    // Optimize getMatchForCell with memoized lookup
    const getMatchForCell = useCallback((tableId: string, timeSlot: string) => {
        const key = `${tableId}-${timeSlot}`
        return dayMatchesMap.get(key) || null
    }, [dayMatchesMap])

    const getRoundForTimeSlot = useCallback((timeSlot: string) => {
        return rounds.find((round) => {
            const slotTime = timeSlot.split(":").map(Number)
            const startTime = round.startTime.split(":").map(Number)
            const endTime = round.endTime.split(":").map(Number)

            const slotMinutes = slotTime[0] * 60 + slotTime[1]
            const startMinutes = startTime[0] * 60 + startTime[1]
            const endMinutes = endTime[0] * 60 + endTime[1]

            return slotMinutes >= startMinutes && slotMinutes < endMinutes
        })
    }, [rounds])

    // Virtual scrolling handler
    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        if (!tournamentTables?.data) return

        const scrollTop = e.currentTarget.scrollTop
        const containerHeight = e.currentTarget.clientHeight

        const start = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER_SIZE)
        const visibleCount = Math.ceil(containerHeight / ITEM_HEIGHT)
        const end = Math.min(tournamentTables.data.length, start + visibleCount + BUFFER_SIZE * 2)

        setVisibleRange({ start, end })
    }, [tournamentTables?.data])

    // Get visible tables for virtual scrolling
    const visibleTables = useMemo(() => {
        if (!tournamentTables?.data) return []
        return tournamentTables.data.slice(visibleRange.start, visibleRange.end)
    }, [tournamentTables?.data, visibleRange])

    // Calculate total height for virtual scrolling
    const totalHeight = (tournamentTables?.data?.length || 0) * ITEM_HEIGHT
    const offsetY = visibleRange.start * ITEM_HEIGHT

    const formatDayLabel = (dayString: string) => {
        const date = new Date(dayString + 'T00:00:00')
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        })
    }

    return (
        <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 flex flex-col">

            {/* Day Tabs */}
            {tournamentDays.length > 1 && (
                <div className="bg-white border-b px-4 py-2">
                    <div className="flex gap-1">
                        {tournamentDays.map((day) => (
                            <button
                                key={day}
                                onClick={() => setSelectedDay(day)}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${selectedDay === day
                                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                {formatDayLabel(day)}
                            </button>
                        ))}
                    </div>
                </div>
            )}

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
            <div className="flex-1 overflow-auto" onScroll={handleScroll}>
                <div className="min-w-max">
                    {/* Time Header Row */}
                    <div className="sticky top-0 bg-white border-b flex z-10">
                        <div className="w-16 bg-gray-50 border-r flex items-center justify-center text-xs font-medium p-1">
                            {t('competitions.timetable.view.tables')}
                        </div>
                        {timeSlots.map((timeSlot) => {
                            const round = getRoundForTimeSlot(timeSlot)
                            return (
                                <div
                                    key={timeSlot}
                                    className="w-24 border-r flex flex-col items-center justify-center p-1 text-xs bg-gray-100"
                                >
                                    <div className="font-medium">{timeSlot}</div>
                                    {round && <div className="text-[10px] text-gray-600 truncate w-full text-center">{round.name}</div>}
                                </div>
                            )
                        })}
                    </div>

                    {/* Virtual scrolling container */}
                    <div style={{ height: totalHeight, position: 'relative' }}>
                        <div style={{ transform: `translateY(${offsetY}px)` }}>
                            {visibleTables.map((table) => (
                                <TableRow
                                    key={table.id}
                                    table={table}
                                    timeSlots={timeSlots}
                                    getMatchForCell={getMatchForCell}
                                    getRoundForTimeSlot={getRoundForTimeSlot}
                                    getGroupColor={getGroupColor}
                                    isPlacementMatch={isPlacementMatch}
                                    getPlacementLabel={getPlacementLabel}
                                    tournamentClassesData={tournamentClassesData}
                                    hoveredCell={hoveredCell}
                                    setHoveredCell={setHoveredCell}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
