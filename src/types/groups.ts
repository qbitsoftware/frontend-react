import { Participant } from "./participants";

export type TournamentTable = {
  created_at: string;
  deleted_at: string | null;
  id: number;
  updated_at: string;
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
