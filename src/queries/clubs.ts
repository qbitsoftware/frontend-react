import { Club } from "@/types/types"
import { queryOptions, useMutation, useQuery } from "@tanstack/react-query"
import { axiosInstance } from "./axiosconf"
import { UsersResponse } from "./users"

export interface ClubsResponse {
    data: Club[]
    message: string
    error: string | null
}

export interface ClubResponse {
    data: Club
    message: string
    error: string | null
}

export const UseGetClubsOption = () => {
    return queryOptions<ClubsResponse>({
        queryKey: ["clubs_options"],
        queryFn: async () => {
            const { data } = await axiosInstance.get(`/api/v1/clubs`)
            return data
        }
    })
}

export const UseGetClubsQuery = () => {
    return useQuery<ClubsResponse>({
        queryKey: ["clubs_query"],
        queryFn: async () => {
            const { data } = await axiosInstance.get(`/api/v1/clubs`)
            return data
        }
    })
}

export const UseGetClubPlayers = (club_name: string) => {
    return useQuery<UsersResponse>({
        queryKey: ["club_players"],
        queryFn: async () => {
            const { data } = await axiosInstance.get(`/api/v1/clubs/${club_name}/players`)
            return data
        }
    })
}

export type CreateClubInput = Omit<Club, 'id' | 'created_at'>

export const useCreateClub = () => {
    return useMutation({
        mutationFn: async (newClub: CreateClubInput) => {
            const { data } = await axiosInstance.post('/api/v1/clubs', newClub)
            return data
        }
    })
}

export const useUpdateClub = () => {
    return useMutation({
        mutationFn: async (updatedClub: Club) => {
            const { data } = await axiosInstance.patch('/api/v1/clubs', updatedClub)
            return data
        }
    })
}

export const useDeleteClub = () => {
    return useMutation<ClubResponse>({
        mutationFn: async (clubName) => {
            const { data } = await axiosInstance.delete(`/api/v1/clubs/${clubName}`)
            return data
        }
    })
}