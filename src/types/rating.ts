export type RatingInfo = {
    id: number;
    created_at: string;
    deleted_at: string | null;
    updated_at: string;
    last_calculated_at: string;
    status: string;
    tournaments_affected: number;
    next_calculation: string;
}