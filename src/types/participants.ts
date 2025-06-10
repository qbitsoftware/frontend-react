import type { Player } from "./players";

export type Participant = {
  id: string;
  name: string;
  order: number;
  rank: number;
  sport_type: string;
  tournament_id: number;
  created_at: string;
  updated_at: string;
  deleted_at: Deleted_at;
  group: number;
  group_name: string;
  group_id: string;
  type: string;
  players: Player[];
  tournament_table_id: number;
  extra_data: PartipantExtraData;
};

interface Deleted_at {
  Valid: boolean;
  Time: string;
}

export type PartipantExtraData = {
  image_url: string;
  class: string;
  is_parent: boolean;
  total_points: number;
};

