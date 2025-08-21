import { useState } from "react"
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getDaysInMonth, getTournamentColor } from "./calendar-utils"
import { getFormattedDate } from "../$tournamentid/mangud/-components/schedule-utils"
import { Tournament } from "@/types/tournaments"

const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
]

interface Props {
    tournaments: Tournament[]
}

export function SportsTimetable({ tournaments }: Props) {
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth()

    const [selectedSport, setSelectedSport] = useState<string | null>(null)
    const [selectedYear, setSelectedYear] = useState(currentYear)
    const [isZoomed, setIsZoomed] = useState(true)
    const [zoomStartMonth, setZoomStartMonth] = useState(currentMonth)
    void setSelectedSport;

    // const sports = Array.from(new Set(tournaments.map((t) => t.sport)))

    const filteredTournaments = selectedSport ? tournaments.filter((t) => t.sport === selectedSport) : tournaments
    filteredTournaments.map((t) => {
        t.color = getTournamentColor(t.id)
    })

    const visibleMonths = isZoomed
        ? months.slice(zoomStartMonth, zoomStartMonth + 3).map((month, index) => ({
            name: month,
            index: zoomStartMonth + index,
        }))
        : months.map((month, index) => ({
            name: month,
            index,
        }))

    const handlePrevMonths = () => {
        if (zoomStartMonth > 0) {
            setZoomStartMonth(zoomStartMonth - 1)
        }
    }

    const handleNextMonths = () => {
        if (zoomStartMonth < 9) {
            setZoomStartMonth(zoomStartMonth + 1)
        }
    }

    // Calculate position and width for each tournament
    const getTournamentStyle = (tournament: Tournament, isZoomed: boolean) => {
        const startMonth = new Date(tournament.start_date).getMonth()
        const startDay = new Date(tournament.start_date).getDate()
        const endMonth = new Date(tournament.end_date).getMonth()
        const endDay = new Date(tournament.end_date).getDate()

        const daysInMonth = getDaysInMonth(selectedYear)

        // Calculate total days in year
        const totalDays = daysInMonth.reduce((sum, days) => sum + days, 0)

        // Calculate start position (days from beginning of year)
        let startPosition = 0
        for (let i = 0; i < startMonth; i++) {
            startPosition += daysInMonth[i]
        }
        startPosition += startDay - 1

        // Calculate end position
        let endPosition = 0
        for (let i = 0; i < endMonth; i++) {
            endPosition += daysInMonth[i]
        }
        endPosition += endDay - 1

        // Calculate tournament duration in days
        const durationDays = endPosition - startPosition + 1

        const isShortTournament = durationDays <= 5

        if (isZoomed) {
            // Calculate days from start of zoom period
            let zoomStartDays = 0
            for (let i = 0; i < zoomStartMonth; i++) {
                zoomStartDays += daysInMonth[i]
            }

            // Calculate total days in zoom period (3 months)
            let zoomTotalDays = 0
            for (let i = zoomStartMonth; i < Math.min(zoomStartMonth + 3, 12); i++) {
                zoomTotalDays += daysInMonth[i]
            }

            // Calculate zoom end days
            const zoomEndDays = zoomStartDays + zoomTotalDays

            // Adjust positions relative to zoom window
            const adjustedStartPosition = Math.max(startPosition, zoomStartDays) - zoomStartDays
            const adjustedEndPosition = Math.min(endPosition, zoomEndDays) - zoomStartDays

            // Convert to percentage for positioning within zoom window
            const left = (adjustedStartPosition / zoomTotalDays) * 100
            const width = ((adjustedEndPosition - adjustedStartPosition) / zoomTotalDays) * 100

            // Apply different styles based on duration
            if (isShortTournament) {
                return {
                    left: `${left}%`,
                    width: '50px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                }
            } else {
                const minWidth = 2
                return {
                    left: `${left}%`,
                    width: `${Math.max(minWidth, width)}%`,
                }
            }
        } else {
            // Convert to percentage for positioning in full year view
            const left = (startPosition / totalDays) * 100
            const width = ((endPosition - startPosition) / totalDays) * 100

            if (isShortTournament) {
                return {
                    left: `${left}%`,
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                }
            } else {
                let minWidth = 0.5
                if (durationDays <= 3) {
                    minWidth = 3
                }

                return {
                    left: `${left}%`,
                    width: `${Math.max(minWidth, width)}%`,
                }
            }
        }
    }
    const isPastTournament = (tournament: Tournament) => {
        return new Date(tournament.end_date) < currentDate
    }

    const isTournamentVisible = (tournament: (typeof tournaments)[0]) => {
        if (!isZoomed) return true

        const tournamentStartMonth = new Date(tournament.start_date).getMonth()
        const tournamentEndMonth = new Date(tournament.end_date).getMonth()

        return (
            (tournamentStartMonth >= zoomStartMonth && tournamentStartMonth < zoomStartMonth + 3) ||
            (tournamentEndMonth >= zoomStartMonth && tournamentEndMonth < zoomStartMonth + 3) ||
            (tournamentStartMonth < zoomStartMonth && tournamentEndMonth >= zoomStartMonth + 3)
        )
    }

    // Available years for selection (current year -5 to +5)
    const availableYears = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i)

    return (
        <div className="space-y-6">
            {/* Controls */}
            <div className="flex flex-wrap w-full gap-4">
                <div className="flex flex-col gap-2 items-center w-full">
                    {/* Year selector */}
                    <div className="flex gap-4">
                        <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(Number.parseInt(value))}>
                            <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder="Select Year" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableYears.map((year) => (
                                    <SelectItem key={year} value={year.toString()}>
                                        {year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Zoom controls */}
                        <button
                            onClick={() => setIsZoomed(!isZoomed)}
                            className="flex items-center gap-1 px-3 py-1 rounded-md bg-muted hover:bg-muted/80"
                        >
                            {isZoomed ? <ZoomOut className="h-4 w-4" /> : <ZoomIn className="h-4 w-4" />}
                            <span>{isZoomed ? "Show Full Year" : "Zoom In"}</span>
                        </button>

                    </div>

                </div>

                {/* Month navigation (only in zoomed mode) */}
                {isZoomed && (
                    <div className="flex items-center justify-between gap-1 w-full">
                        <button
                            onClick={handlePrevMonths}
                            disabled={zoomStartMonth === 0}
                            className="p-1 rounded-md bg-muted hover:bg-muted/80 disabled:opacity-50"
                        >
                            <ChevronLeft className="h-8 w-8" />
                        </button>
                        <span className="text-sm font-medium">
                            {months[zoomStartMonth]} - {months[Math.min(zoomStartMonth + 2, 11)]}
                        </span>
                        <button
                            onClick={handleNextMonths}
                            disabled={zoomStartMonth >= 9}
                            className="p-1 rounded-md bg-muted hover:bg-muted/80 disabled:opacity-50"
                        >
                            <ChevronRight className="h-8 w-8" />
                        </button>
                    </div>
                )}


                {/* Sport filter */}
                {/* <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setSelectedSport(null)}
                        className={`px-3 py-1 rounded-full text-sm ${selectedSport === null ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
                            }`}
                    >
                        All Sports
                    </button>
                    {sports.map((sport) => (
                        <button
                            key={sport}
                            onClick={() => setSelectedSport(sport)}
                            className={`px-3 py-1 rounded-full text-sm ${selectedSport === sport ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
                                }`}
                        >
                            {sport}
                        </button>
                    ))}
                </div> */}
            </div>

            {/* Timetable */}
            <div className="border rounded-lg overflow-hidden">
                {/* Month headers */}
                <div className={`grid ${isZoomed ? "grid-cols-3" : "grid-cols-12"} bg-muted`}>
                    {visibleMonths.map((month) => (
                        <div key={month.index} className="p-2 text-center text-sm font-medium border-r last:border-r-0">
                            {month.name}
                        </div>
                    ))}
                </div>

                {/* Timetable body */}
                <div className="relative h-[400px] bg-card">
                    {/* Month grid lines */}
                    <div
                        className={`grid ${isZoomed ? "grid-cols-3" : "grid-cols-12"} h-full absolute w-full pointer-events-none`}
                    >
                        {visibleMonths.map((month) => (
                            <div key={month.index} className="border-r last:border-r-0 h-full"></div>
                        ))}
                    </div>

                    {/* Tournament bars */}
                    <TooltipProvider>
                        {filteredTournaments
                            .filter((tournament) => isTournamentVisible(tournament))
                            .map((tournament, index) => {
                                const style = getTournamentStyle(tournament, isZoomed)
                                const rowHeight = 40
                                const top = (index % 10) * rowHeight
                                const isPast = isPastTournament(tournament)

                                return (
                                    <Tooltip key={tournament.id}>
                                        <TooltipTrigger asChild>
                                            <div
                                                className={`absolute h-8 rounded-md text-white text-xs font-medium flex items-center justify-center px-2 truncate cursor-pointer hover:opacity-90 transition-opacity ${isPast ? "opacity-40 grayscale" : ""
                                                    }`}
                                                style={{
                                                    ...style,
                                                    backgroundColor: tournament.color,
                                                    top: `${top}px`,
                                                }}
                                            >
                                                <p className="text-center">{tournament.name}</p>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <div className="space-y-1">
                                                <p className="font-bold">{tournament.name}</p>
                                                <p className="text-sm">{tournament.sport}</p>
                                                <p className="text-xs">
                                                    {getFormattedDate(tournament.start_date)} - {getFormattedDate(tournament.end_date)}
                                                </p>
                                                <p className="text-xs">
                                                    Duration:{" "}
                                                    {Math.ceil(
                                                        (new Date(tournament.end_date).getTime() - new Date(tournament.start_date).getTime()) / (1000 * 60 * 60 * 24),
                                                    )}{" "}
                                                    days
                                                </p>
                                                {isPast && <p className="text-xs text-muted-foreground">Event completed</p>}
                                            </div>
                                        </TooltipContent>
                                    </Tooltip>
                                )
                            })}
                    </TooltipProvider>
                </div>
            </div>

            {/* Legend */}
            <div className="border rounded-lg p-4 bg-card">
                <h3 className="font-medium mb-2">Legend</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {tournaments.map((tournament) => {
                        const isPast = isPastTournament(tournament)
                        return (
                            <div key={tournament.id} className="flex items-center gap-2">
                                <div style={{ backgroundColor: tournament.color }} className={`w-3 h-3 rounded-sm ${isPast ? "opacity-40 grayscale" : ""}`}></div>
                                <span className="text-sm">{tournament.name}</span>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
