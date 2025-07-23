import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "./axiosconf";
import { ParticipantFormValues } from "@/routes/admin/tournaments/$tournamentid/-components/participant-forms/form-utils";
import { Participant } from "@/types/participants";
import { selectedTeams } from "@/routes/admin/tournaments/$tournamentid/grupid/$groupid/osalejad/-components/new-double";

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

export function UseGetTournamentParticipants(tournament_id: number) {
    return queryOptions<ParticipantsResponse>({
        queryKey: ["participants", tournament_id],
        queryFn: async () => {
            const { data } = await axiosInstance.get(`/api/v1/tournaments/${tournament_id}/participants`, {
                withCredentials: true,
            })
            return data;
        }
    })
}


export function UseGetParticipants(tournament_id: number, table_id: number) {
    return queryOptions<ParticipantsResponse>({
        queryKey: ["participants", table_id],
        queryFn: async () => {
            const { data } = await axiosInstance.get(`/api/v1/tournaments/${tournament_id}/tables/${table_id}/participants`, {
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
        mutationFn: async (formData: ParticipantFormValues): Promise<ParticipantResponse> => {
            const { data } = await axiosInstance.post(`/api/v1/tournaments/${tournament_id}/tables/${table_id}/participants`, formData, {
                withCredentials: true,
            })
            return data;
        },
        onSuccess: (data: ParticipantResponse) => {
            queryClient.setQueryData(["participants", table_id],
                (oldData: ParticipantsResponse | undefined) => {
                    if (!oldData) return { data: [data.data], message: data.message, error: null };
                    return data
                }
            )
        }
    })
}

export function UseChangeSubgroupName(tournament_id: number, table_id: number) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (formData: { participant_ids: string[], group_name: string }) => {
            const { data } = await axiosInstance.patch(`/api/v1/tournaments/${tournament_id}/tables/${table_id}/participants/group`, formData, {
                withCredentials: true,
            })
            return data;
        },
        onSuccess: (data: ParticipantResponse) => {
            queryClient.setQueryData(["participants", table_id],
                (oldData: ParticipantsResponse) => {
                    if (!oldData || !oldData.data) return oldData;
                    return {
                        data: oldData.data,
                        message: data.message,
                        error: null
                    };
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
            queryClient.setQueryData(["participants", table_id],
                (oldData: ParticipantsResponse | undefined) => {
                    if (!oldData || !oldData.data) return oldData;
                    const updatedParticipantsMap = new Map(
                        // we can put ? since always there is atleast one participant ( updated participant )
                        data.data?.map(participant => [participant.id, participant])
                    );

                    const updatedData = oldData.data.map(participant =>
                        updatedParticipantsMap.has(participant.id)
                            ? updatedParticipantsMap.get(participant.id)!
                            : participant
                    );

                    const sortedData = [...updatedData].sort((a, b) => a.order - b.order);

                    return {
                        ...oldData,
                        data: sortedData,
                        message: data.message,
                        error: null
                    }
                }
            )

            // Since match data may depend on participant data, still reset the matches query
            queryClient.resetQueries({ queryKey: ["matches", table_id] })
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
        onSuccess: (data: ParticipantResponse) => {
            // Update cache by filtering out the deleted participant
            queryClient.setQueryData(["participants", table_id],
                (oldData: ParticipantsResponse | undefined) => {
                    // if (!oldData || !oldData.data) return oldData;
                    if (data) return data
                    if (!oldData || !oldData.data) return oldData;

                    // return {
                    //     ...oldData,
                    //     data: oldData.data.filter(participant => participant.id !== variables),
                    //     message: data.message,
                    //     error: null
                    // };
                }
            )
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
        onSuccess: () => {
            queryClient.resetQueries({ queryKey: ["participants", table_id] })
            queryClient.resetQueries({ queryKey: ["bracket", table_id] })
            queryClient.resetQueries({ queryKey: ["matches", table_id] })
        },
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
        onSuccess: () => {
            queryClient.resetQueries({ queryKey: ["participants", table_id] })
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
        onSuccess: () => {
            queryClient.resetQueries({ queryKey: ["participants", table_id] })
            queryClient.resetQueries({ queryKey: ["bracket", table_id] })
            queryClient.resetQueries({ queryKey: ["matches", table_id] })
            queryClient.resetQueries({ queryKey: ["tournament_table", table_id] })
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
            // queryClient.resetQueries({ queryKey: ["participants", table_id] })
            queryClient.setQueryData(["participants", table_id], (oldData: ParticipantsResponse) => {
                if (!oldData || !oldData.data) return oldData;
                return {
                    ...new_data,
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
        onSuccess: () => {
            queryClient.resetQueries({ queryKey: ["participants", table_id] })
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
        onSuccess: () => {
            queryClient.resetQueries({ queryKey: ["participants", table_id] })
        },
    })
}


