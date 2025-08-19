import { UseGetTournamentMatchesQuery } from '@/queries/match'
import { UseGetFreeVenues } from '@/queries/venues'
import { TimeTableEditMatch, UseEditTimeTable, UseGetTournamentTablesQuery } from '@/queries/tables'
import { createFileRoute, useParams } from '@tanstack/react-router'
import { useMemo, useState, useCallback } from 'react'
import { MatchWrapper } from '@/types/matches'
import { useTranslation } from 'react-i18next'
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
} from '@dnd-kit/core'
import {
    sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import { colorPalette } from './-components/color-palette'
import TTRow from './-components/table-row'
import { DraggableMatch } from './-components/draggable-match'
import { toast } from 'sonner'

export const Route = createFileRoute(
    '/admin/tournaments/$tournamentid/ajakava/',
)({
    component: RouteComponent,
})

function RouteComponent() {
    const { tournamentid } = useParams({ from: "/admin/tournaments/$tournamentid/ajakava/" })
    const { t } = useTranslation()
    const [hoveredCell, setHoveredCell] = useState<string | null>(null)
    const [selectedDay, setSelectedDay] = useState<string>('')
    const [activeMatch, setActiveMatch] = useState<MatchWrapper | null>(null)

    const [matchPositions, setMatchPositions] = useState<Map<string, { table: string, timeSlot: string }>>(new Map())

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const { data: tournamentTables } = UseGetFreeVenues(Number(tournamentid), true);
    const { data: tournamentMatches } = UseGetTournamentMatchesQuery(Number(tournamentid))
    const { data: tournamentClassesData } = UseGetTournamentTablesQuery(Number(tournamentid))
    const editTimeTableMutation = UseEditTimeTable(Number(tournamentid))

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

    // Filter matches for the selected day with position updates
    const dayMatches = useMemo(() => {
        if (!tournamentMatches?.data || !selectedDay) return []

        return tournamentMatches.data.filter(match => {
            if (!match.match.start_date) return false
            const matchDay = new Date(match.match.start_date).toISOString().split('T')[0]
            return matchDay === selectedDay
        }).map(match => {
            // Check if this match has been moved
            const updatedPosition = matchPositions.get(match.match.id)
            if (updatedPosition) {
                // Create a new match object with updated position
                const updatedMatch = {
                    ...match,
                    match: {
                        ...match.match,
                        extra_data: {
                            ...match.match.extra_data,
                            table: updatedPosition.table
                        },
                        start_date: (() => {
                            const originalDate = new Date(match.match.start_date!)
                            const [hours, minutes] = updatedPosition.timeSlot.split(':').map(Number)
                            const newDate = new Date(originalDate)
                            newDate.setUTCHours(hours, minutes, 0, 0)
                            return newDate.toISOString()
                        })()
                    }
                }
                return updatedMatch
            }
            return match
        })
    }, [tournamentMatches, selectedDay, matchPositions])

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

    // Handle drag start
    const handleDragStart = useCallback((event: DragStartEvent) => {
        const { active } = event
        if (active.data.current?.type === 'match') {
            setActiveMatch(active.data.current.match)
        }
    }, [])

    // Shared validation function to check if a match would be invalid at a given time
    const isMatchTimeInvalid = useCallback((activeMatch: MatchWrapper, currentMatch: MatchWrapper, allMatches: MatchWrapper[]): boolean => {
        if (!activeMatch || !allMatches) return false

        // Find all parent matches (that feed into activeMatch)
        const parentMatches = allMatches.filter(m => 
            m.match.next_winner_match_id === activeMatch.match.id ||
            m.match.next_loser_match_id === activeMatch.match.id
        )

        // Find all successor matches (that activeMatch feeds into)
        const successorMatches = allMatches.filter(m => 
            activeMatch.match.next_winner_match_id === m.match.id ||
            activeMatch.match.next_loser_match_id === m.match.id
        )

        // Get parent start dates
        const parentStartDates = parentMatches
            .map(m => m.match.start_date)
            .filter(date => date && new Date(date).getTime() > 0)
            .map(date => new Date(date))

        // Get successor start dates  
        const successorStartDates = successorMatches
            .map(m => m.match.start_date)
            .filter(date => date && new Date(date).getTime() > 0)
            .map(date => new Date(date))

        const currentMatchDate = currentMatch.match.start_date && new Date(currentMatch.match.start_date).getTime() > 0 
            ? new Date(currentMatch.match.start_date) 
            : null

        if (!currentMatchDate) return false

        // Check if current match time is invalid based on dependencies
        const latestParent = parentStartDates.length > 0 ? new Date(Math.max(...parentStartDates.map(d => d.getTime()))) : null
        const earliestSuccessor = successorStartDates.length > 0 ? new Date(Math.min(...successorStartDates.map(d => d.getTime()))) : null

        const isBeforeParents = latestParent && currentMatchDate <= latestParent
        const isAfterSuccessors = earliestSuccessor && currentMatchDate >= earliestSuccessor

        return isBeforeParents || isAfterSuccessors
    }, [])

    // Validation function to check if target time slot is valid for drag and drop
    const isValidTimeSlot = useCallback((match: MatchWrapper, targetTimeSlot: string) => {
        if (!dayMatches) return true

        // Create a temporary match with the target time to validate
        const [hours, minutes] = targetTimeSlot.split(':').map(Number)
        const targetDate = new Date(`${selectedDay}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00.000Z`)
        
        const tempMatch: MatchWrapper = {
            ...match,
            match: {
                ...match.match,
                start_date: targetDate.toISOString()
            }
        }

        return !isMatchTimeInvalid(match, tempMatch, dayMatches)
    }, [dayMatches, selectedDay, isMatchTimeInvalid])

    // Handle drag end
    const handleDragEnd = useCallback(async (event: DragEndEvent) => {
        const { active, over } = event

        setActiveMatch(null)

        if (!over || !active.data.current?.match) {
            return
        }

        const match = active.data.current.match as MatchWrapper
        const targetCell = over.data.current

        if (targetCell?.type === 'cell') {
            const targetTable = targetCell.table
            const targetTimeSlot = targetCell.timeSlot

            // Validate if target time slot is valid based on match dependencies
            if (!isValidTimeSlot(match, targetTimeSlot)) {
                toast.error('Cannot move match to this time slot - it conflicts with parent or successor match scheduling')
                return
            }

            // Check if target cell is already occupied
            const targetKey = `${targetTable}-${targetTimeSlot}`
            const existingMatch = dayMatchesMap.get(targetKey)
            let edited_match_array: TimeTableEditMatch[] = []

            if (existingMatch && existingMatch.match.id !== match.match.id) {
                const originalDate = new Date(match.match.start_date!)
                const originalTable = match.match.extra_data.table

                const editData: TimeTableEditMatch = {
                    match_id: existingMatch.match.id,
                    table: originalTable,
                    time: originalDate.toISOString(),
                }
                edited_match_array.push(editData)
            }

            const [hours, minutes] = targetTimeSlot.split(':').map(Number)
            const fullDateTimeString = `${selectedDay}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00.000Z`

            const previousPositions = new Map(matchPositions)
            try {
                console.log('Moved match', match.match.id, 'to table', targetTable, 'at time', fullDateTimeString)
                const editData: TimeTableEditMatch = {
                    match_id: match.match.id,
                    table: targetTable,
                    time: fullDateTimeString
                }
                edited_match_array.push(editData)

                setMatchPositions(prev => {
                    const newPositions = new Map(prev)

                    edited_match_array.forEach(editItem => {
                        const timeDate = new Date(editItem.time)
                        const hours = String(timeDate.getUTCHours()).padStart(2, '0')
                        const minutes = String(timeDate.getUTCMinutes()).padStart(2, '0')
                        const timeSlot = `${hours}:${minutes}`

                        newPositions.set(editItem.match_id, {
                            table: editItem.table,
                            timeSlot: timeSlot
                        })
                    })

                    return newPositions
                })

                await editTimeTableMutation.mutateAsync(edited_match_array)
                toast.success('moved match successfully')
            } catch (error) {
                setMatchPositions(previousPositions)
                toast.error('Failed to move match')
            }
        }
    }, [dayMatchesMap, selectedDay])

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
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
                            <div className="w-16 bg-gray-50 border-r flex items-center justify-center text-xs font-medium p-1 sticky left-0 z-10">
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
                                {visibleTables.map((table) => {
                                    return (
                                        <TTRow
                                            key={table.id}
                                            table={table}
                                            timeSlots={timeSlots}
                                            activeMatch={activeMatch}
                                            getMatchForCell={getMatchForCell}
                                            getRoundForTimeSlot={getRoundForTimeSlot}
                                            getGroupColor={getGroupColor}
                                            isPlacementMatch={isPlacementMatch}
                                            getPlacementLabel={getPlacementLabel}
                                            tournamentClassesData={tournamentClassesData?.data}
                                            hoveredCell={hoveredCell}
                                            setHoveredCell={setHoveredCell}
                                            allMatches={dayMatches}
                                            isMatchTimeInvalid={isMatchTimeInvalid}
                                        />
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                <DragOverlay>
                    {activeMatch ? (
                        <div className="w-24 h-12 border-r flex items-center justify-center p-0.5 bg-white shadow-lg rounded border-2 border-blue-300">
                            <DraggableMatch
                                activeMatch={activeMatch}
                                match={activeMatch}
                                tournamentClassesData={tournamentClassesData?.data}
                                isPlacementMatch={isPlacementMatch}
                                getPlacementLabel={getPlacementLabel}
                                getGroupColor={getGroupColor}
                                allMatches={dayMatches}
                                isMatchTimeInvalid={isMatchTimeInvalid}
                            />
                        </div>
                    ) : null}
                </DragOverlay>
            </div>
        </DndContext>
    )
}
