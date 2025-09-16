import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "./axiosconf";
import { ParticipantFormValues } from "@/routes/admin/tournaments/$tournamentid/-components/participant-forms/form-utils";
import { Participant } from "@/types/participants";
import { selectedTeams } from "@/routes/admin/tournaments/$tournamentid/grupid/$groupid/osalejad/-components/new-double";
import { TournamentTableWithStagesResponse } from "./tables";
import { TableInfoResponse } from "./match";

export type ParticipantResponse = {
    data: Participant | null
    message: string;
    error: string | null
}

export type ParticipantsResponse = {
    data: Participant[] | null
    message: string;
    error: string | null
}

export function UseGetTournamentParticipantsQuery(tournament_id: number) {
    return useQuery<ParticipantsResponse>({
        queryKey: ["participants_query", tournament_id],
        queryFn: async () => {
            const { data } = await axiosInstance.get(`/api/v1/tournaments/${tournament_id}/participants`, {
                withCredentials: true,
            })
            return data;
        }
    })
}


export function UseGetParticipantsQuery(tournament_id: number, table_id: number, regrouped: boolean = false, initialData?: ParticipantsResponse) {
    return useQuery<ParticipantsResponse>({
        queryKey: ["participants", table_id],
        initialData,
        queryFn: async () => {
            const { data } = await axiosInstance.get(`/api/v1/tournaments/${tournament_id}/tables/${table_id}/participants?regrouped=${regrouped}`, {
                withCredentials: true,
            })
            return data;
        }
    })
}


export function UseCreateParticipants(tournament_id: number, table_id: number) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (formData: ParticipantFormValues): Promise<ParticipantsResponse> => {
            const { data } = await axiosInstance.post(`/api/v1/tournaments/${tournament_id}/tables/${table_id}/participants`, formData, {
                withCredentials: true,
            })
            return data;
        },
        onSuccess: (data: ParticipantsResponse) => {
            queryClient.setQueryData(["tournament_table", table_id],
                (oldData: TournamentTableWithStagesResponse) => {
                    if (oldData.data && data.data) {
                        return {
                            ...oldData,
                            data: {
                                ...oldData.data,
                                participants: data.data
                            }
                        }
                    }
                    return oldData
                }
            )
        }
    })
}

type UpdateParticipantArgs = {
    formData: ParticipantFormValues;
    participantId: string;
}

export function UseUpdateParticipant(tournament_id: number, table_id: number) {
    const queryClient = useQueryClient()

    return useMutation<ParticipantsResponse, Error, UpdateParticipantArgs>({
        mutationFn: async ({ formData, participantId }) => {
            const { data } = await axiosInstance.patch(
                `/api/v1/tournaments/${tournament_id}/tables/${table_id}/participants/${participantId}`,
                formData,
                { withCredentials: true }
            )
            return data
        },
        onSuccess: (data: ParticipantsResponse) => {
            queryClient.setQueryData(["tournament_table", table_id],
                (oldData: TournamentTableWithStagesResponse) => {
                    if (oldData.data && data.data) {
                        return {
                            ...oldData,
                            data: {
                                ...oldData.data,
                                participants: data.data
                            }
                        }
                    }
                    return oldData
                }
            )
        }
    })
}

export function UseDeleteParticipant(tournament_id: number, table_id: number) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (participantId: string) => {
            const { data } = await axiosInstance.delete(`/api/v1/tournaments/${tournament_id}/tables/${table_id}/participants/${participantId}`, {
                withCredentials: true,
            })
            return data;
        },
        onSuccess: (data: ParticipantsResponse) => {
            // Update cache by filtering out the deleted participant
            queryClient.setQueryData(["tournament_table", table_id], (oldData: TournamentTableWithStagesResponse) => {
                if (oldData && oldData.data && data.data) {
                    return {
                        ...oldData,
                        data: {
                            ...oldData.data,
                            participants: data.data
                        }
                    }
                }
                return oldData
            })
        }
    })
}

export type Order = {
    order: string
}

export function UsePostSeeding(tournament_id: number, table_id: number) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (order: Order) => {
            const { data } = await axiosInstance.post(`/api/v1/tournaments/${tournament_id}/tables/${table_id}/participants/seed`, order, {
                withCredentials: true,
            })
            return data;
        },
        onSuccess: (data: TableInfoResponse) => {
            queryClient.setQueryData(["tournament_table", table_id], (oldData: TournamentTableWithStagesResponse) => {
                if (!oldData) return data;
                return {
                    ...oldData,
                    data: {
                        ...oldData.data,
                        group: data.data ? data.data.tournament_table : oldData.data.group,
                    }
                }
            })
        }
    })
}

export function UsePostOrder(tournament_id: number, table_id: number) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async () => {
            const { data } = await axiosInstance.post(`/api/v1/tournaments/${tournament_id}/tables/${table_id}/participants/order?order=rating`, {}, {
                withCredentials: true,
            })
            return data;
        },
        onSuccess: (data: ParticipantsResponse) => {
            queryClient.setQueryData(["tournament_table", table_id],
                (oldData: TournamentTableWithStagesResponse) => {
                    if (!oldData || !oldData.data) return oldData;
                    return {
                        ...oldData,
                        data: {
                            ...oldData.data,
                            participants: data.data ? data.data : oldData.data.participants
                        }
                    }
                }
            )
        },
    })
}



