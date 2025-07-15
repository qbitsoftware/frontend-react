import { useQuery } from "@tanstack/react-query"
import { axiosInstance } from "./axiosconf"
import { Venue } from "@/types/venues"

export interface VenuesResponse {
    data: Venue[]
    message: string
    error: string | null
}

export const UseGetFreeVenues = (tournament_id: number, includeAll: boolean = false) => {
    return useQuery<VenuesResponse>({
        queryKey: ["venues", tournament_id, includeAll],
        queryFn: async () => {
            const { data } = await axiosInstance.get(`/api/v1/tournaments/${tournament_id}/free_tables`, {
                withCredentials: true,
                params: includeAll ? { all: true } : {}
            })
            return data
        },
        refetchInterval: 10000
    })
}