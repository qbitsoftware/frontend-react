import { TournamentEvent } from "@/queries/tournaments";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ExternalLink, MapPin, Calendar, Users } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useMemo, useCallback } from "react";
import { List as VirtualizedList, AutoSizer, ListRowProps } from 'react-virtualized';
import 'react-virtualized/styles.css';

interface Props {
    tournaments: TournamentEvent[];
    selectedYear: number;
    isLoading: boolean;
    error: Error | null;
    searchQuery: string;
}

export default function CalTableView({ selectedYear, isLoading, error, tournaments, searchQuery }: Props) {
    const { t } = useTranslation();
    const currentTournamentRef = useRef<HTMLTableRowElement>(null);
    const tableContainerRef = useRef<HTMLDivElement>(null);
    const virtualizedListRef = useRef<VirtualizedList>(null);

    const currentDate = useMemo(() => new Date(), []);

    const filteredTournaments = useMemo(() => {
        const normalizedSearchQuery = searchQuery.toLowerCase();

        return tournaments
            .filter(event => {
                const startDate = (event.is_gameday || event.is_finals) ?
                    new Date(event.gameday_date) :
                    new Date(event.tournament.start_date);
                const endDate = (event.is_gameday || event.is_finals) ?
                    new Date(event.gameday_date) :
                    new Date(event.tournament.end_date);

                const yearMatch = startDate.getFullYear() === selectedYear || endDate.getFullYear() === selectedYear;
                const searchMatch = event.tournament.name.toLowerCase().includes(normalizedSearchQuery);

                return yearMatch && searchMatch;
            })
            .sort((a, b) => {
                const getStartDate = (event: TournamentEvent) =>
                    (event.is_gameday || event.is_finals) ? new Date(event.gameday_date) : new Date(event.tournament.start_date);
                return getStartDate(a).getTime() - getStartDate(b).getTime();
            });
    }, [tournaments, selectedYear, searchQuery]);

    const currentTournamentIndex = useMemo(() => {
        return filteredTournaments.findIndex(event => {
            const startDate = (event.is_gameday || event.is_finals) ?
                new Date(event.gameday_date) :
                new Date(event.tournament.start_date);
            return startDate >= currentDate;
        });
    }, [filteredTournaments, currentDate]);

    useEffect(() => {
        if (virtualizedListRef.current && currentTournamentIndex !== -1) {
            setTimeout(() => {
                virtualizedListRef.current?.scrollToRow(currentTournamentIndex);
            }, 100);
        }
    }, [currentTournamentIndex, filteredTournaments]);

    const formatDate = useMemo(() => {
        return (dateString: string) => {
            return new Date(dateString).toLocaleDateString('et-EE', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        };
    }, []);

    const formatDateRange = useMemo(() => {
        return (event: TournamentEvent) => {
            if (event.is_gameday || event.is_finals) {
                return formatDate(event.gameday_date);
            }

            const startDate = formatDate(event.tournament.start_date);
            const endDate = formatDate(event.tournament.end_date);

            if (startDate === endDate) {
                return startDate;
            }

            return `${startDate} - ${endDate}`;
        };
    }, [formatDate]);

    const renderTableRow = useCallback(({ index, key, style }: ListRowProps) => {
        const event = filteredTournaments[index];
        const isCurrentTournament = index === currentTournamentIndex;
        const getStartDate = (event: TournamentEvent) =>
            (event.is_gameday || event.is_finals) ? new Date(event.gameday_date) : new Date(event.tournament.start_date);
        const isPast = getStartDate(event) < currentDate;

        return (
            <div key={key} style={style} className="border-b border-gray-200 last:border-b-0">
                <div
                    ref={isCurrentTournament ? currentTournamentRef : null}
                    className={`transition-colors grid grid-cols-5 items-center min-h-[80px] ${
                        isCurrentTournament
                            ? "bg-blue-50 border-l-4 border-l-[#4C97F1] hover:bg-blue-100"
                            : isPast
                                ? "opacity-60 hover:bg-gray-50"
                                : "hover:bg-gray-50"
                    }`}
                >
                    <div className="px-6 py-4">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 h-3 w-3 rounded-full bg-[#4C97F1] mr-3"></div>
                            <div>
                                <div className="text-sm font-medium text-gray-900">
                                    {event.tournament.name}
                                </div>
                                {(event.is_gameday || event.is_finals) && (
                                    <div className="text-xs text-gray-500">
                                        {event.is_finals ? t('table_view.finals') : t('table_view.gameday')}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-900">
                            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                            {formatDateRange(event)}
                        </div>
                    </div>
                    <div className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-900">
                            <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                            <span title={event.tournament.location || '-'}>
                                {event.tournament.location
                                    ? event.tournament.location.length > 25
                                        ? `${event.tournament.location.substring(0, 25)}...`
                                        : event.tournament.location
                                    : '-'
                                }
                            </span>
                        </div>
                    </div>
                    <div className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-900">
                            <Users className="h-4 w-4 text-gray-400 mr-2" />
                            {event.tournament.organizer || '-'}
                        </div>
                    </div>
                    <div className="px-6 py-4 text-center">
                        <Link
                            to="/voistlused/$tournamentid"
                            params={{ tournamentid: event.tournament.id.toString() }}
                        >
                            <Button
                                size="sm"
                                variant="outline"
                                className="hover:bg-[#4C97F1] hover:text-white hover:border-[#4C97F1] transition-colors"
                            >
                                <ExternalLink className="h-4 w-4 mr-1" />
                                {t('table_view.view_details')}
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }, [filteredTournaments, currentTournamentIndex, currentDate, formatDateRange, t]);

    if (isLoading) return <TableViewSkeleton />;
    if (error) return <TableViewError />;

    return (
        <div className="w-full">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                    <div className="grid grid-cols-5 items-center">
                        <div className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            {t('table_view.tournament_name')}
                        </div>
                        <div className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            {t('table_view.dates')}
                        </div>
                        <div className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            {t('table_view.location')}
                        </div>
                        <div className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            {t('table_view.organizer')}
                        </div>
                        <div className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            {t('table_view.actions')}
                        </div>
                    </div>
                </div>

                <div
                    ref={tableContainerRef}
                    className="h-[calc(70vh-60px)]"
                >
                    {filteredTournaments.length > 0 ? (
                        <AutoSizer>
                            {({ height, width }) => (
                                <VirtualizedList
                                    ref={virtualizedListRef}
                                    height={height}
                                    width={width}
                                    rowCount={filteredTournaments.length}
                                    rowHeight={80}
                                    rowRenderer={renderTableRow}
                                    overscanRowCount={5}
                                    scrollToAlignment="center"
                                />
                            )}
                        </AutoSizer>
                    ) : (
                        <div className="px-6 py-12 text-center">
                            <div className="text-gray-500">
                                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                                    <Calendar className="h-6 w-6 text-gray-400" />
                                </div>
                                <p className="text-sm font-medium">
                                    {searchQuery ? t('admin.tournaments.no_tournaments') : t('calendar.no_tournaments')}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    {searchQuery ? t('admin.tournaments.no_tournaments_criteria') : t('table_view.no_tournaments_year', { year: selectedYear })}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const TableViewSkeleton = () => (
    <div className="w-full">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            {Array.from({ length: 5 }, (_, i) => (
                                <th key={i} className="px-6 py-4">
                                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {Array.from({ length: 8 }, (_, i) => (
                            <tr key={i}>
                                {Array.from({ length: 5 }, (_, j) => (
                                    <td key={j} className="px-6 py-4">
                                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
);

const TableViewError = () => {
    const { t } = useTranslation();
    return (
        <div className="w-full">
            <div className="bg-white rounded-lg border border-red-200 overflow-hidden">
                <div className="px-6 py-12 text-center">
                    <div className="text-red-500">
                        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                            <Calendar className="h-6 w-6 text-red-500" />
                        </div>
                        <p className="text-sm font-medium">{t('calendar.error_loading_tournaments')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
