import { TournamentTable } from "@/types/groups"
import { Tournament } from "@/types/tournaments"
import { z } from "zod"

export interface ParticipantFormProps {
    tournament_data: Tournament
    table_data: TournamentTable
}

export const playerFormSchema = z.object({
    id: z.string().optional(),
    user_id: z.number().optional(),
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().optional(),
    name: z.string(),
    sport_type: z.string().default("tabletennis"),
    sex: z.string().default("M"),
    number: z.number().optional(),
    isikukood: z.string().optional(),
    nationality: z.string().default("EE").optional(),
    extra_data: z
        .object({
            rate_order: z.number().default(0).optional(),
            club: z.string().default("").optional(),
            rate_points: z.number().default(0),
            eltl_id: z.number().default(0).optional(),
            class: z.string().default("").optional(),
            foreign_player: z.boolean().default(false).optional(),
        })
        .optional(),
});

export type PlayerFormValues = z.infer<typeof playerFormSchema>;



export const participantSchema = z.object({
    name: z.string().min(1, "Participant name is required"),
    order: z.number().optional(),
    tournament_id: z.number().min(1),
    sport_type: z.string().default("tabletennis"),
    group: z.number().optional(),
    type: z.string().optional(),
    group_name: z.string().optional(),
    group_id: z.string().optional(),
    players: z.array(playerFormSchema),
    class: z.string().optional(),
})

export type ParticipantFormValues = z.infer<typeof participantSchema>




