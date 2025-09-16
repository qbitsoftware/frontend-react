import { TournamentTable } from "@/types/groups";
import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "./axiosconf";
import TournamentTableForm from "@/routes/admin/tournaments/$tournamentid/grupid/-components/table-form";
import { TimeTableFormValues } from "@/routes/admin/tournaments/$tournamentid/ajakava/seaded/-components/timetable-configurations-form";
import { Participant } from "@/types/participants";

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
    group: TournamentTable;
    stages: TournamentTable[] | null;
    participants: Participant[];
}

export interface TournamentTablesResponse {
    data: TournamentTableWithStages[] | null
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
        select: (data) => {
            const orderedParticipants = data.data.participants.map(participant => {
                if (!participant.players) {
                    return participant
                }
                const sortedPlayers = [...participant.players].sort((a, b) => {
                    if (a.rank === 0 && b.rank !== 0) return 1
                    if (b.rank === 0 && a.rank !== 0) return -1
                    if (a.rank === 0 && b.rank === 0) return 0
                    return a.rank - b.rank
                })
                return {
                    ...participant,
                    players: sortedPlayers
                }
            })

            return {
                ...data,
                data: {
                    ...data.data,
                    participants: orderedParticipants
                }
            }
        }
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

        onSuccess: (data: TournamentTablesResponse) => {
            queryClient.setQueryData(["tournament_table", tournament_table_id], (oldData: TournamentTableWithStagesResponse) => {
                if (oldData && data && data.data) {
                    data.data.map((table) => {
                        if (table.group.id === tournament_table_id) {
                            return {
                                data: table,
                                message: "",
                                error: null,
                            }
                        }
                    })
                }
                return oldData
            })
            queryClient.setQueryData(["tournament_tables_query", tournament_id], (oldData: TournamentTablesResponse) => {
                if (!oldData) {
                    console.log("old data missing")
                }
                return data
            })
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

        onSuccess: (data: TournamentTableWithStagesResponse) => {
            queryClient.setQueryData(["tournament_table", data.data.group.id], (oldData: TournamentTableWithStagesResponse) => {
                if (data) {
                    return data
                }
                return oldData
            })
            queryClient.setQueryData(["tournament_tables_query", tournament_id], (oldData: TournamentTablesResponse) => {
                if (oldData && oldData.data) {
                    return {
                        ...oldData,
                        data: [...oldData.data, data.data]
                    }
                } else {
                    return {
                        data: [data.data],
                        message: "",
                        error: null,
                    }
                }
            })
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

        onSuccess: (data: TournamentTablesResponse) => {
            queryClient.setQueryData(["tournament_table", tournament_table_id], (oldData: TournamentTableWithStagesResponse) => {
                return {
                    ...oldData,
                    data: null
                }
            })
            queryClient.setQueryData(["tournament_tables_query", tournament_id], (oldData: TournamentTablesResponse) => {
                if (!oldData) {
                    console.log("old data missing")
                }
                return data
            })
        }
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
