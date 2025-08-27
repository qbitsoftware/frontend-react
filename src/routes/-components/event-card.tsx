import { TournamentEvent } from "@/queries/tournaments";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { formatDateRange, getAbbreviatedMonth } from "../voistlused/-components/calendar-utils";

interface Props {
    event: TournamentEvent;
    isUpcoming: boolean;
}

export default function EventCard({ event, isUpcoming }: Props) {
    const { t } = useTranslation()
    return (
        <Link to={`/voistlused/${event.tournament.id}`} key={event.tournament.id}>
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
                        {event.is_gameday ? (
                            <div className={`
                  px-1.5 sm:px-2 lg:px-3 py-1 sm:py-1.5 lg:py-2 rounded-md sm:rounded-lg text-center font-medium shadow-sm border
                  ${isUpcoming
                                    ? 'bg-[#4C97F1] text-white border-[#4C97F1]'
                                    : 'bg-gray-100 text-gray-700 border-gray-200'
                                }
                `}>
                                <div className="text-xs font-medium opacity-90">
                                    {getAbbreviatedMonth(event.gameday_date)}
                                </div>
                                <div className="text-sm sm:text-base lg:text-lg font-bold leading-none">
                                    {new Intl.DateTimeFormat('et-EE', { 
                                        day: 'numeric', 
                                        timeZone: 'Europe/Tallinn' 
                                    }).format(new Date(event.gameday_date))}
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className={`
                    px-1.5 sm:px-2 lg:px-3 py-1 sm:py-1.5 lg:py-2 rounded-md sm:rounded-lg text-center font-medium shadow-sm border
                    ${isUpcoming
                                        ? 'bg-[#4C97F1] text-white border-[#4C97F1]'
                                        : 'bg-gray-100 text-gray-700 border-gray-200'
                                    }
                  `}>
                                    <div className="text-xs font-medium opacity-90">
                                        {getAbbreviatedMonth(event.tournament.start_date)}
                                    </div>
                                    <div className="text-sm sm:text-base lg:text-lg font-bold leading-none">
                                        {formatDateRange(event.tournament.start_date, event.tournament.end_date).split(" - ")[0]}
                                    </div>
                                </div>

                                {event.tournament.end_date !== event.tournament.start_date && (
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
                                                {(() => {
                                                    const startMonth = new Intl.DateTimeFormat('et-EE', { 
                                                        month: 'numeric', 
                                                        timeZone: 'Europe/Tallinn' 
                                                    }).format(new Date(event.tournament.start_date));
                                                    
                                                    const endMonth = new Intl.DateTimeFormat('et-EE', { 
                                                        month: 'numeric', 
                                                        timeZone: 'Europe/Tallinn' 
                                                    }).format(new Date(event.tournament.end_date));
                                                    
                                                    return startMonth !== endMonth
                                                        ? getAbbreviatedMonth(event.tournament.end_date)
                                                        : getAbbreviatedMonth(event.tournament.start_date);
                                                })()}
                                            </div>
                                            <div className="text-sm sm:text-base lg:text-lg font-bold leading-none">
                                                {formatDateRange(event.tournament.start_date, event.tournament.end_date).split(" - ")[1]}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </>
                        )}
                    </div>

                    {/* Event Content */}
                    <div className="flex-1 min-w-0">
                        <h6 className={`
                font-semibold text-sm sm:text-base mb-0.5 sm:mb-1 truncate group-hover:text-[#4C97F1] transition-colors duration-200
                ${isUpcoming ? 'text-gray-900' : 'text-gray-800'}
              `} title={event.tournament.name}>
                            {event.tournament.name}
                        </h6>

                        <div className="flex items-center gap-1 sm:gap-2">
                            {event.is_finals ? (
                                <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                    {t("calendar.play_off")}
                                </span>
                            ) : event.is_gameday && event.order ? (
                                <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs font-medium bg-orange-100 text-orange-800">
                                    {t("calendar.game_day")} {event.order}
                                </span>
                            ) : (
                                <span className={`
                    text-xs sm:text-sm truncate
                    ${isUpcoming ? 'text-gray-600' : 'text-gray-500'}
                  `}>
                                    {event.tournament.category}
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
