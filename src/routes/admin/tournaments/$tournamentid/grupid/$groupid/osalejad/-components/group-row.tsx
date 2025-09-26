import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { useParticipantUtils } from "@/hooks/useParticipantUtils"
import { capitalizeWords, useDebounce } from "@/lib/utils"
import { UseGetUsersDebounce } from "@/queries/users"
import { Participant } from "@/types/participants"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Check, GripVertical, Pencil, PlusCircle, Trash, X } from "lucide-react"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import PlayerRow from "./player-row"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { NewPlayer, NewPlayerFromName, Player } from "@/types/players"
import { Button } from "@/components/ui/button"
import ParticipantHeader from "./table-header"
import EditImgModal from "../../../../-components/edit-img-modal"
import { DialogType, TournamentTable } from "@/types/groups"
import { NewPlayerDialog } from "./new-player-dialog"
import { TTState } from "@/types/matches"

interface GroupRowProps {
    participant: Participant
    index: number
    tournament_id: number
    tournament_table: TournamentTable
    globalEdit: boolean
    setGlobalEdit: (value: boolean) => void
    forceDisableOrdering: boolean
}

export default function GroupRow({ participant, index, tournament_id, tournament_table, globalEdit, setGlobalEdit, forceDisableOrdering }: GroupRowProps) {
    const { addOrUpdateParticipant, deleteParticipant } = useParticipantUtils(tournament_id, tournament_table.id)
    const { t } = useTranslation()

    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: participant.id })
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    const [editing, setIsEditing] = useState(false)
    const [newPlayerDialogOpen, setNewPlayerDialogOpen] = useState(false)
    const [newPlayer, setNewPlayer] = useState<Player | null>(null)

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

    const handleDeleteParticipant = async () => {
        try {
            await deleteParticipant(participantState)
            setIsEditing(false)
            setGlobalEdit(false)
            toast.message(t("toasts.participants.deleted"))
        } catch (error) {
            void error
            toast.error(t("toasts.participants.deleted_error"))
        }
    }

    const handleUpdateParticipant = async () => {
        try {
            await addOrUpdateParticipant(participantState, participantState.id)
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

    const [searchTerm, setSearchTerm] = useState("")
    const [popoverOpen, setPopoverOpen] = useState(false);
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    useEffect(() => {
        if (debouncedSearchTerm) {
            const timeout = setTimeout(() => setPopoverOpen(true), 50);
            return () => clearTimeout(timeout);
        } else {
            setPopoverOpen(false);
        }
    }, [debouncedSearchTerm]);


    const { data: playerSuggestions } =
        UseGetUsersDebounce(debouncedSearchTerm);


    const [isExpanded, setIsExpanded] = useState(!(tournament_table.dialog_type === DialogType.DT_DOUBLES || tournament_table.dialog_type === DialogType.DT_FIXED_DOUBLES))

    return (
        <>
            <div className="w-full mb-4 border rounded-md shadow-sm bg-white" ref={setNodeRef} style={style}>
                {/* Team Header Row */}
                <div className="flex items-center justify-between px-3 bg-gray-50/50 border-b hover:bg-gray-100/50 transition-colors">
                    <div className="flex items-center space-x-2">
                        {!globalEdit && !forceDisableOrdering ? <div
                            className="flex items-center justify-center hover:bg-indigo-50 gap-1 p-1 rounded-sm cursor-grab"
                            {...attributes}
                            {...listeners}
                        >
                            <GripVertical className="h-3 w-3" />
                            <span className="text-xs font-medium">{index + 1}</span>
                        </div>
                            :
                            <div className="flex items-center justify-center hover:bg-indigo-50 gap-1 p-1 rounded-sm cursor-default">
                                <GripVertical className="h-3 w-3" />
                                <Input className="w-[30px] h-5 text-xs p-0 disabled:p-0 disabled:bg-transparent disabled:border-none disabled:opacity-100 disabled:cursor-default disabled:text-stone-900" disabled={!editing || forceDisableOrdering} placeholder="Pos" value={participantState.order}
                                    onChange={(e) => {
                                        const newValue = Number(e.target.value);
                                        const participants_len = 10
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
                            </div>
                        }
                        <Input
                            className={`w-[200px] h-6 text-sm font-medium bg-transparent border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-white ${!editing ? 'cursor-default' : ''}`}
                            type="text"
                            readOnly={!editing}
                            placeholder="Team name"
                            onChange={(e) => updateField("name", e.target.value)}
                            value={participantState.name}
                        />
                        <div className="ml-2">
                            {editing ?
                                <div className="flex gap-1">
                                    <div className="h-5 w-5 flex items-center justify-center bg-green-100 cursor-pointer rounded-sm" onClick={handleUpdateParticipant}>
                                        <Check className="h-3 w-3" />
                                    </div>
                                    <div className="h-5 w-5 flex items-center justify-center bg-stone-100 cursor-pointer rounded-sm" onClick={handleCancelEditing}>
                                        <X className="h-3 w-3 cursor-pointer" />
                                    </div>
                                    {tournament_table.state < TTState.TT_STATE_MATCHES_ASSIGNED &&
                                        <div className="h-5 w-5 flex items-center justify-center bg-red-100 cursor-pointer rounded-sm" onClick={handleDeleteParticipant}>
                                            <Trash className="h-3 w-3 cursor-pointer" />
                                        </div>
                                    }
                                </div> : !globalEdit ?
                                    <div className="h-5 w-5 cursor-pointer flex items-center justify-center bg-stone-100 rounded-sm"
                                        onClick={() => {
                                            if (!globalEdit) {
                                                handleStartEditing()
                                            }
                                        }}
                                    >
                                        <Pencil className="h-3 w-3 cursor-pointer hover:text-blue-500" />
                                    </div> : null
                            }
                        </div>
                        {tournament_table.dialog_type !== DialogType.DT_DOUBLES && tournament_table.dialog_type !== DialogType.DT_FIXED_DOUBLES && (
                            <EditImgModal id={participantState.id} playerName={participantState.name} img={participant.extra_data.image_url} type="participant" />
                        )}
                    </div>

                    {/* Collapse/Expand Button */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="h-6 w-6 p-0"
                    >
                        {isExpanded ? <X className="h-3 w-3" /> : <PlusCircle className="h-3 w-3" />}
                    </Button>
                </div>

                {/* Players Section - Show by default */}
                {isExpanded && (
                    <div className="px-3 py-2">
                        <Table>
                            <ParticipantHeader team={true} />
                            <TableBody>
                                {participantState.players && participantState.players.sort((a, b) => b.extra_data.rate_points - a.extra_data.rate_points).map((player, idx) => (
                                    <PlayerRow key={idx} player={player} participant={participantState} index={idx} updateField={(field, value) => updateField(field, value)} tournament_id={tournament_id} tournament_table={tournament_table} />
                                ))}
                                {(tournament_table.dialog_type === DialogType.DT_DOUBLES || tournament_table.dialog_type === DialogType.DT_FIXED_DOUBLES) && participantState.players && participantState.players.length >= 2 ? null : (
                                    <TableRow className="border-l-4 border-l-gray-200 bg-gray-50/20 h-7">
                                        <TableCell className="py-0.5 px-2 pl-5"></TableCell>
                                        <TableCell className="py-0.5 px-2">
                                            <Popover
                                                open={popoverOpen}
                                                onOpenChange={(open) => {
                                                    setPopoverOpen(open)
                                                }}
                                            >
                                                <PopoverTrigger asChild>
                                                    <Input
                                                        type="text"
                                                        autoComplete='off'
                                                        placeholder={"Add player name"}
                                                        value={searchTerm}
                                                        onChange={(e) => { setSearchTerm(e.target.value) }}
                                                        className="min-w-[120px] max-w-[200px] h-8 text-xs"
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
                                                        {playerSuggestions && playerSuggestions.data.map((user, i) => (
                                                            <div
                                                                key={i}
                                                                className="px-3 py-2 cursor-pointer hover:bg-accent"
                                                                onClick={async () => {
                                                                    setPopoverOpen(false)
                                                                    const new_player = NewPlayer(user)
                                                                    const currentPlayers = participantState.players || []
                                                                    const updatedPlayers = [...currentPlayers, new_player]

                                                                    setSearchTerm('')
                                                                    try {
                                                                        const updatedParticipant = {
                                                                            ...participantState,
                                                                            players: updatedPlayers
                                                                        }
                                                                        await addOrUpdateParticipant(updatedParticipant, participantState.id)
                                                                        setParticipantState(prev => ({
                                                                            ...prev,
                                                                            players: updatedPlayers
                                                                        }))
                                                                        toast.message(t("toasts.participants.updated"))
                                                                    } catch (error) {
                                                                        setParticipantState(prev => ({
                                                                            ...prev,
                                                                            players: currentPlayers
                                                                        }))
                                                                        void error
                                                                        toast.error(t("toasts.participants.updated_error"))
                                                                    }
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
                                        <TableCell colSpan={6} className="py-0.5 px-2"></TableCell>
                                        <TableCell className="py-0.5 px-2">
                                            <Button
                                                className="text-sm"
                                                onClick={async () => {
                                                    if (searchTerm.trim() === "") {
                                                        return
                                                    }
                                                    const nameParts = searchTerm.trim().split(/\s+/)
                                                    if (nameParts.length > 0) {
                                                        const new_player = NewPlayerFromName(searchTerm)
                                                        setNewPlayer(new_player)
                                                        setNewPlayerDialogOpen(true)
                                                    }
                                                }}
                                                size="sm"
                                            >
                                                {t("admin.tournaments.groups.participants.actions.submit")}{" "}
                                                <PlusCircle />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>
            {newPlayer && <NewPlayerDialog
                isOpen={newPlayerDialogOpen}
                onOpenChange={setNewPlayerDialogOpen}
                player={newPlayer}
                onPlayerUpdate={async (updatedPlayer) => {
                    setNewPlayer(updatedPlayer);
                    const currentPlayers = participantState.players || []
                    const updatedPlayers = [...currentPlayers, updatedPlayer]

                    setSearchTerm('')
                    setNewPlayer(null)
                    try {
                        const updatedParticipant = {
                            ...participantState,
                            players: updatedPlayers
                        }

                        await addOrUpdateParticipant(updatedParticipant, participantState.id)
                        setParticipantState(prev => ({
                            ...prev,
                            players: updatedPlayers
                        }))
                        toast.message(t("toasts.participants.updated"))
                    } catch (error) {
                        setParticipantState(prev => ({
                            ...prev,
                            players: currentPlayers
                        }))

                        void error
                        toast.error(t("toasts.participants.updated_error"))
                    }
                }}
            />
            }

        </>
    )
}

