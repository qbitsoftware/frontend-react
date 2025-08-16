import type React from "react"
import { useState, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "@tanstack/react-router"
import { Calendar, Search } from "lucide-react"
import { formatDateString } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tournament } from "@/types/tournaments"
import AdminHeader from "../../-components/admin-header"
import { TournamentState } from "@/types/matches"

interface TournamentTableProps {
  tournaments: Tournament[]
}

export const TournamentTable: React.FC<TournamentTableProps> = ({ tournaments }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")

  const handleRowClick = (tournament_id: number) => {
    navigate({ to: `/admin/tournaments/${tournament_id}` })
  }

  const filteredAndSortedTournaments = useMemo(() => {
    const now = new Date()

    return tournaments
      .filter(tournament =>
        tournament.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        const dateA = new Date(a.start_date)
        const dateB = new Date(b.start_date)

        // Calculate distance from current date
        const diffA = Math.abs(dateA.getTime() - now.getTime())
        const diffB = Math.abs(dateB.getTime() - now.getTime())

        return diffA - diffB
      })
  }, [tournaments, searchQuery])

  const getStatusVariant = (state: string) => {
    switch (state) {
      case "ongoing":
        return { variant: "secondary" as const, className: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200" }
      case "created":
        return { variant: "outline" as const, className: "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200" }
      case "finished":
        return { variant: "outline" as const, className: "bg-green-100 text-green-800 border-green-200 hover:bg-green-200" }
      default:
        return { variant: "destructive" as const, className: "bg-red-100 text-red-800 border-red-200 hover:bg-red-200" }
    }
  }

  return (
    <div className="">
      <AdminHeader
        href={"/admin/tournaments/new"}
        title={t("admin.tournaments.title")}
        description={t("admin.tournaments.description")}
        input_placeholder={t("admin.tournaments.search_placeholder")}
        add_new={t('admin.tournaments.add_new')}
        searchTerm={searchQuery}
        setSearchTerm={setSearchQuery}
      />

      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="border-gray-200 bg-gray-50/50">
                  <TableHead className="text-xs sm:text-sm px-3 py-3 font-semibold text-gray-700">
                    {t("admin.tournaments.table.name")}
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm px-3 py-3 text-center font-semibold text-gray-700">
                    {t("admin.tournaments.table.status")}
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm px-3 py-3 text-center font-semibold text-gray-700">
                    {t("admin.tournaments.table.dates")}
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm px-3 py-3 text-center font-semibold text-gray-700 hidden md:table-cell">
                    {t("admin.tournaments.table.location")}
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm px-3 py-3 text-center font-semibold text-gray-700 hidden lg:table-cell">
                    {t("admin.tournaments.table.duration")}
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm px-3 py-3 text-center font-semibold text-gray-700 hidden lg:table-cell">
                    {t("admin.tournaments.table.tables")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedTournaments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <Search className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{t('admin.tournaments.no_tournaments')}</p>
                          <p className="text-sm text-gray-500">{t('admin.tournaments.no_tournaments_criteria')}</p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedTournaments.map((tournament) => {
                    const statusConfig = getStatusVariant(tournament.state)
                    const isSameDay = tournament.start_date === tournament.end_date
                    return (
                      <TableRow
                        key={tournament.id}
                        onClick={() => handleRowClick(tournament.id)}
                        className="cursor-pointer hover:bg-gray-50/75 border-gray-100 transition-colors duration-150"
                      >
                        <TableCell className="px-3 py-3 font-medium text-gray-900">
                          <div className="flex items-center gap-2">
                            <span className="truncate max-w-[180px]" title={tournament.name}>
                              {tournament.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="px-3 py-3 text-center">
                          <Badge className={`text-xs px-2 py-1 font-medium ${statusConfig.className}`}>
                            {tournament.state === TournamentState.CREATED ? t('admin.tournaments.state.created').toUpperCase() :
                              tournament.state === TournamentState.ONGOING ? t('admin.tournaments.state.ongoing').toUpperCase() :
                                t('admin.tournaments.state.finished').toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-3 py-3 text-gray-600 min-w-[140px]">
                          {isSameDay ? (
                            <div className="flex items-center justify-center gap-2 text-sm">
                              <Calendar className="w-3 h-3 text-gray-400" />
                              <span>{formatDateString(tournament.start_date)}</span>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2 text-sm justify-center">
                                <Calendar className="w-3 h-3 text-gray-400" />
                                <span>{formatDateString(tournament.start_date)}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-500 justify-center">
                                <span className="w-3 h-3"></span>
                                <span>{formatDateString(tournament.end_date)}</span>
                              </div>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="px-3 py-3 text-gray-600 hidden md:table-cell max-w-[150px]">
                          <div className="flex items-center gap-2 justify-center">
                            <span className="truncate text-sm" title={tournament.location}>
                              {tournament.location}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="px-3 py-3 text-gray-600 hidden lg:table-cell">
                          <div className="flex items-center gap-2 justify-center">
                            <span className="text-sm font-medium">
                              {getDurationDays(tournament.start_date, tournament.end_date)} {t('admin.tournaments.day')}{getDurationDays(tournament.start_date, tournament.end_date) !== 1 ? t('admin.tournaments.day_plural_ending') : ''}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="px-3 py-3 text-gray-600 hidden lg:table-cell">
                          <div className="flex items-center gap-2 justify-center">
                            <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                              <span className="text-xs font-bold text-blue-600">{tournament.total_tables}</span>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

const getDurationDays = (startDate: string, endDate: string) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  return days
}

