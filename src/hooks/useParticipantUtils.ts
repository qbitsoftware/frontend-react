import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { UseCreateParticipants, UseUpdateParticipant, UseDeleteParticipant, UseChangeSubgroupName } from '@/queries/participants';
import { createParticipantUtils } from '@/routes/admin/tournaments/$tournamentid/grupid/$groupid/osalejad/-components/participant-utils';

export function useParticipantUtils(tournamentId: number, tableId: number) {
  const { t } = useTranslation();
  
  const createMutation = UseCreateParticipants(tournamentId, tableId);
  const updateMutation = UseUpdateParticipant(tournamentId, tableId);
  const deleteMutation = UseDeleteParticipant(tournamentId, tableId);
  const changeSubgroupMutation = UseChangeSubgroupName(tournamentId, tableId);
  
  return createParticipantUtils({
    tournamentId,
    tableId,
    createParticipantMutation: createMutation,
    updateParticipantMutation: updateMutation,
    deleteParticipantMutation: deleteMutation,
    changeSubgroupNameMutation: changeSubgroupMutation,
    onSuccess: (msg) => toast.message(t(msg)),
    onError: (msg) => toast.error(t(msg))
  });
}