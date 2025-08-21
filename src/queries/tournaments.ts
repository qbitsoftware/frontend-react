import {
  queryOptions,
  useMutation,
  useQueryClient,
  useQuery,
} from "@tanstack/react-query";
import { axiosInstance } from "./axiosconf";
import {
  Tournament,
  TournamentSize,
  TournamentType,
  TournamentWithGroups,
} from "@/types/tournaments";
import { Bracket } from "@/types/brackets";
import { TournamentFormValues } from "@/routes/admin/tournaments/-components/tournament-form";
import { Category } from "@/types/blogs";

export type TournamentsResponse = {
  data: Tournament[] | null;
  message: string;
  error: string | null;
};

export type TournamentsProfile = {
  data: TournamentWithGroups[] | null;
  message: string;
  error: string | null;
};

export type TournamentResponse = {
  data: Tournament | null;
  message: string;
  error: string | null;
};

export function UseGetTournamentsAdmin() {
  return queryOptions<TournamentsResponse>({
    queryKey: ["tournaments_admin"],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/api/v1/tournaments`, {
        params: { public: false },
        withCredentials: true,
      });
      return data;
    },
  });
}

export function UseGetTournamentsAdminQuery() {
  return useQuery<TournamentsResponse>({
    queryKey: ["tournaments_admin_query"],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/api/v1/tournaments`, {
        params: { public: false },
        withCredentials: true,
      });
      return data;
    },
  });
}

export function UseGetTournamentsPublic() {
  return queryOptions<TournamentsResponse>({
    queryKey: ["tournaments_public"],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/api/v1/tournaments`, {
        params: { public: true },
        withCredentials: true,
      });
      return data;
    },
  });
}

export type TournamentTypesResposne = {
  data: TournamentType[] | null;
  message: string;
  error: string | null;
};

export type TournamentCategoriesResponse = {
  data: Category[] | null;
  message: string;
  error: string | null;
};

export type TournamentSizeResposne = {
  data: TournamentSize[] | null;
  message: string;
  error: string | null;
};

export function UseGetTournamentTypes() {
  return useQuery<TournamentTypesResposne>({
    queryKey: ["tournament_types"],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/api/v1/types`, {
        withCredentials: true,
      });
      return data;
    },
  });
}

export function UseGetTournamentCategories() {
  return useQuery<TournamentCategoriesResponse>({
    queryKey: ["tournament_categories"],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/api/v1/categories`, {
        withCredentials: true,
      });
      return data;
    },
  });
}

export function UseGetTournamentSizes() {
  return useQuery<TournamentSizeResposne>({
    queryKey: ["tournament_sizes"],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/api/v1/sizes`, {
        withCredentials: true,
      });
      return data;
    },
  });
}

export const UsePatchTournamentMedia = (tournament_id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (media: { media: string }) => {
      const { data } = await axiosInstance.patch(
        `/api/v1/tournaments/${tournament_id}/media`,
        media,
        {
          withCredentials: true,
        },
      );
      return data;
    },
    onSuccess: (data: TournamentResponse) => {
      queryClient.setQueryData(["tournament_admin", tournament_id], () => {
        return data;
      });
    },
  });
};

export const UseGetTournamentPublic = (id: number) => {
  return queryOptions<TournamentResponse>({
    queryKey: ["tournament_public", id],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/api/v1/tournaments/${id}`, {
        params: { public: true },
        withCredentials: true,
      });
      return data;
    },
  });
};

export function UseGetProfileTournaments(upcoming = false) {
  return queryOptions<TournamentsProfile>({
    queryKey: ["tournaments_profile"],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/api/v1/profile/tournaments`, {
        params: { public: true, upcoming },
        withCredentials: true,
      });
      return data;
    },
  });
}

export const UseGetTournamentAdmin = (id: number) => {
  return queryOptions<TournamentResponse>({
    queryKey: ["tournament_admin", id],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/api/v1/tournaments/${id}`, {
        params: { public: false },
        withCredentials: true,
      });
      return data;
    },
  });
};

export const UseGetTournamentQuery = (id: number) => {
  return useQuery<TournamentResponse>({
    queryKey: ["tournament", id],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/api/v1/tournaments/${id}`, {
        withCredentials: true,
      });
      return data;
    },
  });
};

