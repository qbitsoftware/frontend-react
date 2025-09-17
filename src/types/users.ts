import { MatchWrapper } from "./matches";
import { LicenseType } from "./license";

export interface Profile {
  user: User;
  matches: MatchWrapper[];
  rating_events: RatingEvent[];
}

export interface RatingEvent {
  id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  user_id: number;
  timestamp: string;
  rate_order: number;
  rate_pl_points: number;
  rate_points: number;
  rate_weight: number;
  is_delta: boolean;
  algo_version: string;
  tournament_id: number;
  last_name?: string
  first_name?: string
}

export type User = {
  id: number;
  email: string;
  organization_id: number;
  first_name: string;
  last_name: string;
  created_at: string;
  eltl_id: number;
  birth_date: string;
  sex: string;
  foreigner: number;
  club: {
    id: number;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    name: string;
    email: string;
    phone: string;
    contact_person: string;
    address: string;
    website: string;
    organization_id: number;
    image_url: string;
  };
  rate_order: number;
  rate_pl_points: number;
  rate_points: number;
  rate_weigth: number;
  role: number;
  license: string | null;
  expiration_date: string | null;
  rating_last_change: number;
  isikukood?: string;
  selectedLicenseType?: LicenseType;
  combinedIndex?: number;
  genderCombinedIndex?: number;
  originalRateOrder?: number;
  menCombinedIndex?: number;
  womenCombinedIndex?: number;
};

export type UserLogin = {
  id: number;
  email: string;
  username: string;
  role: string;
};

export interface UserProfile {
  id: number;
  name: string;
  birthYear: number;
  club: string;
  description: string;
  photo: string;
  coverPhoto: string;
  stats: {
    matches: number;
    goals: number;
    assists: number;
    winRate: number;
  };
  achievements: string[];
  rivals: {
    id: number;
    name: string;
    photo: string;
  }[];
  socials: {
    twitter?: string;
    linkedin?: string;
    website?: string;
    instagram?: string;
    facebook?: string;
  };
}

