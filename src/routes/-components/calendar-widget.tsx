import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";
import { TournamentEvent, UseGetHomePageTournamentsQuery } from "@/queries/tournaments";
import EventCard from "./event-card";

const CalendarWidget = () => {
  const { t } = useTranslation();
  const { data, isLoading, error } = UseGetHomePageTournamentsQuery(true)
  const [events, setEvents] = useState<TournamentEvent[]>([]);

  useEffect(() => {
    if (data && data.data) {
      setEvents(data.data);
    }
  }, [data])

  const { upcomingEvents, pastEvents } = useMemo(() => {
    if (isLoading || !events.length) {
      return { upcomingEvents: [], pastEvents: [] };
    }

    const now = new Date();
    const getStartDate = (event: TournamentEvent) =>
      (event.is_gameday || event.is_finals) ? new Date(event.gameday_date) : new Date(event.tournament.start_date);
    const getEndDate = (event: TournamentEvent) =>
      (event.is_gameday || event.is_finals) ? new Date(event.gameday_date) : new Date(event.tournament.end_date);

    const upcoming = events
      .filter((event) => getEndDate(event) >= now)
      .sort(
        (a, b) =>
          getStartDate(a).getTime() - getStartDate(b).getTime()
      )
      .slice(0, 3);

    const past = events
      .filter((event) => getEndDate(event) < now)
      .sort(
        (a, b) =>
          getStartDate(b).getTime() - getStartDate(a).getTime()
      )
      .slice(0, 3);

    return { upcomingEvents: upcoming, pastEvents: past };
  }, [events, isLoading]);


  const EventCardSkeleton = ({ isUpcoming }: { isUpcoming: boolean }) => (
    <div className="mb-2 sm:mb-3 relative">
      <div className={`
        flex items-center gap-2 sm:gap-3 lg:gap-4 p-2 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl border
        ${isUpcoming
          ? 'bg-gradient-to-r from-[#4C97F1]/5 to-blue-50 border-[#4C97F1]/20'
          : 'bg-white border-gray-200'
        }
      `}>
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <Skeleton className="h-10 sm:h-12 lg:h-16 w-8 sm:w-10 lg:w-14 rounded-md sm:rounded-lg" />
          <Skeleton className="h-10 sm:h-12 lg:h-16 w-8 sm:w-10 lg:w-14 rounded-md sm:rounded-lg" />
        </div>
        <div className="flex-1 min-w-0 space-y-1 sm:space-y-2">
          <Skeleton className="h-4 sm:h-5 w-4/5" />
          <Skeleton className="h-3 sm:h-4 w-2/3" />
        </div>
        <Skeleton className="h-2.5 sm:h-3 w-2.5 sm:w-3 rounded-full" />
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

  if (error) {
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
            ? upcomingEvents.map((event, index) => (
              <EventCard key={index} event={event} isUpcoming={true} />
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
            ? pastEvents.map((event, index) => (
              <EventCard key={index} event={event} isUpcoming={false} />
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
