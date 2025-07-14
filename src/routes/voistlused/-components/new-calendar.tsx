import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getDaysInMonth,
  formatDateRange,
  useTournamentEvents,
  formatDate,
  ProcessedEvent,
  getAbbreviatedMonth
} from "./calendar-utils";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Tournament } from "@/types/tournaments";

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
];

interface Props {
  tournaments: Tournament[];
}

export function TournamentsCalendar({ tournaments }: Props) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const queryClient = useQueryClient();

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [activeTab, setActiveTab] = useState<string>("three-month");
  const [zoomStartMonth, setZoomStartMonth] = useState(currentMonth);

  const events = useTournamentEvents(tournaments, queryClient);

  const daysInMonthArray = getDaysInMonth(selectedYear);

  const mobileContainerRef = useRef<HTMLDivElement>(null);
  const monthRefs = useRef<(HTMLDivElement | null)[]>([]);

  const { t } = useTranslation()

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


  const availableYears = useMemo(() => {
    const yearsSet = new Set<number>();
    yearsSet.add(currentYear);

    tournaments.forEach(tournament => {
      if (tournament.start_date) {
        const startYear = new Date(tournament.start_date).getFullYear();
        yearsSet.add(startYear);
      }

      if (tournament.end_date) {
        const endYear = new Date(tournament.end_date).getFullYear();
        yearsSet.add(endYear);
      }
    });

    return Array.from(yearsSet).sort((a, b) => a - b);
  }, [tournaments, currentYear]);

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

  const eventsByDate = new Map<string, ProcessedEvent[]>();

  events.forEach((event) => {
    const startDate = new Date(event.start_date);
    const endDate = new Date(event.end_date);

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

  const getEventsForDate = (year: number, month: number, day: number) => {
    const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return eventsByDate.get(dateKey) || [];
  };

  const getEventsForMonth = (year: number, month: number) => {
    const events: ProcessedEvent[] = [];
    const eventIds = new Set<string>();

    for (let day = 1; day <= daysInMonthArray[month]; day++) {
      const eventsOnDay = getEventsForDate(year, month, day);

      eventsOnDay.forEach((event) => {
        if (!eventIds.has(String(event.id))) {
          eventIds.add(String(event.id));
          events.push(event);
        }
      });
    }

    return events.sort(
      (a, b) =>
        new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
    );
  };


  const renderYearView = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[1100px]">
              {/* Month headers */}
              <div className="grid grid-cols-12 gap-2 p-4 bg-gradient-to-r from-gray-50 to-gray-100">
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
                              backgroundColor: eventsOnDay[0].color,
                            };

                            const tooltipContent = (
                              <div className="p-3 space-y-2 max-w-xs">
                                <div className="font-semibold text-gray-900">
                                  {formatDate(selectedYear, monthIndex, day)}
                                </div>
                                <div className="space-y-2">
                                  {eventsOnDay.map((event) => (
                                    <Link key={event.id} to={event.isGameday ? `/voistlused/${event.parentTournamentId}` : `/voistlused/${event.id}`}>
                                      <div className="flex items-start gap-2 hover:bg-gray-50 p-2 rounded-lg transition-colors">
                                        <div
                                          className="w-3 h-3 mt-1 rounded-sm flex-shrink-0 shadow-sm"
                                          style={{ backgroundColor: event.color }}
                                        />
                                        <div className="min-w-0">
                                          <div className="text-sm font-medium text-gray-900 line-clamp-2">
                                            {event.name}
                                          </div>
                                          {(event.isGameday && event.order) && (
                                            <div className="text-xs text-gray-600 mt-1">
                                              {event.eventType === "winner" ? t('calendar.play_off') : `${t('calendar.game_day')} ${event.order}`}
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
            {Array.from(new Set(events.map((e) => e.category))).map(
              (category) => {
                const categories = events.filter(
                  (e) => e.category === category
                );
                if (categories.length === 0) return null;

                return (
                  <div key={category} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg">
                    <div
                      style={{ backgroundColor: categories[0].color }}
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
  };

  const EventCard = ({ event }: { event: ProcessedEvent }) => {
    const linkPath = event.isGameday
      ? `/voistlused/${event.parentTournamentId}`
      : `/voistlused/${event.id}`;

    return (
      <Link to={linkPath} key={event.id}>
        <div className="group bg-white border border-gray-200 rounded-xl p-3 sm:p-4 hover:border-[#4C97F1]/30 hover:shadow-lg hover:shadow-[#4C97F1]/10 transition-all duration-300 mb-3 sm:mb-4 active:scale-[0.98] touch-manipulation">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <h6 className="font-semibold text-gray-900 group-hover:text-[#4C97F1] transition-colors duration-200 line-clamp-2 leading-tight mb-2 text-sm sm:text-base">
                {event.name}
              </h6>
              {(event.isGameday && event.order) && (
                <div className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-orange-100 text-orange-800 mt-1">
                  {event.eventType === "winner" ? t('calendar.play_off') : `${t('calendar.game_day')} ${event.order}`}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0 self-start sm:self-center">
              <div className="bg-[#4C97F1] text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-center font-bold shadow-sm">
                <div className="text-xs font-medium opacity-90">
                  {getAbbreviatedMonth(event.start_date)}
                </div>
                <div className="text-base sm:text-lg font-bold leading-none">
                  {formatDateRange(event.start_date, event.end_date).split(" - ")[0]}
                </div>
              </div>
              {event.end_date !== event.start_date && (
                <>
                  <div className="w-3 h-px bg-gray-300"></div>
                  <div className="bg-[#4C97F1] text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-center font-bold shadow-sm">
                    <div className="text-xs font-medium opacity-90">
                      {event.end_date !== event.start_date &&
                        new Date(event.start_date).getMonth() !== new Date(event.end_date).getMonth()
                        ? getAbbreviatedMonth(event.end_date)
                        : getAbbreviatedMonth(event.start_date)}
                    </div>
                    <div className="text-base sm:text-lg font-bold leading-none">
                      {formatDateRange(event.start_date, event.end_date).split(" - ")[1]}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  };

  const renderThreeMonthView = () => {
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
                        {monthEvents.map((event) => (
                          <EventCard key={event.id} event={event} />
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
                        {monthEvents.map((event) => (
                          <EventCard key={event.id} event={event} />
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
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="flex items-center gap-4">
          <Select
            value={selectedYear.toString()}
            onValueChange={(value) => setSelectedYear(Number.parseInt(value))}
          >
            <SelectTrigger className="bg-white border-2 border-gray-200 hover:border-[#4C97F1]/50 text-gray-700 font-semibold rounded-xl px-3 sm:px-4 py-2 sm:py-3 shadow-sm focus:ring-2 focus:ring-[#4C97F1]/20 transition-all text-sm sm:text-base">
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-2 border-gray-100 shadow-xl">
              {availableYears.map((year) => (
                <SelectItem key={year} value={year.toString()} className="rounded-lg hover:bg-[#4C97F1]/10">
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 bg-gray-100 p-1 rounded-xl border border-gray-200 h-9 sm:h-10">
              <TabsTrigger
                value="three-month"
                className="data-[state=active]:bg-[#4C97F1] data-[state=active]:text-white data-[state=active]:shadow-lg bg-transparent text-gray-600 rounded-lg transition-all duration-300 font-medium text-xs sm:text-sm px-2 sm:px-3"
              >
                {t('calendar.3_months')}
              </TabsTrigger>
              <TabsTrigger
                value="year"
                className="data-[state=active]:bg-[#4C97F1] data-[state=active]:text-white data-[state=active]:shadow-lg bg-transparent text-gray-600 rounded-lg transition-all duration-300 font-medium text-xs sm:text-sm px-2 sm:px-3"
              >
                {t('calendar.full_year')}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="bg-gray-50/50 rounded-xl sm:rounded-2xl p-3 sm:p-6">
        <TooltipProvider>
          {activeTab === "three-month"
            ? renderThreeMonthView()
            : renderYearView()}
        </TooltipProvider>
      </div>
    </div>
  );
}
