import { DEFAULT_PLAYER } from "@/types/players";
import { ParticipantFormValues } from "../../../../-components/participant-forms/form-utils";
import { ParticipantResponse, ParticipantsResponse } from "@/queries/participants";
import { Participant } from "@/types/participants";
import { UseMutationResult } from "@tanstack/react-query";

export interface ParticipantUtils {
    addOrUpdateParticipant: (values: ParticipantFormValues, participantId?: string) => Promise<void>;
    deleteParticipant: (participant: Participant) => Promise<void>;
}

export function createParticipantUtils({
    tournamentId,
    tableId,
    createParticipantMutation,
    updateParticipantMutation,
    deleteParticipantMutation,
    changeSubgroupNameMutation,
    onSuccess,
    onError
}: {
    tournamentId: number;
    tableId: number;
    createParticipantMutation: UseMutationResult<ParticipantResponse, Error, ParticipantFormValues>;
    updateParticipantMutation: UseMutationResult<ParticipantsResponse, Error, { formData: ParticipantFormValues, participantId: string }>;
    deleteParticipantMutation: UseMutationResult<ParticipantResponse, Error, string>;
    changeSubgroupNameMutation: UseMutationResult<ParticipantResponse, Error, { participant_ids: string[], group_name: string }>;
    onSuccess?: (message: string) => void;
    onError?: (message: string) => void;
}): ParticipantUtils {

    const addOrUpdateParticipant = async (
        values: ParticipantFormValues,
        participantId?: string
    ) => {
        if (participantId) {
            await updateParticipantMutation.mutateAsync({
                formData: values,
                participantId,
            });
            // toast.message(t("toasts.participants.updated"))
        } else {
            await createParticipantMutation.mutateAsync(values);
            // toast.message(t("toasts.participants.created"))
        }

    };

    const deleteParticipant = async (participant: Participant) => {
            await deleteParticipantMutation.mutateAsync(participant.id);
            //    toast.message(t("toasts.participants.deleted"))
            // toast.error(t("toasts.participants.deleted_error"))
    };




    return {
        addOrUpdateParticipant,
        deleteParticipant,
    };
}
