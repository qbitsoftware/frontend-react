import { UseGetMyClub } from "@/queries/clubs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Users, Settings, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function AdminDashBoardClubWrapper() {
    const { data, isLoading, error } = UseGetMyClub();
    const { t } = useTranslation();

    return (
        <Card className="shadow-sm">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="w-5 h-5" />
                    {t("admin.dashboard.my_club")}
                </CardTitle>
                <CardDescription className="text-sm">
                    {t("admin.dashboard.manage_your_club")}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading && (
                    <div className="space-y-3">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-xs sm:text-sm">{t("admin.dashboard.utils.name")}</TableHead>
                                        <TableHead className="text-xs sm:text-sm hidden sm:table-cell">{t("admin.dashboard.members")}</TableHead>
                                        <TableHead className="text-xs sm:text-sm">{t("admin.dashboard.actions")}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell>
                                            <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell">
                                            <div className="h-4 bg-gray-200 rounded animate-pulse w-12"></div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="h-8 bg-gray-200 rounded animate-pulse w-20"></div>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="p-4 rounded-lg border border-red-200 bg-red-50">
                        <div className="flex items-center gap-2 text-red-700 mb-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-medium text-sm">{t("admin.dashboard.error_loading_club")}</span>
                        </div>
                        <p className="text-xs text-red-600">
                            {t("admin.dashboard.club_load_failed")}
                        </p>
                    </div>
                )}

                {!isLoading && !error && data?.data?.clubs && data.data.clubs.length > 0 && (
                    <div className="space-y-3">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-xs sm:text-sm">{t("admin.dashboard.utils.name")}</TableHead>
                                        <TableHead className="text-xs sm:text-sm">{t("admin.dashboard.actions")}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.data.clubs.map((club) => (
                                        <TableRow key={club.id} className="hover:bg-gray-50">
                                            <TableCell className="font-medium text-xs sm:text-sm">
                                                <div>
                                                    <p className="truncate max-w-[120px]">{club.name}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Link href={`/admin/clubs/${club.id}`}>
                                                    <Button variant="outline" size="sm" className="text-xs">
                                                        <Settings className="w-3 h-3 mr-1" />
                                                        {t("admin.dashboard.manage")}
                                                    </Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                )}

                {!isLoading && !error && (!data?.data?.clubs || data.data.clubs.length === 0) && (
                    <div className="p-6 rounded-lg border border-gray-200 bg-gray-50 text-center">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h4 className="font-medium text-gray-700 mb-2">
                            {t("admin.dashboard.no_club_managed")}
                        </h4>
                        <p className="text-sm text-gray-500 mb-4">
                            {t("admin.dashboard.create_or_join_club")}
                        </p>
                        <Link href="/admin/clubs/new">
                            <Button size="sm">
                                <Plus className="w-4 h-4 mr-1" />
                                {t("admin.dashboard.create_club")}
                            </Button>
                        </Link>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}