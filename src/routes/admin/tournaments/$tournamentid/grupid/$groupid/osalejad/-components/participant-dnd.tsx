import { useParticipantUtils } from "@/hooks/useParticipantUtils"
import { capitalize, cn, formatDateStringYearMonthDay, useDebounce } from "@/lib/utils"
import { UseGetUsersDebounce } from "@/queries/users"
import { Participant } from "@/types/participants"
import { useSortable } from "@dnd-kit/sortable"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { CSS } from '@dnd-kit/utilities'
import { TableCell, TableRow } from "@/components/ui/table"
import { Check, GripVertical, Pencil, Trash, X } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import EditImgModal from "../../../../-components/edit-img-modal"
import { DialogType, TournamentTable } from "@/types/groups"
import { selectedTeams } from "./new-double"
import { GroupType } from "@/types/matches"

interface Props {
    participant: Participant
    index: number
    disableOrdering: boolean
    setDisableOrdering: (value: boolean) => void
    forceDisableOrdering: boolean
    tournament_id: number
    tournament_table: TournamentTable
    participants_len: number

    // Experimental
    selectedTeams?: selectedTeams | undefined
    setSelectedTeams?: (teams: selectedTeams) => void
    renderRR?: boolean
    isSecondary?: boolean
}

export default function ParticipantDND({ participant, index, disableOrdering, setDisableOrdering, forceDisableOrdering, tournament_id, tournament_table, participants_len, selectedTeams, setSelectedTeams, renderRR, isSecondary }: Props) {

    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: participant.id })

    const { addOrUpdateParticipant, deleteParticipant } = useParticipantUtils(tournament_id, tournament_table.id)

    const [editing, setIsEditing] = useState(false)

    const [participantState, setParticipantState] = useState<Participant>(participant)

    useEffect(() => {
        setParticipantState(participant);
    }, [participant]);

    const updateField = (field: string, value: any) => {
        setParticipantState((prevState) => {
            if (!field.includes(".")) {
                return {
                    ...prevState,
                    [field]: value,
                }
            }

            const pathParts = field.split('.');
            const newState = { ...prevState };

            if (pathParts[0] === 'players') {
                const playerIndex = parseInt(pathParts[1]);
                const playerField = pathParts[2];

                if (pathParts.length === 4 && playerField === 'extra_data') {
                    const extraDataField = pathParts[3];
                    newState.players = [...newState.players];
                    newState.players[playerIndex] = {
                        ...newState.players[playerIndex],
                        extra_data: {
                            ...newState.players[playerIndex].extra_data,
                            [extraDataField]: value

                        }
                    };
                }
                else {
                    newState.players = [...newState.players];
                    newState.players[playerIndex] = {
                        ...newState.players[playerIndex],
                        [playerField]: value
                    };
                }
            }

            return newState;
        })
    }

    const [searchTerm, setSearchTerm] = useState("")
    const [popoverOpen, setPopoverOpen] = useState(false);
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

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

    const handleStartEditing = (e: React.MouseEvent) => {
        e.stopPropagation()
        setIsEditing(true)
        setDisableOrdering(true)
    }

    const handleDeleteParticipant = () => {
        if (setSelectedTeams && selectedTeams) {
            setSelectedTeams({ p1_id: "", p2_id: "", type: selectedTeams.type })
        }
        try {
            deleteParticipant(participantState)
            toast.message(t("toasts.participants.deleted"))
        } catch (error) {
            void error
            toast.error(t("toasts.participants.deleted_error"))
        }
        handleStopEditing()
    }

    const handleStopEditing = () => {
        setIsEditing(false)
        setDisableOrdering(false)
    }

    const handleCancel = () => {
        setParticipantState(participant)
        handleStopEditing()
    }

    const handleSubmit = async () => {
        try {
            const updatedParticipant = { ...participantState };

            if (Number(updatedParticipant.order) === 0) {
                updatedParticipant.order = participant.order;
            }

            await addOrUpdateParticipant(updatedParticipant, updatedParticipant.id);
            toast.message(t("toasts.participants.updated"))
        } catch (error) {
            setParticipantState(participant)
            void error;
            toast.error(t("toasts.participants.updated_error"))
        }
        handleStopEditing()
    }

    const handleRowClick = () => {
        if (editing || isSecondary) return

        if (setSelectedTeams) {
            // For Round robin
            if (tournament_table.type === GroupType.DYNAMIC && !renderRR) {
                if (selectedTeams) {
                    setSelectedTeams({ p1_id: participantState.id, p2_id: selectedTeams.p2_id, type: 'round_robin' })
                } else {
                    setSelectedTeams({ p1_id: participantState.id, p2_id: "", type: 'round_robin' })
                }
                // Check if clicking on the same participant that's already selected FOR DOUBLES
            } else if (tournament_table.dialog_type === DialogType.DT_DOUBLES || tournament_table.dialog_type === DialogType.DT_FIXED_DOUBLES) {
                if (selectedTeams &&
                    (selectedTeams.p1_id === participantState.id || selectedTeams.p2_id === participantState.id)) {
                    // Reset selection if clicking on already selected participant
                    setSelectedTeams({ p1_id: "", p2_id: "", type: 'double' })
                    return
                }

                let test: selectedTeams = {
                    p1_id: "",
                    p2_id: "",
                    type: tournament_table.type === GroupType.DYNAMIC ? 'round_robin' : 'double'
                }

                if (selectedTeams && selectedTeams.p1_id !== "") {
                    test.p1_id = selectedTeams.p1_id
                    test.p2_id = participantState.id
                } else if (selectedTeams && selectedTeams.p2_id !== "") {
                    test.p1_id = participantState.id
                    test.p2_id = selectedTeams.p2_id
                } else {
                    test.p1_id = participantState.id
                }
                setSelectedTeams(test)

            }
        }
    }

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    return (
        <TableRow ref={setNodeRef} style={style} onClick={handleRowClick} className={cn("h-7 bg-card rounded-lg shadow-sm hover:shadow-md hover:bg-stone-100/40 hover:border", tournament_table.dialog_type == DialogType.DT_DOUBLES || tournament_table.dialog_type == DialogType.DT_FIXED_DOUBLES || (tournament_table.type === GroupType.DYNAMIC && !renderRR) ? "hover:border-blue-500 cursor-pointer" : "", selectedTeams && (selectedTeams.p1_id == participantState.id || selectedTeams.p2_id == participantState.id) ? "bg-blue-100 hover:bg-blue-100" : "")}>
            <TableCell className='text-center py-0.5 px-2'>
                { }
                {disableOrdering || forceDisableOrdering ? <div className="flex items-center justify-center hover:bg-indigo-50 gap-1 p-1 rounded-sm">
                    <Input className="w-[35px] h-5 text-xs p-0 disabled:p-0 disabled:bg-transparent disabled:border-none disabled:opacity-100 disabled:cursor-default disabled:text-stone-900" disabled={!editing || forceDisableOrdering} placeholder="Pos" value={participantState.order}
                        onChange={(e) => {
                            const newValue = Number(e.target.value);
                            if (newValue <= 0) {
                                updateField("order", "");
                            }
                            if (newValue > participants_len) {
                                updateField("order", participants_len);
                            }
                            if (!isNaN(newValue) && newValue > 0 && newValue <= participants_len) {
                                updateField("order", newValue);
                            }
                        }}
                    />
                    <GripVertical className="h-2.5 w-2.5" />
                </div>
                    :
                    <div className="flex items-center justify-center hover:bg-sky-100/40 gap-1 p-1 rounded-sm"
                        {...attributes}
                        {...listeners}
                    >
                        {index + 1}
                        <GripVertical className="h-2.5 w-2.5" />
                    </div>
                }
            </TableCell>
            <TableCell className="text-center py-0.5 px-2">
                {editing ?
                    <div className="flex gap-1">
                        <div className="h-4 w-4 flex items-center justify-center bg-green-100 cursor-pointer rounded-sm"
                            onClick={handleSubmit}
                        >
                            <Check className="h-2.5 w-2.5" />
                        </div>
                        <div className="h-4 w-4 flex items-center justify-center bg-stone-100 cursor-pointer rounded-sm"
                            onClick={handleCancel}
                        >
                            <X className="h-2.5 w-2.5 cursor-pointer" />
                        </div>
                        <div className="h-4 w-4 flex items-center justify-center bg-red-100 cursor-pointer rounded-sm"
                            onClick={handleDeleteParticipant}
                        >
                            <Trash className="h-2.5 w-2.5 cursor-pointer" />
                        </div>
                    </div> :
                    <div className="w-4 h-4 flex items-center justify-center bg-stone-100 cursor-pointer rounded-sm"
                        onClick={handleStartEditing}
                    >
                        <Pencil className="h-2.5 w-2.5 cursor-pointer" />

                    </div>
                }
            </TableCell>
            <TableCell className="font-medium py-0.5 px-2">
                <Popover
                    open={popoverOpen}
                    onOpenChange={(open) => {
                        setPopoverOpen(open)
                    }}
                >
                    <PopoverTrigger asChild>
                        <Input className="w-[150px] h-5 text-xs disabled:p-0 disabled:bg-transparent disabled:border-none disabled:opacity-100 disabled:cursor-default disabled:text-stone-900"
                            type="text"
                            disabled={!editing}
                            placeholder="Participant name"
                            onChange={(e) => {
                                setSearchTerm(e.target.value)
                                updateField("name", e.target.value)
                            }}
                            value={participantState.name}
                        />
                    </PopoverTrigger>
                    {playerSuggestions && playerSuggestions.data &&
                        (<PopoverContent
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
                            {playerSuggestions.data.map((user, i) => (
                                <div
                                    key={i}
                                    className="px-3 py-2 cursor-pointer hover:bg-accent"
                                    onClick={() => {
                                        setPopoverOpen(false)
                                        updateField("name", `${capitalize(user.first_name)} ${capitalize(user.last_name)}`)
                                        updateField("players.0.first_name", user.first_name)
                                        updateField("players.0.last_name", user.last_name)
                                        updateField("players.0.user_id", user.id)
                                        updateField("players.0.extra_data.rate_order", user.rate_order)
                                        updateField("players.0.extra_data.club", user.club?.name || "KLUBITU")
                                        updateField("players.0.extra_data.eltl_id", user.eltl_id)
                                        updateField("players.0.extra_data.rate_points", user.rate_points)
                                        updateField("players.0.sex", user.sex)
                                        updateField("rank", user.rate_order)
                                        const formattedDate = formatDateStringYearMonthDay(user.birth_date)
                                        updateField(`players.0.created_at`, formattedDate)
                                        updateField(`players.0.nationality`, "EE")
                                        updateField(`players.0.extra_data.foreign_player`, false)
                                    }}
                                >
                                    {capitalize(user.first_name)}{" "}
                                    {capitalize(user.last_name)}{" "}
                                    {user.eltl_id}
                                </div>
                            ))}
                        </PopoverContent>
                        )
                    }
                </Popover>
            </TableCell>
            <TableCell className="text-center py-0.5 px-2">
                <Input className="w-[35px] h-5 text-xs p-0 disabled:p-0 disabled:bg-transparent disabled:border-none disabled:opacity-100 disabled:cursor-default disabled:text-stone-900" disabled={!editing} placeholder="ELTL ID" value={participantState.players[0].extra_data.eltl_id || 0} onChange={(e) => updateField("players.0.extra_data.eltl_id", Number(e.target.value))} />
            </TableCell>
            <TableCell className="text-center py-0.5 px-2">
                <Input className="w-[50px] h-5 text-xs disabled:p-0 disabled:bg-transparent disabled:border-none disabled:opacity-100 disabled:cursor-default disabled:text-stone-900" disabled={!editing} placeholder="Rank" onChange={(e) => updateField("rank", Number(e.target.value))} value={participantState.rank || 0} />
            </TableCell>
            <TableCell className="text-center py-0.5 px-2">
                <Input className="w-[35px] h-5 text-xs p-0 disabled:p-0 disabled:bg-transparent disabled:border-none disabled:opacity-100 disabled:cursor-default disabled:text-stone-900" disabled={!editing} placeholder="PP" value={participantState.players[0].extra_data.rate_points || 0} onChange={(e) => updateField("players.0.extra_data.rate_points", Number(e.target.value))} />
            </TableCell>

            <TableCell className="text-center py-0.5 px-2">
                {editing ? (
                    <Input className="w-[100px] h-5 text-xs" type="date" placeholder="YOB" onChange={(e) => updateField("players.0.birthdate", e.target.value)} value={formatDateStringYearMonthDay(participantState.players[0].birthdate) || ''} />
                ) : (
                    <span className="text-xs">{participantState.players[0].birthdate ? new Date(participantState.players[0].birthdate).getFullYear() : ''}</span>
                )}
            </TableCell>
            <TableCell className="text-center py-0.5 px-2">
                <Input className="w-[130px] h-5 text-xs disabled:p-0 disabled:bg-transparent disabled:border-none disabled:opacity-100 disabled:cursor-default disabled:text-stone-900" disabled={!editing} placeholder="Club name" onChange={(e) => updateField("players.0.extra_data.club", e.target.value)} value={participantState.players[0].extra_data.club || ""} />
            </TableCell>
            <TableCell className="text-center py-0.5 px-2">
                <Select value={participantState.players[0].sex} disabled={!editing} onValueChange={(value) => updateField("players.0.sex", value)}>
                    <SelectTrigger className="w-[70px] h-5 text-xs disabled:p-0 disabled:bg-transparent disabled:border-none disabled:opacity-100 disabled:cursor-default disabled:text-stone-900">
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
            <TableCell className="py-0.5 px-2">
                <Checkbox
                    checked={participantState.players[0].extra_data.foreign_player === true}
                    disabled={!editing}
                    onCheckedChange={(checked) => {
                        updateField(`players.0.extra_data.foreign_player`, checked === true)
                    }
                    }
                    className=""
                />
            </TableCell>
            <TableCell className="text-center py-0.5 px-2">
                <Input className="w-[50px] h-5 text-xs disabled:p-0 disabled:bg-transparent disabled:border-none disabled:opacity-100 disabled:cursor-default disabled:text-stone-900" disabled={!editing} placeholder="Riik" onChange={(e) => updateField("players.0.nationality", e.target.value)} value={participantState.players[0].nationality || ""} />
            </TableCell>
            <TableCell className="text-center py-0.5 px-2">
                <EditImgModal id={participantState.players[0].id} playerName={`${participantState.players[0].first_name} ${participantState.players[0].last_name}`} img={participantState.players[0].extra_data.image_url} type="player" />
            </TableCell>

        </TableRow>
    )
}
