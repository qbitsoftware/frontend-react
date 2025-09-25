export enum DialogType {
  DT_TEAM_LEAGUES = "team_leagues",
  DT_DOUBLES = "doubles",
  DT_FIXED_DOUBLES = "fixed_doubles",
  DT_3_PER_TEAM = "3_per_team",
  DT_2_PER_TEAM_DOUBLE = "2_per_team_double",
  DT_4_PER_TEAM_DOUBLE = "4_per_team_double",
}

export const Leagues = [
  DialogType.DT_TEAM_LEAGUES,
  DialogType.DT_3_PER_TEAM,
  DialogType.DT_2_PER_TEAM_DOUBLE,
  DialogType.DT_4_PER_TEAM_DOUBLE,
]

export function getPlayerLabels(dialogType: DialogType | undefined): { left: string[]; right: string[] } {
  if (!dialogType) {
    return { left: [], right: [] }
  }
  switch (dialogType) {
    case DialogType.DT_2_PER_TEAM_DOUBLE:
      return {
        left: ["A", "B", "Paar", "A", "B"],
        right: ["X", "Y", "Paar", "Y", "X"],
      }
    case DialogType.DT_3_PER_TEAM:
      return {
        left: ["A", "B", "C", "A", "B"],
        right: ["X", "Y", "Z", "Y", "X"],
      }
    case DialogType.DT_4_PER_TEAM_DOUBLE:
      return {
        left: ["M1N1", "N2", "M2", "N1", "M1"],
        right: ["M1N1", "N2", "M2", "N1", "M1"],
      }
    default:
      return {
        left: [],
        right: [],
      }
  }
}



export type TournamentTable = {
  created_at: string;
  deleted_at: string | null;
  id: number;
  updated_at: string;
  dialog_type: DialogType;
  tournament_id: number;
  class: string;
  second_class: string;
  state: number;
  type: string;
  solo: boolean;
  min_team_size: number;
  max_team_size: number;
  woman_weight: number;
  size: number;
  avg_match_duration: number;
  start_date: string;
  break_duration: number;
  time_table: boolean;
  concurrency_priority: boolean;
  version: number;
}
