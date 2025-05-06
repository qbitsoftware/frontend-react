import { Input } from "@/components/ui/input"
import { closestCenter, DndContext, DragEndEvent, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Participant } from "@/types/participants"
import { CSS } from '@dnd-kit/utilities'
import { Check, GripVertical, Pencil, PlusCircle, Trash, X } from "lucide-react"
import { useEffect, useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { capitalize, formatDateStringYearMonthDay, useDebounce } from "@/lib/utils"
import { UseGetUsersDebounce } from "@/queries/users"
import { useParams } from "@tanstack/react-router"
import { Accordion, AccordionContent, AccordionTrigger } from "@/components/ui/accordion"
import { AccordionItem } from "@radix-ui/react-accordion"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { ParticipantFormValues } from "../../../../-components/participant-forms/form-utils"
import { useParticipantUtils } from "@/hooks/useParticipantUtils"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { ParticipantsResponse } from "@/queries/participants"

interface NewTeamsProps {
    participant_data: ParticipantsResponse
}

export const NewTeams = ({ participant_data }: NewTeamsProps) => {
    const params = useParams({ from: '/admin/tournaments/$tournamentid/grupid/$groupid/osalejad/' })
    const { addOrUpdateParticipant } = useParticipantUtils(Number(params.tournamentid), Number(params.groupid))
    const [globalEdit, setGlobalEdit] = useState(false)

    const [participants, setParticipantsState] = useState<Participant[]>([])
    const [newParticipantName, setNewParticipantName] = useState<string>("")

    const { t } = useTranslation()

    useEffect(() => {
        if (participant_data && participant_data.data) {
            const orderedParticipants = participant_data.data.map(participant => {
                if (!participant.players) {
                    return participant
                }
                const sortedPlayers = [...participant.players].sort((a, b) => {
                    return a.rank - b.rank
                })
                return {
                    ...participant,
                    players: sortedPlayers
                }
            })
            setParticipantsState(orderedParticipants)
        }
    }, [participant_data])

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event
        if (active.id !== over?.id && over) {
            const activeIndex = participants.findIndex(p => p.id === active.id)
            const overIndex = participants.findIndex(p => p.id === over.id)

            const part_to_update = participants[activeIndex]
            part_to_update.order = overIndex + 1

            try {
                if (activeIndex !== -1 && overIndex !== -1) {
                    const updatedParticipants = arrayMove([...participants], activeIndex, overIndex)
                    setParticipantsState(updatedParticipants)
                }
                addOrUpdateParticipant(part_to_update, part_to_update.id)
            } catch (error) {
                console.log("error", error)
            }

        }
    }

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(TouchSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const handleAddParticipant = async () => {
        if (newParticipantName.trim() === "") {
            return
        }
        const new_participant: ParticipantFormValues = {
            name: newParticipantName,
            tournament_id: Number(params.tournamentid),
            sport_type: "tabletennis",
            order: participants.length + 1,
            players: []

        }
        try {
            await addOrUpdateParticipant(new_participant)
            toast.message(t("toasts.participants.created"))
            setNewParticipantName("")
        } catch (error) {
            toast.error(t("toasts.participants.created_error"))
        }
    }
    return (
        <div className="mt-10">
            <div className='flex flex-col mt-6'>
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                    modifiers={[restrictToVerticalAxis]}
                >
                    <SortableContext
                        items={participants.map(participant => participant.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        {participants && participants.map((participant, key) => (
                            <GroupRow key={participant.id} participant={participant} index={key} tournament_id={Number(params.tournamentid)} tournament_table_id={Number(params.groupid)} globalEdit={globalEdit} setGlobalEdit={setGlobalEdit} />
                        ))}

                    </SortableContext>
                </DndContext>
                <div className="flex gap-3">
                    <Input
                        type="text"
                        autoComplete='off'
                        placeholder={t("admin.tournaments.groups.participants.actions.add_team")}
                        value={newParticipantName}
                        onChange={(e) => setNewParticipantName(e.target.value)}
                    />
                    <Button
                        onClick={handleAddParticipant}
                    >
                        {"Add"}{" "}
                        <PlusCircle />
                    </Button>

                </div>
            </div>

        </div >
    )
}

interface GroupRowProps {
    participant: Participant
    index: number
    tournament_id: number
    tournament_table_id: number
    globalEdit: boolean
    setGlobalEdit: (value: boolean) => void
}

function GroupRow({ participant, index, tournament_id, tournament_table_id, globalEdit, setGlobalEdit }: GroupRowProps) {
    const { addOrUpdateParticipant, deleteParticipant } = useParticipantUtils(tournament_id, tournament_table_id)
    const { t } = useTranslation()

    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: participant.id })
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    const [editing, setIsEditing] = useState(false)

    const [participantState, setParticipantState] = useState<Participant>(participant)
    const [originalState, setOriginalState] = useState<Participant>(participant)

    useEffect(() => {
        if (!editing) {
            setParticipantState(participant)
            setOriginalState(participant)
        }
    }, [participant, editing])

    const handleStartEditing = () => {
        setOriginalState(JSON.parse(JSON.stringify(participantState)))
        setIsEditing(true)
        setGlobalEdit(true)
    }

    const handleCancelEditing = () => {
        setParticipantState(originalState)
        setIsEditing(false)
        setGlobalEdit(false)
    }

    const handleDeleteParticipant = () => {
        try {
            deleteParticipant(participantState)
            setIsEditing(false)
            setGlobalEdit(false)
            toast.message(t("toasts.participants.deleted"))
        } catch (error) {
            void error
            toast.error(t("toasts.participants.deleted_error"))
        }
    }

    const handleUpdateParticipant = () => {
        try {
            addOrUpdateParticipant(participantState, participantState.id)
            toast.message(t("toasts.participants.updated"))
        } catch (error) {
            void error
            toast.error(t("toasts.participants.updated_error"))
        }
        setOriginalState(JSON.parse(JSON.stringify(participantState)))
        setIsEditing(false)
        setGlobalEdit(false)
    }

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

    return (
        <Accordion type="single" collapsible className="w-full mb-2" ref={setNodeRef} style={style}>
            <AccordionItem value={participant.id} className="border rounded-md ">
                <AccordionTrigger className="hover:no-underline px-4 py-2 [&>svg]:ml-auto [&>svg]:mr-0 flex w-full items-center justify-between  "
                >
                    <div className="flex items-center space-x-4">
                        {!globalEdit ? <div
                            className="flex items-center justify-center hover:bg-indigo-50 gap-3 p-2 rounded-sm cursor-grab"
                            {...attributes}
                            {...listeners}
                        >
                            <GripVertical className="h-4 w-4" />
                            {index + 1}
                        </div>
                            :
                            <div
                                className="flex items-center justify-center hover:bg-indigo-50 gap-3 p-2 rounded-sm cursor-grab"
                            >
                                <GripVertical className="h-4 w-4" />
                                {index + 1}
                            </div>
                        }

                        <Input
                            className={`w-[180px] cursor-pointer no-underline `}
                            type="text"
                            readOnly={!editing}
                            placeholder="Participant name"
                            onChange={(e) => {
                                if (editing) {
                                    e.stopPropagation()
                                }
                                updateField("name", e.target.value)
                            }}
                            onClick={(e) => { if (editing) e.stopPropagation() }}
                            onKeyDown={(e) => {
                                if (editing && e.key === " ") {
                                    updateField("name", participantState.name + " ")
                                    e.preventDefault()
                                }
                            }}
                            value={participantState.name}
                        />

                        <div className="ml-4" >
                            {editing ?
                                <div className="flex gap-2">
                                    <div className="h-8 w-8 flex items-center justify-center bg-green-100 cursor-pointer rounded-sm" onClick={(e) => {
                                        handleUpdateParticipant()
                                        e.stopPropagation()
                                    }}>
                                        <Check className="h-4 w-4" />
                                    </div>
                                    <div className="h-8 w-8 flex items-center justify-center bg-stone-100 cursor-pointer rounded-sm" onClick={(e) => {
                                        handleCancelEditing()
                                        e.stopPropagation()
                                    }} >
                                        <X className="h-4 w-4 cursor-pointer" />
                                    </div>
                                    <div className="h-8 w-8 flex items-center justify-center bg-red-100 cursor-pointer rounded-sm" onClick={(e) => {
                                        handleDeleteParticipant()
                                        e.stopPropagation()
                                    }}>
                                        <Trash className="h-4 w-4 cursor-pointer" />
                                    </div>
                                </div> :
                                <div className="h-8 w-8 cursor-pointer flex items-center justify-center bg-stone-100 rounded-sm"
                                    onClick={(e) => {
                                        if (!globalEdit) {
                                            handleStartEditing()
                                            e.stopPropagation()
                                        }
                                    }}
                                >
                                    {globalEdit ? null : <Pencil className="h-4 w-4 cursor-pointer hover:text-blue-500" />}
                                </div>
                            }
                        </div>
                    </div>

                </AccordionTrigger>
                <AccordionContent className="px-4 pt-2 pb-4">
                    <div className="px-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="">
                                        <div className="flex items-center justify-center gap-1">
                                            #
                                        </div>
                                    </TableHead>
                                    <TableHead className="">
                                        <div className="">
                                            Name
                                        </div>
                                    </TableHead>
                                    <TableHead className="truncate">
                                        <div className="">
                                            ELTL ID
                                        </div>
                                    </TableHead>
                                    <TableHead className="">
                                        <div className="">
                                            Koht reitingus
                                        </div>
                                    </TableHead>

                                    <TableHead className="">
                                        <div className="">
                                            Synniaasta
                                        </div>
                                    </TableHead>
                                    <TableHead className="">
                                        <div className="">
                                            Valismangija
                                        </div>
                                    </TableHead>
                                    <TableHead className="">
                                        <div className="">
                                            Klubi
                                        </div>
                                    </TableHead>
                                    <TableHead className="">
                                        <div className="">
                                            Riik
                                        </div>
                                    </TableHead>
                                    <TableHead className="">
                                        <div className="">
                                            Sugu
                                        </div>
                                    </TableHead>

                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {participantState.players && participantState.players.map((_, idx) => (
                                    <PlayerRow key={idx} participant={participantState} index={idx} updateField={(field, value) => updateField(field, value)} />
                                ))}
                                <TableRow>
                                    <TableCell>
                                    </TableCell>
                                    <TableCell className="">
                                        <Input
                                            type="text"
                                            autoComplete='off'
                                            placeholder={"Nimi"}
                                        />
                                    </TableCell>
                                    <TableCell colSpan={6}></TableCell>
                                    <TableCell className="sticky right-0 p-3">
                                        <Button
                                            onClick={() => {

                                                console.log("adding new player")
                                                // handleUpdateParticipant()
                                            }}
                                        >
                                            {"Add"}{" "}
                                            <PlusCircle />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>

                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    )
}

interface Props {
    participant: Participant
    updateField: (field: string, value: any) => void
    index: number
}

function PlayerRow({ participant, index, updateField }: Props) {

    const [editing, setIsEditing] = useState(false)

    const [searchTerm, setSearchTerm] = useState("")
    const [fullName, setFullName] = useState('')

    const [popoverOpen, setPopoverOpen] = useState(false);
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const { data: playerSuggestions } =
        UseGetUsersDebounce(debouncedSearchTerm);

    // const { t } = useTranslation()

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
    }

    const handleStopEditing = () => {
        setIsEditing(false)
    }

    const handleSubmit = () => {
        console.log('submitting change')
        const nameParts = fullName.trim().split(/\s+/)

        if (nameParts.length > 0) {
            const firstName = nameParts[0]
            const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : ''

            updateField(`players.${index}.first_name`, firstName)
            updateField(`players.${index}.last_name`, lastName)
        }

        handleStopEditing()
    }

    return (
        <TableRow className="bg-card rounded-lg shadow-sm hover:shadow-md hover:bg-stone-100/40">
            <TableCell className="text-center ">
                {editing ?
                    <div className="flex gap-2">
                        <div className="h-8 w-8 flex items-center justify-center bg-green-100 cursor-pointer rounded-sm" onClick={handleSubmit} >
                            <Check className="h-4 w-4" />
                        </div>
                        <div className="h-8 w-8 flex items-center justify-center bg-stone-100 cursor-pointer rounded-sm" onClick={handleStopEditing}>

                            <X className="h-4 w-4 cursor-pointer" />
                        </div>
                        <div className="h-8 w-8 flex items-center justify-center bg-red-100 cursor-pointer rounded-sm" onClick={handleStopEditing}>

                            <Trash className="h-4 w-4 cursor-pointer" />
                        </div>
                    </div> :
                    <Pencil className="h-4 w-4 cursor-pointer" onClick={handleStartEditing} />
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
                                        updateField(`players.${index}.extra_data.club`, user.club_name)
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
                                    {capitalize(user.first_name)}{" "}
                                    {capitalize(user.last_name)}{" "}
                                    {user.eltl_id}
                                </div>
                            ))}
                        </PopoverContent>
                    }
                </Popover>
            </TableCell>
            <TableCell className="text-center">
                <Input className="w-[40px] p-0 disabled:p-0 disabled:bg-transparent disabled:border-none disabled:opacity-100 disabled:cursor-default disabled:text-stone-900" disabled placeholder="ELTL ID" value={participant.players[index].extra_data.eltl_id} />

            </TableCell>
            <TableCell className="text-center">
                <Input className="w-[60px] disabled:p-0 disabled:bg-transparent disabled:border-none disabled:opacity-100 disabled:cursor-default disabled:text-stone-900" disabled={!editing} placeholder="Rank" onChange={(e) => updateField(`players.${index}.rank`, Number(e.target.value))} value={participant.players[index].rank} />
            </TableCell>
            <TableCell className="text-center">
                <Input className="w-[120px] disabled:p-0 disabled:bg-transparent disabled:border-none disabled:opacity-100 disabled:cursor-default disabled:text-stone-900" type="date" disabled={!editing} placeholder="YOB" onChange={(e) => updateField(`players.${index}.created_at`, e.target.value)} value={participant.players[index].created_at} />
            </TableCell>
            <TableCell className="text-center">
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
            <TableCell className="text-center">
                <Input className="w-[160px] disabled:p-0 disabled:bg-transparent disabled:border-none disabled:opacity-100 disabled:cursor-default disabled:text-stone-900" disabled={!editing} placeholder="Club name" onChange={(e) => updateField(`players.${index}.extra_data.club`, e.target.value)} value={participant.players[index].extra_data.club} />
            </TableCell>
            <TableCell className="text-center">
                <Input className="w-[50px] disabled:p-0 disabled:bg-transparent disabled:border-none disabled:opacity-100 disabled:cursor-default disabled:text-stone-900" disabled={!editing} placeholder="Riik" onChange={(e) => updateField(`players.${index}.nationality`, e.target.value)} value={participant.players[index].nationality} />
            </TableCell>
            <TableCell className="text-center">
                <Select value={participant.players[index].sex} disabled={!editing} onValueChange={(value) => updateField(`players.${index}.sex`, value)}>
                    <SelectTrigger className="w-[80px] disabled:p-0 disabled:bg-transparent disabled:border-none disabled:opacity-100 disabled:cursor-default disabled:text-stone-900">
                        <SelectValue placeholder="Sex" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Sex</SelectLabel>
                            <SelectItem value="M">M</SelectItem>
                            <SelectItem value="N">N</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </TableCell>

        </TableRow>
    )
}

