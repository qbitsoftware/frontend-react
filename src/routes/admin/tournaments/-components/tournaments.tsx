import type React from "react"
import { useState, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "@tanstack/react-router"
import { MapPin, Calendar, Search, PlusCircle } from "lucide-react"
import { formatDateString } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tournament } from "@/types/tournaments"
import { Link } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"

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
      case "started":
        return { variant: "default" as const, className: "bg-green-100 text-green-800 border-green-200 hover:bg-green-200" }
      case "not_started":
        return { variant: "secondary" as const, className: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200" }
      case "created":
        return { variant: "outline" as const, className: "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200" }
      case "finished":
        return { variant: "outline" as const, className: "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200" }
      default:
        return { variant: "destructive" as const, className: "bg-red-100 text-red-800 border-red-200 hover:bg-red-200" }
    }
  }

  return (
    <div className="space-y-4">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            {t("admin.tournaments.title")}
          </h1>
          <p className="text-sm text-gray-600">
            {t("admin.tournaments.description")}
          </p>
        </div>

        <div className="flex sm:items-center gap-3 flex-col sm:flex-row">
          <div className="relative min-w-[280px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={t("admin.tournaments.search_placeholder") || "Search tournaments..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 bg-white rounded-lg shadow-sm"
            />
          </div>

          <div>
            <Link to="/admin/tournaments/new" className="inline-flex">
              <Button className="bg-[#4C97F1] hover:bg-[#3B7DD8] text-white shadow-sm border-0 px-4 py-2 font-medium transition-all duration-200 hover:shadow-md whitespace-nowrap">
                <PlusCircle className="w-4 h-4 mr-2" />
                {t('admin.tournaments.add_new') || 'Add Tournament'}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="border-gray-200 bg-gray-50/50">
                  <TableHead className="text-xs sm:text-sm px-3 py-3 font-semibold text-gray-700">
                    {t("admin.tournaments.table.name")}
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm px-3 py-3 font-semibold text-gray-700 hidden sm:table-cell">
                    {t("admin.tournaments.table.category")}
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm px-3 py-3 font-semibold text-gray-700">
                    {t("admin.tournaments.table.status")}
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm px-3 py-3 font-semibold text-gray-700">
                    {t("admin.tournaments.table.dates")}
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm px-3 py-3 font-semibold text-gray-700 hidden md:table-cell">
                    {t("admin.tournaments.table.location")}
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm px-3 py-3 font-semibold text-gray-700 hidden lg:table-cell">
                    {t("admin.tournaments.table.duration")}
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm px-3 py-3 font-semibold text-gray-700 hidden lg:table-cell">
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
                          <p className="font-medium text-gray-900">No tournaments found</p>
                          <p className="text-sm text-gray-500">Try adjusting your search criteria</p>
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
                            {/* <div className="w-1.5 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div> */}
                            <span className="truncate max-w-[180px]" title={tournament.name}>
                              {tournament.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="px-3 py-3 text-gray-600 hidden sm:table-cell">
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                            {tournament.category}
                          </span>
                        </TableCell>
                        <TableCell className="px-3 py-3">
                          <Badge className={`text-xs px-2 py-1 font-medium ${statusConfig.className}`}>
                            {tournament.state.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-3 py-3 text-gray-600 min-w-[140px]">
                          {isSameDay ? (
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="w-3 h-3 text-gray-400" />
                              <span>{formatDateString(tournament.start_date)}</span>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2 text-sm">
                                <Calendar className="w-3 h-3 text-gray-400" />
                                <span>{formatDateString(tournament.start_date)}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span className="w-3 h-3"></span>
                                <span>{formatDateString(tournament.end_date)}</span>
                              </div>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="px-3 py-3 text-gray-600 hidden md:table-cell max-w-[150px]">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3 h-3 text-red-500 flex-shrink-0" />
                            <span className="truncate text-sm" title={tournament.location}>
                              {tournament.location}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="px-3 py-3 text-gray-600 hidden lg:table-cell">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                            <span className="text-sm font-medium">
                              {getDurationDays(tournament.start_date, tournament.end_date)} day{getDurationDays(tournament.start_date, tournament.end_date) !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="px-3 py-3 text-gray-600 hidden lg:table-cell">
                          <div className="flex items-center gap-2">
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

