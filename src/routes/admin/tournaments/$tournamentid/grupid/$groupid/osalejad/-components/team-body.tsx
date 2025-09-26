import { useParticipantUtils } from "@/hooks/useParticipantUtils"
import { DialogType, TournamentTable } from "@/types/groups"
import { Participant } from "@/types/participants"
import { closestCenter, DndContext, DragEndEvent, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { ParticipantFormValues } from "../../../../-components/participant-forms/form-utils"
import { toast } from 'sonner'
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import { GroupType, TTState } from "@/types/matches"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import GroupRow from "./group-row"

interface NewTeamProps {
    tournament_id: number
    tournament_table: TournamentTable
    participants: Participant[]
    group_participant?: Participant
    setParticipantsState: Dispatch<SetStateAction<Participant[]>>
    highLightInput?: boolean
}

export default function TeamParticipants({ tournament_id, tournament_table, participants, setParticipantsState, group_participant, highLightInput }: NewTeamProps) {
    const { addOrUpdateParticipant } = useParticipantUtils(tournament_id, tournament_table.id)
    const [globalEdit, setGlobalEdit] = useState(false)
    const [forceDisableOrdering, setForceDisableOrdering] = useState(tournament_table.state >= TTState.TT_STATE_STARTED)
    const [inputHidden, setInputHidden] = useState(false)

    const inputElem = useRef<HTMLInputElement>(null)
    const { t } = useTranslation()


    useEffect(() => {
        if (tournament_table.state >= TTState.TT_STATE_STARTED) {
            setForceDisableOrdering(true)
        } else {
            setForceDisableOrdering(false)
        }
        if ((tournament_table.size > participants.length) && tournament_table.state < TTState.TT_STATE_MATCHES_ASSIGNED && tournament_table.dialog_type !== DialogType.DT_DOUBLES && tournament_table.dialog_type !== DialogType.DT_FIXED_DOUBLES) {
            setInputHidden(false)
        } else {
            setInputHidden(true)
        }
    }, [tournament_table])

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(TouchSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const handleAddParticipant = async () => {
        if (!inputElem || !inputElem.current || inputElem.current.value.trim() === "") {
            return
        }
        const new_participant: ParticipantFormValues = {
            name: inputElem.current.value,
            tournament_id,
            sport_type: "tabletennis",
            order: participants.length + 1,
            group_id: group_participant?.id,
            players: [],
            group: 1,
        }
        try {
            await addOrUpdateParticipant(new_participant)
            toast.message(t("toasts.participants.created"))
            inputElem.current.value = ""
        } catch (error) {
            toast.error(t("toasts.participants.created_error"))
        }
    }

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
                addOrUpdateParticipant(part_to_update, part_to_update.id)
            } catch (error) {
                void error
                setParticipantsState(originalParticipants)
                toast.error(t("toasts.participants.updated_error"))
            }

        }
    }

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
                        {participants && participants.map((participant, key) => (
                            <GroupRow key={participant.id} participant={participant} index={key} tournament_id={tournament_id} tournament_table={tournament_table} globalEdit={globalEdit} setGlobalEdit={setGlobalEdit} forceDisableOrdering={forceDisableOrdering} />
                        ))}

                    </SortableContext>
                </DndContext>
                {((tournament_table.type != GroupType.ROUND_ROBIN && tournament_table.type != GroupType.ROUND_ROBIN_FULL_PLACEMENT) && !inputHidden && <div className="flex gap-2 mt-2 max-w-xs">
                    <div className="flex-1 min-w-0">
                        <Input
                            type="text"
                            autoComplete='off'
                            placeholder={t("admin.tournaments.groups.participants.actions.add_team")}
                            ref={inputElem}
                            className={`w-full transition-all duration-300 ${highLightInput
                                ? 'border-blue-500 ring-2 ring-blue-200 shadow-lg'
                                : ''
                                }`}

                        />
                    </div>
                    <Button
                        onClick={handleAddParticipant}
                        className="flex-shrink-0"
                        size="sm"
                    >
                        {t("admin.tournaments.groups.participants.actions.submit")}{" "}
                        <PlusCircle />
                    </Button>

                </div>
                )}
                {(tournament_table.type == GroupType.ROUND_ROBIN || tournament_table.type == GroupType.ROUND_ROBIN_FULL_PLACEMENT) && tournament_table.state < TTState.TT_STATE_MATCHES_CREATED &&
                    <div className="flex gap-2 mt-2 max-w-xs">
                        <div className="flex-1 min-w-0">
                            <Input
                                type="text"
                                autoComplete='off'
                                placeholder={t("admin.tournaments.groups.participants.actions.add_team")}
                                ref={inputElem}
                                className={`w-full transition-all duration-300 ${highLightInput
                                    ? 'border-blue-500 ring-2 ring-blue-200 shadow-lg'
                                    : ''
                                    }`}
                            />
                        </div>
                        <Button
                            onClick={handleAddParticipant}
                            className="flex-shrink-0"
                            size="sm"
                        >
                            {t("admin.tournaments.groups.participants.actions.submit")}{" "}
                            <PlusCircle />
                        </Button>

                    </div>
                }
            </div>

        </div >
    )

}