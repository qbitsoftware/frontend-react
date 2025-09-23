import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query"
import { axiosInstance } from "./axiosconf"
import { GroupType, Match, MatchTimeUpdate, MatchWrapper } from "@/types/matches"
import { Participant } from "@/types/participants"
import { Venue } from "@/types/venues"
import { VenuesResponse } from "./venues"
import { Bracket } from "@/types/brackets"
import { BracketReponse } from "./tournaments"
import { TournamentTableWithStages, TournamentTableWithStagesResponse } from "./tables"
import { Leagues } from "@/types/groups"

export interface TableInfoResponse {
    data: MatchesInfo
    message: string
    error: string | null
}

export interface MatchesInfo {
    matches: MatchWrapper[]
    all_matches: MatchWrapper[]
    free_tables: Venue[]
    all_tables: Venue[]
    tournament_table: TournamentTableWithStages
    brackets: Bracket | null
    current_match: Match | null
    child_matches: MatchWrapper[] | null
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


export interface PatchMatchBody {
    match_id: string
    group_id: number
    match: Match
}

export const UsePatchMatch = (id: number) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({ match_id, group_id, match }: PatchMatchBody) => {
            const { data } = await axiosInstance.patch(`/api/v1/tournaments/${id}/tables/${group_id}/match/${match_id}`, match, {
                withCredentials: true
            })
            return data;
        },
        onSuccess: (data: TableInfoResponse) => {
            console.log("invalidating")
            queryClient.setQueryData(['matches_info', data.data.tournament_table.group.id], (oldData: TableInfoResponse) => {
                if (!oldData) return data;
                const output = {
                    ...oldData,
                    data: {
                        ...oldData.data,
                        matches: data.data.matches,
                        free_tables: data.data.free_tables,
                        tournament_table: data.data.tournament_table
                    }
                }

                return output
            })
            if (data.data.brackets) {
                queryClient.setQueryData(['bracket', id, data.data.tournament_table.group.id], (oldData: BracketReponse) => {
                    if (!oldData) return { data: data.data.brackets, message: data.message, error: null };
                    const output = {
                        ...oldData,
                        data: data.data.brackets
                    }
                    return output
                })
            }
            if (data.data.current_match && (Leagues.includes(data.data.tournament_table.group.dialog_type) || data.data.tournament_table.group.type === GroupType.CHAMPIONS_LEAGUE)) {
                queryClient.setQueryData(['matches', data.data.tournament_table.group.id, data.data.current_match.extra_data.parent_match_id], (oldData: TableInfoResponse) => {
                    if (oldData && oldData.data && oldData.data.matches) {
                        const updatedMatches = oldData.data.matches.map((m) => {
                            if (data.data.current_match && m.match.id === data.data.current_match.id) {
                                return { ...m, match: data.data.current_match }
                            } else {
                                return m;
                            }
                        })

                        const output = {
                            ...oldData,
                            data: {
                                ...oldData.data,
                                matches: updatedMatches,
                            }
                        }

                        return output
                    }
                })
            }

            if (data.data.child_matches && data.data.current_match) {
                queryClient.setQueryData(['matches', data.data.tournament_table.group.id, data.data.current_match.id], (oldData: TableInfoResponse) => {
                    if (!oldData) return data;
                    return {
                        ...oldData,
                        data: {
                            ...oldData.data,
                            matches: data.data.child_matches || [],
                            free_tables: data.data.free_tables,
                        }
                    }
                })

            }

            queryClient.setQueryData(['matches_info_tournament', id], (oldData: TableInfoResponse) => {
                if (oldData && oldData.data && oldData.data.matches) {
                    const updatedMatches = oldData.data.matches.map((m) => {
                        const updatedMatch = data.data.matches.find((um) => um.match.id === m.match.id);
                        return updatedMatch ? updatedMatch : m;
                    });

                    const output = {
                        ...oldData,
                        data: {
                            ...oldData.data,
                            matches: updatedMatches,
                        }
                    }

                    return output
                }
            })

            queryClient.setQueryData(["tournament_table", data.data.tournament_table.group.id], (oldData: TournamentTableWithStagesResponse) => {
                if (!oldData) return oldData;
                const output = {
                    ...oldData,
                    data: {
                        ...oldData.data,
                        group: data.data.tournament_table.group,
                    }
                }
                return output
            })
            queryClient.setQueryData(['venues_all', id], (oldData: VenuesResponse) => {
                return {
                    ...oldData,
                    data: data.data.all_tables,
                }
            })
            queryClient.setQueryData(['venues_free', id], (oldData: VenuesResponse) => {
                return {
                    ...oldData,
                    data: data.data.free_tables,
                }
            })

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
        onSuccess: (data: TableInfoResponse) => {
            queryClient.setQueryData(['matches_info', group_id], (oldData: TableInfoResponse) => {
                if (!oldData) return data;
                return {
                    ...oldData,
                    data: {
                        ...oldData.data,
                        matches: data.data.matches,
                        free_tables: data.data.free_tables,
                    }
                }
            })
            queryClient.setQueryData(['matches', group_id, match_id], (oldData: TableInfoResponse) => {
                if (!oldData) return data;
                return {
                    ...oldData,
                    data: {
                        ...oldData.data,
                        matches: data.data.child_matches || [],
                        free_tables: data.data.free_tables,
                    }
                }
            })
            queryClient.setQueryData(['venues_all', tournament_id], (oldData: VenuesResponse) => {
                if (!oldData) return { data: data.data.all_tables, message: "", error: null };
                return {
                    ...oldData,
                    data: data.data.all_tables,
                }
            })
            if (data.data.brackets) {
                queryClient.setQueryData(['bracket', tournament_id, data.data.tournament_table.group.id], (oldData: BracketReponse) => {
                    if (!oldData) return { data: data.data.brackets, message: data.message, error: null };
                    const output = {
                        ...oldData,
                        data: data.data.brackets
                    }
                    return output
                })
            }
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
        onSuccess: (data: TableInfoResponse) => {
            queryClient.setQueryData(['matches_info', data.data.tournament_table.group.id], (oldData: TableInfoResponse) => {
                if (!oldData) return data;
                const output = {
                    ...oldData,
                    data: {
                        ...oldData.data,
                        matches: data.data.matches,
                        free_tables: data.data.free_tables,
                        tournament_table: data.data.tournament_table
                    }
                }

                return output
            })
            if (data.data.brackets) {
                queryClient.setQueryData(['bracket', id, data.data.tournament_table.group.id], (oldData: BracketReponse) => {
                    if (!oldData) return { data: data.data.brackets, message: data.message, error: null };
                    const output = {
                        ...oldData,
                        data: data.data.brackets
                    }
                    return output
                })
            }
            if (data.data.current_match && (Leagues.includes(data.data.tournament_table.group.dialog_type) || data.data.tournament_table.group.type === GroupType.CHAMPIONS_LEAGUE)) {
                queryClient.setQueryData(['matches', data.data.tournament_table.group.id, data.data.current_match.extra_data.parent_match_id], (oldData: TableInfoResponse) => {
                    if (oldData && oldData.data && oldData.data.matches) {
                        const updatedMatches = oldData.data.matches.map((m) => {
                            if (data.data.current_match && m.match.id === data.data.current_match.id) {
                                return { ...m, match: data.data.current_match }
                            } else {
                                return m;
                            }
                        })

                        const output = {
                            ...oldData,
                            data: {
                                ...oldData.data,
                                matches: updatedMatches,
                            }
                        }

                        return output
                    }
                })
            }
            queryClient.setQueryData(['matches_info_tournament', id], (oldData: TableInfoResponse) => {
                if (oldData && oldData.data && oldData.data.matches) {
                    const updatedMatches = oldData.data.matches.map((m) => {
                        const updatedMatch = data.data.matches.find((um) => um.match.id === m.match.id);
                        return updatedMatch ? updatedMatch : m;
                    });

                    const output = {
                        ...oldData,
                        data: {
                            ...oldData.data,
                            matches: updatedMatches,
                        }
                    }

                    return output
                }
            })
            queryClient.setQueryData(["tournament_table", data.data.tournament_table.group.id], (oldData: TournamentTableWithStagesResponse) => {
                if (!oldData) return oldData;
                const output = {
                    ...oldData,
                    data: {
                        ...oldData.data,
                        group: data.data.tournament_table.group,
                    }
                }
                return output
            })
            queryClient.setQueryData(['venues_all', id], (oldData: VenuesResponse) => {
                return {
                    ...oldData,
                    data: data.data.all_tables,
                }
            })
            queryClient.setQueryData(['venues_free', id], (oldData: VenuesResponse) => {
                return {
                    ...oldData,
                    data: data.data.free_tables,
                }
            })

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

export const UseGetTournamentMatchesQuery = (tournament_id: number) => {
    return useQuery<TableInfoResponse>({
        queryKey: ['matches_info_tournament', tournament_id],
        queryFn: async () => {
            const { data } = await axiosInstance.get(`/api/v1/tournaments/${tournament_id}/matches`, {
                withCredentials: true
            })

            return data;
        },
    })
}

export const UseGetMatchesQuery = (tournament_id: number, table_id: number) => {
    return useQuery<TableInfoResponse>({
        queryKey: ['matches_info', table_id],
        queryFn: async () => {
            const { data } = await axiosInstance.get(`/api/v1/tournaments/${tournament_id}/tables/${table_id}/matches`, {
                withCredentials: true
            })
            return data;
        }
    })
}

export const UseGetChildMatchesQuery = (tournament_id: number, group_id: number, match_id: string) => {
    return useQuery<TableInfoResponse>({
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

