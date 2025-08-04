import type { TournamentTable } from "./groups";

export type Tournament = {
  created_at: string;
  deleted_at: string | null;
  id: number;
  updated_at: string;
  name: string;
  start_date: string;
  end_date: string;
  location: string;
  organizer?: string;
  category: string;
  image: string;
  sport: string;
  state: string;
  private: boolean;
  total_tables: number;
  information: string;
  media: string;
  rating_coef: number;
  color?: string;
  registration_type: string;
  registration_link?: string;
};

export type TournamentInformation = {
  fields: [{ title: string; information: string }];
};

export type TournamentWithGroups = {
  tournament: Tournament;
  groups: TournamentTable[];
};

export type TournamentType = {
  id: number;
  created_at: string;
  deleted_at: string | null;
  name: string;
};

export type TournamentSize = {
  id: number;
  created_at: string;
  deleted_at: string | null;
  size: number;
};

export interface RoundTime {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
}
