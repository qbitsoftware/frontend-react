import React, { useMemo } from "react";
import { Tournament } from "@/types/tournaments";
import { Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  formatDateRange,
  useTournamentEvents,
  ProcessedEvent,
  getAbbreviatedMonth,
} from "../voistlused/-components/calendar-utils";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  tournaments: Tournament[];
  isEmpty: boolean;
  isLoading?: boolean;
}

const CalendarWidget = ({ tournaments, isEmpty, isLoading = false }: Props) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const events = useTournamentEvents(tournaments, queryClient);

  const { upcomingEvents, pastEvents } = useMemo(() => {
    if (isLoading || !events.length) {
      return { upcomingEvents: [], pastEvents: [] };
    }

    const now = new Date();
    const upcoming = events
      .filter((event) => new Date(event.end_date) >= now)
      .sort(
        (a, b) =>
          new Date(a.start_date).getTime() - new Date(b.start_date).getTime(),
      )
      .slice(0, 3);

    const past = events
      .filter((event) => new Date(event.end_date) < now)
      .sort(
        (a, b) =>
          new Date(b.start_date).getTime() - new Date(a.start_date).getTime(),
      )
      .slice(0, 3);

    return { upcomingEvents: upcoming, pastEvents: past };
  }, [events]);

  const EventCard = ({
    event,
    isUpcoming,
  }: {
    event: ProcessedEvent;
    isUpcoming: boolean;
  }) => {
    const linkPath = event.isGameday
      ? `/voistlused/${event.parentTournamentId}`
      : `/voistlused/${event.id}`;

    return (
      <Link to={linkPath} key={event.id}>
        <div className="group mb-2 sm:mb-3 relative">
          <div className={`
            flex items-center gap-2 sm:gap-3 lg:gap-4 p-2 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl border transition-all duration-300
            ${isUpcoming 
              ? 'bg-gradient-to-r from-[#4C97F1]/5 to-blue-50 border-[#4C97F1]/20 hover:border-[#4C97F1]/40 hover:shadow-lg hover:shadow-[#4C97F1]/10' 
              : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
            }
          `}>
            {/* Date Display */}
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <div className={`
                px-1.5 sm:px-2 lg:px-3 py-1 sm:py-1.5 lg:py-2 rounded-md sm:rounded-lg text-center font-medium shadow-sm border
                ${isUpcoming 
                  ? 'bg-[#4C97F1] text-white border-[#4C97F1]' 
                  : 'bg-gray-100 text-gray-700 border-gray-200'
                }
              `}>
                <div className="text-xs font-medium opacity-90">
                  {getAbbreviatedMonth(event.start_date)}
                </div>
                <div className="text-sm sm:text-base lg:text-lg font-bold leading-none">
                  {formatDateRange(event.start_date, event.end_date).split(" - ")[0]}
                </div>
              </div>
              
              {event.end_date !== event.start_date && (
                <>
                  <div className="w-2 sm:w-3 h-px bg-gray-300"></div>
                  <div className={`
                    px-1.5 sm:px-2 lg:px-3 py-1 sm:py-1.5 lg:py-2 rounded-md sm:rounded-lg text-center font-medium shadow-sm border
                    ${isUpcoming 
                      ? 'bg-[#4C97F1] text-white border-[#4C97F1]' 
                      : 'bg-gray-100 text-gray-700 border-gray-200'
                    }
                  `}>
                    <div className="text-xs font-medium opacity-90">
                      {event.end_date !== event.start_date &&
                      new Date(event.start_date).getMonth() !==
                        new Date(event.end_date).getMonth()
                        ? getAbbreviatedMonth(event.end_date)
                        : getAbbreviatedMonth(event.start_date)}
                    </div>
                    <div className="text-sm sm:text-base lg:text-lg font-bold leading-none">
                      {formatDateRange(event.start_date, event.end_date).split(" - ")[1]}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Event Content */}
            <div className="flex-1 min-w-0">
              <h6 className={`
                font-semibold text-sm sm:text-base mb-0.5 sm:mb-1 truncate group-hover:text-[#4C97F1] transition-colors duration-200
                ${isUpcoming ? 'text-gray-900' : 'text-gray-800'}
              `} title={event.name}>
                {event.name}
              </h6>
              
              <div className="flex items-center gap-1 sm:gap-2">
                {event.isGameday && event.order ? (
                  <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs font-medium bg-orange-100 text-orange-800">
                    {t("calendar.game_day")} {event.order}
                  </span>
                ) : (
                  <span className={`
                    text-xs sm:text-sm truncate
                    ${isUpcoming ? 'text-gray-600' : 'text-gray-500'}
                  `}>
                    {event.category}
                  </span>
                )}
              </div>
            </div>

            {/* Status Indicator */}
            <div className="flex-shrink-0">
              <div className={`
                w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full
                ${isUpcoming ? 'bg-green-400' : 'bg-gray-400'}
              `}></div>
            </div>
          </div>
        </div>
      </Link>
    );
  };

  const EventCardSkeleton = ({ isUpcoming }: { isUpcoming: boolean }) => (
    <div className="mb-3 relative">
      <div className={`
        flex items-center gap-4 p-4 rounded-xl border
        ${isUpcoming 
          ? 'bg-gradient-to-r from-[#4C97F1]/5 to-blue-50 border-[#4C97F1]/20' 
          : 'bg-white border-gray-200'
        }
      `}>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Skeleton className="h-16 w-14 rounded-lg" />
          <Skeleton className="h-16 w-14 rounded-lg" />
        </div>
        <div className="flex-1 min-w-0 space-y-2">
          <Skeleton className="h-5 w-4/5" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <Skeleton className="h-3 w-3 rounded-full" />
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-2 h-6 bg-[#4C97F1] rounded-full"></div>
            <h6 className="text-lg font-semibold text-gray-900">
              {t("calendar.upcoming")}
            </h6>
          </div>
          <div className="space-y-3">
            {[...Array(3)].map((_, index) => (
              <EventCardSkeleton
                key={`upcoming-skeleton-${index}`}
                isUpcoming={true}
              />
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-2 h-6 bg-gray-400 rounded-full"></div>
            <h6 className="text-lg font-semibold text-gray-900">
              {t("calendar.finished")}
            </h6>
          </div>
          <div className="space-y-3">
            {[...Array(3)].map((_, index) => (
              <EventCardSkeleton
                key={`past-skeleton-${index}`}
                isUpcoming={false}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isLoading && isEmpty) {
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-xl py-16 px-8 text-center bg-gray-50/50">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-lg font-medium text-gray-700 mb-2">
          {t("calendar.no_tournaments")}
        </p>
        <p className="text-sm text-gray-500">
          {t("calendar.no_tournaments_subtitle")}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
      <div className="space-y-3 sm:space-y-4 lg:space-y-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-1.5 sm:w-2 h-4 sm:h-6 bg-[#4C97F1] rounded-full"></div>
          <h6 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900">
            {t("calendar.upcoming")}
          </h6>
        </div>

        <div className="space-y-2 sm:space-y-3">
          {upcomingEvents.length > 0
            ? upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} isUpcoming={true} />
              ))
            : [1, 2, 3].map((_, index) => (
                <EventCardSkeleton key={`upcoming-skeleton-${index}`} isUpcoming />
              ))}
        </div>
      </div>

      <div className="space-y-3 sm:space-y-4 lg:space-y-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-1.5 sm:w-2 h-4 sm:h-6 bg-gray-400 rounded-full"></div>
          <h6 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900">
            {t("calendar.finished")}
          </h6>
        </div>
        <div className="space-y-2 sm:space-y-3">
          {pastEvents.length > 0
            ? pastEvents.map((event) => (
                <EventCard key={event.id} event={event} isUpcoming={false} />
              ))
            : [1, 2, 3].map((_, index) => (
                <EventCardSkeleton
                  key={`upcoming-skeleton-${index}`}
                  isUpcoming={false}
                />
              ))}
        </div>
      </div>
    </div>
  );
};

export default React.memo(CalendarWidget);
