import { useQuery } from "@tanstack/react-query";
import { TournamentsResponse } from "./tournaments";
import { axiosInstance } from "./axiosconf";
import { RatingInfo } from "@/types/rating";
import { RatingEvent } from "@/types/users";

export interface RatingInfoResponse {
    data: RatingInfo
    message: string;
    error: string | null;
}

export interface RatingLatestChangesResponse {
    data: RatingEvent[]
    message: string;
    error: string | null;
}

export const UseGetReadyTournamentsForRatingCalc = (filter: 'upcoming' | 'latest') => {
    return useQuery<TournamentsResponse>({
        queryKey: ["rating_calc_tournaments", filter],
        queryFn: async () => {
            const { data } = await axiosInstance.get(`/api/v1/rating/tournaments`, {
                params: { filter },
                withCredentials: true,
            });
            return data;
        },
    });
}

export const UseGetRatingInfo = () => {
    return useQuery<RatingInfoResponse>({
        queryKey: ["rating_info"],
        queryFn: async () => {
            const { data } = await axiosInstance.get(`/api/v1/rating/info`, {
                withCredentials: true,
            });
            return data;
        },
    });
}

export const UseGetRatingLatestChanges = () => {
    return useQuery<RatingLatestChangesResponse>({
        queryKey: ["rating_changes"],
        queryFn: async () => {
            const { data } = await axiosInstance.get(`/api/v1/rating/changes`, {
                params: { limit: 50 },
                withCredentials: true,
            });
            return data;
        },
    });
}