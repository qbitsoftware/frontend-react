import { UseGetTournamentMatchesQuery } from '@/queries/match'
import { UseGetFreeVenues } from '@/queries/venues'
import { TimeTableEditMatch, UseChangeTimeSlotTime, UseEditTimeTable, UseGetTournamentTablesQuery } from '@/queries/tables'
import { useMemo, useState, useCallback, useEffect } from 'react'
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
import { colorPalette } from '@/routes/admin/tournaments/$tournamentid/ajakava/-components/color-palette'
import TTRow from '@/routes/admin/tournaments/$tournamentid/ajakava/-components/table-row'
import { DraggableMatch } from '@/routes/admin/tournaments/$tournamentid/ajakava/-components/draggable-match'
import { toast } from 'sonner'
import { FaPencilAlt } from 'react-icons/fa'

interface TimetableProps {
    tournamentId: number
    isAdmin?: boolean
    showDragAndDrop?: boolean
    showParticipantsDefault?: boolean
    height?: string
}

export function Timetable({
    tournamentId,
    isAdmin = false,
    showDragAndDrop = false,
    showParticipantsDefault = false,
    height = "h-screen"
}: TimetableProps) {
    const { t } = useTranslation()
    const [hoveredCell, setHoveredCell] = useState<string | null>(null)
    const [selectedDay, setSelectedDay] = useState<string>('')
    const [activeMatch, setActiveMatch] = useState<MatchWrapper | null>(null)
    const [showParticipants, setShowParticipants] = useState<boolean>(showParticipantsDefault)

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

    const { data: tournamentTables } = UseGetFreeVenues(tournamentId, isAdmin);
    const { data: tournamentMatches } = UseGetTournamentMatchesQuery(tournamentId)
    const { data: tournamentClassesData } = UseGetTournamentTablesQuery(tournamentId)
    console.log('tournamentclassesData', tournamentClassesData)
    const editTimeTableMutation = isAdmin ? UseEditTimeTable(tournamentId) : null
    const editTimeSlotsMutation = isAdmin ? UseChangeTimeSlotTime(tournamentId) : null

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

        if (sortedDays.length > 0 && !selectedDay) {
            setSelectedDay(sortedDays[0])
        }

        return sortedDays
    }, [tournamentMatches, selectedDay])

    const dayMatches = useMemo(() => {
        if (!tournamentMatches?.data || !selectedDay) return []

        return tournamentMatches.data.filter(match => {
            if (!match.match.start_date) return false
            const matchDay = new Date(match.match.start_date).toISOString().split('T')[0]
            return matchDay === selectedDay
        }).map(match => {
            const updatedPosition = matchPositions.get(match.match.id)
            if (updatedPosition) {
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

    const isRoundRobinMatch = useCallback((match: MatchWrapper) => {
        return match.match.type === 'roundrobin'
    }, [])

    const isPlacementMatch = useCallback((match: MatchWrapper) => {
        const bracket = match.match.bracket

        if (!bracket || typeof bracket !== 'string') return false

        return bracket === '1-2' || bracket === '3-4'
    }, [])

    const hasRoundRobinConflict = useCallback((timeSlot: string, draggedMatch: MatchWrapper) => {
        if (!isRoundRobinMatch(draggedMatch) || !dayMatches) return false

        const matchesAtTimeSlot = dayMatches.filter(match => {
            if (!match.match.start_date) return false
            const date = new Date(match.match.start_date)
            const hours = String(date.getUTCHours()).padStart(2, '0')
            const minutes = String(date.getUTCMinutes()).padStart(2, '0')
            const matchTimeString = `${hours}:${minutes}`
            return matchTimeString === timeSlot
        })

        const draggedP1Id = draggedMatch.p1?.id
        const draggedP2Id = draggedMatch.p2?.id

        return matchesAtTimeSlot.some(match => {
            if (match.match.id === draggedMatch.match.id) return false // Ignore self
            const p1Id = match.p1?.id
            const p2Id = match.p2?.id

            return (draggedP1Id && (p1Id === draggedP1Id || p2Id === draggedP1Id)) ||
                (draggedP2Id && (p1Id === draggedP2Id || p2Id === draggedP2Id))
        })
    }, [dayMatches, isRoundRobinMatch])

    const getPlacementLabel = useCallback((match: MatchWrapper) => {
        const bracket = match.match.bracket
        if (bracket === '1-2') return t('competitions.timetable.view.final_match')
        if (bracket === '3-4') return t('competitions.timetable.view.bronze_match')
        return ''
    }, [t])

    const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 })
    const ITEM_HEIGHT = 48
    const BUFFER_SIZE = 5

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

    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        if (!tournamentTables?.data) return

        const scrollTop = e.currentTarget.scrollTop
        const containerHeight = e.currentTarget.clientHeight

        const start = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER_SIZE)
        const visibleCount = Math.ceil(containerHeight / ITEM_HEIGHT)
        const end = Math.min(tournamentTables.data.length, start + visibleCount + BUFFER_SIZE * 2)

        setVisibleRange({ start, end })
    }, [tournamentTables?.data])

    const visibleTables = useMemo(() => {
        if (!tournamentTables?.data) return []
        return tournamentTables.data.slice(visibleRange.start, visibleRange.end)
    }, [tournamentTables?.data, visibleRange])

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

    const handleDragStart = useCallback((event: DragStartEvent) => {
        if (!showDragAndDrop) return
        const { active } = event
        if (active.data.current?.type === 'match') {
            setActiveMatch(active.data.current.match)
        }
    }, [showDragAndDrop])

    const isMatchTimeInvalid = useCallback((activeMatch: MatchWrapper, currentMatch: MatchWrapper, allMatches: MatchWrapper[]): boolean => {
        if (!activeMatch || !allMatches) return false

        const parentMatches = allMatches.filter(m =>
            m.match.next_winner_match_id === activeMatch.match.id ||
            m.match.next_loser_match_id === activeMatch.match.id
        )

        const successorMatches = allMatches.filter(m =>
            activeMatch.match.next_winner_match_id === m.match.id ||
            activeMatch.match.next_loser_match_id === m.match.id
        )

        const parentStartDates = parentMatches
            .map(m => m.match.start_date)
            .filter(date => date && new Date(date).getTime() > 0)
            .map(date => new Date(date))

        const successorStartDates = successorMatches
            .map(m => m.match.start_date)
            .filter(date => date && new Date(date).getTime() > 0)
            .map(date => new Date(date))

        const currentMatchDate = currentMatch.match.start_date && new Date(currentMatch.match.start_date).getTime() > 0
            ? new Date(currentMatch.match.start_date)
            : null

        if (!currentMatchDate) return false

        const latestParent = parentStartDates.length > 0 ? new Date(Math.max(...parentStartDates.map(d => d.getTime()))) : null
        const earliestSuccessor = successorStartDates.length > 0 ? new Date(Math.min(...successorStartDates.map(d => d.getTime()))) : null

        const isBeforeParents = latestParent && currentMatchDate <= latestParent
        const isAfterSuccessors = earliestSuccessor && currentMatchDate >= earliestSuccessor

        return Boolean(isBeforeParents || isAfterSuccessors)
    }, [])

    const isValidTimeSlot = useCallback((match: MatchWrapper, targetTimeSlot: string) => {
        if (!dayMatches) return true

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

    const handleDragEnd = useCallback(async (event: DragEndEvent) => {
        if (!showDragAndDrop || !editTimeTableMutation) return

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

            if (!isValidTimeSlot(match, targetTimeSlot)) {
                toast.error(t('admin.tournaments.timetable.move_conflict_error'))
                return
            }

            if (hasRoundRobinConflict(targetTimeSlot, match)) {
                toast.error(t('admin.tournaments.timetable.round_robin_conflict_error'))
                return
            }

            const targetKey = `${targetTable}-${targetTimeSlot}`
            const existingMatch = dayMatchesMap.get(targetKey)
            const edited_match_array: TimeTableEditMatch[] = []

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
                toast.success(t('admin.tournaments.timetable.move_success'))
            } catch {
                setMatchPositions(previousPositions)
                toast.error(t('admin.tournaments.timetable.failed_to_move'))
            }
        }
    }, [dayMatchesMap, selectedDay, showDragAndDrop, editTimeTableMutation, hasRoundRobinConflict, isValidTimeSlot, matchPositions, t])

    // Replace isEditingTimeSlots and editableTimeSlots logic with per-slot editing
    const [editingSlotIdx, setEditingSlotIdx] = useState<number | null>(null)
    const [editableTimeSlots, setEditableTimeSlots] = useState<string[]>([])
    const [originalTimeSlots, setOriginalTimeSlots] = useState<string[]>([])

    useEffect(() => {
        setEditableTimeSlots(timeSlots)
        setOriginalTimeSlots(timeSlots)
        setEditingSlotIdx(null)
    }, [timeSlots])

    // Helper to get full date string for a time slot
    const getFullDateString = (day: string, time: string) => {
        const [hours, minutes] = time.split(':').map(Number)
        return `${day}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00.000Z`
    }

    // Handler for editing
    const handleEditSlot = (idx: number) => {
        setEditingSlotIdx(idx)
    }

    const handleTimeSlotChange = (idx: number, value: string) => {
        let digits = value.replace(/\D/g, '');

        if (digits.length > 4) digits = digits.slice(0, 4);

        let formatted = digits;
        if (digits.length >= 3) {
            formatted = `${digits.slice(0, 2)}:${digits.slice(2, 4)}`;
        } else if (digits.length >= 1) {
            formatted = digits;
        }

        setEditableTimeSlots(prev => {
            const updated = [...prev];
            updated[idx] = formatted;
            return updated;
        });
    }

    const handleSaveSlot = async (idx: number) => {
        if (idx > 0) {
            const prevTime = editableTimeSlots[idx - 1]
            const newTime = editableTimeSlots[idx]

            const [prevH, prevM] = prevTime.split(':').map(Number)
            const [newH, newM] = newTime.split(':').map(Number)
            const prevMinutes = prevH * 60 + prevM
            const newMinutes = newH * 60 + newM
            if (newMinutes <= prevMinutes) {
                toast.error(t('admin.tournaments.timetable.change_time_slot_error'))
                return
            }
        }

        const before = getFullDateString(selectedDay, originalTimeSlots[idx])
        const after = getFullDateString(selectedDay, editableTimeSlots[idx])
        const change = { before, after }
        try {
            if (isAdmin) {
                await editTimeSlotsMutation?.mutateAsync(change)
                toast.success(t('admin.tournaments.timetable.time_slot_update_success'))
                setEditingSlotIdx(null)
            }
        } catch {
            toast.error(t('admin.tournaments.timetable.failed_to_update_time_slot'))
        }
    }

    const timetableContent = (
        <div className={`${height} flex flex-col border rounded-lg overflow-hidden`}>
            {tournamentDays.length > 1 && (
                <div className="bg-white border-b py-2">
                    <div className="flex gap-1 ">
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

            <div className="border-b p-3">
                <div className="flex flex-wrap gap-3 items-center justify-between">
                    <div className="flex flex-wrap gap-3">
                        {tournamentClasses.map((classData, index) => (
                            <div key={index} className="flex items-center gap-1">
                                <div className={`w-4 h-4 border-2 ${classData.bg} ${classData.border} rounded`}></div>
                                <span className="text-xs font-medium">{classData.name}</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center gap-1">
                        <input
                            type="checkbox"
                            id="showParticipants"
                            checked={showParticipants}
                            onChange={(e) => setShowParticipants(e.target.checked)}
                            className="w-3 h-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="showParticipants" className="text-xs font-medium cursor-pointer">
                            {t('competitions.timetable.view.show_participants')}
                        </label>
                    </div>
                </div>
            </div>
            <div className="flex-1 overflow-auto" onScroll={handleScroll}>
                <div className="min-w-max">
                    <div className="sticky top-0 bg-white border-b flex z-10">
                        <div className="w-16 bg-gray-50 border-x flex items-center justify-center text-xs font-medium p-1 sticky left-0 z-10">
                            {t('competitions.timetable.view.tables')}
                        </div>
                        {/* Render time slots with pencil icon and per-slot editing */}
                        {editableTimeSlots.map((timeSlot, idx) => {
                            const round = getRoundForTimeSlot(timeSlot)
                            return (
                                <div
                                    key={idx}
                                    className="w-24 border-r flex flex-col items-center justify-center p-1 text-xs bg-gray-100 relative"
                                >
                                    {editingSlotIdx === idx ? (
                                        <div className="flex items-center gap-1">
                                            <input
                                                type="text"
                                                value={timeSlot}
                                                onChange={e => handleTimeSlotChange(idx, e.target.value)}
                                                className="w-16 px-1 py-0.5 border rounded text-xs"
                                                placeholder="HH:MM"
                                            />
                                            <button
                                                className="ml-1 text-green-600"
                                                onClick={() => handleSaveSlot(idx)}
                                            >
                                                ✓
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1">
                                            <span className="font-medium">{timeSlot}</span>
                                            <button
                                                className="ml-1 text-gray-500 hover:text-blue-600"
                                                onClick={() => handleEditSlot(idx)}
                                                aria-label="Edit time slot"
                                            >
                                                <FaPencilAlt size={12} />
                                            </button>
                                        </div>
                                    )}
                                    {round && <div className="text-[10px] text-gray-600 truncate w-full text-center">{round.name}</div>}
                                </div>
                            )
                        })}
                    </div>

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
                                        showParticipants={showParticipants}
                                        hasRoundRobinConflict={hasRoundRobinConflict}
                                        isAdmin={showDragAndDrop}
                                    />
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {showDragAndDrop && (
                <DragOverlay>
                    {activeMatch ? (
                        <div className="w-24 h-12 border-x flex items-center justify-center p-0.5 bg-white shadow-lg rounded border-2 border-blue-300">
                            <DraggableMatch
                                activeMatch={activeMatch}
                                match={activeMatch}
                                tournamentClassesData={tournamentClassesData?.data}
                                isPlacementMatch={isPlacementMatch}
                                getPlacementLabel={getPlacementLabel}
                                getGroupColor={getGroupColor}
                                allMatches={dayMatches}
                                isMatchTimeInvalid={isMatchTimeInvalid}
                                showParticipants={showParticipants}
                            />
                        </div>
                    ) : null}
                </DragOverlay>
            )}
        </div>
    )

    if (showDragAndDrop) {
        return (
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                {timetableContent}
            </DndContext>
        )
    }

    return timetableContent
}

