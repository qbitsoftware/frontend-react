import { TournamentTable, DialogType } from '@/types/groups'
import { Participant } from '@/types/participants'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { ParticipantFormValues } from '../../../../-components/participant-forms/form-utils'
import { useTranslation } from 'react-i18next'
import { capitalizeWords, useDebounce } from '@/lib/utils'
import { UseGetUsersDebounce } from '@/queries/users'
import { closestCenter, DndContext, DragEndEvent, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { toast } from 'sonner'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { NewPlayer, NewPlayerFromName } from '@/types/players'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
import ParticipantDND from './participant-dnd'
import ParticipantHeader from './table-header'
import { GroupType, TTState } from '@/types/matches'
import { selectedTeams } from './new-double'

interface SoloParticipantsProps {
    participants: Participant[]
    group_participant?: Participant
    tournament_id: number
    tournament_table: TournamentTable
    setParticipantsState: Dispatch<SetStateAction<Participant[]>>
    addOrUpdateParticipant: (values: ParticipantFormValues, participantId?: string) => Promise<void>
    // Experimental
    selectedTeams?: selectedTeams | undefined
    setSelectedTeams?: (teams: selectedTeams) => void
    activeTab: number
    renderRR?: boolean
}

export default function SoloParticipants({ participants, group_participant, tournament_id, tournament_table, setParticipantsState, addOrUpdateParticipant, selectedTeams, setSelectedTeams, activeTab, renderRR }: SoloParticipantsProps) {

    const { t } = useTranslation()

    const [forceDisableOrdering, setForceDisableOrdering] = useState(false)
    const [disableOrderring, setDisableOrdering] = useState(false)

    const [searchTerm, setSearchTerm] = useState("")
    const [popoverOpen, setPopoverOpen] = useState(false);
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const { data: playerSuggestions } =
        UseGetUsersDebounce(debouncedSearchTerm);

    useEffect(() => {
        if (tournament_table.state >= TTState.TT_STATE_STARTED || (tournament_table.type === GroupType.DYNAMIC && renderRR)) {
            setForceDisableOrdering(true)
        }
    }, [tournament_table])

    useEffect(() => {
        if (debouncedSearchTerm) {
            const timeout = setTimeout(() => setPopoverOpen(true), 50);
            return () => clearTimeout(timeout);
        } else {
            setPopoverOpen(false);
        }
    }, [debouncedSearchTerm]);

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event
        if (active.id !== over?.id && over) {
            const activeIndex = participants.findIndex(p => p.id === active.id)
            const overIndex = participants.findIndex(p => p.id === over.id)

            const originalParticipants = [...participants]

            const part_to_update = participants[activeIndex]
            part_to_update.order = overIndex + 1

            try {
                if (activeIndex !== -1 && overIndex !== -1) {
                    const updatedParticipants = arrayMove([...participants], activeIndex, overIndex)
                    if (group_participant) {
                        setParticipantsState((prev) => {
                            const updatedParticipantsMap = new Map(
                                updatedParticipants.map((p, index) => [p.id, { ...p, order: index + 1 }])
                            );

                            const result = prev.map(participant => {
                                if (updatedParticipantsMap.has(participant.id)) {
                                    return updatedParticipantsMap.get(participant.id)!;
                                }
                                return participant;
                            }).sort((a, b) => a.order - b.order);

                            return result
                        });

                    } else {
                        setParticipantsState(updatedParticipants)
                    }
                }

                await addOrUpdateParticipant(part_to_update, part_to_update.id)
            } catch (error) {
                setParticipantsState(originalParticipants)
                toast.error(t("toasts.participants.updated_error"))
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


    return (
        <div className="mt-6">
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
                        <Table>
                            <ParticipantHeader />
                            <TableBody>
                                {participants && participants.map((participant, key) => (
                                    <ParticipantDND key={participant.id} participant={participant} index={key} disableOrdering={disableOrderring} setDisableOrdering={setDisableOrdering} tournament_id={tournament_id} tournament_table={tournament_table} participants_len={participants.length} forceDisableOrdering={forceDisableOrdering} selectedTeams={selectedTeams} setSelectedTeams={setSelectedTeams} renderRR={renderRR} />
                                ))}
                                {(() => {
                                    console.log(participants)
                                    if (tournament_table.dialog_type === DialogType.DT_DOUBLES || tournament_table.dialog_type === DialogType.DT_FIXED_DOUBLES) {
                                        return tournament_table.size > participants.length / 2;
                                    }
                                    return tournament_table.size > participants.length || group_participant || tournament_table.type == GroupType.DYNAMIC;
                                })() && <TableRow>
                                    <TableCell colSpan={2}></TableCell>
                                    <TableCell colSpan={6} className="p-4">
                                        <div className="flex gap-3 items-center max-w-xs">
                                            <div className="flex-1 min-w-0">
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
                                                            placeholder={t("admin.tournaments.groups.participants.actions.name_placeholder")}
                                                            value={searchTerm}
                                                            onChange={(e) => { setSearchTerm(e.target.value) }}
                                                            className="w-full"
                                                        />
                                                    </PopoverTrigger>
                                                    {playerSuggestions && playerSuggestions.data &&
                                                        <PopoverContent
                                                            className="p-0 w-[300px] max-h-[400px] overflow-y-auto suggestion-dropdown"
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
                                                                        const group_number = activeTab
                                                                        const group_name = activeTab === 1 ? GroupType.ROUND_ROBIN : tournament_table.second_class
                                                                        const new_participant: ParticipantFormValues = {
                                                                            name: `${capitalizeWords(user.first_name)} ${capitalizeWords(user.last_name)}`,
                                                                            players: [new_player],
                                                                            sport_type: "tabletennis",
                                                                            group: group_number,
                                                                            group_name: group_name,
                                                                            order: participants.length + 1,
                                                                            tournament_id,
                                                                            class: "",
                                                                            group_id: group_participant?.id,
                                                                        }

                                                                        setSearchTerm('')
                                                                        try {
                                                                            await addOrUpdateParticipant(new_participant)
                                                                            toast.message(t("toasts.participants.created"))
                                                                        } catch (error) {
                                                                            void error
                                                                            toast.error(t("toasts.participants.created_error"))
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
                                            </div>
                                            <Button
                                                onClick={async () => {
                                                    if (searchTerm.trim() === "") {
                                                        return
                                                    }
                                                    const nameParts = searchTerm.trim().split(/\s+/)
                                                    if (nameParts.length > 0) {
                                                        const firstName = nameParts[0]
                                                        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : ''
                                                        const newPlayer = NewPlayerFromName(searchTerm)
                                                        const group_number = activeTab
                                                        const group_name = activeTab === 1 ? GroupType.ROUND_ROBIN : tournament_table.second_class
                                                        const new_participant: ParticipantFormValues = {
                                                            name: `${capitalizeWords(firstName)} ${capitalizeWords(lastName)}`,
                                                            players: [newPlayer],
                                                            sport_type: "tabletennis",
                                                            group: group_number,
                                                            group_name: group_name,
                                                            order: participants.length + 1,
                                                            tournament_id,
                                                            class: "",
                                                            group_id: group_participant?.id,
                                                        }
                                                        setSearchTerm('')
                                                        try {
                                                            await addOrUpdateParticipant(new_participant)
                                                            toast.message(t("toasts.participants.created"))
                                                        } catch (error) {
                                                            void error
                                                            toast.error(t("toasts.participants.created_error"))
                                                        }
                                                    }
                                                }
                                                }
                                                className="flex-shrink-0"
                                                size="sm"
                                            >
                                                {t("admin.tournaments.groups.participants.actions.submit")}{" "}
                                                <PlusCircle />
                                            </Button>
                                        </div>
                                    </TableCell>
                                    <TableCell colSpan={3}></TableCell>
                                </TableRow>
                                }
                            </TableBody>
                        </Table>
                    </SortableContext>
                </DndContext>
            </div>
        </div >

    )
}

