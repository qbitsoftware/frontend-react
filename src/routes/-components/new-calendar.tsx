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
import { Tournament } from "@/types/tournaments";
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

  // Get visible months for 3-month view
  const visibleMonths = months
    .slice(zoomStartMonth, zoomStartMonth + 3)
    .map((month, index) => ({
      name: month,
      index: zoomStartMonth + index,
    }));

  // Handle month navigation for 3-month view
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

  // Handle month circle click
  const handleMonthCircleClick = (monthIndex: number) => {
    const newStartMonth = Math.min(Math.max(0, monthIndex), 9);
    setZoomStartMonth(newStartMonth);
  };


  // Create a map of dates to events
  // "2025-03-24 ===>>> {EventObject}"
  const eventsByDate = new Map<string, ProcessedEvent[]>();

  events.forEach((event) => {
    const startDate = new Date(event.start_date);
    const endDate = new Date(event.end_date);

    // Skip if not in the selected year
    if (
      startDate.getFullYear() !== selectedYear &&
      endDate.getFullYear() !== selectedYear
    ) {
      return;
    }

    // Iterate through each day of the event
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      // Skip if not in the selected year
      if (currentDate.getFullYear() !== selectedYear) {
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
      }
      const dateKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;

      if (!eventsByDate.has(dateKey)) {
        eventsByDate.set(dateKey, []);
      }

      eventsByDate.get(dateKey)!.push(event);

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
  });

  // Get events for a specific date
  const getEventsForDate = (year: number, month: number, day: number) => {
    const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return eventsByDate.get(dateKey) || [];
  };

  // Get events for a specific month
  const getEventsForMonth = (year: number, month: number) => {
    const events: ProcessedEvent[] = [];
    const eventIds = new Set<string>();

    // Iterate through each day of the month
    for (let day = 1; day <= daysInMonthArray[month]; day++) {
      const eventsOnDay = getEventsForDate(year, month, day);

      // Add unique events
      eventsOnDay.forEach((event) => {
        if (!eventIds.has(String(event.id))) {
          eventIds.add(String(event.id));
          events.push(event);
        }
      });
    }

    // Sort by start date
    return events.sort(
      (a, b) =>
        new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
    );
  };


  const renderYearView = () => {
    // State to track which tooltip is currently open (if any)
    const [openTooltipId, setOpenTooltipId] = useState("");

    // Toggle tooltip visibility with logging
    const handleTooltipToggle = (tooltipId: string) => {

      if (openTooltipId === tooltipId) {
        setOpenTooltipId(""); // Close if already open
      } else {
        setOpenTooltipId(tooltipId); // Open the clicked tooltip
      }
    };

    // Log when component renders

    return (
      <div className="space-y-2">
        <div className="overflow-x-auto pb-2">
          <div className="min-w-[1100px] ">
            {/* Month headers */}
            <div className="grid grid-cols-12 gap-2 px-1 border justify-center">
              {months.map((month, monthIndex) => {
                const daysInMonth = daysInMonthArray[monthIndex];
                return (
                  <div
                    key={monthIndex}
                    className="text-center text-base font-medium py-2 w-full"
                  >
                    <div className="mb-1">
                      {t('calendar.months.' + month.toLowerCase())}
                    </div>
                    <div
                      key={monthIndex}
                      className=" "
                    >
                      <div className="grid grid-cols-4 gap-0.5">
                        {/* Generate all cells for this month */}
                        {Array.from({ length: daysInMonth }, (_, i) => {
                          const day = i + 1;
                          const eventsOnDay = getEventsForDate(
                            selectedYear,
                            monthIndex,
                            day
                          );
                          const hasEvents = eventsOnDay.length > 0;
                          const tooltipId = `tooltip-${monthIndex}-${day}`;

                          if (hasEvents) {
                            const cellStyle = {
                              backgroundColor: eventsOnDay[0].color,
                            };

                            const tooltipContent = (
                              <div className="p-2 space-y-1">
                                <div className="font-medium">
                                  {formatDate(selectedYear, monthIndex, day)}
                                </div>
                                <div className="space-y-1">
                                  {eventsOnDay.map((event) => (
                                    <Link key={event.id} to={event.isGameday ? `/voistlused/${event.parentTournamentId}` : `/voistlused/${event.id}`}>
                                      <div className="flex items-start gap-1 hover:bg-gray-100 p-1 rounded-sm">
                                        <div
                                          className="w-3 h-3 mt-1 rounded-none flex-shrink-0"
                                          style={{ backgroundColor: event.color }}
                                        />
                                        <div>
                                          <div className="text-sm font-medium">
                                            {event.name}
                                            {event.isGameday && event.order && (
                                              <p className="text-xs self-start">
                                                {t('calendar.game_day')} {event.order}
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            );

                            const isOpen = openTooltipId === tooltipId;
                            return (
                              <div key={`${monthIndex}-${day}`} className="relative">
                                <div
                                  className="aspect-square w-full"
                                  onClick={() => {
                                    handleTooltipToggle(tooltipId);
                                  }}
                                >
                                  <div
                                    className={`flex items-center justify-center relative w-full h-full cursor-pointer hover:ring-1 hover:ring-primary ${eventsOnDay.length > 1 ? "ring-1 ring-white" : ""} `}
                                    style={eventsOnDay.length > 1 ? {
                                      backgroundColor: "#D1F9F9",
                                    } : cellStyle}
                                  >
                                    {(eventsOnDay.length > 1) && (
                                      <div className="flex items-center justify-center text-sm font-medium text-gray-600 rounded-full ">
                                        +{eventsOnDay.length - 1}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Custom tooltip that shows on click for mobile */}
                                {isOpen && (
                                  <div className="absolute z-50 bg-white shadow-lg rounded-md border p-2 w-64 left-0 top-full mt-1">
                                    {tooltipContent}
                                    <button
                                      className="absolute top-1 right-1 text-gray-500 hover:text-gray-700"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenTooltipId("");
                                      }}
                                    >
                                      ×
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          } else {
                            return (
                              <div className="aspect-square w-full"
                                key={`${monthIndex}-${day}`}
                              >
                                <div
                                  className="w-full h-full bg-gray-200"
                                />
                              </div>
                            );
                          }
                        })}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Add click-away listener to close any open tooltip when clicking elsewhere */}
        <div
          className={openTooltipId ? "fixed inset-0 z-40" : "hidden"}
          onClick={() => {
            setOpenTooltipId("");
          }}
        />

        {/* Legend */}
        <div className="border rounded-lg p-4 bg-card space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from(new Set(events.map((e) => e.category))).map(
              (category) => {
                const categories = events.filter(
                  (e) => e.category === category
                );
                if (categories.length === 0) return null;

                return (
                  <div key={category} className="flex items-center gap-2">
                    <div
                      style={{ backgroundColor: categories[0].color }}
                      className="w-3 h-3 rounded-none"
                    />
                    <span className="text-sm">{category}</span>
                  </div>
                );
              }
            )}
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-none flex items-center justify-center bg-[#D1F9F9]"
            ><Plus /></div>
            <span className="text-sm">{t('calendar.multiple_tournaments_placeholder')}</span>
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
        <div className="mb-3 flex flex-row justify-between hover:bg-white/10 bg-white/50 items-start gap-2 p-2">
          <h6 className="px-1 font-semibold w-2/3">
            {event.name}
            {event.isGameday && event.order && (
              <p className="font-normal text-sm">{t('calendar.game_day')} {event.order}</p>
            )}
          </h6>

          <div className="flex items-center gap-2">
            <div className="px-2 py-1 bg-white text-center font-bold border-t-2 border-red-600 rounded-t-[2px] text-stone-800 shadow-sm">
              <div className="text-xs text-center ">
                {getAbbreviatedMonth(event.start_date)}
              </div>
              {formatDateRange(event.start_date, event.end_date).split(" - ")[0]}
            </div>
            {event.end_date !== event.start_date && (
              <>
                <span className="font-semibold">-</span>
                <div className="px-2 py-1 bg-white text-center font-bold border-t-2 border-red-600 rounded-t-[2px] text-stone-800">
                  <div className="text-xs text-center">
                    {event.end_date !== event.start_date &&
                      new Date(event.start_date).getMonth() !== new Date(event.end_date).getMonth()
                      ? getAbbreviatedMonth(event.end_date)
                      : getAbbreviatedMonth(event.start_date)}
                  </div>
                  {formatDateRange(event.start_date, event.end_date).split(" - ")[1]}
                </div>
              </>
            )}
          </div>
        </div>
      </Link>
    );
  };

  const renderThreeMonthView = () => {
    return (
      <div>
        {/* Desktop view */}
        <div className="hidden md:block space-y-6 ">
          <div className="flex flex-col items-start justify-around gap-4 mb-8 ">
            <div className="flex flex-col items-start gap-4">
              <h5 className="font-medium">
                {t("calendar.months." + months[zoomStartMonth].toLowerCase())} - {t('calendar.months.' + months[zoomStartMonth + 2].toLowerCase())}
              </h5>
              <div className="flex items-center gap-2 ">
                <Button
                  size="icon"
                  onClick={handlePrevMonths}
                  disabled={zoomStartMonth === 0}
                  className="bg-[#737373] hover:bg-stone-400 rounded-md disabled:opacity-50 border-2 border-[#5c5c5c]"
                >
                  <ChevronLeft strokeWidth={2.5} />
                </Button>

                <Button
                  size="icon"
                  onClick={handleNextMonths}
                  disabled={zoomStartMonth >= 9}
                  className="bg-[#737373] hover:bg-stone-400  p-2 rounded-md disabled:opacity-50 border-2 border-[#5c5c5c]"
                >
                  <ChevronRight strokeWidth={2.5} />
                </Button>

                <div className="flex-1 flex items-center ml-8 w-[400px]">
                  {months.map((month, index) => (
                    <React.Fragment key={index}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={`h-6 w-6 rounded-full flex items-center justify-center cursor-pointer  ${index >= zoomStartMonth &&
                              index < zoomStartMonth + 3
                              ? "bg-[#90D3FF] border-2 border-[#c6ecf0]"
                              : "bg-[#E6E6E6] hover:bg-[#90D3FF] border-2 border-[#CBCBCB]"
                              }`}
                            onClick={() => handleMonthCircleClick(index)}
                          />
                        </TooltipTrigger>
                        <TooltipContent>{month}</TooltipContent>
                      </Tooltip>

                      {index < 11 && <div className="h-0.5 flex-1 bg-gray-300" />}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Month columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {visibleMonths.map((monthInfo) => {
              const monthEvents = getEventsForMonth(
                selectedYear,
                monthInfo.index
              );

              return (
                <div key={monthInfo.index} className="space-y-4 p-2">
                  <h2 className="text-xl font-bold">
                    {t('calendar.months.' + monthInfo.name.toLowerCase())}</h2>

                  {/* Event cards for the month */}
                  {monthEvents.length > 0 ? (
                    <div className="space-y-8">
                      {monthEvents.map((event) => (
                        <EventCard key={event.id} event={event} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-muted-foreground text-sm p-2 ">
                      {t('calendar.no_tournaments')}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="md:hidden">
          <div
            ref={mobileContainerRef}
            className="px-2 relative min-h-[75vh] overflow-y-auto max-h-[75vh]"
          >
            <div className="space-y-6">
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
                    <h6 className="font-semibold mb-2">{t('calendar.months.' + month.toLowerCase())}</h6>
                    {monthEvents.length > 0 ? (
                      <div className="space-y-8">
                        {monthEvents.map((event) => (
                          <EventCard key={event.id} event={event} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-muted-foreground text-sm p-2">
                        {t('calendar.no_tournaments')}
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
    <div className=" w-full max-w-7xl mx-auto">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center">
          <Select
            value={selectedYear.toString()}
            onValueChange={(value) => setSelectedYear(Number.parseInt(value))}
          >
            <SelectTrigger className=" bg-stone-100 text-black/70 space-x-4 rounded-sm border-stone-300 font-medium ">
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
        </div>

        <div>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 gap-1">
              <TabsTrigger
                value="three-month"
                className="data-[state=active]:bg-stone-800 bg-[#ececec] text-stone-800 rounded-sm"
              >
                {t('calendar.3_months')}
              </TabsTrigger>
              <TabsTrigger
                value="year"
                className="data-[state=active]:bg-stone-800 bg-[#ececec] text-stone-800 rounded-sm"
              >
                {t('calendar.full_year')}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className=" rounded-lg px-1 py-6">
        <TooltipProvider>
          {activeTab === "three-month"
            ? renderThreeMonthView()
            : renderYearView()}
        </TooltipProvider>
      </div>
    </div>
  );
}
