import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useTranslation } from 'react-i18next'
import {
    Clock,
    CheckCircle,
    XCircle,
    Loader2,
    Calendar,
    Download,
    RotateCcw,
    AlertTriangle,
    TrendingUp,
    Database
} from 'lucide-react'
import { formatDateString } from '@/lib/utils'
import { useState, useEffect } from 'react'
import AdminHeader from '../-components/admin-header'
import { UseGetRatingInfo, UseGetRatingLatestChanges, UseGetReadyTournamentsForRatingCalc } from '@/queries/rating'
import { axiosInstance } from '@/queries/axiosconf'
import { AutoSizer, Column, Table as VirtualizedTable } from "react-virtualized"
import 'react-virtualized/styles.css'

export const Route = createFileRoute('/admin/rating/')({
    component: RouteComponent,
})

function RouteComponent() {
    const { t } = useTranslation()
    const { data: upcomingTournaments } = UseGetReadyTournamentsForRatingCalc('upcoming')
    const { data: latestTournaments } = UseGetReadyTournamentsForRatingCalc('latest')
    const { data: ratingInfo } = UseGetRatingInfo()
    const { data: ratingChanges } = UseGetRatingLatestChanges()

    const [timeUntilNext, setTimeUntilNext] = useState('')
    const [isExportingRatings, setIsExportingRatings] = useState(false)
    const [withRating, setWithRating] = useState(false);
    const [selectedDate, setSelectedDate] = useState('2025-09-10');

    useEffect(() => {
        const updateTimer = () => {
            const now = new Date()
            const next = new Date(ratingInfo?.data.next_calculation || '')
            const diff = next.getTime() - now.getTime()

            if (diff > 0) {
                const days = Math.floor(diff / (1000 * 60 * 60 * 24))
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
                const seconds = Math.floor((diff % (1000 * 60)) / 1000)

                if (days > 0) {
                    setTimeUntilNext(`${days}d ${hours}h ${minutes}m ${seconds}s`)
                } else if (hours > 0) {
                    setTimeUntilNext(`${hours}h ${minutes}m ${seconds}s`)
                } else {
                    setTimeUntilNext(`${minutes}m ${seconds}s`)
                }
            } else {
                setTimeUntilNext('Calculating...')
            }
        }

        updateTimer()
        const interval = setInterval(updateTimer, 1000)

        return () => clearInterval(interval)
    }, [ratingInfo?.data.next_calculation])

    const downloadRatingsXML = async (with_timestamp: boolean) => {
        setIsExportingRatings(true)
        try {
            const response = await axiosInstance.get("/api/v1/ratings/export_xml", {
                responseType: "blob",
                withCredentials: true,
                params: {
                    timestamp: with_timestamp ? selectedDate : undefined,
                    rating: withRating,
                }
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            if (selectedDate && with_timestamp && withRating) {
                link.setAttribute("download", `reiting_min_${selectedDate}.xml`);
            } else if (selectedDate && with_timestamp) {
                link.setAttribute("download", `reiting_all_${selectedDate}.xml`);
            } else if (withRating) {
                link.setAttribute("download", `reiting_all_latest.xml`);
            } else {
                link.setAttribute("download", `reiting_min_latest.xml`);
            }
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Download failed", error);
        } finally {
            setIsExportingRatings(false)
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'success':
                return <CheckCircle className="h-5 w-5 text-green-600" />
            case 'failed':
                return <XCircle className="h-5 w-5 text-red-600" />
            case 'ongoing':
                return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
            default:
                return <Clock className="h-5 w-5 text-gray-600" />
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'OK':
                return <Badge className="bg-green-100 text-green-800 border-green-200">{t('admin.rating.status.success')}</Badge>
            case 'failed':
                return <Badge className="bg-red-100 text-red-800 border-red-200">{t('admin.rating.status.failed')}</Badge>
            case 'In Progress':
                return <Badge className="bg-blue-100 text-blue-800 border-blue-200">{t('admin.rating.status.ongoing')}</Badge>
            default:
                return <Badge className="bg-gray-100 text-gray-800 border-gray-200">{t('admin.rating.status.pending')}</Badge>
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
            <div className="p-8">
                <AdminHeader
                    title={t('admin.rating.title', 'Rating Management')}
                    description={t('admin.rating.subtitle', 'Monitor and manage rating calculations')}
                    href=""
                    feedback={true}
                />

                {/* Status Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {/* Last Calculation */}
                    <Card className="border-gray-200 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <Database className="h-4 w-4" />
                                {t('admin.rating.last_calculation', 'Last Calculation')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {ratingInfo?.data && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        {getStatusIcon(ratingInfo?.data.status)}
                                        {getStatusBadge(ratingInfo?.data.status)}
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        {formatDateString(ratingInfo?.data.last_calculated_at || '')}
                                    </p>
                                    {ratingInfo.data.status === 'In Progress' && (
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-xs text-gray-500">
                                                <span>{t('admin.rating.progress', 'Progress')}</span>
                                                <span>40%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                    style={{ width: `${40}%` }}
                                                />
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                {ratingInfo.data.tournaments_affected} tournaments
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                        </CardContent>
                    </Card>

                    {/* Next Calculation */}
                    <Card className="border-gray-200 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                {t('admin.rating.next_calculation', 'Next Calculation')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <p className="text-lg font-semibold text-blue-600">
                                    {timeUntilNext}
                                </p>
                                <p className="text-sm text-gray-600">
                                    {formatDateString(ratingInfo?.data.next_calculation || '')}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {upcomingTournaments && upcomingTournaments.data && upcomingTournaments.data.length} {t('admin.rating.tournaments_pending', 'tournaments pending')}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card className="border-gray-200 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2 justify-between">
                                <div className='flex items-center gap-2'>
                                    <TrendingUp className="h-4 w-4" />
                                    {t('admin.rating.quick_actions', 'Quick Actions')}
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="withRating"
                                        checked={withRating}
                                        onChange={e => setWithRating(e.target.checked)}
                                        className="h-3 w-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />

                                    <label htmlFor="withRating" className="text-xs text-slate-700">
                                        {t('admin.rating.with_rating_only', 'With rating only')}
                                    </label>
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">

                                <Button variant="outline" size="sm" className="w-full h-8 text-xs" disabled={isExportingRatings} onClick={() => downloadRatingsXML(false)}>
                                    <Download className="h-3 w-3 mr-2" />
                                    {t('admin.rating.export_current', 'Export Current Ratings')}
                                </Button>
                                <Button variant="outline" size="sm" className="w-full h-8 text-xs" disabled>
                                    <RotateCcw className="h-3 w-3 mr-2" />
                                    {t('admin.rating.rollback', 'Rollback Ratings')}
                                </Button>
                                <div className="space-y-2">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">
                                            {t('export.ratings.dateLabel', 'Select date')}
                                        </label>
                                        <input
                                            type="date"
                                            className="border border-slate-300 rounded px-2 py-1 w-full text-xs"
                                            value={selectedDate}
                                            onChange={e => setSelectedDate(e.target.value)}
                                            min="2025-09-09"
                                            max={new Date().toISOString().split('T')[0]}
                                        />
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full h-8 text-xs"
                                        onClick={() => downloadRatingsXML(true)}
                                        disabled={isExportingRatings || !selectedDate}
                                    >
                                        <Calendar className="h-3 w-3 mr-2" />
                                        {t('admin.rating.export_date', 'Export by Date')}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Pending Tournaments */}
                <Card className="border-gray-200 shadow-sm mb-6">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-orange-500" />
                            {t('admin.rating.pending_tournaments', 'Tournaments Awaiting Calculation')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {upcomingTournaments && upcomingTournaments.data && upcomingTournaments.data.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                                <p>{t('admin.rating.no_pending', 'No tournaments pending calculation')}</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-gray-200">
                                        <TableHead className="text-xs font-semibold text-gray-700">
                                            {t('admin.rating.tournament_name', 'Tournament')}
                                        </TableHead>
                                        <TableHead className="text-xs font-semibold text-gray-700">
                                            {t('admin.rating.date', 'Date')}
                                        </TableHead>
                                        <TableHead className="text-xs font-semibold text-gray-700 text-center">
                                            {t('admin.rating.participants', 'Location')}
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {upcomingTournaments && upcomingTournaments.data && upcomingTournaments.data.map((tournament) => (
                                        <TableRow key={tournament.id} className="border-gray-100">
                                            <TableCell className="font-medium text-sm">{tournament.name}</TableCell>
                                            <TableCell className="text-sm text-gray-600">
                                                {formatDateString(tournament.start_date)}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="outline" className="text-xs">
                                                    {tournament.location}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                {/* Calculated Tournaments */}
                <Card className="border-gray-200 shadow-sm mb-6">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            {t('admin.rating.calculated_tournaments', 'Recently Calculated Tournaments')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow className="border-gray-200">
                                    <TableHead className="text-xs font-semibold text-gray-700">
                                        {t('admin.rating.tournament_name', 'Tournament')}
                                    </TableHead>
                                    <TableHead className="text-xs font-semibold text-gray-700">
                                        {t('admin.rating.tournament_date', 'Tournament Date')}
                                    </TableHead>
                                    <TableHead className="text-xs font-semibold text-gray-700 text-center">
                                        {t('admin.rating.participants', 'Location')}
                                    </TableHead>
                                    <TableHead className="text-xs font-semibold text-gray-700">
                                        {t('admin.rating.calculated_at', 'Calculated At')}
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {latestTournaments && latestTournaments.data && latestTournaments.data.map((tournament) => (
                                    <TableRow key={tournament.id} className="border-gray-100">
                                        <TableCell className="font-medium text-sm">{tournament.name}</TableCell>
                                        <TableCell className="text-sm text-gray-600">
                                            {formatDateString(tournament.start_date)}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="outline" className="text-xs">
                                                {tournament.location}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-600">
                                            {tournament.rating_calculated_at && formatDateString(tournament.rating_calculated_at)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Latest Rating Changes */}
                <Card className="border-gray-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-blue-500" />
                            {t('admin.rating.latest_changes', 'Latest Rating Changes')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {ratingChanges && ratingChanges.data && ratingChanges.data.length > 0 ? (
                            <div className="h-[400px] w-full border rounded-md">
                                <AutoSizer>
                                    {({ height, width }) => (
                                        <VirtualizedTable
                                            width={width}
                                            height={height}
                                            headerHeight={40}
                                            rowHeight={35}
                                            rowCount={ratingChanges.data.length}
                                            rowGetter={({ index }) => ratingChanges.data[index]}
                                            rowClassName={({ index }) =>
                                                index !== -1 ? "border-b border-gray-100 hover:bg-gray-50" : "bg-gray-50"
                                            }
                                            headerClassName="bg-gray-50 font-semibold text-xs border-b"
                                        >
                                            <Column
                                                label="User ID"
                                                dataKey="user_id"
                                                width={80}
                                                flexGrow={0}
                                                cellRenderer={({ cellData }) => (
                                                    <div className="flex items-center h-full px-2 font-medium text-sm">
                                                        {cellData}
                                                    </div>
                                                )}
                                            />

                                            <Column
                                                label={t('admin.rating.first_name', 'Eesnimi')}
                                                dataKey="first_name"
                                                width={100}
                                                flexGrow={1}
                                                cellRenderer={({ cellData }) => (
                                                    <div className="flex items-center h-full px-2 font-medium text-sm">
                                                        {cellData}
                                                    </div>
                                                )}
                                            />

                                            <Column
                                                label={t('admin.rating.last_name', 'Perenimi')}
                                                dataKey="last_name"
                                                width={100}
                                                flexGrow={1}
                                                cellRenderer={({ cellData }) => (
                                                    <div className="flex items-center h-full px-2 font-medium text-sm">
                                                        {cellData}
                                                    </div>
                                                )}
                                            />

                                            <Column
                                                label={t('admin.rating.algorithm', 'Algo Version')}
                                                dataKey="algo_version"
                                                width={90}
                                                flexGrow={0}
                                                headerClassName="text-center"
                                                cellRenderer={({ cellData }) => (
                                                    <div className="flex items-center justify-center h-full px-2 text-sm text-gray-600">
                                                        {cellData}
                                                    </div>
                                                )}
                                            />

                                            <Column
                                                label={t('admin.rating.new_rating', 'Rate Order')}
                                                dataKey="rate_order"
                                                width={90}
                                                flexGrow={0}
                                                headerClassName="text-center"
                                                cellRenderer={({ cellData }) => (
                                                    <div className="flex items-center justify-center h-full px-2 text-sm font-medium">
                                                        {cellData}
                                                    </div>
                                                )}
                                            />

                                            <Column
                                                label="PP"
                                                dataKey="rate_pl_points"
                                                width={60}
                                                flexGrow={0}
                                                headerClassName="text-center"
                                                cellRenderer={({ cellData }) => (
                                                    <div className="flex items-center justify-center h-full px-2 text-sm">
                                                        {cellData}
                                                    </div>
                                                )}
                                            />

                                            <Column
                                                label="KL"
                                                dataKey="rate_weight"
                                                width={80}
                                                flexGrow={0}
                                                cellRenderer={({ cellData }) => (
                                                    <div className="flex items-center h-full px-2 text-sm text-gray-600 max-w-[80px] truncate">
                                                        {cellData}
                                                    </div>
                                                )}
                                            />

                                            <Column
                                                label="RP"
                                                dataKey="rate_points"
                                                width={80}
                                                flexGrow={0}
                                                cellRenderer={({ cellData }) => (
                                                    <div className="flex items-center h-full px-2 text-sm text-gray-600">
                                                        {cellData}
                                                    </div>
                                                )}
                                            />

                                            <Column
                                                label={t('admin.rating.date', 'Date')}
                                                dataKey="timestamp"
                                                width={120}
                                                flexGrow={0}
                                                cellRenderer={({ cellData }) => (
                                                    <div className="flex items-center h-full px-2 text-sm text-gray-600">
                                                        {formatDateString(cellData)}
                                                    </div>
                                                )}
                                            />
                                        </VirtualizedTable>
                                    )}
                                </AutoSizer>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <Database className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                                <p>{t('admin.rating.no_changes', 'No rating changes available')}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
