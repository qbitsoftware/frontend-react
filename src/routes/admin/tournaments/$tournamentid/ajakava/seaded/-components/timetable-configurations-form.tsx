import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
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
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Settings, Save } from "lucide-react";
import { TournamentTable } from "@/types/groups";
import { Tournament } from "@/types/tournaments";
import { toast } from "sonner";

const timetableConfigSchema = z.object({
  configurations: z.array(
    z.object({
      id: z.number(),
      class: z.string(),
      enabled: z.boolean(),
      start_date: z.string().optional(),
      start_time: z.string().optional(),
      avg_match_duration: z.number().min(5).max(120),
      break_duration: z.number().min(0).max(60),
    })
  ),
});

export type TimetableConfigValues = z.infer<typeof timetableConfigSchema>;

interface Props {
  tournamentTables: TournamentTable[];
  tournament: Tournament;
}

export default function TimetableConfigurationsForm({
  tournamentTables,
  tournament,
}: Props) {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get tournament date range
  const getTournamentDateRange = () => {
    const startDate = tournament.start_date
      ? new Date(tournament.start_date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0];
    const endDate = tournament.end_date
      ? new Date(tournament.end_date).toISOString().split("T")[0]
      : startDate;
    return { startDate, endDate };
  };

  const { startDate: tournamentStartDate, endDate: tournamentEndDate } =
    getTournamentDateRange();

  // Initialize form with current tournament table settings
  const getInitialConfigurations = () => {
    return tournamentTables.map((table) => {
      const hasStartDate = table.start_date && table.start_date !== "";
      let formattedDate = tournamentStartDate;
      let formattedTime = "12:00";

      if (hasStartDate) {
        try {
          const date = new Date(table.start_date);
          if (!isNaN(date.getTime())) {
            formattedDate = date.toISOString().split("T")[0];
            formattedTime = `${date.getHours().toString().padStart(2, "0")}:${date
              .getMinutes()
              .toString()
              .padStart(2, "0")}`;
          }
        } catch (error) {
          console.error("Error parsing date:", error);
        }
      }

      return {
        id: table.id,
        class: table.class,
        enabled: table.time_table || false,
        start_date: formattedDate,
        start_time: formattedTime,
        avg_match_duration: table.avg_match_duration || 20,
        break_duration: table.break_duration || 5,
      };
    });
  };

  const form = useForm<TimetableConfigValues>({
    resolver: zodResolver(timetableConfigSchema),
    defaultValues: {
      configurations: getInitialConfigurations(),
    },
  });

  // Reset form when tournament tables change
  useEffect(() => {
    form.reset({
      configurations: getInitialConfigurations(),
    });
  }, [tournamentTables]);

  const handleSubmit = async (values: TimetableConfigValues) => {
    setIsSubmitting(true);
    try {
      console.log("Updating timetable configurations:", values);
      
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      toast.success(t("admin.tournaments.timetable.configurations_saved"));
    } catch (error) {
      console.error("Error saving configurations:", error);
      toast.error(t("admin.tournaments.timetable.configurations_save_error"));
    }
    setIsSubmitting(false);
  };

  const configurations = form.watch("configurations");

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {configurations.map((config, index) => (
            <Card key={config.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    <span>{config.class}</span>
                  </div>
                  <FormField
                    control={form.control}
                    name={`configurations.${index}.enabled`}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                        <FormLabel className="text-sm font-normal">
                          {t("admin.tournaments.timetable.enable_timetabling")}
                        </FormLabel>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardTitle>
              </CardHeader>

              {config.enabled && (
                <CardContent className="space-y-6">
                  {/* Date and Time Settings */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`configurations.${index}.start_date`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t("admin.tournaments.timetable.start_date")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              min={tournamentStartDate}
                              max={tournamentEndDate}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            {t("admin.tournaments.timetable.date_range_info", {
                              start: tournamentStartDate,
                              end: tournamentEndDate,
                            })}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`configurations.${index}.start_time`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t("admin.tournaments.timetable.start_time")}
                          </FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
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
                      name={`configurations.${index}.avg_match_duration`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t("admin.tournaments.timetable.match_duration")}
                          </FormLabel>
                          <div className="grid grid-cols-[1fr,80px] items-center gap-4">
                            <FormControl>
                              <Slider
                                min={5}
                                max={120}
                                step={5}
                                value={[field.value || 20]}
                                onValueChange={(values) => {
                                  field.onChange(values[0]);
                                }}
                                className="pt-2"
                              />
                            </FormControl>
                            <FormControl>
                              <Input
                                type="number"
                                min={5}
                                max={120}
                                value={field.value}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value);
                                  if (!isNaN(value)) {
                                    field.onChange(Math.min(120, Math.max(5, value)));
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
                      name={`configurations.${index}.break_duration`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t("admin.tournaments.timetable.break_duration")}
                          </FormLabel>
                          <div className="grid grid-cols-[1fr,80px] items-center gap-4">
                            <FormControl>
                              <Slider
                                min={0}
                                max={60}
                                step={1}
                                value={[field.value || 5]}
                                onValueChange={(values) => {
                                  field.onChange(values[0]);
                                }}
                                className="pt-2"
                              />
                            </FormControl>
                            <FormControl>
                              <Input
                                type="number"
                                min={0}
                                max={60}
                                value={field.value}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value);
                                  if (!isNaN(value)) {
                                    field.onChange(Math.min(60, Math.max(0, value)));
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
                </CardContent>
              )}
            </Card>
          ))}

          <div className="flex justify-end pt-6">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Save className="h-4 w-4 animate-spin" />
                  {t("admin.tournaments.timetable.saving")}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {t("admin.tournaments.timetable.save_configurations")}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
