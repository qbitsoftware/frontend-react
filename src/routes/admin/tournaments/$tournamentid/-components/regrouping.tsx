import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import React, { useEffect, useState } from 'react'
import { DndContext, DragEndEvent, KeyboardSensor, PointerSensor, TouchSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { Button } from '@/components/ui/button'
import RegroupDND from './regroup-dnd'
import { UseGetParticipantsQuery } from '@/queries/participants'
import { useParams } from '@tanstack/react-router'
import { UseRegroupMatches } from '@/queries/match'
import { Participant } from '@/types/participants'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

interface ReGroupingProps {
    isOpen: boolean
    onClose: () => void
    tournamentId: number
    state: string
}

const ReGrouping: React.FC<ReGroupingProps> = ({ isOpen, onClose, tournamentId, state }) => {
    const params = useParams({ strict: false })
    const { data } = UseGetParticipantsQuery(tournamentId, Number(params.groupid), true)
    const [participants, setParticipants] = useState<Participant[]>([])
    const useRegroupMutation = UseRegroupMatches(tournamentId, Number(params.groupid), true)
    const useFinalsMutation = UseRegroupMatches(tournamentId, Number(params.groupid), false, true)

    const { t } = useTranslation()

    useEffect(() => {
        if (data?.data) {
            setParticipants(data.data)
        }
    }, [isOpen, data?.data])

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        if (active.id !== over?.id) {
            const updatedParticipants = arrayMove(participants,
                participants.findIndex((item) => item.id === active.id),
                participants.findIndex((item) => item.id === over?.id)
            )
            setParticipants(updatedParticipants);
        }
    }


    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(TouchSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const onSubmit = async () => {
        try {
            if (state == "finals") {
                await useFinalsMutation.mutateAsync(participants)
            } else if (state == "regrouping") {
                await useRegroupMutation.mutateAsync(participants)
            }
            toast.message(t('toasts.participants.regroup_success'))
            onClose()
        } catch (error) {
            void error
            toast.error(t('toasts.participants.regroup_error'))
        }
    }



    return (
        <Dialog open={isOpen} onOpenChange={onClose} >
            <DialogContent className="max-w-4xl max-h-[80vh] md:max-h-[90vh] overflow-y-auto px-0 sm:px-2 md:px-4">
                <DialogHeader>
                    {state == "regrouping" ?
                        <DialogTitle>{t('admin.tournaments.groups.participants.regroup.title_regroup')}</DialogTitle>
                        : state == "finals" ?
                            <DialogTitle>{t('admin.tournaments.groups.participants.regroup.title_finals')}</DialogTitle> : ""
                    }
                    <DialogDescription>
                        {t('admin.tournaments.groups.participants.regroup.description')}
                    </DialogDescription>
                </DialogHeader>
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
                            <ul className="space-y-2">
                                {participants.map((participant, key) => (
                                    <RegroupDND key={participant.id} participant={participant} index={key} />
                                ))}
                            </ul>
                        </SortableContext>
                    </DndContext>
                </div>
                <Button onClick={onSubmit}>
                    {state == "regrouping" ? t('admin.tournaments.groups.participants.regroup.regroup_button') : state == "finals" ? t('admin.tournaments.groups.participants.regroup.final_button') : ""}
                </Button>
            </DialogContent>
        </Dialog>
    )
}

export default ReGrouping