export const UsePostTournament = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: TournamentFormValues) => {
      const { data } = await axiosInstance.post(
        `/api/v1/tournaments`,
        formData,
        {
          withCredentials: true,
        },
      );
      return data;
    },
    onSuccess: (data: TournamentResponse) => {
      queryClient.setQueryData(
        ["tournaments_admin"],
        (oldData: TournamentsResponse) => {
          if (oldData?.data && data.data) {
            oldData.data = [...oldData.data, data.data];
            oldData.message = data.message;
            oldData.error = data.error;
          } else {
            const newData: TournamentsResponse = {
              message: data.message,
              error: data.error,
              data: data.data ? [data.data] : null,
            };
            return newData;
          }
          return oldData;
        },
      );
    },
  });
};

export interface BracketReponse {
  data: Bracket | null;
  message: string;
  error: string | null;
}

export const UseStartTournament = (tournament_id: number) => {
  const queryClient = useQueryClient();
  return useMutation<BracketReponse, unknown, boolean>({
    mutationFn: async (start: boolean) => {
      const { data } = await axiosInstance.post(
        `/api/v1/tournaments/${tournament_id}`,
        JSON.stringify({ start }),
        {
          withCredentials: true,
        },
      );
      return data;
    },
    onSuccess: () => {
      queryClient.resetQueries({ queryKey: ["tournaments_admin"] });
    },
  });
};

export const UsePatchTournament = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: TournamentFormValues) => {
      const { data } = await axiosInstance.patch(
        `/api/v1/tournaments/${id}`,
        formData,
        {
          withCredentials: true,
        },
      );
      return data;
    },

    onSuccess: (data: TournamentResponse) => {
      queryClient.resetQueries({ queryKey: ["tournaments_admin"] });
      queryClient.setQueryData(
        ["tournament_admin", id],
        (oldData: TournamentResponse) => {
          if (oldData) {
            oldData.data = data.data;
            oldData.message = data.message;
            oldData.error = data.error;
          }
          return oldData;
        },
      );
      queryClient.resetQueries({ queryKey: ["bracket", id] });
      queryClient.resetQueries({ queryKey: ["matches", id] });
    },
  });
};

export const UseDeleteTournament = (id: number | undefined) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await axiosInstance.delete(`/api/v1/tournaments/${id}`, {
        withCredentials: true,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.setQueryData(
        ["tournaments_admin"],
        (oldData: TournamentsResponse) => {
          if (oldData?.data) {
            oldData.data = oldData.data.filter(
              (tournament: Tournament) => tournament.id !== id,
            );
          }
          return oldData;
        },
      );
      // queryClient.resetQueries({ queryKey: ['tournaments'] })
    },
  });
};

export type TournamentEvent = {
  tournament: Tournament
  is_gameday: boolean
  is_finals: boolean
  gameday_date: string
  class: string
  order: number
  parent_tournament_id: number
}

export type TournamentsHomepageResponse = {
  data: TournamentEvent[] | null;
  message: string;
  error: string | null;
};

export const UseGetHomePageTournaments = (forHomepage: boolean) => {
  return queryOptions<TournamentsHomepageResponse>({
    queryKey: ["home_tournaments"],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/api/v1/homepage/tournaments`, {
        params: { homepage: forHomepage },
        withCredentials: true,
      });
      return data;
    },
  });
}

export const UseGetHomePageTournamentsQuery = (forHomepage: boolean) => {
  return useQuery<TournamentsHomepageResponse>({
    queryKey: ["home_tournaments"],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/api/v1/homepage/tournaments`, {
        params: { homepage: forHomepage },
        withCredentials: true,
      });
      return data;
    },
  });
}

export const UseCalcTournamentRating = (tournament_id: number) => {
  // const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await axiosInstance.post(
        `/api/v1/tournaments/${tournament_id}/calc_rating`,
        {},
        {
          withCredentials: true,
        },
      );
      return data;
    },
    // onSuccess: () => {
    //   queryClient.resetQueries({ queryKey: ["tournaments_admin"] });
    // },
  });
};

export interface TimetableVisibilityRequest {
  visibility: boolean;
}

export interface TimetableVisibilityResponse {
  data: { visibility: boolean } | null;
  message: string;
  error: string | null;
}

export const UseUpdateTimetableVisibility = (tournament_id: number) => {
  const queryClient = useQueryClient();
  return useMutation<TimetableVisibilityResponse, unknown, TimetableVisibilityRequest>({
    mutationFn: async (payload: TimetableVisibilityRequest) => {
      const { data } = await axiosInstance.post(
        `/api/v1/tournaments/${tournament_id}/timetable/visibility`,
        payload,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tournament_admin", tournament_id] });
      queryClient.invalidateQueries({ queryKey: ["tournament_public", tournament_id] });
    },
  });
};
