import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import {
  CalendarIcon,
  Loader2,
  Building,
  FileText,
  FileSpreadsheet,
  Mail,
} from "lucide-react";
import { useRouter } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  UsePostTournament,
  UsePatchTournament,
  UseDeleteTournament,
} from "@/queries/tournaments";
import { useTranslation } from "react-i18next";
import { useState as useStateOriginal } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { YooptaContentValue } from "@yoopta/editor";
import Editor from "../../-components/yooptaeditor";
import { TFunction } from "i18next";
import { Tournament } from "@/types/tournaments";
import { toast } from "sonner";

const createFormSchema = (t: TFunction) =>
  z
    .object({
      name: z
        .string()
        .min(4, {
          message: t("admin.tournaments.create_tournament.errors.name_min"),
        })
        .max(40, {
          message: t("admin.tournaments.create_tournament.errors.name_max"),
        }),
      start_date: z.date({
        message: t("admin.tournaments.create_tournament.errors.start_date"),
      }),
      end_date: z.date({
        message: t("admin.tournaments.create_tournament.errors.end_date"),
      }),
      sport: z.string({
        message: t("admin.tournaments.create_tournament.errors.sport"),
      }),
      total_tables: z
        .number()
        .min(1, {
          message: t("admin.tournaments.create_tournament.errors.total_tables"),
        })
        .max(200, {
          message: t(
            "admin.tournaments.create_tournament.errors.total_tables_max"
          ),
        }),
      category: z.string().optional(),
      location: z
        .string()
        .min(1, {
          message: t("admin.tournaments.create_tournament.errors.location"),
        }),
      organizer: z.string().optional(),
      information: z.any(),
      private: z.boolean(),
      calc_rating: z.boolean(),
      rating_coef: z
        .number()
        .min(1, {
          message: t(
            "admin.tournaments.create_tournament.errors.rating_coef_min"
          ),
        })
        .max(2, {
          message: t(
            "admin.tournaments.create_tournament.errors.rating_coef_max"
          ),
        }),
      registration_type: z.string({
        message: t(
          "admin.tournaments.create_tournament.errors.registration_type"
        ),
      }),
      registration_link: z.string({ message: "" }).optional(),
      registered_players_link: z.string({ message: "" }).optional(),
    })
    .refine(
      (data) => {
        // Validate registration_link for URL-based registration types
        if (
          data.registration_type === "onsite" ||
          data.registration_type === "email"
        ) {
          return true;
        }
        if (
          (data.registration_type === "google_forms" ||
            data.registration_type === "excel") &&
          data.registration_link
        ) {
          return (
            data.registration_link.startsWith("https://") ||
            data.registration_link.startsWith("http://")
          );
        }

        return false;
      },
      {
        message: t("admin.tournaments.create_tournament.errors.invalid_url"),
        path: ["registration_link"],
      }
    )
    .refine(
      (data) => {
        // Validate registered_players_link if provided
        if (data.registration_type === "onsite") {
          return true;
        }
        if (
          data.registration_type === "email" &&
          data.registered_players_link &&
          data.registered_players_link.trim() !== ""
        ) {
          return (
            data.registered_players_link.startsWith("https://") ||
            data.registered_players_link.startsWith("http://")
          );
        } else if (data.registration_type === "email") {
          return true;
        }
        if (
          (data.registration_type === "google_forms" ||
            data.registration_type === "excel") &&
          data.registered_players_link
        ) {
          return (
            data.registered_players_link.startsWith("https://") ||
            data.registered_players_link.startsWith("http://")
          );
        }
        return false;
      },
      {
        message: t("admin.tournaments.create_tournament.errors.invalid_url"),
        path: ["registered_players_link"],
      }
    );

export type TournamentFormValues = z.infer<ReturnType<typeof createFormSchema>>;

interface TournamentFormProps {
  initial_data: Tournament | undefined | null;
}

