import { TournamentEvent } from "@/queries/tournaments";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { formatDateRange, getAbbreviatedMonth } from "./calendar-utils";

interface Props {
    event: TournamentEvent
}
export default function EventCard({ event }: Props) {
    const linkPath = event.is_gameday
        ? `/voistlused/${event.parent_tournament_id}`
        : `/voistlused/${event.tournament.id}`;

    const { t } = useTranslation()

    return (
        <Link to={linkPath} key={`${event.tournament.id}-${event.is_gameday ? event.gameday_date : ''}`}>
            <div className="group bg-white border border-gray-200 rounded-xl p-3 sm:p-4 hover:border-[#4C97F1]/30 hover:shadow-lg hover:shadow-[#4C97F1]/10 transition-all duration-300 mb-3 sm:mb-4 active:scale-[0.98] touch-manipulation">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                        <h6 className="font-semibold text-gray-900 group-hover:text-[#4C97F1] transition-colors duration-200 line-clamp-2 leading-tight mb-2 text-sm sm:text-base">
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
                                <span className="text-xs sm:text-sm truncate text-gray-600">
                                    {event.tournament.category}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 self-start sm:self-center">
                        {event.is_gameday ? (
                            <div className="bg-[#4C97F1] text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-center font-bold shadow-sm">
                                <div className="text-xs font-medium opacity-90">
                                    {getAbbreviatedMonth(event.gameday_date)}
                                </div>
                                <div className="text-base sm:text-lg font-bold leading-none">
                                    {new Date(event.gameday_date).getDate()}
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="bg-[#4C97F1] text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-center font-bold shadow-sm">
                                    <div className="text-xs font-medium opacity-90">
                                        {getAbbreviatedMonth(event.tournament.start_date)}
                                    </div>
                                    <div className="text-base sm:text-lg font-bold leading-none">
                                        {formatDateRange(event.tournament.start_date, event.tournament.end_date).split(" - ")[0]}
                                    </div>
                                </div>
                                {event.tournament.end_date !== event.tournament.start_date && (
                                    <>
                                        <div className="w-3 h-px bg-gray-300"></div>
                                        <div className="bg-[#4C97F1] text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-center font-bold shadow-sm">
                                            <div className="text-xs font-medium opacity-90">
                                                {event.tournament.end_date !== event.tournament.start_date &&
                                                    new Date(event.tournament.start_date).getMonth() !== new Date(event.tournament.end_date).getMonth()
                                                    ? getAbbreviatedMonth(event.tournament.end_date)
                                                    : getAbbreviatedMonth(event.tournament.start_date)}
                                            </div>
                                            <div className="text-base sm:text-lg font-bold leading-none">
                                                {formatDateRange(event.tournament.start_date, event.tournament.end_date).split(" - ")[1]}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );

}