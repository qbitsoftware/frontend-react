import { Participant } from "@/types/participants"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { useTranslation } from "react-i18next"
import { TournamentTable } from "@/types/groups"
import { GroupType } from "@/types/matches"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import placeholderImg from "@/assets/blue-profile.png"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { useState } from "react"
import { exportStandingsToExcel } from "@/lib/excel-export"
import { Download } from "lucide-react"

interface Props {
  participants: Participant[]
  tournament_table: TournamentTable
}

const Standings = ({ participants, tournament_table }: Props) => {
  const { t } = useTranslation()
  const [ratingFilter, setRatingFilter] = useState<string>("all")
  const [sexFilter, setSexFilter] = useState<string>("all")
  const [ageClassFilter, setAgeClassFilter] = useState<string>("")
  console.log("participants", participants)

  const ratingFilterOptions = [
    { value: "all", label: t("competitions.standings.filter.all_ratings") },
    { value: "50", label: t("competitions.standings.filter.rating_plus", { rating: "50" }) },
    { value: "100", label: t("competitions.standings.filter.rating_plus", { rating: "100" }) },
    { value: "150", label: t("competitions.standings.filter.rating_plus", { rating: "150" }) },
    { value: "200", label: t("competitions.standings.filter.rating_plus", { rating: "200" }) },
    { value: "250", label: t("competitions.standings.filter.rating_plus", { rating: "250" }) },
    { value: "300", label: t("competitions.standings.filter.rating_plus", { rating: "300" }) },
    { value: "350", label: t("competitions.standings.filter.rating_plus", { rating: "350" }) },
    { value: "400", label: t("competitions.standings.filter.rating_plus", { rating: "400" }) },
  ]

  const sexFilterOptions = [
    { value: "all", label: t("competitions.standings.filter.all_sexes") },
    { value: "M", label: t("competitions.standings.filter.men") },
    { value: "N", label: t("competitions.standings.filter.women") },
  ]

  const parseAgeFromInput = (input: string): { age: number; type: 'under' | 'veteran' } | null => {
    const trimmed = input.trim()

    // Match U* format (under age)
    const underMatch = trimmed.match(/^[Uu](\d+)$/)
    if (underMatch) {
      return { age: parseInt(underMatch[1]), type: 'under' }
    }

    // Match V* format (veterans/over age) 
    const veteranMatch = trimmed.match(/^[Vv](\d+)$/)
    if (veteranMatch) {
      return { age: parseInt(veteranMatch[1]), type: 'veteran' }
    }

    return null
  }


  const getEffectiveRating = (participant: Participant) => {
    const player = participant.players?.[0]
    const baseRating = player?.rank || 0

    if (player?.sex === "N" && tournament_table.woman_weight && baseRating > 0) {
      return Math.round(baseRating * tournament_table.woman_weight)
    }

    return baseRating
  }

  const filteredParticipants = participants.filter(participant => {
    const player = participant.players?.[0]
    if (!player) return false

    if (ratingFilter !== "all") {
      if (player.extra_data?.foreign_player) {
        return false
      }
      const effectiveRating = getEffectiveRating(participant)
      if (!(effectiveRating >= parseInt(ratingFilter) || effectiveRating === 0)) {
        return false
      }
    }

    if (sexFilter !== "all") {
      if (player.sex !== sexFilter) {
        return false
      }
    }

    if (ageClassFilter.trim()) {
      const ageFilter = parseAgeFromInput(ageClassFilter)
      if (ageFilter !== null) {
        const playerBirthDate = player.birthdate
        if (!playerBirthDate) return false

        const currentYear = new Date().getFullYear()
        const birthYear = new Date(playerBirthDate).getFullYear()
        const playerAge = currentYear - birthYear

        if (ageFilter.type === 'under') {
          // U* or plain number: show players under this age
          if (playerAge >= ageFilter.age) return false
        } else if (ageFilter.type === 'veteran') {
          // V*: show players this age or older
          if (playerAge < ageFilter.age) return false
        }
      }
    }

    return true
  })

  const handleExportExcel = () => {
    exportStandingsToExcel({
      participants: filteredParticipants,
      tournament_table,
      ratingFilter,
      sexFilter,
      ageClassFilter,
      t
    })
  }

  const isRoundRobin = tournament_table.type === GroupType.ROUND_ROBIN || tournament_table.type === GroupType.ROUND_ROBIN_FULL_PLACEMENT

  if (isRoundRobin) {
    // const groupNames = filteredParticipants.filter(p => !p.group_id)

    const groupedParticipants = filteredParticipants
      .filter(p => p.group_id)
      .reduce((acc, participant) => {
        const groupId = participant.group_id
        if (!acc[groupId]) {
          acc[groupId] = []
        }
        acc[groupId].push(participant)
        return acc
      }, {} as Record<string, Participant[]>)

    // const groupIdToName = groupNames.reduce((acc, group) => {
    //   if (group.id) {
    //     acc[group.id.toString()] = group.name
    //   }
    //   return acc
    // }, {} as Record<string, string>)

    const sortedGroupIds = Object.keys(groupedParticipants).sort((a, b) => Number(a) - Number(b))

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-2 flex-1 md:hidden">
            <div className="flex gap-2 w-full">
              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder={t("competitions.standings.filter.rating_placeholder", "Filter by rating")} />
                </SelectTrigger>
                <SelectContent>
                  {ratingFilterOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sexFilter} onValueChange={setSexFilter}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder={t("competitions.standings.filter.sex_placeholder", "Filter by gender")} />
                </SelectTrigger>
                <SelectContent>
                  {sexFilterOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full">
              <Input
                placeholder={t("competitions.standings.filter.age_placeholder_manual", "Enter age (e.g., U18, V40)")}
                value={ageClassFilter}
                onChange={(e) => setAgeClassFilter(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>


          <div className="hidden md:flex gap-2 items-center flex-1">
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="w-45">
                <SelectValue placeholder={t("competitions.standings.filter.rating_placeholder", "Filter by rating")} />
              </SelectTrigger>
              <SelectContent>
                {ratingFilterOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sexFilter} onValueChange={setSexFilter}>
              <SelectTrigger className="w-45">
                <SelectValue placeholder={t("competitions.standings.filter.sex_placeholder", "Filter by gender")} />
              </SelectTrigger>
              <SelectContent>
                {sexFilterOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="w-full">
              <Input
                placeholder={t("competitions.standings.filter.age_placeholder_manual", "Enter age (e.g., U18, V40)")}
                value={ageClassFilter}
                onChange={(e) => setAgeClassFilter(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>

          <Button
            onClick={handleExportExcel}
            variant="outline"
            className="h-10 hidden md:flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {t("competitions.standings.export", "Export Standings")}
          </Button>
        </div>
        {sortedGroupIds && sortedGroupIds.map((groupId) => (
          <div key={groupId} className="bg-white rounded-lg shadow-sm border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">{t("competitions.standings.placement")}</TableHead>
                  <TableHead>{t("competitions.standings.participants")}</TableHead>
                  <TableHead>{t("competitions.standings.rating")}</TableHead>
                  <TableHead>ELTL ID</TableHead>
                  <TableHead>{t("competitions.standings.sex")}</TableHead>
                  <TableHead>{t("competitions.standings.yob")}</TableHead>
                  <TableHead>{t("competitions.standings.club")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groupedParticipants && groupedParticipants[groupId].map((participant, index) => (
                  <TableRow key={participant.id || index} className="hover:bg-gray-50">
                    <TableCell className="w-16 font-medium">{index + 1}</TableCell>
                    <TableCell className="flex items-center space-x-3">
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarImage src={participant.players?.[0]?.extra_data?.image_url || ""} alt={`${participant.name}'s profile`} />
                        <AvatarFallback className="p-0">
                          <img src={placeholderImg} className="rounded-full h-full w-full object-cover" alt="Profile" />
                        </AvatarFallback>
                      </Avatar>
                      <span>{participant.name}</span>
                    </TableCell>
                    <TableCell>
                      {(() => {
                        if (participant.players && participant.players.length > 1) {
                          return "-"
                        }
                        const player = participant.players?.[0]
                        const baseRating = player?.rank || 0
                        const effectiveRating = getEffectiveRating(participant)

                        if (baseRating === 0) return "-"

                        if (player?.sex === "N" && tournament_table.woman_weight && baseRating > 0) {
                          if (tournament_table.woman_weight === 1) {
                            return baseRating
                          }
                          return (
                            <span>
                              {baseRating} <span className="text-gray-500 text-sm">({effectiveRating})</span>
                            </span>
                          )
                        }

                        return baseRating
                      })()}
                    </TableCell>
                    <TableCell>
                      {participant.players && participant.players.length > 1
                        ? participant.players.map(p => p.extra_data?.eltl_id).filter(Boolean).join(' & ')
                        : participant.players?.[0]?.extra_data?.eltl_id
                      }
                    </TableCell>
                    <TableCell>
                      {participant.players && participant.players.length > 1
                        ? "-"
                        : participant.players?.[0]?.sex
                      }
                    </TableCell>
                    <TableCell>
                      {participant.players && participant.players.length > 1
                        ? "-"
                        : participant.players?.[0]?.birthdate?.slice(0, 4)
                      }
                    </TableCell>
                    <TableCell>
                      {participant.players && participant.players.length > 1
                        ? participant.players.map(p => p.extra_data?.club).filter(Boolean).join(' & ')
                        : participant.players?.[0]?.extra_data?.club
                      }
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        {/* Mobile filters */}
        <div className="flex flex-col gap-2 flex-1 md:hidden">
          <div className="flex gap-2 w-full">
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder={t("competitions.standings.filter.rating_placeholder", "Filter by rating")} />
              </SelectTrigger>
              <SelectContent>
                {ratingFilterOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sexFilter} onValueChange={setSexFilter}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder={t("competitions.standings.filter.sex_placeholder", "Filter by gender")} />
              </SelectTrigger>
              <SelectContent>
                {sexFilterOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full">
            <Input
              placeholder={t("competitions.standings.filter.age_placeholder_manual", "Enter age (e.g., U18, V40)")}
              value={ageClassFilter}
              onChange={(e) => setAgeClassFilter(e.target.value)}
              className="flex-1"
            />
          </div>
        </div>


        <div className="hidden md:flex gap-2 items-center flex-1">
          <Select value={ratingFilter} onValueChange={setRatingFilter}>
            <SelectTrigger className="w-45">
              <SelectValue placeholder={t("competitions.standings.filter.rating_placeholder", "Filter by rating")} />
            </SelectTrigger>
            <SelectContent>
              {ratingFilterOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sexFilter} onValueChange={setSexFilter}>
            <SelectTrigger className="w-45">
              <SelectValue placeholder={t("competitions.standings.filter.sex_placeholder", "Filter by gender")} />
            </SelectTrigger>
            <SelectContent>
              {sexFilterOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder={t("competitions.standings.filter.age_placeholder_manual", "Enter age (e.g., U18, V40)")}
            value={ageClassFilter}
            onChange={(e) => setAgeClassFilter(e.target.value)}
            className="w-45"
          />
        </div>

        <Button
          onClick={handleExportExcel}
          variant="outline"
          className="h-10 hidden md:flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          {t("competitions.standings.export", "Export Standings")}
        </Button>
      </div>
      <div className="bg-white rounded-lg shadow-sm border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">{t("competitions.standings.placement")}</TableHead>
              <TableHead>{t("competitions.standings.participants")}</TableHead>
              <TableHead>{t("competitions.standings.rating")}</TableHead>
              <TableHead>ELTL ID</TableHead>
              <TableHead>{t("competitions.standings.sex")}</TableHead>
              <TableHead>{t("competitions.standings.yob")}</TableHead>
              <TableHead>{t("competitions.standings.club")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredParticipants.map((participant: Participant, index) => (
              <TableRow key={participant.id || index} className="hover:bg-gray-50">
                <TableCell className="w-16 font-medium">{participants.findIndex(p => p.id === participant.id) + 1}</TableCell>
                <TableCell className="flex items-center space-x-3">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage src={participant.players?.[0]?.extra_data?.image_url || ""} alt={`${participant.name}'s profile`} />
                    <AvatarFallback className="p-0">
                      <img src={placeholderImg} className="rounded-full h-full w-full object-cover" alt="Profile" />
                    </AvatarFallback>
                  </Avatar>
                  <span>{participant.name}</span>
                </TableCell>
                <TableCell>
                  {(() => {
                    if (participant.players && participant.players.length > 1) {
                      return "-"
                    }
                    const player = participant.players?.[0]
                    const baseRating = player?.rank || 0
                    const effectiveRating = getEffectiveRating(participant)

                    if (baseRating === 0) return "-"

                    if (player?.sex === "N" && tournament_table.woman_weight && baseRating > 0) {
                      if (tournament_table.woman_weight === 1) {
                        return baseRating
                      }
                      return (
                        <span>
                          {baseRating} <span className="text-gray-500 text-sm">({effectiveRating})</span>
                        </span>
                      )
                    }

                    return baseRating
                  })()}
                </TableCell>
                <TableCell>
                  {participant.players && participant.players.length > 1
                    ? participant.players.map(p => p.extra_data?.eltl_id).filter(Boolean).join(' & ')
                    : participant.players?.[0]?.extra_data?.eltl_id
                  }
                </TableCell>
                <TableCell>
                  {participant.players && participant.players.length > 1
                    ? "-"
                    : participant.players?.[0]?.sex
                  }
                </TableCell>
                <TableCell>
                  {participant.players && participant.players.length > 1
                    ? "-"
                    : participant.players?.[0]?.birthdate?.slice(0, 4)
                  }
                </TableCell>
                <TableCell>
                  {participant.players && participant.players.length > 1
                    ? participant.players.map(p => p.extra_data?.club).filter(Boolean).join(' & ')
                    : participant.players?.[0]?.extra_data?.club
                  }
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default Standings
