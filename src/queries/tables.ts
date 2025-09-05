import { TournamentTable } from "@/types/groups";
import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "./axiosconf";
import TournamentTableForm from "@/routes/admin/tournaments/$tournamentid/grupid/-components/table-form";
import { TimeTableFormValues } from "@/routes/admin/tournaments/$tournamentid/ajakava/seaded/-components/timetable-configurations-form";

export interface TournamentTableResponse {
    data: TournamentTable | null
    message: string;
    error: string | null;
}

export interface TournamentTableWithStagesResponse {
    data: TournamentTableWithStages
    message: string;
    error: string | null;
}

export interface TournamentTableWithStages {
    group: TournamentTable | null;
    stages: TournamentTable[] | null;
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
            try {
                const { data } = await axiosInstance.get(`/api/v1/tournaments/${tournament_id}/tables`, {
                    withCredentials: true,
                })

                return data;
            } catch (error: any) {
                if (error.response?.status == 404) {
                    return { data: [], message: "No tables found", error: null };
                } else {
                    return { data: null, message: "", error: "An error occurred" };
                }
            }
        },
    });
}



export const UseGetTournamentTable = (tournament_id: number, tournament_table_id: number) => {
    return queryOptions<TournamentTableWithStagesResponse>({
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
    return useQuery<TournamentTableWithStagesResponse>({
        queryKey: ["tournament_table", tournament_table_id],
        queryFn: async () => {
            const { data } = await axiosInstance.get(`/api/v1/tournaments/${tournament_id}/tables/${tournament_table_id}`, {
                withCredentials: true,

            })
            return data;
        },
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
            // ["tournament_tables_query", tournament_id]
            queryClient.invalidateQueries({ queryKey: ['tournament_tables_query', tournament_id] })
            queryClient.resetQueries({ queryKey: ['participants', tournament_table_id] })
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
            // queryClient.resetQueries({ queryKey: ['tournament_tables_query', tournament_id] })
            queryClient.invalidateQueries({ queryKey: ['tournament_tables_query', tournament_id] })
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
            queryClient.resetQueries({ queryKey: ['tournament_tables_query', tournament_id] })
        },
    })
}

export const UseGenerateTimeTable = (tournament_id: number) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (formdata: TimeTableFormValues[]) => {
            const { data } = await axiosInstance.post(`/api/v1/tournaments/${tournament_id}/timetable`, formdata, {
                withCredentials: true
            })
            return data;
        },
        onSuccess: () => {
            // queryClient.invalidateQueries({ queryKey: ['tournament_table', tournament_table_id] })
            queryClient.invalidateQueries({ queryKey: ['tournament_tables', tournament_id] })
            queryClient.invalidateQueries({ queryKey: ['matches', tournament_id] })
        }
    })
}

export interface TimeTableEditMatch {
    match_id: string;
    table: string;
    time: string;
}

export const UseEditTimeTable = (tournament_id: number) => {
    return useMutation({
        mutationFn: async (formdata: TimeTableEditMatch[]) => {
            const { data } = await axiosInstance.post(`/api/v1/tournaments/${tournament_id}/timetable/edit`, formdata, {
                withCredentials: true
            })
            return data;
        },
    })
}

export const UseChangeTimeSlotTime = (tournament_id: number) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (formdata: { before: string; after: string }) => {
            const { data } = await axiosInstance.post(`/api/v1/tournaments/${tournament_id}/timetable/timeslots`, formdata, {
                withCredentials: true
            })
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tournament_tables_query', tournament_id] })
            queryClient.invalidateQueries({ queryKey: ['matches', tournament_id] })
        }
    })
}
