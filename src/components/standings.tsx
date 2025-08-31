import { Participant } from "@/types/participants"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { useTranslation } from "react-i18next"
import { TournamentTable } from "@/types/groups"
import { GroupType } from "@/types/matches"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import placeholderImg from "@/assets/blue-profile.png"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { useState } from "react"
import { filterByAgeClass } from "@/lib/rating-utils"

interface Props {
  participants: Participant[]
  tournament_table: TournamentTable
}

const Standings = ({ participants, tournament_table }: Props) => {
  const { t } = useTranslation()
  const [ratingFilter, setRatingFilter] = useState<string>("all")
  const [sexFilter, setSexFilter] = useState<string>("all")
  const [ageClassFilter, setAgeClassFilter] = useState<string>("all")

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

  const ageClassFilterOptions = [
    { value: "all", label: t("rating.filtering.select.options.all") },
    { value: "u9", label: t("rating.filtering.select.options.u9", "U9") },
    { value: "u11", label: t("rating.filtering.select.options.u11", "U11") },
    { value: "u13", label: t("rating.filtering.select.options.u13", "U13") },
    { value: "u15", label: t("rating.filtering.select.options.u15", "U15") },
    { value: "u19", label: t("rating.filtering.select.options.u19", "U19") },
    { value: "u21", label: t("rating.filtering.select.options.u21", "U21") },
  ]

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

    if (ageClassFilter !== "all") {
      const playerBirthDate = player.birthdate
      if (!playerBirthDate || !filterByAgeClass({ birth_date: playerBirthDate, sex: player.sex } as any, ageClassFilter)) {
        return false
      }
    }
    
    return true
  })

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
          <div className="flex flex-col gap-2 w-full md:hidden">
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
            <Select value={ageClassFilter} onValueChange={setAgeClassFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("competitions.standings.filter.age_placeholder", "Filter by age")} />
              </SelectTrigger>
              <SelectContent>
                {ageClassFilterOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="hidden md:flex gap-2">
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
            <Select value={ageClassFilter} onValueChange={setAgeClassFilter}>
              <SelectTrigger className="w-45">
                <SelectValue placeholder={t("competitions.standings.filter.age_placeholder", "Filter by age")} />
              </SelectTrigger>
              <SelectContent>
                {ageClassFilterOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
                    <TableCell>{participant.players?.[0]?.extra_data?.eltl_id}</TableCell>
                    <TableCell>{participant.players?.[0]?.sex}</TableCell>
                    <TableCell>{participant.players?.[0]?.birthdate?.slice(0, 4)}</TableCell>
                    <TableCell>{participant.players?.[0]?.extra_data?.club}</TableCell>
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
        <div className="flex flex-col gap-2 w-full md:hidden">
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
          <Select value={ageClassFilter} onValueChange={setAgeClassFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("competitions.standings.filter.age_placeholder", "Filter by age")} />
            </SelectTrigger>
            <SelectContent>
              {ageClassFilterOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="hidden md:flex gap-2">
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
          <Select value={ageClassFilter} onValueChange={setAgeClassFilter}>
            <SelectTrigger className="w-45">
              <SelectValue placeholder={t("competitions.standings.filter.age_placeholder", "Filter by age")} />
            </SelectTrigger>
            <SelectContent>
              {ageClassFilterOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
              <TableCell>{participant.players?.[0].extra_data.eltl_id}</TableCell>
              <TableCell>{participant.players?.[0]?.sex}</TableCell>
              <TableCell>{participant.players?.[0]?.birthdate?.slice(0, 4)}</TableCell>
              <TableCell>{participant.players?.[0]?.extra_data?.club}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default Standings
