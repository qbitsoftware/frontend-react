import { useQuery } from "@tanstack/react-query"
import { axiosInstance } from "./axiosconf"
import { Venue } from "@/types/venues"

export interface VenuesResponse {
    data: Venue[]
    message: string
    error: string | null
}

export const UseGetFreeVenues = (tournament_id: number) => {
    return useQuery<VenuesResponse>({
        queryKey: ["venues", tournament_id],
        queryFn: async () => {
            const { data } = await axiosInstance.get(`/api/v1/tournaments/${tournament_id}/free_tables`, {
                withCredentials: true
            })
            return data
        }
    })
}