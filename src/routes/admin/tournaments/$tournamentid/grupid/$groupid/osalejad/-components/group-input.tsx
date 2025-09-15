import { Input } from '@/components/ui/input'
import { useParticipantUtils } from '@/hooks/useParticipantUtils'
import { TournamentTable } from '@/types/groups'
import { TTState } from '@/types/matches'
import { Participant } from '@/types/participants'
import { Trash } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

interface GroupInputProps {
    group: Participant
    tournament_id: number
    tournament_table: TournamentTable
}

export default function GroupInput({ group, tournament_id, tournament_table }: GroupInputProps) {
    const { addOrUpdateParticipant, deleteParticipant } = useParticipantUtils(tournament_id, tournament_table.id)
    const [groupName, setGroupName] = useState(group.name)
    useEffect(() => {
        setGroupName(group.name)
    }, [group.name])
    const { t } = useTranslation()

    const handleNameChange = async () => {
        try {
            if (groupName === "") return
            await addOrUpdateParticipant({ ...group, name: groupName }, group.id)
            toast.message(t("toasts.participants.updated"))
        } catch (error) {
            void error;
            toast.error(t("toasts.participants.updated_error"))
        }
    }

    const handleDeleteGroup = async () => {
        try {
            await deleteParticipant(group)
            toast.message(t("toasts.participants.deleted"))
        } catch (error) {
            void error
            toast.error(t("toasts.participants.deleted_error"))
        }
    }

    return (
        <div className=''>
            <div className="flex justify-between items-center  bg-[#062842] py-2 rounded-l-sm pr-2">
                <h3 className="text-xl font-semibold px-2 ">
                    <Input
                        placeholder={`${t('admin.tournaments.groups.participants.new_group')} ${group.order}`}
                        className="text-lg"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        onBlur={handleNameChange}
                    />
                </h3>
                {tournament_table.state < TTState.TT_STATE_MATCHES_CREATED &&
                    <Trash
                        className="h-6 w-6 text-red-500 cursor-pointer hover:text-red-700"
                        onClick={handleDeleteGroup}
                    />
                }
            </div>
        </div>
    )
}