export const TournamentForm: React.FC<TournamentFormProps> = ({
  initial_data,
}) => {
  const { t } = useTranslation();

  const [value, setValue] = useState<YooptaContentValue | undefined>(
    initial_data && initial_data.information
      ? JSON.parse(initial_data?.information)
      : undefined
  );
  const formSchema = createFormSchema(t);

  const form = useForm<TournamentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initial_data
      ? {
          ...initial_data,
          start_date: new Date(initial_data.start_date),
          end_date: new Date(initial_data.end_date),
          rating_coef:
            initial_data.rating_coef == 0 ? 1 : initial_data.rating_coef,
          registration_type: initial_data.registration_type || "onsite",
          registered_players_link: initial_data.registered_players_link || "",
          registration_link: initial_data.registration_link || "",
        }
      : {
          name: "",
          start_date: new Date(),
          end_date: new Date(),
          total_tables: 1,
          sport: "tabletennis",
          location: "",
          organizer: "",
          category: "",
          information: "",
          private: false,
          calc_rating: false,
          rating_coef: 1,
          registration_type: "onsite",
          registration_link: "",
          registered_players_link: "",
        },
  });

  const [showDeleteDialog, setShowDeleteDialog] = useStateOriginal(false);
  const deleteMutation = UseDeleteTournament(initial_data?.id);
  const router = useRouter();

  let postMutation = UsePostTournament();
  if (initial_data) {
    postMutation = UsePatchTournament(initial_data.id);
  }

  useEffect(() => {
    if (initial_data && initial_data.information != "") {
      setValue(JSON.parse(initial_data.information));
    }
  }, [initial_data]);

  const onSubmit = async (values: TournamentFormValues) => {
    try {
      values.information = JSON.stringify(value);
      if (values.registration_type === "onsite") {
        values.registration_link = "";
        values.registered_players_link = "";
      }
      const result = await postMutation.mutateAsync(values);
      if (initial_data) {
        toast.message(t("toasts.tournaments.updated"));
      } else {
        if (result.data) {
          router.navigate({
            to: `/admin/tournaments/${result.data.id}`,
            replace: true,
          });
        } else {
          router.navigate({ to: `/admin/tournaments`, replace: true });
        }
        toast.message(t("toasts.tournaments.created"));
      }
    } catch (error) {
      void error;
      if (initial_data) {
        toast.error(t("toasts.tournaments.updated_error"));
      } else {
        toast.error(t("toasts.tournaments.created_error"));
      }
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync();
      router.navigate({
        to: `/admin/tournaments`,
        replace: true,
      });
      toast.message(t("toasts.tournaments.deleted"));
      setShowDeleteDialog(false);
    } catch (error) {
      void error;
      toast.error(t("toasts.tournaments.deleted_error"));
    }
  };

  return (
    <div className="">
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("admin.tournaments.confirmations.delete.question")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("admin.tournaments.confirmations.delete.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t("admin.tournaments.confirmations.delete.cancel")}
            </AlertDialogCancel>
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

      <Card className="w-full shadow-none border-none bg-transparent ">
        <CardContent className="p-4 rounded-lg bg-card border border-stone-100 shadow-sm">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="space-y-6">
                <div className="border-b pb-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {t(
                      "admin.tournaments.create_tournament.basic_info",
                      "Basic Information"
                    )}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {t(
                      "admin.tournaments.create_tournament.basic_info_desc",
                      "Essential tournament details"
                    )}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem id="tutorial-tournament-name">
                        <FormLabel className="text-sm font-medium">
                          {t("admin.tournaments.create_tournament.name")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            id="tournament-name-input"
                            autoComplete="off"
                            placeholder={t(
                              "admin.tournaments.create_tournament.name_placeholder"
                            )}
                            className="h-10"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem id="tutorial-tournament-location">
                        <FormLabel className="text-sm font-medium">
                          {t("admin.tournaments.create_tournament.location")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            id="tournament-location-input"
                            autoComplete="off"
                            placeholder={t(
                              "admin.tournaments.create_tournament.location_placeholder"
                            )}
                            className="h-10"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="start_date"
                    render={({ field }) => (
                      <FormItem
                        className="flex flex-col"
                        id="tutorial-tournament-start-date"
                      >
                        <FormLabel className="text-sm font-medium">
                          {t("admin.tournaments.create_tournament.start_date")}
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                id="start-date-button"
                                variant={"outline"}
                                className={`w-full h-10 pl-3 text-left font-normal justify-start ${!field.value && "text-muted-foreground"}`}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>
                                    {t(
                                      "admin.tournaments.create_tournament.start_date_placeholder"
                                    )}
                                  </span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="end_date"
                    render={({ field }) => (
                      <FormItem
                        className="flex flex-col"
                        id="tutorial-tournament-end-date"
                      >
                        <FormLabel className="text-sm font-medium">
                          {t("admin.tournaments.create_tournament.end_date")}
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                id="end-date-button"
                                variant={"outline"}
                                className={`w-full h-10 pl-3 text-left font-normal justify-start ${!field.value && "text-muted-foreground"}`}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>
                                    {t(
                                      "admin.tournaments.create_tournament.start_date_placeholder"
                                    )}
                                  </span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="total_tables"
                    render={({ field }) => (
                      <FormItem id="tutorial-tournament-tables">
                        <FormLabel className="text-sm font-medium">
                          {t(
                            "admin.tournaments.create_tournament.number_of_tables"
                          )}
                        </FormLabel>
                        <FormControl>
                          <Input
                            id="tournament-tables-input"
                            type="number"
                            placeholder={t(
                              "admin.tournaments.create_tournament.number_of_tables_placeholder"
                            )}
                            className="h-10"
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === "") {
                                field.onChange(0);
                              } else {
                                const cleanedValue = value.replace(/^0+/, "");
                                field.onChange(
                                  cleanedValue === ""
                                    ? 0
                                    : Number.parseInt(cleanedValue)
                                );
                              }
                            }}
                            value={field.value === 0 ? "" : field.value}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="organizer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          {t("admin.tournaments.create_tournament.organizer")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            autoComplete="off"
                            placeholder={t(
                              "admin.tournaments.create_tournament.organizer_placeholder"
                            )}
                            className="h-10"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="registration_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          {t(
                            "admin.tournaments.create_tournament.registration_type",
                            "Registration"
                          )}
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-10">
                              <SelectValue
                                placeholder={t(
                                  "admin.tournaments.create_tournament.registration_type_placeholder",
                                  "Select registration type"
                                )}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="onsite">
                              <div className="flex items-center gap-2">
                                <Building className="h-4 w-4" />
                                {t(
                                  "admin.tournaments.create_tournament.registration_onsite",
                                  "Registration on-site at the venue"
                                )}
                              </div>
                            </SelectItem>
                            <SelectItem value="google_forms">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-purple-600" />
                                {t(
                                  "admin.tournaments.create_tournament.registration_google_forms",
                                  "Google Forms"
                                )}
                              </div>
                            </SelectItem>
                            <SelectItem value="excel">
                              <div className="flex items-center gap-2">
                                <FileSpreadsheet className="h-4 w-4 text-green-600" />
                                {t(
                                  "admin.tournaments.create_tournament.registration_excel",
                                  "Excel"
                                )}
                              </div>
                            </SelectItem>
                            <SelectItem value="email">
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-blue-600" />
                                {t(
                                  "admin.tournaments.create_tournament.registration_email",
                                  "Registration by Email"
                                )}
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {(form.watch("registration_type") === "google_forms" ||
                    form.watch("registration_type") === "excel" ||
                    form.watch("registration_type") === "email") && (
                    <FormField
                      control={form.control}
                      name="registration_link"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">
                            {form.watch("registration_type") === "google_forms"
                              ? t(
                                  "admin.tournaments.create_tournament.google_forms_link",
                                  "Google Forms Link"
                                )
                              : form.watch("registration_type") === "excel"
                                ? t(
                                    "admin.tournaments.create_tournament.excel_link",
                                    "Excel Sheet Link"
                                  )
                                : t(
                                    "admin.tournaments.create_tournament.email_address",
                                    "Email Address"
                                  )}
                          </FormLabel>
                          <FormControl>
                            <Input
                              autoComplete="off"
                              placeholder={
                                form.watch("registration_type") ===
                                "google_forms"
                                  ? t(
                                      "admin.tournaments.create_tournament.google_forms_link_placeholder",
                                      "Enter Google Forms URL"
                                    )
                                  : form.watch("registration_type") === "excel"
                                    ? t(
                                        "admin.tournaments.create_tournament.excel_link_placeholder",
                                        "Enter Excel sheet URL"
                                      )
                                    : t(
                                        "admin.tournaments.create_tournament.email_address_placeholder",
                                        "Enter email address"
                                      )
                              }
                              className="h-10"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {form.watch("registration_type") !== "onsite" && (
                    <FormField
                      control={form.control}
                      name="registered_players_link"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">
                            {t(
                              "admin.tournaments.create_tournament.registered_players_link",
                              "Registered Players List Link (Optional)"
                            )}
                          </FormLabel>
                          <FormControl>
                            <Input
                              autoComplete="off"
                              placeholder={t(
                                "admin.tournaments.create_tournament.registered_players_link_placeholder",
                                "Enter link where players can see registered participants"
                              )}
                              className="h-10"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </div>

              {/* Configuration Section */}
              <div className="space-y-6">
                <div className="border-b pb-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {t(
                      "admin.tournaments.create_tournament.configuration",
                      "Configuration"
                    )}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {t(
                      "admin.tournaments.create_tournament.configuration_desc",
                      "Tournament settings and options"
                    )}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="calc_rating"
                    render={({ field }) => (
                      <FormItem
                        className="flex flex-row items-center justify-between rounded-lg border border-gray-200 bg-gray-50/50 p-4"
                        id="tutorial-tournament-rating"
                      >
                        <div className="space-y-0.5 pr-4">
                          <FormLabel className="text-sm font-medium">
                            {t("admin.tournaments.create_tournament.ranking")}
                          </FormLabel>
                          <FormDescription className="text-xs">
                            {t(
                              "admin.tournaments.create_tournament.ranking_description"
                            )}
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            id="tournament-rating-switch"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="private"
                    render={({ field }) => (
                      <FormItem
                        className="flex flex-row items-center justify-between rounded-lg border border-gray-200 bg-gray-50/50 p-4"
                        id="tutorial-tournament-private"
                      >
                        <div className="space-y-0.5 pr-4">
                          <FormLabel className="text-sm font-medium">
                            {t("admin.tournaments.create_tournament.private")}
                          </FormLabel>
                          <FormDescription className="text-xs">
                            {t(
                              "admin.tournaments.create_tournament.private_description"
                            )}
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            id="tournament-private-switch"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Rating Coefficient */}
                <FormField
                  control={form.control}
                  name="rating_coef"
                  render={({ field }) => (
                    <FormItem
                      className="space-y-3"
                      id="tutorial-tournament-rating-coef"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <FormLabel className="text-sm font-medium">
                            {t(
                              "admin.tournaments.create_tournament.rating_coef"
                            )}
                          </FormLabel>
                          <FormDescription className="text-xs mt-1">
                            {t(
                              "admin.tournaments.create_tournament.rating_coef_description"
                            )}
                          </FormDescription>
                        </div>
                        <div className="text-sm font-semibold bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                          {field.value}
                        </div>
                      </div>
                      <FormControl>
                        <input
                          type="range"
                          min={1}
                          max={2}
                          step={0.05}
                          value={field.value}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Additional Information Section */}
              <div className="space-y-6">
                <div className="border-b pb-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {t(
                      "admin.tournaments.create_tournament.additional_information"
                    )}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {t(
                      "admin.tournaments.create_tournament.additional_info_desc",
                      "Optional details and description"
                    )}
                  </p>
                </div>

                <div
                  className="bg-gray-50/50 rounded-lg p-4 border border-gray-200"
                  id="tutorial-tournament-information"
                >
                  <Editor value={value} setValue={setValue} readOnly={false} />
                </div>
              </div>

              {/* Action Buttons */}
              <div
                className="flex flex-col-reverse gap-4 pt-6 border-t md:flex-row md:justify-between"
                id="tutorial-tournament-create"
              >
                {initial_data && (
                  <Button
                    type="button"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => setShowDeleteDialog(true)}
                    variant={"outline"}
                  >
                    {t("admin.tournaments.delete")}
                  </Button>
                )}
                <Button
                  id="tournament-create-button"
                  type="submit"
                  className="md:w-[200px] w-full h-11 font-medium"
                >
                  {initial_data
                    ? t("admin.tournaments.create_tournament.button_edit")
                    : t("admin.tournaments.create_tournament.button_create")}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
