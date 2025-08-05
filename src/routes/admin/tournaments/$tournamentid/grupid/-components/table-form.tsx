import Loader from '@/components/loader'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { UseDeleteTournamentTable, UsePatchTournamentTable, UsePostTournamentTable } from '@/queries/tables'
import { UseGetTournamentSizes, UseGetTournamentTypes } from '@/queries/tournaments'
import { DialogType, TournamentTable } from '@/types/groups'
import { GroupType } from '@/types/matches'
import { zodResolver } from '@hookform/resolvers/zod'
import { useParams, useRouter } from '@tanstack/react-router'
import { TFunction } from 'i18next'
import { Loader2 } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { toast } from 'sonner'
import { Slider } from '@/components/ui/slider'


const createFormSchema = (t: TFunction) => z.object({
  class: z.string().min(1, t('admin.tournaments.groups.errors.class')),
  type: z.string().min(1, t('admin.tournaments.groups.errors.type')),
  solo: z.boolean(),
  min_team_size: z.number().optional(),
  max_team_size: z.number().optional(),
  woman_weight: z.number().min(1).max(10),
  dialog_type: z.string().optional(),
  size: z.number(),
  time_table: z.boolean().optional(),
  second_class: z.string().optional(),
  has_consolation: z.boolean().optional(),
  consolation_class: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.solo) return;

  if (data.dialog_type == "") {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: t('admin.tournaments.groups.errors.dialog_type'),
      path: ['dialog_type']
    });
  }

  if (data.min_team_size === undefined) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: t('admin.tournaments.groups.errors.min_team_size'),
      path: ['min_team_size']
    });
  } else if (data.min_team_size < 2) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: t('admin.tournaments.groups.errors.min_team_size'),
      path: ['min_team_size']
    });
  }

  if (data.type === GroupType.DYNAMIC && data.second_class === "") {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: t('admin.tournaments.groups.errors.second_class'),
      path: ['second_class']
    });
  }

  if (data.type === GroupType.DYNAMIC && data.has_consolation && data.consolation_class === "") {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: t('admin.tournaments.groups.errors.consolation_class'),
      path: ['consolation_class']
    });
  }

  if (data.max_team_size === undefined) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: t('admin.tournaments.groups.errors.min_team_size'),
      path: ['max_team_size']
    });
  } else if (data.max_team_size < 2) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: t('admin.tournaments.groups.errors.min_team_size'),
      path: ['max_team_size']
    });
  }
});

export type TournamentTableForm = z.infer<ReturnType<typeof createFormSchema>>

interface TableFormProps {
  initial_data: TournamentTable | undefined
  onTimetableToggle?: (enabled: boolean) => void
}

