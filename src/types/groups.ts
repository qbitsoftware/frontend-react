import { Participant } from "./participants";

export type TournamentTable = {
    created_at: string;
    deleted_at: string | null;
    id: number;
    updated_at: string;
    tournament_id: number;
    class: string;
    type: string;
    solo: boolean;
    min_team_size: number;
    max_team_size: number;
    size: number;
    participants: Participant[];
  }
  