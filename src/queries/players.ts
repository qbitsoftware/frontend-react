import { Profile } from "@/types/users"
import { useQuery } from "@tanstack/react-query"
import { axiosInstance } from "./axiosconf"

export interface ProfileResponse {
    error: string
    data: Profile
    message: string
}

export const UseGetUserProfile = (id: number) => {
    return useQuery<ProfileResponse>({
        queryKey: ["profile", id],
        queryFn: async () => {
            const { data } = await axiosInstance.get(`/api/v1/users/${id}`)
            return data
        }
    })
}
