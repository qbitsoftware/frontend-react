import { TournamentTableWithStages } from "@/queries/tables";
import { DialogType } from "@/types/groups";
import { GroupType, PlayerKey } from "@/types/matches";

export const getPlayerKeys = (teamNumber: number, currentTable: TournamentTableWithStages | undefined): PlayerKey[] => {
    const keys: PlayerKey[] = [];
    if (!currentTable) return keys;
    let count = 0
    let lettersA: string[] = []
    let lettersB: string[] = []
    switch (currentTable.group.dialog_type) {
        case DialogType.DT_2_PER_TEAM_DOUBLE:
            count = 2
            lettersA = ['a', 'b']
            lettersB = ['x', 'y']
            break;
        case DialogType.DT_4_PER_TEAM_DOUBLE:
            count = 4
            lettersA = ['a', 'b', 'c', 'f']
            lettersB = ['x', 'y', 'z', 's']
            break;
        case DialogType.DT_3_PER_TEAM:
            count = 3
            lettersA = ['a', 'b', 'c']
            lettersB = ['x', 'y', 'z']
            break;
        case DialogType.DT_TEAM_LEAGUES:
            count = 3
            lettersA = ['a', 'b', 'c']
            lettersB = ['x', 'y', 'z']
            break;
    }

    if (teamNumber === 1) {
        for (let i = 0; i < count && i < lettersA.length; i++) {
            keys.push(`player_${lettersA[i]}_id` as PlayerKey)
        }
    } else {
        for (let i = 0; i < count && i < lettersB.length; i++) {
            keys.push(`player_${lettersB[i]}_id` as PlayerKey)
        }
    }
    return keys
};

export const getCaptainKey = (teamNumber: number): 'captain_a' | 'captain_b' => {
    return teamNumber === 1 ? 'captain_a' : 'captain_b';
};

export const getPlayerLabel = (index: number, team: number, currentTable: TournamentTableWithStages | undefined): string => {
    if (!currentTable) return "";
    let lettersA: string[] = []
    let lettersB: string[] = []
    switch (currentTable.group.dialog_type) {
        case DialogType.DT_2_PER_TEAM_DOUBLE:
            lettersA = ['a', 'b']
            lettersB = ['x', 'y']
            break
        case DialogType.DT_4_PER_TEAM_DOUBLE:
            lettersA = ['m1', 'm2', 'n1', 'n2']
            lettersB = ['m1', 'm2', 'n1', 'n2']
            break
        case DialogType.DT_3_PER_TEAM:
            lettersA = ['a', 'b', 'c']
            lettersB = ['x', 'y', 'z']
            break;
        default:
            lettersA = ['a', 'b', 'c']
            lettersB = ['x', 'y', 'z']
            break;
    }

    return team === 1 ? lettersA[index].toUpperCase() : lettersB[index].toUpperCase();
};

export const getPairKeys = (teamNumber: number, currentTable: TournamentTableWithStages | undefined): PlayerKey[] => {
    const keys: PlayerKey[] = [];
    if (!currentTable || currentTable.group.dialog_type === DialogType.DT_3_PER_TEAM) return keys;

    const count = 2
    if (teamNumber === 1) {
        const letters = ['d', 'e']
        for (let i = 0; i < count && i < letters.length; i++) {
            keys.push(`player_${letters[i]}_id` as PlayerKey)
        }
    } else {
        const letters = ['v', 'w'];
        for (let i = 0; i < count && i < letters.length; i++) {
            keys.push(`player_${letters[i]}_id` as PlayerKey)
        }
    }
    return keys
};

export const getPairLabel = (index: number, team: number, currentTable: TournamentTableWithStages | undefined): string => {
    if (!currentTable) return ""
    if (currentTable.group.type === GroupType.CHAMPIONS_LEAGUE) {
        if (team === 1) {
            const letters = ['D', 'E']
            return letters[index]
        } else {
            const letters = ['V', 'W'];
            return letters[index];
        }
    } else {
        const letters = ['D1', 'D2'];
        return letters[index];
    }
};

export const generateMatchOrderLabels = (playerCount: number, currentTable: TournamentTableWithStages | undefined) => {
    switch (currentTable?.group.dialog_type) {
        case DialogType.DT_2_PER_TEAM_DOUBLE:
            return ["A-X", "B-Y", "D1-D2", "A-Y", "B-X"];
        case DialogType.DT_4_PER_TEAM_DOUBLE:
            return ["Paarismäng", "N2-N2", "M2-M2", "N1-N1", "M1-M1"];
        case DialogType.DT_3_PER_TEAM:
            return ["A-X", "B-Y", "C-Z", "A-Y", "B-X"];
        case DialogType.DT_TEAM_LEAGUES:
            if (playerCount === 2) {
                return ["A-X", "B-Y", "D1-D2", "A-Y", "B-X"];
            } else if (playerCount >= 3) {
                return ["A-Y", "B-X", "C-Z", "D1-D2", "A-X", "C-Y", "B-Z"];
            } else {
                return [""]
            }
        default:
            return [""]
    }
}