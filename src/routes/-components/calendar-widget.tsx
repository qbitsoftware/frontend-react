import React, { useMemo } from "react";
import { Tournament } from "@/types/tournaments";
import { Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import SfumatoBackground from "@/components/sfumato/sfumatoBg";
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
        <div className="mb-3 relative flex flex-col rounded-md ">
          {isUpcoming ? (
            <SfumatoBackground>
              <div className="flex flex-row justify-between hover:bg-white/10 bg-white/30 items-start gap-2 p-2">
                <div className="px-1  flex flex-col gap-2">
                  <h6 className="font-semibold w-2/3">{event.name}</h6>
                  <p>{event.category}</p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="px-2 py-1 bg-white text-center font-bold border-t-2 border-red-600 rounded-t-[2px] text-stone-800 shadow-sm">
                    <div className="text-xs text-center font-medium">
                      {getAbbreviatedMonth(event.start_date)}
                    </div>
                    {
                      formatDateRange(event.start_date, event.end_date).split(
                        " - ",
                      )[0]
                    }
                  </div>
                  {event.end_date !== event.start_date && (
                    <>
                      <span className="font-semibold">-</span>
                      <div className="px-2 py-1 bg-white text-center font-bold border-t-2 border-red-600 rounded-t-[2px] text-stone-800 shadow-sm">
                        <div className="text-xs text-center font-medium">
                          {event.end_date !== event.start_date &&
                          new Date(event.start_date).getMonth() !==
                            new Date(event.end_date).getMonth()
                            ? getAbbreviatedMonth(event.end_date)
                            : getAbbreviatedMonth(event.start_date)}
                        </div>
                        {
                          formatDateRange(
                            event.start_date,
                            event.end_date,
                          ).split(" - ")[1]
                        }
                      </div>
                    </>
                  )}
                </div>
              </div>
            </SfumatoBackground>
          ) : (
            <div className="flex flex-row justify-between bg-gray-200/40 hover:bg-gray-100 rounded-md items-start gap-2 p-2 ">
              <h6 className="px-1 font-semibold w-2/3">
                {event.name}
                {event.isGameday && event.order && (
                  <p className="font-normal text-sm">
                    {t("calendar.game_day")} {event.order}
                  </p>
                )}
              </h6>

              <div className="flex items-center gap-2">
                <div className="px-2 py-1 bg-white text-center font-bold border-t border-red-600 rounded-t-[2px]  text-stone-800 shadow-sm">
                  <div className="text-xs text-center  font-medium">
                    {getAbbreviatedMonth(event.start_date)}
                  </div>
                  {
                    formatDateRange(event.start_date, event.end_date).split(
                      " - ",
                    )[0]
                  }
                </div>
                {event.end_date !== event.start_date && (
                  <>
                    <span className="font-semibold">-</span>
                    <div className="px-2 py-1 bg-white text-center font-bold border-t border-red-600 rounded-t-[2px] text-stone-800 shadow-sm">
                      <div className="text-xs text-center font-medium">
                        {event.end_date !== event.start_date &&
                        new Date(event.start_date).getMonth() !==
                          new Date(event.end_date).getMonth()
                          ? getAbbreviatedMonth(event.end_date)
                          : getAbbreviatedMonth(event.start_date)}
                      </div>
                      {
                        formatDateRange(event.start_date, event.end_date).split(
                          " - ",
                        )[1]
                      }
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </Link>
    );
  };

  // Loading skeleton for event cards
  const EventCardSkeleton = ({ isUpcoming }: { isUpcoming: boolean }) => (
    <div className="mb-3 relative flex flex-col shadow-eventCard rounded-md overflow-hidden">
      <div
        className={`flex flex-row justify-between items-center gap-2 p-2 ${isUpcoming ? "bg-white/30" : "bg-gray-200/40"}`}
      >
        <div className="space-y-2 w-2/3">
          <Skeleton className="h-5 w-4/5" />
          <Skeleton className="h-4 w-3/5" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-8 w-12" />
          <Skeleton className="h-8 w-12" />
        </div>
      </div>
    </div>
  );

  // Check loading state first
  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 gap-8 px-2">
        <div className="space-y-4">
          <h6 className="font-medium text-stone-800/80">
            {t("calendar.upcoming")}
          </h6>
          <div className="space-y-2">
            {[...Array(3)].map((_, index) => (
              <EventCardSkeleton
                key={`upcoming-skeleton-${index}`}
                isUpcoming={true}
              />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <h6 className="font-medium text-stone-800/80">
            {t("calendar.finished")}
          </h6>
          <div className="space-y-2">
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

  // Only check isEmpty if not in loading state
  if (!isLoading && isEmpty) {
    return (
      <div className="border-2 border-dashed rounded-md py-12 px-8">
        <p className="pb-1 text-center font-medium text-stone-700">
          {t("calendar.no_tournaments")}
        </p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-8 px-2">
      <div className="space-y-4">
        <h6 className="font-medium text-stone-800/80">
          {t("calendar.upcoming")}
        </h6>

        <div className="space-y-2">
          {upcomingEvents.length > 0
            ? upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} isUpcoming={true} />
              ))
            : [1, 2, 3].map((_, index) => (
                <EventCardSkeleton key={`past-skeleton-${index}`} isUpcoming />
              ))}
        </div>
      </div>

      <div className="space-y-4">
        <h6 className="font-medium text-stone-800/80">
          {t("calendar.finished")}
        </h6>
        <div className="space-y-2">
          {pastEvents.length > 0
            ? pastEvents.map((event) => (
                <EventCard key={event.id} event={event} isUpcoming={false} />
              ))
            : [1, 2, 3].map((_, index) => (
                <EventCardSkeleton
                  key={`past-skeleton-${index}`}
                  isUpcoming={false}
                />
              ))}
        </div>
      </div>
    </div>
  );
};

export default React.memo(CalendarWidget);

