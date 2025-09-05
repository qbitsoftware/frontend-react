import { ParticipantFormValues } from "../../../../-components/participant-forms/form-utils";
import { ParticipantResponse, ParticipantsResponse } from "@/queries/participants";
import { Participant } from "@/types/participants";
import { UseMutationResult } from "@tanstack/react-query";

export interface ParticipantUtils {
    addOrUpdateParticipant: (values: ParticipantFormValues, participantId?: string) => Promise<void>;
    deleteParticipant: (participant: Participant) => Promise<void>;
    addNewRoundRobinGroup: (order: number, tournament_id: number) => Promise<void>
}

export const getFirstAndLastName = (fullName: string): { firstName: string; lastName: string } => {
    const parts = fullName.trim().split(' ').filter(part => part.length > 0);
    if (parts.length === 0) return { firstName: '', lastName: '' };
    if (parts.length === 1) return { firstName: parts[0], lastName: '' };

    const firstName = parts.slice(0, -1).join(' ');
    const lastName = parts[parts.length - 1];

    return { firstName, lastName };
}

export function createParticipantUtils({
    createParticipantMutation,
    updateParticipantMutation,
    deleteParticipantMutation,
}: {
    createParticipantMutation: UseMutationResult<ParticipantResponse, Error, ParticipantFormValues>;
    updateParticipantMutation: UseMutationResult<ParticipantsResponse, Error, { formData: ParticipantFormValues, participantId: string }>;
    deleteParticipantMutation: UseMutationResult<ParticipantResponse, Error, string>;
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
        } else {
            await createParticipantMutation.mutateAsync(values);
        }

    };

    const addNewRoundRobinGroup = async (order: number, tournament_id: number) => {
        const new_participant: ParticipantFormValues = {
            name: "",
            type: "round_robin",
            order: order,
            sport_type: "tabletennis",
            tournament_id,
            group: 0,
            group_name: "",
            players: [],
        };
        await createParticipantMutation.mutateAsync(new_participant);
    };

    const deleteParticipant = async (participant: Participant) => {
        await deleteParticipantMutation.mutateAsync(participant.id);
    };

    return {
        addOrUpdateParticipant,
        deleteParticipant,
        addNewRoundRobinGroup,
    };
}

interface GroupedParticipants {
    groupParticipant: Participant
    participants: Participant[]
}

export function filterGroups(participants: Participant[]): GroupedParticipants[] {
    const groupedParticipants: GroupedParticipants[] = [];
    const groups = participants.filter((participant) => participant.type === "round_robin")
    for (const participant of groups) {
        const groupParticipants = participants.filter((p) => p.group_id === participant.id)
        groupedParticipants.push({
            groupParticipant: participant,
            participants: groupParticipants,
        });
    }

    return groupedParticipants;
}