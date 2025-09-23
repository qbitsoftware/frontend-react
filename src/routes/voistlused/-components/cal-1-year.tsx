import { useTranslation } from "react-i18next";
import ErrorState from "./error-state-skeleton";
import { TournamentEvent } from "@/queries/tournaments";
import { formatDate } from "./calendar-utils";
import { Link } from "@tanstack/react-router";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus } from "lucide-react";
import {
    Table,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { useMemo } from "react";
import { List } from "react-virtualized";
import "react-virtualized/styles.css";

const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

interface Props {
    selectedYear: number;
    isLoading: boolean;
    error: Error | null;
    tournaments: TournamentEvent[];
}

interface CalendarWeek {
    weekNumber: number;
    days: CalendarDay[];
}

interface CalendarDay {
    date: Date;
    events: TournamentEvent[];
    monthIndex: number;
    dayOfMonth: number;
}

export default function Cal1YearView({ selectedYear, isLoading, error, tournaments }: Props) {
    const { t } = useTranslation()

    const calendarData = useMemo(() => {
        const eventsByDate = new Map<string, TournamentEvent[]>();

        tournaments.forEach((event) => {
            const getStartDate = (event: TournamentEvent) =>
                (event.is_gameday || event.is_finals) ? new Date(event.gameday_date) : new Date(event.tournament.start_date);
            const getEndDate = (event: TournamentEvent) =>
                (event.is_gameday || event.is_finals) ? new Date(event.gameday_date) : new Date(event.tournament.end_date);

            const startDate = getStartDate(event);
            const endDate = getEndDate(event);

            if (
                startDate.getFullYear() !== selectedYear &&
                endDate.getFullYear() !== selectedYear
            ) {
                return;
            }

            const currentDate = new Date(startDate);
            while (currentDate <= endDate) {
                if (currentDate.getFullYear() !== selectedYear) {
                    currentDate.setDate(currentDate.getDate() + 1);
                    continue;
                }
                const dateKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;

                if (!eventsByDate.has(dateKey)) {
                    eventsByDate.set(dateKey, []);
                }

                eventsByDate.get(dateKey)!.push(event);
                currentDate.setDate(currentDate.getDate() + 1);
            }
        });

        // Generate weeks for the year
        const weeks: CalendarWeek[] = [];
        const firstDayOfYear = new Date(selectedYear, 0, 1);

        // Start from the first Monday of the year or before
        const startDate = new Date(firstDayOfYear);
        startDate.setDate(startDate.getDate() - startDate.getDay() + 1);

        let weekNumber = 0;
        const currentDate = new Date(startDate);

        while (currentDate.getFullYear() <= selectedYear ||
               (currentDate.getFullYear() === selectedYear + 1 && currentDate.getMonth() === 0 && currentDate.getDate() <= 7)) {

            const week: CalendarWeek = {
                weekNumber: weekNumber++,
                days: []
            };

            for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
                const dateKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;

                week.days.push({
                    date: new Date(currentDate),
                    events: eventsByDate.get(dateKey) || [],
                    monthIndex: currentDate.getMonth(),
                    dayOfMonth: currentDate.getDate()
                });

                currentDate.setDate(currentDate.getDate() + 1);
            }

            weeks.push(week);

            if (currentDate.getFullYear() > selectedYear + 1) break;
        }

        return weeks;
    }, [tournaments, selectedYear]);


    if (isLoading) return <YearViewSkeleton />;
    if (error) return <YearViewError />;

    const renderDayCell = (day: CalendarDay) => {
        const hasEvents = day.events.length > 0;

        if (hasEvents) {
            const cellStyle = {
                backgroundColor: day.events[0].tournament.color || '#4C97F1',
            };

            const tooltipContent = (
                <div className="p-3 space-y-2 max-w-xs">
                    <div className="font-semibold text-gray-900">
                        {formatDate(day.date.getFullYear(), day.monthIndex, day.dayOfMonth)}
                    </div>
                    <div className="space-y-2">
                        {day.events.map((event) => (
                            <Link key={`${event.tournament.id}-${event.is_gameday ? event.gameday_date : ''}`}
                                  to={event.is_gameday ? `/voistlused/${event.parent_tournament_id}` : `/voistlused/${event.tournament.id}`}>
                                <div className="flex items-start gap-2 hover:bg-gray-50 p-2 rounded-lg transition-colors">
                                    <div
                                        className="w-3 h-3 mt-1 rounded-sm flex-shrink-0 shadow-sm"
                                        style={{ backgroundColor: event.tournament.color || '#4C97F1' }}
                                    />
                                    <div className="min-w-0">
                                        <div className="text-sm font-medium text-gray-900 line-clamp-2">
                                            {event.tournament.name}
                                        </div>
                                        {(event.is_gameday && event.order) && (
                                            <div className="text-xs text-gray-600 mt-1">
                                                {event.is_finals ? t('calendar.play_off') : `${t('calendar.game_day')} ${event.order}`}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            );

            return (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="w-8 h-8 mx-auto">
                            <div
                                className={`flex items-center justify-center w-full h-full cursor-pointer hover:scale-105 transition-transform duration-200 rounded-sm shadow-sm ${day.events.length > 1 ? "ring-2 ring-blue-200" : ""}`}
                                style={day.events.length > 1 ? {
                                    backgroundColor: "#D1F9F9",
                                } : cellStyle}
                            >
                                {day.events.length > 1 && (
                                    <div className="flex items-center justify-center text-xs font-bold text-blue-600">
                                        +{day.events.length - 1}
                                    </div>
                                )}
                            </div>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent sideOffset={5} className="bg-white border-2 border-gray-100 shadow-xl rounded-xl p-0">
                        {tooltipContent}
                    </TooltipContent>
                </Tooltip>
            );
        } else {
            const isCurrentYear = day.date.getFullYear() === selectedYear;
            return (
                <div className="w-8 h-8 mx-auto">
                    <div className={`w-full h-full rounded-sm ${isCurrentYear ? 'bg-gray-100' : 'bg-gray-50'}`} />
                </div>
            );
        }
    };

    const WeekRow = ({ index, style }: { index: number; style: React.CSSProperties }) => {
        const week = calendarData[index];

        return (
            <div style={style}>
                <TableRow className="border-b border-gray-100">
                    <TableCell className="text-xs text-gray-500 font-medium w-12">
                        W{week.weekNumber + 1}
                    </TableCell>
                    {week.days.map((day, dayIndex) => (
                        <TableCell key={dayIndex} className="p-2 text-center relative">
                            <div className="text-xs text-gray-400 mb-1">
                                {day.dayOfMonth}
                            </div>
                            {renderDayCell(day)}
                        </TableCell>
                    ))}
                </TableRow>
            </div>
        );
    };

    return (
        <div className="space-y-4">
            <div className="bg-white rounded-lg border border-gray-200/50 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50">
                            <TableHead className="w-12 text-center text-xs font-semibold">
                                Week
                            </TableHead>
                            <TableHead className="text-center text-xs font-semibold">Mon</TableHead>
                            <TableHead className="text-center text-xs font-semibold">Tue</TableHead>
                            <TableHead className="text-center text-xs font-semibold">Wed</TableHead>
                            <TableHead className="text-center text-xs font-semibold">Thu</TableHead>
                            <TableHead className="text-center text-xs font-semibold">Fri</TableHead>
                            <TableHead className="text-center text-xs font-semibold">Sat</TableHead>
                            <TableHead className="text-center text-xs font-semibold">Sun</TableHead>
                        </TableRow>
                    </TableHeader>
                </Table>
                <div style={{ height: '600px', width: '100%' }}>
                    <List
                        height={600}
                        itemCount={calendarData.length}
                        itemSize={60}
                        width="100%"
                    >
                        {WeekRow}
                    </List>
                </div>
            </div>

            {/* Legend */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm space-y-4 sm:space-y-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <div className="w-1 h-5 sm:h-6 bg-[#4C97F1] rounded-full"></div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Tournament Categories</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                    {Array.from(new Set(tournaments.map((e) => e.tournament.category))).map(
                        (category) => {
                            const categorizedTournaments = tournaments.filter(
                                (e) => e.tournament.category === category
                            );
                            if (categorizedTournaments.length === 0) return null;

                            return (
                                <div key={category} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg">
                                    <div
                                        style={{ backgroundColor: categorizedTournaments[0].tournament.color || '#4C97F1' }}
                                        className="w-3 h-3 sm:w-4 sm:h-4 rounded-sm shadow-sm flex-shrink-0"
                                    />
                                    <span className="text-xs sm:text-sm font-medium text-gray-700 truncate">{category}</span>
                                </div>
                            );
                        }
                    )}
                </div>
                <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-blue-50 rounded-lg">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-sm flex items-center justify-center bg-[#D1F9F9] border border-blue-200 flex-shrink-0">
                        <Plus className="w-1.5 h-1.5 sm:w-2 sm:h-2 text-blue-600" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-gray-700">{t('calendar.multiple_tournaments_placeholder')}</span>
                </div>
            </div>
        </div>
    );
}

const YearViewSkeleton = () => (
    <div className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <div className="min-w-[1100px]">
                    <div className="grid grid-cols-12 gap-2 p-4 bg-gradient-to-r from-gray-50 to-gray-100">
                        {months.map((monthIndex) => (
                            <div key={monthIndex} className="text-center w-full">
                                <div className="h-4 bg-gray-200 rounded mb-3 mx-auto w-16 animate-pulse"></div>
                                <div className="grid grid-cols-4 gap-1 p-2">
                                    {Array.from({ length: 16 }, (_, i) => (
                                        <div key={i} className="aspect-square w-full">
                                            <div className="w-full h-full bg-gray-200 rounded-sm animate-pulse" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm space-y-4 sm:space-y-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="w-1 h-5 sm:h-6 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="h-5 sm:h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                {Array.from({ length: 4 }, (_, i) => (
                    <div key={i} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg">
                        <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-sm bg-gray-200 animate-pulse flex-shrink-0" />
                        <div className="h-3 bg-gray-200 rounded flex-1 animate-pulse"></div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const YearViewError = () => {
    const { t } = useTranslation()
    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl border border-red-200 shadow-sm p-8">
                <ErrorState message={t('calendar.error_loading_tournaments')} />
            </div>
        </div>
    )
}


