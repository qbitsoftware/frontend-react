"use client"

import type React from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "@tanstack/react-router"
import { MapPin, Calendar } from "lucide-react"
import type { Tournament } from "@/types/types"
import { formatDateString } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("admin.tournaments.table.name")}</TableHead>
          <TableHead>{t("admin.tournaments.table.category")}</TableHead>
          <TableHead>{t("admin.tournaments.table.status")}</TableHead>
          <TableHead>{t("admin.tournaments.table.dates")}</TableHead>
          <TableHead>{t("admin.tournaments.table.location")}</TableHead>
          <TableHead>{t("admin.tournaments.table.duration")}</TableHead>
          <TableHead>{t("admin.tournaments.table.tables")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tournaments.map((tournament) => (
          <TableRow
            key={tournament.id}
            onClick={() => handleRowClick(tournament.id)}
            className="cursor-pointer hover:bg-gray-100"
          >
            <TableCell className="font-medium">{tournament.name}</TableCell>
            <TableCell>{tournament.category}</TableCell>
            <TableCell>
              <Badge variant={tournament.state === "started" ? "outline" : "destructive"}>{tournament.state}</Badge>
            </TableCell>
            <TableCell>
              {formatDateString(tournament.start_date)} - {formatDateString(tournament.end_date)}
            </TableCell>
            <TableCell>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-red-500" />
                {tournament.location}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-purple-500" />
                {getDurationDays(tournament.start_date, tournament.end_date) + 1} days
              </div>
            </TableCell>
            <TableCell>{tournament.total_tables}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

const getDurationDays = (startDate: string, endDate: string) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

