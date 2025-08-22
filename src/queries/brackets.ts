import { axiosInstance } from "./axiosconf";
import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BracketReponse } from "./tournaments";
import { ParticipantsResponse } from "./participants";
import { PlayerSwitch } from "@/types/brackets";

export function UseGetBracket(tournament_id: number, table_id: number) {
    return queryOptions<BracketReponse>({
        queryKey: ["bracket", tournament_id, table_id],
        queryFn: async () => {
            const { data } = await axiosInstance.get(`/api/v1/tournaments/${tournament_id}/tables/${table_id}/brackets`, {
                withCredentials: true
            });
            return data
        },
        refetchInterval: 10000,
    })
}

export function UseGetBracketQuery(tournament_id: number, table_id: number) {
    return useQuery<BracketReponse>({
        queryKey: ["bracket", tournament_id, table_id],
        queryFn: async () => {
            const { data } = await axiosInstance.get(`/api/v1/tournaments/${tournament_id}/tables/${table_id}/brackets`, {
                withCredentials: true
            });
            return data
        },
        // enabled: false
    })
}

export function UseDeleteBrackets(tournament_id: number, table_id: number) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async () => {
            const { data } = await axiosInstance.delete(`/api/v1/tournaments/${tournament_id}/tables/${table_id}/brackets`, {
                withCredentials: true
            });
            return data
        },
        onSuccess: () => {
            queryClient.resetQueries({ queryKey: ["bracket", tournament_id] })
            queryClient.resetQueries({ queryKey: ["tournaments"] })
        }
    })
}

export function UseGetPlacements(tournament_id: number, table_id: number) {
    return useQuery<ParticipantsResponse>({
        queryKey: ["leaderboard", tournament_id, table_id],
        queryFn: async () => {
            const { data } = await axiosInstance.get(`/api/v1/tournaments/${tournament_id}/tables/${table_id}/leaderboard`, {
                withCredentials: true
            });
            return data
        }
    })
}

export function UsePostPlayerSwitch(tournament_id: number, table_id: number) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (bodydata: PlayerSwitch) => {
            const { data } = await axiosInstance.post(`/api/v1/tournaments/${tournament_id}/tables/${table_id}/switch_players`, bodydata, {
                withCredentials: true
            })
            return data
        },
        onSuccess: (new_data: BracketReponse) => {
            queryClient.setQueryData(["bracket", tournament_id, table_id],
                (oldData: BracketReponse) => {
                    if (!oldData) return { data: [new_data.data], message: new_data.message, error: null };
                    return new_data
                }
            )
        }
    })
}