import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { useParams } from "@tanstack/react-router"
import { UsePatchMatch } from "@/queries/match"
import { Match } from "@/types/matches"
import { UseGetFreeVenues } from "@/queries/venues"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface TableNumberFormProps {
  match: Match
  initialTableNumber: string
  brackets: boolean
  showLabel?: boolean
}

export function TableNumberForm({ match, initialTableNumber, brackets, showLabel = false }: TableNumberFormProps) {
  const params = useParams({ strict: false })
  const { data: freeVenues, isLoading, isError } = UseGetFreeVenues(Number(params.tournamentid))
  const { t } = useTranslation()

  const [tableNumber, setTableNumber] = useState<string>(initialTableNumber)

  const matchMutation = UsePatchMatch(Number(params.tournamentid), match.tournament_table_id, match.id)

  const handleChange = async (value: string) => {
    setTableNumber(value)
    try {
      const data: Match = { ...match, extra_data: { ...match.extra_data, table: value.trim() } }
      await matchMutation.mutateAsync(data)
    } catch (error) {
      void error
      toast.error(t('toasts.protocol_modals.table_number_change_error'))
    }
  }

  if (isLoading) {
    return <div></div>
  }

  if (isError) {
    return <div></div>
  }

  return (
    <div className="flex items-center gap-3">
      {showLabel && <Label className={cn(brackets ? "text-[8px]" : "")}>{t("admin.tournaments.matches.table.table")}</Label>}
      <Select value={String(tableNumber)} onValueChange={handleChange}>
        <SelectTrigger className={cn(brackets ? "h-[20px]" : "h-8")}>
          <span className={cn(brackets ? "text-[10px]" : "")}>{tableNumber}</span>
        </SelectTrigger>
        <SelectContent className="">
          <SelectItem className="min-h-[30px]" value=" "></SelectItem>
          {freeVenues && freeVenues.data && freeVenues.data.map((table) => (
            <SelectItem key={table.name} value={String(table.name)} className={cn(brackets ? "text-[10px]" : "", "hover:cursor-pointer")}>
              {table.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}