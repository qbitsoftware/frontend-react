import { MatchWrapper } from "./matches";
import { Player } from "./players";
import { LicenseType } from "./license";

export interface Profile {
  user: User;
  matches: MatchWrapper[];
  rating_change: Player[];
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
  club_name: string;
  rate_order: number;
  rate_pl_points: number;
  rate_points: number;
  rate_weigth: number;
  oragnization_id: number;
  role: number;
  licenseType: LicenseType;
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

