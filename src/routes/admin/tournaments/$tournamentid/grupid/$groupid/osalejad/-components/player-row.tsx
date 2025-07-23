import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TableCell, TableRow } from "@/components/ui/table"
import { useParticipantUtils } from "@/hooks/useParticipantUtils"
import { capitalizeWords, formatDateStringYearMonthDay, useDebounce } from "@/lib/utils"
import { UseGetUsersDebounce } from "@/queries/users"
import { Participant } from "@/types/participants"
import { Player } from "@/types/players"
import { Check, Pencil, Trash, X } from "lucide-react"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from 'sonner'
import EditImgModal from "../../../../-components/edit-img-modal"

interface Props {
    participant: Participant
    player: Player
    updateField: (field: string, value: any) => void
    index: number
    tournament_id: number
    tournament_table_id: number
}

export default function PlayerRow({ participant, index, player, updateField, tournament_id, tournament_table_id }: Props) {
    const { addOrUpdateParticipant } = useParticipantUtils(tournament_id, tournament_table_id)
    const [editing, setIsEditing] = useState(false)

    const [searchTerm, setSearchTerm] = useState("")
    const [fullName, setFullName] = useState('')

    const [popoverOpen, setPopoverOpen] = useState(false);
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const [originalPlayer, setOriginalPlayer] = useState<Player>(player)

    const { data: playerSuggestions } =
        UseGetUsersDebounce(debouncedSearchTerm);

    const { t } = useTranslation()

    useEffect(() => {
        if (debouncedSearchTerm) {
            const timeout = setTimeout(() => setPopoverOpen(true), 50);
            return () => clearTimeout(timeout);
        } else {
            setPopoverOpen(false);
        }
    }, [debouncedSearchTerm]);

    const handleNameChange = (value: string) => {
        setFullName(value)
        setSearchTerm(value)
    }

    const handleStartEditing = () => {
        setIsEditing(true)
        setFullName(participant.players[index].first_name + " " + participant.players[index].last_name)
        setOriginalPlayer(JSON.parse(JSON.stringify(participant.players[index])))
    }

    const handleDelete = async () => {
        const updatedPlayers = [...participant.players]
        updatedPlayers.splice(index, 1)
        updateField("players", updatedPlayers)
        try {
            await addOrUpdateParticipant({ ...participant, players: updatedPlayers }, participant.id)
            toast.message(t("toasts.participants.updated"))
        } catch (error) {
            void error;
            toast.error(t("toasts.participants.updated_error"))
        }
        setIsEditing(false)
    }

    const handleCancel = () => {
        if (originalPlayer) {
            updateField(`players.${index}.first_name`, originalPlayer.first_name)
            updateField(`players.${index}.last_name`, originalPlayer.last_name)
            updateField(`players.${index}.user_id`, originalPlayer.user_id)
            updateField(`players.${index}.rank`, originalPlayer.rank)
            updateField(`players.${index}.created_at`, originalPlayer.created_at)
            updateField(`players.${index}.nationality`, originalPlayer.nationality)
            updateField(`players.${index}.sex`, originalPlayer.sex)

            if (originalPlayer.extra_data) {
                updateField(`players.${index}.extra_data.rate_order`, originalPlayer.extra_data.rate_order)
                updateField(`players.${index}.extra_data.club`, originalPlayer.extra_data.club)
                updateField(`players.${index}.extra_data.eltl_id`, originalPlayer.extra_data.eltl_id)
                updateField(`players.${index}.extra_data.rate_points`, originalPlayer.extra_data.rate_points)
                updateField(`players.${index}.extra_data.foreign_player`, originalPlayer.extra_data.foreign_player)
            }
        }

        setIsEditing(false)
        setPopoverOpen(false)
        setSearchTerm('')
    }

    const handleSubmit = async () => {
        const nameParts = fullName.trim().split(/\s+/)
        let updatedParticipant = null
        if (nameParts.length > 0) {
            const firstName = nameParts[0]
            const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : ''

            updateField(`players.${index}.first_name`, firstName)
            updateField(`players.${index}.last_name`, lastName)
            updatedParticipant = {
                ...participant,
                players: participant.players.map((player, i) =>
                    i === index
                        ? { ...player, first_name: firstName, last_name: lastName }
                        : player
                )
            }
        }

        try {
            if (updatedParticipant === null) {
                await addOrUpdateParticipant(participant, participant.id)
            } else {
                await addOrUpdateParticipant(updatedParticipant, participant.id)
            }
            toast.message(t("toasts.participants.updated"))
        } catch (error) {
            handleCancel()
            void error;
            toast.error(t("toasts.participants.updated_error"))
        }
        setIsEditing(false)
    }

    return (
        <TableRow className="h-10 bg-card rounded-lg shadow-sm hover:shadow-md hover:bg-stone-100/40">
            <TableCell className="text-center py-2 px-3">
                {editing ?
                    <div className="flex gap-2">
                        <div className="h-6 w-6 flex items-center justify-center bg-green-100 cursor-pointer rounded-sm" onClick={handleSubmit} >
                            <Check className="h-3 w-3" />
                        </div>
                        <div className="h-6 w-6 flex items-center justify-center bg-stone-100 cursor-pointer rounded-sm" onClick={handleCancel}>
                            <X className="h-3 w-3 cursor-pointer" />
                        </div>
                        <div className="h-6 w-6 flex items-center justify-center bg-red-100 cursor-pointer rounded-sm" onClick={handleDelete}>
                            <Trash className="h-3 w-3 cursor-pointer" />
                        </div>
                    </div> :
                    <div className="w-6 h-6 flex items-center justify-center bg-stone-100 rounded-sm" onClick={handleStartEditing} >
                        <Pencil className="h-3 w-3 cursor-pointer" />
                    </div>
                }
            </TableCell>
            <TableCell className="font-medium py-2 px-3">
                <Popover
                    open={popoverOpen}
                    onOpenChange={(open) => {
                        setPopoverOpen(open)
                    }}
                >
                    <PopoverTrigger asChild>
                        <Input className="w-[180px] h-8 text-sm disabled:p-0 disabled:bg-transparent disabled:border-none disabled:opacity-100 disabled:cursor-default disabled:text-stone-900"
                            type="text"
                            disabled={!editing}
                            placeholder="Participant name"
                            onChange={(e) => {
                                handleNameChange(e.target.value)
                            }}
                            value={editing ? fullName : participant.players[index].first_name + " " + participant.players[index].last_name}
                        />
                    </PopoverTrigger>
                    {playerSuggestions && playerSuggestions.data &&
                        <PopoverContent
                            className="p-0 w-[200px] max-h-[400px] overflow-y-auto suggestion-dropdown"
                            align="start"
                            sideOffset={5}
                            onInteractOutside={(e) => {
                                if ((e.target as HTMLElement).closest('input')) {
                                    e.preventDefault()
                                } else {
                                    setPopoverOpen(false)
                                }
                            }}
                            onOpenAutoFocus={(e) => {
                                e.preventDefault()
                            }}
                        >
                            {playerSuggestions?.data.map((user, i) => (
                                <div
                                    key={i}
                                    className="px-3 py-2 cursor-pointer hover:bg-accent"
                                    onClick={() => {

                                        setPopoverOpen(false)
                                        setFullName(user.first_name + " " + user.last_name)
                                        updateField(`players.${index}.first_name`, user.first_name)
                                        updateField(`players.${index}.last_name`, user.last_name)
                                        updateField(`players.${index}.user_id`, user.id)
                                        updateField(`players.${index}.extra_data.rate_order`, user.rate_order)
                                        updateField(`players.${index}.extra_data.club`, user.club?.name || "KLUBITU")
                                        updateField(`players.${index}.extra_data.eltl_id`, user.eltl_id)
                                        updateField(`players.${index}.extra_data.rate_points`, user.rate_points)
                                        updateField(`players.${index}.rank`, user.rate_order)
                                        updateField(`players.${index}.sex`, user.sex)
                                        const formattedDate = formatDateStringYearMonthDay(user.birth_date)
                                        updateField(`players.${index}.created_at`, formattedDate)
                                        updateField(`players.${index}.nationality`, "EE")
                                        updateField(`players.${index}.extra_data.foreign_player`, false)
                                    }}
                                >
                                    {capitalizeWords(user.first_name)}{" "}
                                    {capitalizeWords(user.last_name)}{" "}
                                    {user.eltl_id}
                                </div>
                            ))}
                        </PopoverContent>
                    }
                </Popover>
            </TableCell>
            <TableCell className="text-center py-2 px-3">
                <Input className="w-[40px] h-8 text-sm p-0 disabled:p-0 disabled:bg-transparent disabled:border-none disabled:opacity-100 disabled:cursor-default disabled:text-stone-900" disabled={!editing} placeholder="ELTL ID" value={participant.players[index].extra_data.eltl_id || 0} onChange={(e) => { updateField(`players.${index}.extra_data.eltl_id`, Number(e.target.value)) }} />

            </TableCell>
            <TableCell className="text-center py-2 px-3">
                <Input className="w-[60px] h-8 text-sm disabled:p-0 disabled:bg-transparent disabled:border-none disabled:opacity-100 disabled:cursor-default disabled:text-stone-900" disabled={!editing} placeholder="Rank" onChange={(e) => updateField(`players.${index}.rank`, Number(e.target.value))} value={participant.players[index].rank || 0} />
            </TableCell>
            <TableCell className="text-center py-2 px-3">
                <Input className="w-[120px] h-8 text-sm disabled:p-0 disabled:bg-transparent disabled:border-none disabled:opacity-100 disabled:cursor-default disabled:text-stone-900" type="date" disabled={!editing} placeholder="YOB" onChange={(e) => updateField(`players.${index}.birthdate`, e.target.value)} value={formatDateStringYearMonthDay(participant.players[index].birthdate) || ''} />
            </TableCell>
            <TableCell className="text-center py-2 px-3">
                <Checkbox
                    checked={participant.players[index].extra_data.foreign_player === true}
                    disabled={!editing}
                    onCheckedChange={(checked) => {
                        updateField(`players.${index}.extra_data.foreign_player`, checked === true)
                    }
                    }
                    className=""
                />
            </TableCell>
            <TableCell className="text-center py-2 px-3">
                <Input className="w-[160px] h-8 text-sm disabled:p-0 disabled:bg-transparent disabled:border-none disabled:opacity-100 disabled:cursor-default disabled:text-stone-900" disabled={!editing} placeholder="Club name" onChange={(e) => updateField(`players.${index}.extra_data.club`, e.target.value)} value={participant.players[index].extra_data.club || ''} />
            </TableCell>
            <TableCell className="text-center py-2 px-3">
                <Input className="w-[50px] h-8 text-sm disabled:p-0 disabled:bg-transparent disabled:border-none disabled:opacity-100 disabled:cursor-default disabled:text-stone-900" disabled={!editing} placeholder="Riik" onChange={(e) => updateField(`players.${index}.nationality`, e.target.value)} value={participant.players[index].nationality || ''} />
            </TableCell>
            <TableCell className="text-center py-2 px-3">
                <Select value={participant.players[index].sex} disabled={!editing} onValueChange={(value) => updateField(`players.${index}.sex`, value)}>
                    <SelectTrigger className="w-[80px] h-8 text-sm disabled:p-0 disabled:bg-transparent disabled:border-none disabled:opacity-100 disabled:cursor-default disabled:text-stone-900">
                        <SelectValue placeholder="Sex" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>{t('register.form.sex')}</SelectLabel>
                            <SelectItem value="M">{t('register.form.sex_options.male')}</SelectItem>
                            <SelectItem value="N">{t('register.form.sex_options.female')}</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </TableCell>
            <TableCell className="text-center py-2 px-3">
                <EditImgModal id={participant.players[index].id} playerName={`${participant.players[index].first_name} ${participant.players[index].last_name}`} img={participant.players[index].extra_data.image_url} type="player" />
            </TableCell>

        </TableRow>
    )
}

