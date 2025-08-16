import { TournamentEvent } from "@/queries/tournaments";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import EventCardSkeleton from "./event-card-skeleton";
import EventCard from "./event-card";
import ErrorState from "./error-state-skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getDaysInMonth } from "@/routes/-components/calendar-utils";

export const months = [
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
];

interface Props {
    tournaments: TournamentEvent[];
    selectedYear: number;
    isLoading: boolean;
    error: Error | null;
}

export default function Calendar3MonthView({ selectedYear, isLoading, error, tournaments }: Props) {
    const { t } = useTranslation()
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const monthRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [zoomStartMonth, setZoomStartMonth] = useState(currentMonth);
    const mobileContainerRef = useRef<HTMLDivElement>(null);
    const eventsByDate = new Map<string, TournamentEvent[]>();

    useEffect(() => {
        monthRefs.current = monthRefs.current.slice(0, months.length);
    }, []);

    useEffect(() => {
        if (mobileContainerRef.current && monthRefs.current[currentMonth]) {
            if (selectedYear === currentYear) {
                setTimeout(() => {
                    const containerTop = mobileContainerRef.current?.offsetTop || 0;
                    const monthTop = monthRefs.current[currentMonth]?.offsetTop || 0;

                    mobileContainerRef.current?.scrollTo({
                        top: monthTop - containerTop + 230,
                        behavior: 'smooth'
                    });
                }, 100);
            }
        }
    }, [selectedYear, currentYear, currentMonth]);

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

    const visibleMonths = months
        .slice(zoomStartMonth, zoomStartMonth + 3)
        .map((month, index) => ({
            name: month,
            index: zoomStartMonth + index,
        }));

    const handlePrevMonths = () => {
        if (zoomStartMonth > 0) {
            setZoomStartMonth(zoomStartMonth - 1);
        }
    };

    const handleNextMonths = () => {
        if (zoomStartMonth < 9) {
            setZoomStartMonth(zoomStartMonth + 1);
        }
    };

    const handleMonthCircleClick = (monthIndex: number) => {
        const newStartMonth = Math.min(Math.max(0, monthIndex), 9);
        setZoomStartMonth(newStartMonth);
    };


    const daysInMonthArray = getDaysInMonth(selectedYear);

    const getEventsForMonth = (year: number, month: number) => {
        const events: TournamentEvent[] = [];
        const eventIds = new Set<string>();

        for (let day = 1; day <= daysInMonthArray[month]; day++) {
            const eventsOnDay = getEventsForDate(year, month, day);

            eventsOnDay.forEach((event) => {
                const eventKey = `${event.tournament.id}-${event.is_gameday ? event.gameday_date : ''}`;
                if (!eventIds.has(eventKey)) {
                    eventIds.add(eventKey);
                    events.push(event);
                }
            });
        }

        return events.sort((a, b) => {
            const getStartDate = (event: TournamentEvent) =>
                (event.is_gameday || event.is_finals) ? new Date(event.gameday_date) : new Date(event.tournament.start_date);
            return getStartDate(a).getTime() - getStartDate(b).getTime();
        });
    };
    const getEventsForDate = (year: number, month: number, day: number) => {
        const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        return eventsByDate.get(dateKey) || [];
    };
    if (isLoading) return <ThreeMonthViewSkeleton />;
    if (error) return <ThreeMonthViewError />;

    return (
        <div>
            {/* Desktop view */}
            <div className="hidden md:block space-y-8">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                            <h5 className="text-xl font-semibold text-gray-900">
                                {t("calendar.months." + months[zoomStartMonth].toLowerCase())} - {t('calendar.months.' + months[zoomStartMonth + 2].toLowerCase())}
                            </h5>
                            <div className="flex items-center gap-3">
                                <Button
                                    size="icon"
                                    onClick={handlePrevMonths}
                                    disabled={zoomStartMonth === 0}
                                    className="bg-white hover:bg-[#4C97F1] hover:text-white border-2 border-gray-200 hover:border-[#4C97F1] text-gray-600 rounded-xl disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-gray-600 disabled:hover:border-gray-200 transition-all duration-300"
                                >
                                    <ChevronLeft strokeWidth={2} />
                                </Button>
                                <Button
                                    size="icon"
                                    onClick={handleNextMonths}
                                    disabled={zoomStartMonth >= 9}
                                    className="bg-white hover:bg-[#4C97F1] hover:text-white border-2 border-gray-200 hover:border-[#4C97F1] text-gray-600 rounded-xl disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-gray-600 disabled:hover:border-gray-200 transition-all duration-300"
                                >
                                    <ChevronRight strokeWidth={2} />
                                </Button>
                            </div>
                        </div>

                        <div className="flex items-center justify-center">
                            <div className="flex items-center gap-2 max-w-2xl w-full">
                                {months.map((month, index) => (
                                    <React.Fragment key={index}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div
                                                    className={`h-3 w-3 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 ${index >= zoomStartMonth &&
                                                        index < zoomStartMonth + 3
                                                        ? "bg-[#4C97F1] ring-2 ring-[#4C97F1]/30 scale-125"
                                                        : "bg-gray-300 hover:bg-[#4C97F1]/60 hover:scale-110"
                                                        }`}
                                                    onClick={() => handleMonthCircleClick(index)}
                                                />
                                            </TooltipTrigger>
                                            <TooltipContent className="bg-gray-900 text-white border-0 rounded-lg">
                                                {t('calendar.months.' + month.toLowerCase())}
                                            </TooltipContent>
                                        </Tooltip>
                                        {index < 11 && <div className="h-px flex-1 bg-gray-200" />}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Month columns */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {visibleMonths.map((monthInfo) => {
                        const monthEvents = getEventsForMonth(
                            selectedYear,
                            monthInfo.index
                        );

                        return (
                            <div key={monthInfo.index} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="bg-[#4C97F1] px-6 py-4">
                                    <h2 className="text-xl font-bold text-white">
                                        {t('calendar.months.' + monthInfo.name.toLowerCase())}
                                    </h2>
                                </div>

                                <div className="p-6">
                                    {monthEvents.length > 0 ? (
                                        <div className="space-y-4">
                                            {monthEvents.map((event, index) => (
                                                <EventCard key={index} event={event} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 lg:py-12">
                                            <div className="w-10 h-10 lg:w-12 lg:h-12 mx-auto mb-3 lg:mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                                                <div className="w-5 h-5 lg:w-6 lg:h-6 bg-gray-300 rounded-full"></div>
                                            </div>
                                            <p className="text-gray-500 text-xs lg:text-sm font-medium">
                                                {t('calendar.no_tournaments')}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="md:hidden">
                <div
                    ref={mobileContainerRef}
                    className="relative min-h-[75vh] overflow-y-auto max-h-[75vh] bg-white rounded-xl border border-gray-200"
                >
                    <div className="p-4 space-y-6">
                        {months.map((month, index) => {
                            const monthEvents = getEventsForMonth(
                                selectedYear,
                                index
                            );

                            return (
                                <div
                                    key={index}
                                    ref={el => monthRefs.current[index] = el}
                                    className={`${index === currentMonth && selectedYear === currentYear ? "scroll-mt-4" : ""}`}
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-1 h-6 bg-[#4C97F1] rounded-full"></div>
                                        <h6 className="text-lg font-bold text-gray-900">
                                            {t('calendar.months.' + month.toLowerCase())}
                                        </h6>
                                    </div>
                                    {monthEvents.length > 0 ? (
                                        <div className="space-y-3">
                                            {monthEvents.map((event, index) => (
                                                <EventCard key={index} event={event} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-6">
                                            <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-gray-100 flex items-center justify-center">
                                                <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                                            </div>
                                            <p className="text-gray-500 text-xs">
                                                {t('calendar.no_tournaments')}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

        </div>
    );

}

const ThreeMonthViewSkeleton = () => (
    <div>
        {/* Desktop view */}
        <div className="hidden md:block space-y-8">
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-xl animate-pulse"></div>
                            <div className="w-10 h-10 bg-gray-200 rounded-xl animate-pulse"></div>
                        </div>
                    </div>
                    <div className="flex items-center justify-center">
                        <div className="flex items-center gap-2 max-w-2xl w-full">
                            {Array.from({ length: 12 }, (_, i) => (
                                <React.Fragment key={i}>
                                    <div className="h-3 w-3 rounded-full bg-gray-200 animate-pulse" />
                                    {i < 11 && <div className="h-px flex-1 bg-gray-200" />}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {Array.from({ length: 3 }, (_, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="bg-gray-200 px-6 py-4 animate-pulse">
                            <div className="h-6 bg-gray-300 rounded w-24"></div>
                        </div>
                        <div className="p-6 space-y-4">
                            {Array.from({ length: 3 }, (_, j) => (
                                <EventCardSkeleton key={j} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Mobile view */}
        <div className="md:hidden">
            <div className="relative min-h-[75vh] overflow-y-auto max-h-[75vh] bg-white rounded-xl border border-gray-200">
                <div className="p-4 space-y-6">
                    {Array.from({ length: 6 }, (_, i) => (
                        <div key={i}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-1 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                                <div className="h-5 bg-gray-200 rounded w-24 animate-pulse"></div>
                            </div>
                            <div className="space-y-3">
                                {Array.from({ length: 2 }, (_, j) => (
                                    <EventCardSkeleton key={j} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

const ThreeMonthViewError = () => {
    const { t } = useTranslation()
    return (
        <div>
            <div className="hidden md:block space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {Array.from({ length: 3 }, (_, i) => (
                        <div key={i} className="bg-white rounded-xl border border-red-200 shadow-sm overflow-hidden">
                            <div className="bg-red-50 px-6 py-4">
                                <h2 className="text-xl font-bold text-red-600">
                                    {t('calendar.months.' + months[(new Date().getMonth() + i) % 12].toLowerCase())}
                                </h2>
                            </div>
                            <div className="p-6">
                                <ErrorState message={t('calendar.error_loading_tournaments')} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="md:hidden">
                <div className="relative min-h-[75vh] bg-white rounded-xl border border-red-200">
                    <div className="p-4">
                        <ErrorState message={t('calendar.error_loading_tournaments')} />
                    </div>
                </div>
            </div>
        </div>
    )
};