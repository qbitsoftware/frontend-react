import { TournamentTable } from "@/types/groups";
import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "./axiosconf";
import TournamentTableForm from "@/routes/admin/tournaments/$tournamentid/grupid/-components/table-form";
import { TimetableFormValues } from "@/routes/admin/tournaments/$tournamentid/grupid/-components/timetable-form";

export interface TournamentTableResponse {
    data: TournamentTable | null
    message: string;
    error: string | null;
}

interface TournamentTablesResponse {
    data: TournamentTable[] | null
    message: string;
    error: string | null;
}


export function UseGetTournamentTables(tournament_id: number) {
    return queryOptions<TournamentTablesResponse>({
        queryKey: ["tournament_tables", tournament_id],
        queryFn: async () => {
            const { data } = await axiosInstance.get(`/api/v1/tournaments/${tournament_id}/tables`, {
                withCredentials: true,
            })
            return data;
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
    });
}

export function UseGetTournamentTablesQuery(tournament_id: number) {
    return useQuery<TournamentTablesResponse>({
        queryKey: ["tournament_tables_query", tournament_id],
        queryFn: async () => {
            const { data } = await axiosInstance.get(`/api/v1/tournaments/${tournament_id}/tables`, {
                withCredentials: true,
            })
            return data;
        },
    });
}



export const UseGetTournamentTable = (tournament_id: number, tournament_table_id: number) => {
    return queryOptions<TournamentTableResponse>({
        queryKey: ["tournament_table", tournament_table_id],
        queryFn: async () => {
            const { data } = await axiosInstance.get(`/api/v1/tournaments/${tournament_id}/tables/${tournament_table_id}`, {
                withCredentials: true
            })
            return data;
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
    })
}

export const UseGetTournamentTableQuery = (tournament_id: number, tournament_table_id: number) => {
    return useQuery<TournamentTableResponse>({
        queryKey: ["tournament_table", tournament_table_id],
        queryFn: async () => {
            const { data } = await axiosInstance.get(`/api/v1/tournaments/${tournament_id}/tables/${tournament_table_id}`, {
                withCredentials: true
            })
            return data;
        }
    })
}

export const UsePatchTournamentTable = (tournament_id: number, tournament_table_id: number) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (formData: TournamentTableForm) => {
            const { data } = await axiosInstance.patch(`/api/v1/tournaments/${tournament_id}/tables/${tournament_table_id}`, formData, {
                withCredentials: true
            })
            return data;
        },

        onSuccess: (data: TournamentTableResponse) => {
            queryClient.setQueryData(["tournament_table", tournament_table_id], (oldData: TournamentTableResponse) => {
                if (oldData) {
                    oldData.data = data.data
                    oldData.message = data.message
                    oldData.error = data.error
                }
                return oldData
            })
            queryClient.resetQueries({ queryKey: ['tournament_tables', tournament_id] })
            queryClient.resetQueries({ queryKey: ['bracket', tournament_table_id] })
            queryClient.resetQueries({ queryKey: ['matches', tournament_table_id] })
        }
    })
}

export const UsePostTournamentTable = (tournament_id: number) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (formData: TournamentTableForm) => {
            const { data } = await axiosInstance.post(`/api/v1/tournaments/${tournament_id}/tables`, formData, {
                withCredentials: true
            })
            return data;
        },

        onSuccess: () => {
            queryClient.resetQueries({ queryKey: ['tournament_tables', tournament_id] })
        }
    })
}

export const UseDeleteTournamentTable = (tournament_id: number, tournament_table_id: number | undefined) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async () => {
            const { data } = await axiosInstance.delete(`/api/v1/tournaments/${tournament_id}/tables/${tournament_table_id}`, {
                withCredentials: true
            })
            return data;
        },
        onSuccess: () => {
            queryClient.resetQueries({ queryKey: ['tournament_tables', tournament_id] })
        },
    })
}

export const UseGenerateTimeTable = (tournament_id: number, tournament_table_id: number) => {
    // const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (formdata: TimetableFormValues) => {
            const { data } = await axiosInstance.post(`/api/v1/tournaments/${tournament_id}/tables/${tournament_table_id}/timetable`, formdata, {
                withCredentials: true
            })
            return data;
        },
        // onSuccess: () => {
        //     queryClient.invalidateQueries({ queryKey: ['tournament_table', tournament_table_id] })
        //     queryClient.invalidateQueries({ queryKey: ['tournament_tables', tournament_id] })
        // }
    })
}

