import { PlayerFormValues } from "@/routes/admin/tournaments/$tournamentid/-components/participant-forms/form-utils";
import { User } from "./users";
import { formatDateStringYearMonthDay } from "@/lib/utils";
import { getFirstAndLastName } from "@/routes/admin/tournaments/$tournamentid/grupid/$groupid/osalejad/-components/participant-utils";

export const DEFAULT_PLAYER: PlayerFormValues = {
  first_name: "",
  last_name: "",
  name: "",
  sport_type: "tabletennis",
  sex: "M",
  nationality: "EE",
  extra_data: {
    rate_order: 0,
    club: "",
    rate_points: 0,
    eltl_id: 0,
    class: "",
    foreign_player: false,
  }
}

export type Player = {
  id: string;
  user_id: number
  name: string;
  first_name: string;
  last_name: string;
  sport_type: string;
  number: number;
  rank: number;
  sex: string;
  isikukood?: string;
  nationality: string;
  birthdate: string;
  extra_data: PlayerExtraData;
  registration_id?: number;
  created_at: string;
  deleted_at: string | null;
  updated_at: string;
}

export type PlayerExtraData = {
  image_url?: string;
  club: string;
  rate_points: number;
  rate_order: number;
  eltl_id: number;
  class: string;
  foreign_player: boolean;
}

export const NewPlayer = (user: User): Player => {
  const formattedDate = formatDateStringYearMonthDay(user.birth_date)
  const new_player: Player = {
    id: "",
    user_id: user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    sport_type: "tabletennis",
    rank: user.rate_order,
    sex: user.sex,
    created_at: formattedDate,
    nationality: "EE",
    name: user.first_name + " " + user.last_name,
    deleted_at: null,
    birthdate: formattedDate,
    updated_at: formatDateStringYearMonthDay(new Date().toISOString()),
    number: 0,
    extra_data: {
      club: user.club?.name || "KLUBITU",
      rate_points: user.rate_points,
      rate_order: user.rate_order,
      eltl_id: user.eltl_id,
      foreign_player: false,
      class: "",
    }
  }
  return new_player
}

export const NewPlayerFromName = (searchTerm: string): Player => {
  const { firstName, lastName } = getFirstAndLastName(searchTerm)
  const new_player: Player = {
    id: "",
    user_id: 0,
    first_name: firstName,
    last_name: lastName,
    sport_type: "tabletennis",
    rank: 0,
    sex: "",
    created_at: formatDateStringYearMonthDay(new Date().toISOString()),
    birthdate: "",
    nationality: "EE",
    name: firstName + " " + lastName,
    deleted_at: null,
    updated_at: formatDateStringYearMonthDay(new Date().toISOString()),
    number: 0,
    extra_data: {
      club: "",
      rate_points: 0,
      rate_order: 0,
      eltl_id: 0,
      foreign_player: false,
      class: "",
    }
  }
  return new_player;
}
