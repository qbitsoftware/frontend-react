import { useTranslation } from "react-i18next";
import ErrorState from "./error-state-skeleton";
import { TournamentEvent } from "@/queries/tournaments";
import { getDaysInMonth } from "@/routes/-components/calendar-utils";
import { formatDate } from "./calendar-utils";
import { Link } from "@tanstack/react-router";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus } from "lucide-react";

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

export default function Cal1YearView({ selectedYear, isLoading, error, tournaments }: Props) {
    const { t } = useTranslation()
    const eventsByDate = new Map<string, TournamentEvent[]>();
    const daysInMonthArray = getDaysInMonth(selectedYear);

    const getEventsForDate = (year: number, month: number, day: number) => {
        const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        return eventsByDate.get(dateKey) || [];
    };

    tournaments.forEach((event) => {
        // Get the correct dates based on event type
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


    if (isLoading) return <YearViewSkeleton />;
    if (error) return <YearViewError />;

    return (
        <div className="space-y-4">
            <div className="bg-white rounded-lg border border-gray-200/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <div className="min-w-[1100px]">
                        {/* Month headers */}
                        <div className="grid grid-cols-12 gap-2 p-3 bg-gray-50">
                            {months.map((month, monthIndex) => {
                                const daysInMonth = daysInMonthArray[monthIndex];
                                return (
                                    <div
                                        key={monthIndex}
                                        className="text-center w-full"
                                    >
                                        <div className="text-sm font-semibold text-gray-700 mb-3">
                                            {t('calendar.months.' + month.toLowerCase())}
                                        </div>
                                        <div className="grid grid-cols-4 gap-1 p-2">
                                            {/* Generate all cells for this month */}
                                            {Array.from({ length: daysInMonth }, (_, i) => {
                                                const day = i + 1;
                                                const eventsOnDay = getEventsForDate(
                                                    selectedYear,
                                                    monthIndex,
                                                    day
                                                );
                                                const hasEvents = eventsOnDay.length > 0;

                                                if (hasEvents) {
                                                    const cellStyle = {
                                                        backgroundColor: eventsOnDay[0].tournament.color || '#4C97F1',
                                                    };

                                                    const tooltipContent = (
                                                        <div className="p-3 space-y-2 max-w-xs">
                                                            <div className="font-semibold text-gray-900">
                                                                {formatDate(selectedYear, monthIndex, day)}
                                                            </div>
                                                            <div className="space-y-2">
                                                                {eventsOnDay.map((event) => (
                                                                    <Link key={`${event.tournament.id}-${event.is_gameday ? event.gameday_date : ''}`} to={event.is_gameday ? `/voistlused/${event.parent_tournament_id}` : `/voistlused/${event.tournament.id}`}>
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
                                                        <Tooltip key={`${monthIndex}-${day}`}>
                                                            <TooltipTrigger asChild>
                                                                <div className="aspect-square w-full">
                                                                    <div
                                                                        className={`flex items-center justify-center relative w-full h-full cursor-pointer hover:scale-105 transition-transform duration-200 rounded-sm shadow-sm ${eventsOnDay.length > 1 ? "ring-2 ring-blue-200" : ""} `}
                                                                        style={eventsOnDay.length > 1 ? {
                                                                            backgroundColor: "#D1F9F9",
                                                                        } : cellStyle}
                                                                    >
                                                                        {(eventsOnDay.length > 1) && (
                                                                            <div className="flex items-center justify-center text-xs font-bold text-blue-600">
                                                                                +{eventsOnDay.length - 1}
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
                                                    return (
                                                        <div className="aspect-square w-full"
                                                            key={`${monthIndex}-${day}`}
                                                        >
                                                            <div className="w-full h-full bg-gray-100 rounded-sm" />
                                                        </div>
                                                    );
                                                }
                                            })}
                                        </div>

                                    </div>
                                )
                            })}
                        </div>
                    </div>
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


