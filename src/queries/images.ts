import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query"
import { axiosInstance } from "./axiosconf"
import { Gameday, GamedayImage, GamedayImageResponse, GamedayImagesResponse, GetGamedayResponse, GetGamedaysResponse } from "@/types/types"

export const usePostImage = () => {
    return useMutation({
        mutationFn: async (formData: FormData) => {
            const { data } = await axiosInstance.post('/api/v1/image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                withCredentials: true,
            });
            return data;
        },

    });
}


export const usePostGameDay = (tournament_id: number) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (formData: Gameday) => {
            const { data } = await axiosInstance.post(`/api/v1/tournaments/${tournament_id}/gamedays`, formData, {
                withCredentials: true,
            });
            return data;
        },
        onSuccess: (data: GetGamedayResponse) => {
            queryClient.setQueryData(["images_options", tournament_id], (resp: GetGamedaysResponse) => {
                if (!resp) {
                    return data
                }
                resp.data.push(data.data)
            })
        }
    })
}

export const usePatchGameDay = (tournament_id: number) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({ formData, gameday_id }: { formData: Gameday, gameday_id: number }) => {
            const { data } = await axiosInstance.patch(`/api/v1/tournaments/${tournament_id}/gamedays/${gameday_id}`, formData, {
                withCredentials: true,
            });
            return data;
        },
        onSuccess: (data: GetGamedayResponse) => {
            queryClient.setQueryData(["images_options", tournament_id], (resp: GetGamedaysResponse) => {
                if (!resp) {
                    return data
                }
                if (data && data.data) {
                    //update the gameday
                    const index = resp.data.findIndex((gameday: Gameday) => gameday.id === data.data.id)
                    if (index !== -1) {
                        resp.data[index] = data.data
                    }
                    resp.data[index] = data.data
                }
            })
        }
    })
}

export const usePostGamedayImage = (tournament_id: number, gameday_id: number) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({ formData, onProgress }: { formData: FormData, onProgress?: (progress: number) => void }) => {
            const { data } = await axiosInstance.post(`/api/v1/tournaments/${tournament_id}/gamedays/${gameday_id}/images`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                withCredentials: true,
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total && onProgress) {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        onProgress(percentCompleted);
                    }
                }
            });
            return data;
        },
        onSuccess: (data: GamedayImagesResponse) => {
            queryClient.setQueryData(["images_options", tournament_id], (resp: GetGamedaysResponse) => {
                if (!resp) {
                    return data
                }
                if (data && data.data) {
                    //update the gameday
                    data.data.map((img: GamedayImage) => {
                        const index = resp.data.findIndex((gameday: Gameday) => gameday.id === img.gameday_id)
                        if (index !== -1) {
                            resp.data[index].images.push(img)
                        }
                    })
                }
            })
        }
    })
}

export const useDeleteGameday = (tournament_id: number) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (gameday_id: number) => {
            const { data } = await axiosInstance.delete(`/api/v1/tournaments/${tournament_id}/gamedays/${gameday_id}`, {
                withCredentials: true,
            });
            return data;
        },
        onSuccess: (data: GetGamedayResponse) => {
            queryClient.setQueryData(["images_options", tournament_id], (resp: GetGamedaysResponse) => {
                if (!resp) {
                    return data
                }
                if (data && data.data) {
                    const index = resp.data.findIndex((gameday: Gameday) => gameday.id === data.data.id)
                    if (index !== -1) {
                        resp.data.splice(index, 1)
                    }
                }
                return resp
            })
        }
    })
}

export const useDeleteGamedayImage = (tournament_id: number, getGamedayId: () => number) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (image_id: number) => {
            const gameday_id = getGamedayId();
            const { data } = await axiosInstance.delete(
                `/api/v1/tournaments/${tournament_id}/gamedays/${gameday_id}/images/${image_id}`,
                {
                    withCredentials: true,
                }
            );
            return data;
        },
        onSuccess: (data: GamedayImageResponse) => {
            queryClient.setQueryData(["images_options", tournament_id], (oldData: GetGamedaysResponse) => {
                oldData.data.map((gameday: Gameday) => {
                    if (gameday.id === data.data.gameday_id) {
                        gameday.images = gameday.images.filter((image: GamedayImage) => image.id !== data.data.id)
                    }
                })
                return data;
            });

        }
    });
};
export const useGetGamedaysOptions = (tournament_id: number) => {
    return queryOptions<GetGamedaysResponse>({
        queryKey: ["images_options", tournament_id],
        queryFn: async () => {
            const { data } = await axiosInstance.get(`/api/v1/tournaments/${tournament_id}/gamedays`, {
                withCredentials: true
            })
            return data
        },
    })
}

export function addPlayerImage() {
    return useMutation({
        mutationFn: async ({ player_id, image_file }: { player_id: string, image_file: File }) => {

            const formData = new FormData()

            formData.append('image', image_file)
            formData.append('player_id', player_id)

            const { data } = await axiosInstance.post('/api/v1/image/participants', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                withCredentials: true,
            });
            return data;
        }
    })
}