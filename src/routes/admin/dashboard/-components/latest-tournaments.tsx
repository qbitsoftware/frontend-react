import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTranslation } from "react-i18next";
import { TournamentStatusBadge } from "./statistics-card";
import { formatDateString } from "@/lib/utils";
import { UseGetTournamentsAdminQuery } from "@/queries/tournaments";
import { useRouter } from "@tanstack/react-router";

export default function AdminDashboardLatestTournaments() {
    const { data, isLoading, error } = UseGetTournamentsAdminQuery()
    const { t } = useTranslation()
    const router = useRouter()

    const currentDate = new Date();
    const upcomingTournaments = data?.data
        ? [...data.data]
            .filter((tournament) => new Date(tournament.start_date) > currentDate)
            .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
            .slice(0, 3)
        : [];

    return (
        <Card className="shadow-sm">
            <CardHeader className="pb-4">
                <CardTitle className="text-base sm:text-lg">
                    {t("admin.dashboard.upcoming_tournaments")}
                </CardTitle>
                <CardDescription className="text-sm">
                    {t("admin.dashboard.upcoming_tournaments_description")}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-xs sm:text-sm">{t("admin.dashboard.utils.name")}</TableHead>
                                <TableHead className="text-xs sm:text-sm">{t("admin.dashboard.utils.status")}</TableHead>
                                <TableHead className="text-xs sm:text-sm">{t("admin.dashboard.utils.start_date")}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && (
                                <>
                                    {[...Array(3)].map((_, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="h-6 bg-gray-200 rounded-full animate-pulse w-16"></div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </>
                            )}

                            {error && (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-8">
                                        <div className="flex flex-col items-center gap-2 text-red-600">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="text-sm font-medium">
                                                {t("admin.dashboard.error_loading_tournaments")}
                                            </span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}

                            {!isLoading && !error && upcomingTournaments.length > 0 && (
                                <>
                                    {upcomingTournaments.map((tournament) => (
                                        <TableRow
                                            className="cursor-pointer hover:bg-gray-50"
                                            key={tournament.id}
                                            onClick={() => {
                                                router.navigate({
                                                    to: "/admin/tournaments/" + tournament.id,
                                                });
                                            }}
                                        >
                                            <TableCell className="font-medium text-xs sm:text-sm truncate max-w-[120px]">{tournament.name}</TableCell>
                                            <TableCell>
                                                <TournamentStatusBadge status={tournament.state} />
                                            </TableCell>
                                            <TableCell className="text-xs sm:text-sm">
                                                {formatDateString(tournament.start_date)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </>
                            )}

                            {!isLoading && !error && upcomingTournaments.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center text-gray-500 py-8 text-sm">
                                        {t("admin.dashboard.no_upcoming_tournaments")}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}