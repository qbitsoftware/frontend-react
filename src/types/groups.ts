import { Participant } from "./participants";

export enum DialogType {
  DT_TEAM_LEAGUES = "team_leagues",
  DT_DOUBLES = "doubles",
  DT_FIXED_DOUBLES = "fixed_doubles",
}



export type TournamentTable = {
  created_at: string;
  deleted_at: string | null;
  id: number;
  updated_at: string;
  dialog_type: DialogType;
  tournament_id: number;
  class: string;
  state: number;
  type: string;
  solo: boolean;
  min_team_size: number;
  max_team_size: number;
  woman_weight: number;
  size: number;
  participants: Participant[];
  avg_match_duration: number;
  start_date: string;
  break_duration: number,
}
