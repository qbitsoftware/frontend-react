import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { X } from 'lucide-react'
import { fetchUserByName, UseGetUsersDebounce } from '@/queries/users'
import { UseCreateParticipants, UseUpdateParticipant } from '@/queries/participants'
import { useDebounce } from '@/lib/utils'
import { ErrorResponse, Participant, UserNew } from '@/types/types'
import { useToastNotification } from '@/components/toast-notification'
import { UseMutationResult } from '@tanstack/react-query'

const teamSchema = z.object({
    name: z.string().min(1, 'Team name is required'),
    tournament_id: z.number().min(1),
    sport_type: z.string().default('tabletennis'),
    players: z.array(z.object({
        id: z.string().optional(),
        user_id: z.number().optional(),
        first_name: z.string().optional(),
        last_name: z.string().optional(),
        name: z.string()
            .min(1, 'Player name is required')
            .refine((name) => {
                const names = name.split(" ");
                return names.length >= 2 && names[0].length > 1 && names[1].length > 1;
            }, {
                message: 'Player name must include at least a first name and a last name, both longer than 1 character',
            }),
        sport_type: z.string().default('tabletennis'),
        sex: z.string().optional(),
        number: z.number().optional(),
    })).min(1, "Team must have at least one player"),
})

export type TeamFormValues = z.infer<typeof teamSchema>

interface AddTeamDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    tournamentId: string
    initialData: Participant | undefined
}

const TeamForm: React.FC<AddTeamDialogProps> = ({ open, onOpenChange, tournamentId, initialData }) => {
    const toast = useToast()
    const { successToast, errorToast } = useToastNotification(toast)
    const [formKey, setFormKey] = useState(0)

    const form = useForm<TeamFormValues>({
        resolver: zodResolver(teamSchema),
        defaultValues: {
            name: '',
            tournament_id: parseInt(tournamentId),
            players: [{ name: '', first_name: '', last_name: '', user_id: 0, sport_type: 'tabletennis', sex: '', number: 0 }],
        }
    })

    useEffect(() => {
        if (open) {
            if (initialData) {
                console.log(initialData)
                form.reset({
                    name: initialData.name,
                    tournament_id: parseInt(tournamentId),
                    sport_type: initialData.sport_type || 'tabletennis',
                    players: initialData.players.map(player => ({
                        id: player.id,
                        user_id: player.user_id,
                        first_name: player.first_name,
                        last_name: player.last_name,
                        name: `${player.first_name} ${player.last_name}`,
                        sport_type: player.sport_type || 'tabletennis',
                        sex: player.sex,
                        number: player.number,
                    }))
                });
            }
        } else {
            form.reset({
                name: '',
                tournament_id: parseInt(tournamentId),
                players: [{ name: '', first_name: '', last_name: '', user_id: 0, sport_type: 'tabletennis', sex: '', number: 0 }],
            });
            setFormKey(prevKey => prevKey + 1);
        }
    }, [open, initialData, tournamentId]);

    const [searchTerm, setSearchTerm] = useState('')
    const debouncedSearchTerm = useDebounce(searchTerm, 300)

    const { data: playerSuggestions, refetch } = UseGetUsersDebounce(debouncedSearchTerm)
    const usePostParticipant = UseCreateParticipants(parseInt(tournamentId))
    const usePatchParticipant = UseUpdateParticipant(parseInt(tournamentId), initialData?.id!)
    const [focusedIndex, setFocusedIndex] = useState<number | null>(null)

    useEffect(() => {
        if (debouncedSearchTerm) {
            refetch()
        }
    }, [debouncedSearchTerm, refetch])

    const onSubmit = async (values: TeamFormValues) => {
        for (const player of values.players) {
            if (player.user_id === 0  || !player.user_id) {
                try {
                    const user = await fetchUserByName(player.name)
                    if (user) {
                        player.first_name = user.first_name
                        player.last_name = user.last_name
                        player.user_id = user.id
                    } else {
                        const names = player.name.split(" ")
                        player.first_name = names.slice(0, -1).join(" ")
                        player.last_name = names[names.length - 1]
                    }
                } catch (error) {
                    console.error("Error fetching user:", error)
                    errorToast(`Error adding team: ${error}`)
                    return
                }
            }
        }
        try {
            if (initialData) {
                await usePatchParticipant.mutateAsync(values)
            } else {
                await usePostParticipant.mutateAsync(values)
            }
            successToast("Team added successfully")
            onOpenChange(false)
        } catch (error) {
            errorToast(`Error adding team: ${error}`)
        }
    }

    const addPlayer = () => {
        const currentPlayers = form.getValues("players")
        form.setValue("players", [...currentPlayers, { first_name: "", last_name: "", user_id: 0, sport_type: "tabletennis", sex: "", number: 0, name: "" }])
    }

    const removePlayer = (index: number) => {
        const currentPlayers = form.getValues("players")
        if (currentPlayers.length > 1) {
            form.setValue("players", currentPlayers.filter((_, i) => i !== index))
        }
    }

    const setFormValues = (user: UserNew, index: number) => {
        form.setValue(`players.${index}.first_name`, user.first_name)
        form.setValue(`players.${index}.last_name`, user.last_name)
        form.setValue(`players.${index}.user_id`, user.id)
        form.setValue(`players.${index}.name`, user.first_name + " " + user.last_name)
    }

    const players = form.watch("players")

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader className='px-4'>
                    <DialogTitle>{initialData ? 'Edit Team' : 'Add New Team'}</DialogTitle>
                </DialogHeader>
                <Form {...form} key={formKey}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col px-4 max-h-[80vh] min-h-[33vh] overflow-y-auto">
                        <div className='mb-5 flex flex-col gap-3'>
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className='text-lg font-semibold'>Team Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter team name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {players.map((_, index) => (
                                <div key={index} className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <FormField
                                            control={form.control}
                                            name={`players.${index}.name`}
                                            render={({ field }) => (
                                                <FormItem className="flex-1 relative">
                                                    <FormLabel>Player {index + 1}</FormLabel>
                                                    <FormControl>
                                                        <div className='flex justify-between gap-4'>
                                                            <Input
                                                                {...field}
                                                                placeholder="Enter player name"
                                                                autoComplete='off'
                                                                onChange={(e) => {
                                                                    field.onChange(e)
                                                                    setSearchTerm(e.target.value)
                                                                }}
                                                                onFocus={() => setFocusedIndex(index)}
                                                                onBlur={() => {
                                                                    setTimeout(() => setFocusedIndex(null), 200)
                                                                }}
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="destructive"
                                                                onClick={() => removePlayer(index)}
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                    {playerSuggestions && focusedIndex === index && playerSuggestions.data.length > 0 && (
                                                        <div className="absolute w-full mt-1 py-1 bg-background border rounded-md shadow-lg z-10">
                                                            {playerSuggestions.data.map((user, i) => (
                                                                <div
                                                                    key={i}
                                                                    className="px-3 py-2 cursor-pointer hover:bg-accent"
                                                                    onClick={() => {
                                                                        setFormValues(user, index)
                                                                        setFocusedIndex(null)
                                                                    }}
                                                                >
                                                                    {user.first_name} {user.last_name}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            ))}
                            <Button className='mt-6 mb-2' type="button" onClick={addPlayer}>
                                Add Player
                            </Button>
                        </div>
                        <div className="sticky bottom-0 bg-white">
                            <Button type="submit" className="w-full">
                                {initialData ? 'Update Team' : 'Add Team'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

export default TeamForm