export function UsePostOrderReset(tournament_id: number, table_id: number) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async () => {
            const { data } = await axiosInstance.post(`/api/v1/tournaments/${tournament_id}/tables/${table_id}/reset`, {}, {
                withCredentials: true,
            })
            return data;
        },
        onSuccess: (data: TournamentTableWithStagesResponse) => {
            queryClient.setQueryData(["tournament_table", table_id], (oldData: TournamentTableWithStagesResponse) => {
                if (data) {
                    return data
                }
                return oldData
            })
        },
    })
}

export function UseImportParticipants(tournament_id: number, table_id: number) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append('excel_file', file);

            const { data } = await axiosInstance.post(
                `/api/v1/tournaments/${tournament_id}/tables/${table_id}/participants/import`,
                formData,
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            )
            return data;
        },
        onSuccess: (new_data: ParticipantsResponse) => {
            queryClient.setQueryData(["tournament_table", table_id], (oldData: TournamentTableWithStagesResponse) => {
                if (!oldData || !oldData.data) return oldData;
                return {
                    ...oldData,
                    data: {
                        ...oldData.data,
                        participants: new_data.data ? new_data.data : oldData.data.participants
                    }
                };
            })
        }
    })
}

export function UsePostParticipantMerge(tournament_id: number, table_id: number) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (formdata: selectedTeams) => {
            const { data } = await axiosInstance.post(`/api/v1/tournaments/${tournament_id}/tables/${table_id}/participants/merge`, formdata, {
                withCredentials: true,
            })
            return data;
        },
        onSuccess: (data: ParticipantsResponse) => {
            queryClient.setQueryData(["tournament_table", table_id],
                (oldData: TournamentTableWithStagesResponse) => {
                    if (!oldData || !oldData.data) return oldData;
                    return {
                        ...oldData,
                        data: {
                            ...oldData.data,
                            participants: data.data ? data.data : oldData.data.participants
                        }
                    }
                }
            )
        },
    })
}

export function UsePostParticipantJoin(tournament_id: number, table_id: number, type: 'dynamic' | 'doubles') {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async () => {
            const { data } = await axiosInstance.post(`/api/v1/tournaments/${tournament_id}/tables/${table_id}/participants/join?type=${type}`, {}, {
                withCredentials: true,
            })
            return data;
        },
        onSuccess: (data: ParticipantsResponse) => {
            queryClient.setQueryData(["tournament_table", table_id],
                (oldData: TournamentTableWithStagesResponse) => {
                    if (!oldData || !oldData.data) return oldData;
                    return {
                        ...oldData,
                        data: {
                            ...oldData.data,
                            participants: data.data ? data.data : oldData.data.participants
                        }
                    }
                }
            )
        },
    })
}

export function UsePostParticipantMove(tournament_id: number, table_id: number) {
    return useMutation({
        mutationFn: async () => {
            const { data } = await axiosInstance.post(`/api/v1/tournaments/${tournament_id}/tables/${table_id}/move_participants`, {}, {
                withCredentials: true,
            })
            return data;
        },
    })
}

export function UsePostParticipantRegister(tournament_id: number, table_id: number, participant_id: string, player_id: string) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async () => {
            const { data } = await axiosInstance.post(`/api/v1/tournaments/${tournament_id}/tables/${table_id}/participants/${participant_id}/player/${player_id}/register`, {}, {
                withCredentials: true,
            })
            return data;
        },
        onSuccess: (data: { data: number, message: string, error: any }) => {
            queryClient.setQueryData(["tournament_table", table_id], (oldData: TournamentTableWithStagesResponse) => {
                if (!oldData || !oldData.data) return oldData;
                const updatedParticipants = oldData.data.participants.map(participant => {
                    if (participant.id === participant_id) {
                        const updatedPlayers = participant.players.map(player => {
                            if (player.id === player_id) {
                                return { ...player, registration_id: data.data };
                            }
                            return player;
                        });
                        return { ...participant, players: updatedPlayers };
                    }
                    return participant;
                });
                return {
                    ...oldData,
                    data: {
                        ...oldData.data,
                        participants: updatedParticipants
                    }
                };
            })
        }
    })
}

export function UsePostParticipantUnregister(tournament_id: number, table_id: number, participant_id: string, player_id: string) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (registration_id: number) => {
            const { data } = await axiosInstance.post(`/api/v1/tournaments/${tournament_id}/tables/${table_id}/participants/${participant_id}/player/${player_id}/unregister/${registration_id}`, {}, {
                withCredentials: true,
            })
            return data;
        },
        onSuccess: () => {
            queryClient.setQueryData(["tournament_table", table_id], (oldData: TournamentTableWithStagesResponse) => {
                if (!oldData || !oldData.data) return oldData;
                const updatedParticipants = oldData.data.participants.map(participant => {
                    if (participant.id === participant_id) {
                        const updatedPlayers = participant.players.map(player => {
                            if (player.id === player_id) {
                                return { ...player, registration_id: undefined };
                            }
                            return player;
                        });
                        return { ...participant, players: updatedPlayers };
                    }
                    return participant;
                });
                return {
                    ...oldData,
                    data: {
                        ...oldData.data,
                        participants: updatedParticipants
                    }
                };
            })
        }
    })
}