export const TournamentTableForm: React.FC<TableFormProps> = ({ initial_data }) => {

  const { t } = useTranslation()

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [womanWeightInputValue, setWomanWeightInputValue] = useState<string>(
    initial_data?.woman_weight ? String(initial_data.woman_weight) : '1'
  )

  const formSchema = createFormSchema(t)

  const { tournamentid } = useParams({ strict: false })

  const { data: tournament_sizes, isLoading } = UseGetTournamentSizes()
  const { data: tournament_types, isLoading: isLoadingTypes } = UseGetTournamentTypes()
  const deleteMutation = UseDeleteTournamentTable(Number(tournamentid), initial_data?.id)
  const router = useRouter()

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: initial_data
      ? {
        ...initial_data,
      }
      : {
        class: "",
        type: "",
        solo: false,
        dialog_type: "",
        min_team_size: 2,
        max_team_size: 2,
        size: 16,
        woman_weight: 1,
        start_time: "",
        avg_match_duration: 15,
        time_table: false,
        second_class: "",
        has_consolation: false,
        consolation_class: "",
      },
  })

  let postMutation = UsePostTournamentTable(Number(tournamentid))
  if (initial_data) {
    postMutation = UsePatchTournamentTable(Number(tournamentid), initial_data.id)
  }

  // Automatically set solo to true when dynamic type is selected
  const watchedType = form.watch("type");
  useEffect(() => {
    if (watchedType === GroupType.DYNAMIC) {
      form.setValue("solo", true);
      form.setValue("dialog_type", "");
    }
  }, [watchedType, form])

  const handleSubmit = async (values: TournamentTableForm) => {
    try {
      if (values.solo) {
        values.dialog_type = ""
      }
      const res = await postMutation.mutateAsync(values)
      if (initial_data) {
        toast.message(t('toasts.tournament_tables.updated'))
        router.navigate({
          to: `/admin/tournaments/${tournamentid}/grupid/${initial_data.id}/`,
        })
      } else {
        toast.message(t('toasts.tournament_tables.created'))
        router.navigate({
          to: `/admin/tournaments/${tournamentid}/grupid/${res.data.id}/`,
        })
      }
    } catch {
      if (initial_data) {
        toast.error(t('toasts.tournament_tables.updated_error'))
      } else {
        toast.error(t('toasts.tournament_tables.created_error'))
      }
    }
  }

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync()
      router.navigate({
        to: `/admin/tournaments/${Number(tournamentid)}/grupid/`,
        replace: true,
      })
      toast.message(t('toasts.tournament_tables.deleted'))
      setShowDeleteDialog(false)
    } catch {
      toast.error(t('toasts.tournament_tables.deleted_error'))
    }
  }

  return (
    <div className=''>
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("admin.tournaments.confirmations.delete.question")}</AlertDialogTitle>
            <AlertDialogDescription>{t("admin.tournaments.confirmations.delete.description")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("admin.tournaments.confirmations.delete.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 text-white hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("admin.tournaments.confirmations.delete.deleting")}
                </>
              ) : (
                t("admin.tournaments.confirmations.delete.title")
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Card className="w-full border-stone-100">
        <CardHeader className=''>
          <h5 className="font-medium">
            {initial_data ? t("admin.tournaments.create_tournament.edit_group") : t("admin.tournaments.create_tournament.create_group")}
          </h5>
        </CardHeader>
        <CardContent className='px-8'>
          <Form {...form} >
            <form onSubmit={form.handleSubmit(handleSubmit)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="class"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("admin.tournaments.create_tournament.class")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("admin.tournaments.create_tournament.class_placeholder")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("admin.tournaments.create_tournament.type")}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("admin.tournaments.create_tournament.type_placeholder")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isLoadingTypes && (
                            <SelectItem className="flex justify-center items-center" value="loading">
                              <Loader />
                            </SelectItem>
                          )}
                          {tournament_types && tournament_types.data && tournament_types.data.map((type) => {
                            return (
                              <SelectItem key={type.id} value={type.name}>
                                {t(`admin.tournaments.create_tournament.tournament_tables.${type.name}`)}
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />


                {form.watch("type") === GroupType.ROUND_ROBIN || form.watch("type") === GroupType.ROUND_ROBIN_FULL_PLACEMENT ? (
                  <div></div>
                ) : form.watch("type") === GroupType.DYNAMIC ?
                  (
                    <>
                      <FormItem>
                        <FormLabel>
                          {form.watch("type") === GroupType.DYNAMIC
                            ? t("admin.tournaments.create_tournament.max_participants")
                            : t("admin.tournaments.create_tournament.tournament_size")
                          }
                        </FormLabel>
                        <Select
                          onValueChange={(value) => form.setValue("size", Number.parseInt(value, 10))}
                          defaultValue={String(form.getValues().size || "")}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={"Vali turniiri suurus"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {isLoading && (
                              <SelectItem className="flex justify-center items-center" value="loading">
                                <Loader />
                              </SelectItem>
                            )}
                            {tournament_sizes && tournament_sizes.data && tournament_sizes.data.map((size) => {
                              return (
                                <SelectItem key={size.id} value={String(size.size)}>
                                  {size.size}
                                </SelectItem>
                              )
                            })}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                      <FormField
                        control={form.control}
                        name="second_class"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("admin.tournaments.create_tournament.main_bracket")}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={t("admin.tournaments.create_tournament.main_bracket_placeholder")} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {tournament_types && tournament_types.data && tournament_types.data.map((type) => {
                                  if (type.id === 2 || type.id === 1 || type.name === "double_elimination_tabletennis" || type.name === "double_elimination_tabletennis_top_heavy") {
                                    return (
                                      <SelectItem key={type.id} value={type.name}>
                                        {t(`admin.tournaments.create_tournament.tournament_tables.${type.name}`)}
                                      </SelectItem>
                                    )
                                  }
                                })}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="has_consolation"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="">
                              <FormLabel className="text-base">{t("admin.tournaments.create_tournament.consolation_bracket")}</FormLabel>
                              <FormDescription>{t("admin.tournaments.create_tournament.consolation_bracket_description")}</FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value || false}
                                onCheckedChange={(checked) => {
                                  field.onChange(checked);
                                  if (!checked) {
                                    form.setValue("consolation_class", "");
                                  }
                                }}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      {form.watch("has_consolation") && (
                        <FormField
                          control={form.control}
                          name="consolation_class"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("admin.tournaments.create_tournament.consolation_bracket_type")}</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder={t("admin.tournaments.create_tournament.consolation_bracket_placeholder")} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {tournament_types && tournament_types.data && tournament_types.data.map((type) => {
                                    if (type.id === 2 || type.id === 1 || type.name === "double_elimination_tabletennis" || type.name === "double_elimination_tabletennis_top_heavy") {
                                      return (
                                        <SelectItem key={type.id} value={type.name}>
                                          {t(`admin.tournaments.create_tournament.tournament_tables.${type.name}`)}
                                        </SelectItem>
                                      )
                                    }
                                  })}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </>
                  ) : form.watch("type") === GroupType.CHAMPIONS_LEAGUE ? <div></div> : (
                    <FormItem>
                      <FormLabel>{t("admin.tournaments.create_tournament.tournament_size")}</FormLabel>
                      <Select
                        onValueChange={(value) => form.setValue("size", Number.parseInt(value, 10))}
                        defaultValue={String(form.getValues().size || "")}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={"Vali turniiri suurus"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isLoading && (
                            <SelectItem className="flex justify-center items-center" value="loading">
                              <Loader />
                            </SelectItem>
                          )}
                          {tournament_sizes && tournament_sizes.data && tournament_sizes.data.map((size) => {
                            if (size.size == 24 && !(form.watch("type") == GroupType.DOUBLE_ELIM_TABLETENNIS || form.watch("type") == GroupType.DOUBLE_ELIM_TABLETENNIS_TOP_HEAVY)) {
                              return null
                            }
                            return (
                              <SelectItem key={size.id} value={String(size.size)}>
                                {size.size}
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}

                {form.watch("type") !== GroupType.DYNAMIC && (
                  <FormField
                    control={form.control}
                    name="solo"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="">
                          <FormLabel className="text-base">{t("admin.tournaments.create_tournament.team")}</FormLabel>
                          <FormDescription>{t("admin.tournaments.create_tournament.team_description")}</FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={!field.value}
                            onCheckedChange={(checked) => {
                              field.onChange(!checked);
                              if (!checked) {
                                form.setValue("dialog_type", "");
                              }
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}

                {!form.watch("solo") && (
                  <FormField
                    control={form.control}
                    name="dialog_type"
                    render={({ field }) => (
                      <FormItem className='mb-4'>
                        <FormLabel>{t("admin.tournaments.create_tournament.dialog_type")}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t("admin.tournaments.create_tournament.dialog_type_placeholder")} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="team_leagues">
                              {t("admin.tournaments.create_tournament.team_leagues")}
                            </SelectItem>
                            {form.watch("type") !== GroupType.ROUND_ROBIN && form.watch("type") !== GroupType.ROUND_ROBIN_FULL_PLACEMENT && form.watch("type") !== GroupType.CHAMPIONS_LEAGUE &&
                              (
                                <>
                                  <SelectItem value="doubles">
                                    {t("admin.tournaments.create_tournament.doubles")}
                                  </SelectItem>
                                  <SelectItem value="fixed_doubles">
                                    {t("admin.tournaments.create_tournament.fixed_doubles")}
                                  </SelectItem>
                                </>
                              )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

              </div>
              <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-6", form.watch("dialog_type") !== DialogType.DT_TEAM_LEAGUES ? "hidden" : "")}>
                <FormField
                  control={form.control}
                  name="min_team_size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("admin.tournaments.create_tournament.min_team_size")}</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === "") {
                              field.onChange(0);
                            } else {
                              const cleanedValue = value.replace(/^0+/, '');
                              field.onChange(cleanedValue === '' ? 0 : Number.parseInt(cleanedValue));
                            }
                          }}
                          value={field.value === 0 ? '' : field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="max_team_size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("admin.tournaments.create_tournament.max_team_size")}</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === "") {
                              field.onChange(0);
                            } else {
                              const cleanedValue = value.replace(/^0+/, '');
                              field.onChange(cleanedValue === '' ? 0 : Number.parseInt(cleanedValue));
                            }
                          }}
                          value={field.value === 0 ? '' : field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              </div>

              <FormField
                control={form.control}
                name="woman_weight"
                render={({ field }) => (
                  < FormItem className="w-[1/2] mt-5">
                    <FormLabel>{t("admin.tournaments.create_tournament.woman_weight")}</FormLabel>
                    <div className="grid grid-cols-[1fr,80px] items-center gap-4">
                      <FormControl>
                        <Slider
                          min={1}
                          max={10}
                          step={0.1}
                          value={[field.value && field.value >= 1 && field.value <= 10 ? field.value : 1]}
                          onValueChange={(values) => {
                            field.onChange(values[0]);
                            setWomanWeightInputValue(String(values[0]));
                          }}
                          className="pt-2"
                        />
                      </FormControl>
                      <FormControl>
                        <Input
                          type='text'
                          value={womanWeightInputValue}
                          onChange={(e) => {
                            const value = e.target.value;

                            setWomanWeightInputValue(value);

                            if (value === '') {
                              return;
                            }

                            if (!/^\d*\.?\d*$/.test(value)) {
                              return;
                            }

                            const numValue = parseFloat(value);
                            if (!isNaN(numValue)) {
                              if (numValue > 10) {
                                field.onChange(10);
                                setWomanWeightInputValue('10');
                              } else if (numValue < 1) {
                                field.onChange(1);
                                setWomanWeightInputValue('1');
                              } else {
                                field.onChange(numValue);
                              }
                            }
                          }}
                          onBlur={() => {
                            if (womanWeightInputValue === '') {
                              field.onChange(1);
                              setWomanWeightInputValue('1');
                            } else {
                              const numValue = parseFloat(womanWeightInputValue);
                              if (numValue < 1) {
                                field.onChange(1);
                                setWomanWeightInputValue('1');
                              } else if (numValue > 10) {
                                field.onChange(10);
                                setWomanWeightInputValue('10');
                              } else {
                                field.onChange(numValue);
                              }
                            }
                          }}
                          className="w-20"
                        />
                      </FormControl>
                    </div>
                    <FormDescription>
                      {t("admin.tournaments.create_tournament.woman_weight_description")}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-between gap-4 mt-10">
                {initial_data && (
                  <Button type="button" className="text-red-600" onClick={() => setShowDeleteDialog(true)} variant={"outline"}>
                    {t("admin.tournaments.create_tournament.title_delete_table")}
                  </Button>
                )}
                <Button type="submit" className="md:w-[200px] w-full">
                  {initial_data
                    ? t("admin.tournaments.create_tournament.title_edit_table")
                    : t("admin.tournaments.create_tournament.title_create_table")}
                </Button>

              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div >
  )
}

export default TournamentTableForm
