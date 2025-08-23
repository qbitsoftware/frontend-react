import { useQueryClient, useMutation, queryOptions, useQuery } from "@tanstack/react-query"
import { axiosInstance } from "./axiosconf"
import { Match, MatchTimeUpdate, MatchWrapper } from "@/types/matches"
import { Participant } from "@/types/participants"

export interface MatchesResponse {
    data: MatchWrapper[] | null
    message: string
    error: string | null
}

export interface Protocol {
    match: MatchWrapper
    parent_matches: MatchWrapper[]
}

export interface MatchResponse {
    data: Protocol | null
    message: string
    error: string | null
}

export const UsePatchMatch = (id: number, group_id: number, match_id: string) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (formData: Match) => {
            const { data } = await axiosInstance.patch(`/api/v1/tournaments/${id}/tables/${group_id}/match/${match_id}`, formData, {
                withCredentials: true
            })
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bracket', id] })
            queryClient.refetchQueries({ queryKey: ['bracket', id] })
            queryClient.invalidateQueries({ queryKey: ['matches', id] })
            queryClient.invalidateQueries({ queryKey: ['matches_group', group_id] })
            queryClient.invalidateQueries({ queryKey: ['venues', id] })
            queryClient.invalidateQueries({ queryKey: ['tournament_table', group_id] })
            queryClient.refetchQueries({ queryKey: ['tournament_table', group_id] })
        }
    })
}

export const UsePatchMatchReset = (tournament_id: number, group_id: number, match_id: string) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async () => {
            const { data } = await axiosInstance.patch(`/api/v1/tournaments/${tournament_id}/tables/${group_id}/match/${match_id}/reset`, {}, {
                withCredentials: true
            })
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bracket', tournament_id] })
            queryClient.refetchQueries({ queryKey: ['bracket', tournament_id] })
            queryClient.invalidateQueries({ queryKey: ['matches', group_id] })
            queryClient.invalidateQueries({ queryKey: ['venues', tournament_id] })
            queryClient.invalidateQueries({ queryKey: ['tournament_table', group_id] })
            queryClient.refetchQueries({ queryKey: ['tournament_table', group_id] })
        }
    })
}

export const UsePatchMatchSwitch = (id: number, group_id: number, match_id: string) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (formData: Match) => {
            const { data } = await axiosInstance.patch(`/api/v1/tournaments/${id}/tables/${group_id}/match/${match_id}?rotate=true`, formData, {
                withCredentials: true
            })
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bracket', id] })
            queryClient.refetchQueries({ queryKey: ['bracket', id] })
            queryClient.invalidateQueries({ queryKey: ['matches', group_id] })
            // queryClient.resetQueries({ queryKey: ['matches', group_id] })
        }
    })
}

export const UseGetMatch = (tournament_id: number, group_id: number, match_id: string) => {
    return useQuery<MatchResponse>({
        queryKey: ['match', group_id],
        queryFn: async () => {
            const { data } = await axiosInstance.get(`/api/v1/tournaments/${tournament_id}/tables/${group_id}/match/${match_id}`, {
                withCredentials: true
            })
            return data;
        }
    })
}

export const UseGetMatches = (tournament_id: number, group_id: number) => {
    return queryOptions<MatchesResponse>({
        queryKey: ['matches', group_id],
        queryFn: async () => {
            const { data } = await axiosInstance.get(`/api/v1/tournaments/${tournament_id}/tables/${group_id}/matches`, {
                withCredentials: true
            })
            return data;
        }
    })
}

export const UseGetTournamentMatches = (tournament_id: number) => {
    return queryOptions<MatchesResponse>({
        queryKey: ['matches', tournament_id],
        queryFn: async () => {
            const { data } = await axiosInstance.get(`/api/v1/tournaments/${tournament_id}/matches`, {
                withCredentials: true
            })
            return data;
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
    })
}

export const UseGetTournamentMatchesQuery = (tournament_id: number) => {
    return useQuery<MatchesResponse>({
        queryKey: ['matches', tournament_id],
        queryFn: async () => {
            const { data } = await axiosInstance.get(`/api/v1/tournaments/${tournament_id}/matches?timetable=true`, {
                withCredentials: true
            })

            return data;
        },
    })
}

export const UseGetMatchesQuery = (tournament_id: number, group_id: number) => {
    return useQuery<MatchesResponse>({
        queryKey: ['matches_group', group_id],
        queryFn: async () => {
            const { data } = await axiosInstance.get(`/api/v1/tournaments/${tournament_id}/tables/${group_id}/matches`, {
                withCredentials: true
            })
            return data;
        }
    })
}

export const UseGetMatchesAllQuery = (tournament_id: number, group_id: number) => {
    return useQuery<MatchesResponse>({
        queryKey: ['matches_time_modal', group_id],
        queryFn: async () => {
            const { data } = await axiosInstance.get(`/api/v1/tournaments/${tournament_id}/tables/${group_id}/time_matches`, {
                withCredentials: true
            })
            return data;
        }
    })
}



export const UseGetChildMatchesQuery = (tournament_id: number, group_id: number, match_id: string) => {
    return useQuery<MatchesResponse>({
        queryKey: ['matches', group_id, match_id],
        queryFn: async () => {
            const { data } = await axiosInstance.get(`/api/v1/tournaments/${tournament_id}/tables/${group_id}/matches/${match_id}`, {
                withCredentials: true
            })
            return data;
        }
    })
}

export const UseStartMatch = (tournament_id: number, group_id: number, match_id: string) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async () => {
            const { data } = await axiosInstance.post(`/api/v1/tournaments/${tournament_id}/tables/${group_id}/matches/${match_id}/start`, {}, {
                withCredentials: true
            })
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bracket', tournament_id] })
            queryClient.refetchQueries({ queryKey: ['bracket', tournament_id] })
            queryClient.invalidateQueries({ queryKey: ['matches', group_id] })
        }
    })
}


export const UseRegroupMatches = (tournament_id: number, group_id: number, regroup: boolean = false, final: boolean = false) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (participants: Participant[]) => {
            const { data } = await axiosInstance.post(`/api/v1/tournaments/${tournament_id}/tables/${group_id}/assign?regroup=${regroup}&final=${final}`, { participants }, {
                withCredentials: true
            })
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bracket', tournament_id] })
            queryClient.refetchQueries({ queryKey: ['bracket', tournament_id] })
            queryClient.invalidateQueries({ queryKey: ['matches', group_id] })
            queryClient.resetQueries({ queryKey: ['matches', group_id] })
        }
    })
}

export const UseUpdateMatchTime = (tournament_id: number, group_id: number) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (match_time: MatchTimeUpdate[]) => {
            const { data } = await axiosInstance.patch(`/api/v1/tournaments/${tournament_id}/tables/${group_id}/time`, { match_time }, {
                withCredentials: true
            })
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bracket', tournament_id] })
            queryClient.refetchQueries({ queryKey: ['bracket', tournament_id] })
            queryClient.invalidateQueries({ queryKey: ['matches_time_modal', group_id] })
            queryClient.resetQueries({ queryKey: ['matches_time_modal', group_id] })
            queryClient.invalidateQueries({ queryKey: ['matches', group_id] })
            queryClient.resetQueries({ queryKey: ['matches', group_id] })

        }
    })
}

