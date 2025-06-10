import { useParticipantUtils } from "@/hooks/useParticipantUtils"
import { capitalize, formatDateStringYearMonthDay, useDebounce } from "@/lib/utils"
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

interface Props {
    participant: Participant
    index: number
    disableOrdering: boolean
    setDisableOrdering: (value: boolean) => void
    forceDisableOrdering: boolean
    tournament_id: number
    tournament_table_id: number
    participants_len: number
}

export default function ParticipantDND({ participant, index, disableOrdering, setDisableOrdering, forceDisableOrdering, tournament_id, tournament_table_id, participants_len }: Props) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: participant.id })

    const { addOrUpdateParticipant, deleteParticipant } = useParticipantUtils(tournament_id, tournament_table_id)

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

    const handleStartEditing = () => {
        setIsEditing(true)
        setDisableOrdering(true)
    }

    const handleDeleteParticipant = () => {
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

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    return (
        <TableRow ref={setNodeRef} style={style} className="bg-card rounded-lg shadow-sm hover:shadow-md hover:bg-stone-100/40">
            <TableCell className='text-center'>
                { }
                {disableOrdering || forceDisableOrdering ? <div className="flex items-center justify-center hover:bg-indigo-50 gap-1 p-2 rounded-sm">
                    <Input className="w-[40px] p-0 disabled:p-0 disabled:bg-transparent disabled:border-none disabled:opacity-100 disabled:cursor-default disabled:text-stone-900" disabled={!editing || forceDisableOrdering} placeholder="Pos" value={participantState.order}
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
                    <GripVertical className="h-4 w-4" />
                </div>
                    :
                    <div className="flex items-center justify-center hover:bg-sky-100/40 gap-1 p-2 rounded-sm"
                        {...attributes}
                        {...listeners}
                    >
                        {index + 1}
                        <GripVertical className="h-4 w-4" />
                    </div>
                }
            </TableCell>
            <TableCell className="text-center ">
                {editing ?
                    <div className="flex gap-2">
                        <div className="h-8 w-8 flex items-center justify-center bg-green-100 cursor-pointer rounded-sm"
                            onClick={handleSubmit}
                        >
                            <Check className="h-4 w-4" />
                        </div>
                        <div className="h-8 w-8 flex items-center justify-center bg-stone-100 cursor-pointer rounded-sm"
                            onClick={handleCancel}
                        >
                            <X className="h-4 w-4 cursor-pointer" />
                        </div>
                        <div className="h-8 w-8 flex items-center justify-center bg-red-100 cursor-pointer rounded-sm"
                            onClick={handleDeleteParticipant}
                        >
                            <Trash className="h-4 w-4 cursor-pointer" />
                        </div>
                    </div> :
                    <div className="w-8 h-8 flex items-center justify-center bg-stone-100 cursor-pointer rounded-sm"
                        onClick={handleStartEditing}
                    >
                        <Pencil className="h-4 w-4 cursor-pointer" />

                    </div>
                }
            </TableCell>
            <TableCell className="font-medium">
                <Popover
                    open={popoverOpen}
                    onOpenChange={(open) => {
                        setPopoverOpen(open)
                    }}
                >
                    <PopoverTrigger asChild>
                        <Input className="w-[180px] disabled:p-0 disabled:bg-transparent disabled:border-none disabled:opacity-100 disabled:cursor-default disabled:text-stone-900"
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
                                        updateField("players.0.extra_data.club", user.club_name)
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
            <TableCell className="text-center">
                <Input className="w-[40px] p-0 disabled:p-0 disabled:bg-transparent disabled:border-none disabled:opacity-100 disabled:cursor-default disabled:text-stone-900" disabled={!editing} placeholder="ELTL ID" value={participantState.players[0].extra_data.eltl_id || 0} onChange={(e) => updateField("players.0.extra_data.eltl_id", Number(e.target.value))} />
            </TableCell>
            <TableCell className="text-center">
                <Input className="w-[60px] disabled:p-0 disabled:bg-transparent disabled:border-none disabled:opacity-100 disabled:cursor-default disabled:text-stone-900" disabled={!editing} placeholder="Rank" onChange={(e) => updateField("rank", Number(e.target.value))} value={participantState.rank || 0} />
            </TableCell>
            <TableCell className="text-center">
                <Input className="w-[120px] disabled:p-0 disabled:bg-transparent disabled:border-none disabled:opacity-100 disabled:cursor-default disabled:text-stone-900" type="date" disabled={!editing} placeholder="YOB" onChange={(e) => updateField("players.0.birthdate", e.target.value)} value={participantState.players[0].birthdate || ''} />
            </TableCell>
            <TableCell>
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
            <TableCell className="text-center">
                <Input className="w-[160px] disabled:p-0 disabled:bg-transparent disabled:border-none disabled:opacity-100 disabled:cursor-default disabled:text-stone-900" disabled={!editing} placeholder="Club name" onChange={(e) => updateField("players.0.extra_data.club", e.target.value)} value={participantState.players[0].extra_data.club || ""} />
            </TableCell>
            <TableCell className="text-center">
                <Input className="w-[60px] disabled:p-0 disabled:bg-transparent disabled:border-none disabled:opacity-100 disabled:cursor-default disabled:text-stone-900" disabled={!editing} placeholder="Riik" onChange={(e) => updateField("players.0.nationality", e.target.value)} value={participantState.players[0].nationality || ""} />
            </TableCell>
            <TableCell className="text-center">
                <Select value={participantState.players[0].sex} disabled={!editing} onValueChange={(value) => updateField("players.0.sex", value)}>
                    <SelectTrigger className="w-[80px] disabled:p-0 disabled:bg-transparent disabled:border-none disabled:opacity-100 disabled:cursor-default disabled:text-stone-900">
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
            <TableCell className="text-center">
                <EditImgModal id={participantState.players[0].id} playerName={`${participantState.players[0].first_name} ${participantState.players[0].last_name}`} img={participantState.players[0].extra_data.image_url} type="player" />
            </TableCell>

        </TableRow>
    )
}