import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { z } from "zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Settings, Play, Pause, RotateCcw } from 'lucide-react'
import { TournamentTable } from "@/types/groups"
import { UseGenerateTimeTable } from "@/queries/tables"

const timetableSchema = z.object({
    start_date: z.string().min(1, "Start date is required"),
    start_time: z.string().min(1, "Start time is required"),
    avg_match_duration: z.number().min(5).max(120),
    break_duration: z.number().min(0).max(60),
})

export type TimetableFormValues = z.infer<typeof timetableSchema>


interface Props {
    tournament_table: TournamentTable
}

export default function TimetableForm({ tournament_table }: Props) {
    const { t } = useTranslation()
    const [durationInputValue, setDurationInputValue] = useState<string>('avg_match_duration' in tournament_table ? String(tournament_table.avg_match_duration) : '20')
    const [breakInputValue, setBreakInputValue] = useState<string>('break_duration' in tournament_table ? String(tournament_table.break_duration) : '5')
    const [isGenerating, setIsGenerating] = useState(false)
    const timetableMutation = UseGenerateTimeTable(tournament_table.tournament_id, tournament_table.id)

    const getInitialDateTime = () => {
        if (tournament_table.start_date) {
            const date = new Date(tournament_table.start_date)
            if (!isNaN(date.getTime())) {
                const year = date.getFullYear().toString().padStart(4, '0')
                const month = (date.getMonth() + 1).toString().padStart(2, '0')
                const day = date.getDate().toString().padStart(2, '0')
                const hours = date.getHours().toString().padStart(2, '0')
                const minutes = date.getMinutes().toString().padStart(2, '0')

                return {
                    date: `${year}-${month}-${day}`,
                    time: `${hours}:${minutes}`
                }
            }
        }

        const now = new Date()
        const year = now.getFullYear().toString().padStart(4, '0')
        const month = (now.getMonth() + 1).toString().padStart(2, '0')
        const day = now.getDate().toString().padStart(2, '0')

        return {
            date: `${year}-${month}-${day}`,
            time: '12:00'
        }
    }

    const initialDateTime = getInitialDateTime()

    const form = useForm<TimetableFormValues>({
        resolver: zodResolver(timetableSchema),
        defaultValues: {
            start_date: initialDateTime.date,
            start_time: initialDateTime.time,
            avg_match_duration: tournament_table.avg_match_duration || 20,
            break_duration: tournament_table.break_duration || 5,
        },
    })

    const handleGenerateTimetable = async (values: TimetableFormValues) => {
        setIsGenerating(true)
        try {
            const combinedDateTime = new Date(`${values.start_date}T${values.start_time}:00`)
            const formattedValues = {
                ...values,
                start_time: combinedDateTime.toISOString(),
            }
            await timetableMutation.mutateAsync(formattedValues)
        } catch (error) {
            console.error("Error generating timetable:", error)
        }
        setIsGenerating(false)
    }

    const handleResetTimetable = () => {
        const resetDateTime = getInitialDateTime()
        form.reset({
            start_date: resetDateTime.date,
            start_time: resetDateTime.time,
            avg_match_duration: 20,
            break_duration: 5,
        })
        setDurationInputValue('20')
        setBreakInputValue('5')
    }

    return (
        <div className="space-y-6">
            <div className="pt-4">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 p-3 text-lg">
                                <Settings className="h-5 w-5" />
                                {t("admin.tournaments.timetable.settings")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(handleGenerateTimetable)} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="start_date"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        {t("admin.tournaments.timetable.start_date")}
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="date"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="start_time"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        {t("admin.tournaments.timetable.start_time")}
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="time"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {/* Duration Settings */}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="avg_match_duration"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{t("admin.tournaments.timetable.match_duration")}</FormLabel>
                                                    <div className="grid grid-cols-[1fr,80px] items-center gap-4">
                                                        <FormControl>
                                                            <Slider
                                                                min={5}
                                                                max={120}
                                                                step={5}
                                                                value={[field.value || 20]}
                                                                onValueChange={(values) => {
                                                                    field.onChange(values[0]);
                                                                    setDurationInputValue(String(values[0]));
                                                                }}
                                                                className="pt-2"
                                                            />
                                                        </FormControl>
                                                        <FormControl>
                                                            <Input
                                                                type='text'
                                                                value={durationInputValue}
                                                                onChange={(e) => {
                                                                    const value = e.target.value;
                                                                    setDurationInputValue(value);
                                                                    if (value === '') return;
                                                                    if (!/^\d+$/.test(value)) return;
                                                                    const numValue = parseInt(value);
                                                                    if (numValue > 120) {
                                                                        field.onChange(120);
                                                                        setDurationInputValue('120');
                                                                    } else {
                                                                        field.onChange(numValue);
                                                                    }
                                                                }}
                                                                onBlur={() => {
                                                                    if (durationInputValue === '') {
                                                                        field.onChange(20);
                                                                        setDurationInputValue('20');
                                                                    } else {
                                                                        const numValue = parseInt(durationInputValue);
                                                                        if (numValue < 5) {
                                                                            field.onChange(5);
                                                                            setDurationInputValue('5');
                                                                        } else if (numValue > 120) {
                                                                            field.onChange(120);
                                                                            setDurationInputValue('120');
                                                                        }
                                                                    }
                                                                }}
                                                                className="w-20"
                                                            />
                                                        </FormControl>
                                                    </div>
                                                    <FormDescription>
                                                        {t("admin.tournaments.timetable.match_duration_desc")}
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="break_duration"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{t("admin.tournaments.timetable.break_duration")}</FormLabel>
                                                    <div className="grid grid-cols-[1fr,80px] items-center gap-4">
                                                        <FormControl>
                                                            <Slider
                                                                min={0}
                                                                max={60}
                                                                step={1}
                                                                value={[field.value || 5]}
                                                                onValueChange={(values) => {
                                                                    field.onChange(values[0]);
                                                                    setBreakInputValue(String(values[0]));
                                                                }}
                                                                className="pt-2"
                                                            />
                                                        </FormControl>
                                                        <FormControl>
                                                            <Input
                                                                type='text'
                                                                value={breakInputValue}
                                                                onChange={(e) => {
                                                                    const value = e.target.value;
                                                                    setBreakInputValue(value);
                                                                    if (value === '') return;
                                                                    if (!/^\d+$/.test(value)) return;
                                                                    const numValue = parseInt(value);
                                                                    if (numValue > 60) {
                                                                        field.onChange(60);
                                                                        setBreakInputValue('60');
                                                                    } else {
                                                                        field.onChange(numValue);
                                                                    }
                                                                }}
                                                                onBlur={() => {
                                                                    if (breakInputValue === '') {
                                                                        field.onChange(5);
                                                                        setBreakInputValue('5');
                                                                    } else {
                                                                        const numValue = parseInt(breakInputValue);
                                                                        if (numValue < 0) {
                                                                            field.onChange(0);
                                                                            setBreakInputValue('0');
                                                                        } else if (numValue > 60) {
                                                                            field.onChange(60);
                                                                            setBreakInputValue('60');
                                                                        }
                                                                    }
                                                                }}
                                                                className="w-20"
                                                            />
                                                        </FormControl>
                                                    </div>
                                                    <FormDescription>
                                                        {t("admin.tournaments.timetable.break_duration_desc")}
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="flex gap-4 pt-6">
                                        <Button type="submit" disabled={isGenerating} className="flex items-center gap-2">
                                            {isGenerating ? (
                                                <>
                                                    <Pause className="h-4 w-4 animate-spin" />
                                                    {t("admin.tournaments.timetable.generating")}
                                                </>
                                            ) : (
                                                <>
                                                    <Play className="h-4 w-4" />
                                                    {t("admin.tournaments.timetable.generate")}
                                                </>
                                            )}
                                        </Button>
                                        <Button type="button" variant="outline" onClick={handleResetTimetable} className="flex items-center gap-2">
                                            <RotateCcw className="h-4 w-4" />
                                            {t("admin.tournaments.timetable.reset")}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
