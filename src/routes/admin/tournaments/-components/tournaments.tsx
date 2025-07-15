import type React from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "@tanstack/react-router"
import { MapPin, Calendar } from "lucide-react"
import { formatDateString } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tournament } from "@/types/tournaments"

interface TournamentTableProps {
  tournaments: Tournament[]
}


export const TournamentTable: React.FC<TournamentTableProps> = ({ tournaments }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const handleRowClick = (tournament_id: number) => {
    navigate({ to: `/admin/tournaments/${tournament_id}` })
  }

  return (
    <div className="overflow-x-auto -mx-3 sm:mx-0">
      <Table className="w-full min-w-[800px]">
        <TableHeader>
          <TableRow>
            <TableHead className="text-xs sm:text-sm px-2 sm:px-4">{t("admin.tournaments.table.name")}</TableHead>
            <TableHead className="text-xs sm:text-sm px-2 sm:px-4 hidden sm:table-cell">{t("admin.tournaments.table.category")}</TableHead>
            <TableHead className="text-xs sm:text-sm px-2 sm:px-4">{t("admin.tournaments.table.status")}</TableHead>
            <TableHead className="text-xs sm:text-sm px-2 sm:px-4">{t("admin.tournaments.table.dates")}</TableHead>
            <TableHead className="text-xs sm:text-sm px-2 sm:px-4 hidden md:table-cell">{t("admin.tournaments.table.location")}</TableHead>
            <TableHead className="text-xs sm:text-sm px-2 sm:px-4 hidden lg:table-cell">{t("admin.tournaments.table.duration")}</TableHead>
            <TableHead className="text-xs sm:text-sm px-2 sm:px-4 hidden lg:table-cell">{t("admin.tournaments.table.tables")}</TableHead>
          </TableRow>
        </TableHeader>
      <TableBody>
        {tournaments.map((tournament) => (
          <TableRow
            key={tournament.id}
            onClick={() => handleRowClick(tournament.id)}
            className="cursor-pointer hover:bg-gray-100"
          >
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4 max-w-[120px] sm:max-w-none truncate font-medium">
              {tournament.name}
            </TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4 hidden sm:table-cell">
              {tournament.category}
            </TableCell>
            <TableCell className="px-2 sm:px-4">
              <Badge 
                variant={tournament.state === "started" ? "outline" : tournament.state === "not_started" ? "default" : "destructive"}
                className={`text-xs px-2 py-1 ${tournament.state === "created" ? "bg-blue-400 text-white hover:bg-blue-700" : ""}`}
              >
                {tournament.state}
              </Badge>
            </TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4 min-w-[140px]">
              <div className="flex flex-col sm:block">
                <span className="block sm:inline">{formatDateString(tournament.start_date)}</span>
                <span className="block sm:inline sm:before:content-['-'] sm:before:mx-1">
                  {formatDateString(tournament.end_date)}
                </span>
              </div>
            </TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4 hidden md:table-cell max-w-[150px]">
              <div className="flex items-center">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-red-500 flex-shrink-0" />
                <span className="truncate">{tournament.location}</span>
              </div>
            </TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4 hidden lg:table-cell">
              <div className="flex items-center">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-purple-500 flex-shrink-0" />
                {getDurationDays(tournament.start_date, tournament.end_date) + 1} days
              </div>
            </TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4 hidden lg:table-cell">
              {tournament.total_tables}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
    </div>
  )
}

const getDurationDays = (startDate: string, endDate: string) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

