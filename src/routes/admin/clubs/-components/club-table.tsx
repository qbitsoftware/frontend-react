import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MoreHorizontalIcon, Settings, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Club } from "@/types/clubs";
import { useTranslation } from "react-i18next";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface ClubTableProps {
  clubs: Club[];
  variant: "my-clubs" | "all-clubs";
  onEditClub?: (club: Club) => void;
  onManagePlayers?: (club: Club) => void;
  isLoading?: boolean;
}

export function ClubTable({ clubs, variant, onEditClub, onManagePlayers, isLoading = false }: ClubTableProps) {
  const { t } = useTranslation();
  const isMyClubs = variant === "my-clubs";

  if (isLoading) {
    return (
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className={isMyClubs ? "w-full" : "w-full"}>
              <TableHeader>
                <TableRow className="border-gray-200 bg-gray-50/50">
                  {isMyClubs && <TableHead className="text-xs sm:text-sm px-3 py-3 font-semibold text-gray-700">{t("admin.clubs.table.actions")}</TableHead>}
                  <TableHead className="text-xs sm:text-sm px-3 py-3 font-semibold text-gray-700">{t("admin.clubs.table.image")}</TableHead>
                  <TableHead className="text-xs sm:text-sm px-3 py-3 font-semibold text-gray-700">{t("admin.clubs.table.name")}</TableHead>
                  <TableHead className="text-xs sm:text-sm px-3 py-3 font-semibold text-gray-700">{t("admin.clubs.table.contact_person")}</TableHead>
                  <TableHead className="text-xs sm:text-sm px-3 py-3 font-semibold text-gray-700">{t("admin.clubs.table.email")}</TableHead>
                  <TableHead className="text-xs sm:text-sm px-3 py-3 font-semibold text-gray-700">{t("admin.clubs.table.phone")}</TableHead>
                  {!isMyClubs && (
                    <>
                      <TableHead className="text-xs sm:text-sm px-3 py-3 font-semibold text-gray-700 hidden md:table-cell">{t("admin.clubs.table.address")}</TableHead>
                      <TableHead className="text-xs sm:text-sm px-3 py-3 font-semibold text-gray-700 hidden lg:table-cell">{t("admin.clubs.table.website")}</TableHead>
                    </>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 3 }).map((_, index) => (
                  <TableRow key={index} className="border-gray-100">
                    {isMyClubs && (
                      <TableCell className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-8 w-20" />
                          <Skeleton className="h-8 w-24" />
                        </div>
                      </TableCell>
                    )}
                    <TableCell className="px-3 py-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                    </TableCell>
                    <TableCell className="px-3 py-3">
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell className="px-3 py-3">
                      <Skeleton className="h-4 w-28" />
                    </TableCell>
                    <TableCell className="px-3 py-3">
                      <Skeleton className="h-4 w-36" />
                    </TableCell>
                    <TableCell className="px-3 py-3">
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    {!isMyClubs && (
                      <>
                        <TableCell className="px-3 py-3 hidden md:table-cell">
                          <Skeleton className="h-4 w-40" />
                        </TableCell>
                        <TableCell className="px-3 py-3 hidden lg:table-cell">
                          <Skeleton className="h-4 w-32" />
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table className={isMyClubs ? "w-full" : "w-full"}>
            <TableHeader>
              <TableRow className="border-gray-200 bg-gray-50/50">
                {isMyClubs && <TableHead className="text-xs sm:text-sm px-3 py-3 font-semibold text-gray-700">{t("admin.clubs.table.actions")}</TableHead>}
                <TableHead className="text-xs sm:text-sm px-3 py-3 font-semibold text-gray-700">{t("admin.clubs.table.image")}</TableHead>
                <TableHead className="text-xs sm:text-sm px-3 py-3 font-semibold text-gray-700">{t("admin.clubs.table.name")}</TableHead>
                <TableHead className="text-xs sm:text-sm px-3 py-3 font-semibold text-gray-700">{t("admin.clubs.table.contact_person")}</TableHead>
                <TableHead className="text-xs sm:text-sm px-3 py-3 font-semibold text-gray-700 truncate">{t("admin.clubs.table.email")}</TableHead>
                <TableHead className="text-xs sm:text-sm px-3 py-3 font-semibold text-gray-700 truncate">{t("admin.clubs.table.phone")}</TableHead>
                {!isMyClubs && (
                  <>
                    <TableHead className="text-xs sm:text-sm px-3 py-3 font-semibold text-gray-700 hidden md:table-cell">{t("admin.clubs.table.address")}</TableHead>
                    <TableHead className="text-xs sm:text-sm px-3 py-3 font-semibold text-gray-700 hidden lg:table-cell">{t("admin.clubs.table.website")}</TableHead>
                  </>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {clubs
                .slice()
                .reverse()
                .map((club) => (
                  <TableRow key={club.id} className="hover:bg-gray-50/75 border-gray-100 transition-colors duration-150">
                    {isMyClubs && (
                      <TableCell className="px-3 py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontalIcon className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEditClub?.(club)}>
                              <Settings className="mr-2 h-4 w-4" />
                              {t("admin.clubs.buttons.manage_info")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onManagePlayers?.(club)}>
                              <Users className="mr-2 h-4 w-4" />
                              {t("admin.clubs.buttons.manage_players")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>

                      </TableCell>
                    )}
                    <TableCell className="px-3 py-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={club.image_url} alt={club.name} />
                        <AvatarFallback>
                          {club.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="px-3 py-3 font-medium text-gray-900">{club.name}</TableCell>
                    <TableCell className="px-3 py-3 text-gray-600 truncate">{club.contact_person}</TableCell>
                    <TableCell className="px-3 py-3 text-gray-600 truncate">{club.email}</TableCell>
                    <TableCell className="px-3 py-3 text-gray-600 truncate">{club.phone}</TableCell>
                    {!isMyClubs && (
                      <>
                        <TableCell className="px-3 py-3 text-gray-600 truncate hidden md:table-cell">{club.address}</TableCell>
                        <TableCell className="px-3 py-3 hidden lg:table-cell">
                          <a
                            href={club.website.startsWith('http') ? club.website : `https://${club.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline truncate block"
                          >
                            {club.website.replace(/^https?:\/\//, "")}
                          </a>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
