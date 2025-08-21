import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Settings, Play, Pause } from "lucide-react";
import { TournamentTable } from "@/types/groups";
import { Tournament } from "@/types/tournaments";
import { toast } from "sonner";
import { UseGenerateTimeTable } from "@/queries/tables";
import { UseUpdateTimetableVisibility } from "@/queries/tournaments";
import { Switch } from "@/components/ui/switch";
import { Globe, Lock } from "lucide-react";

export interface TimeTableFormValues {
  id: number;
  time_table: boolean;
  start_date: string | null;
  start_time: string | null;
  avg_match_duration: number | null;
  break_duration: number | null;
  concurrency_priority: boolean;
}

interface Props {
  tournamentTables: TournamentTable[];
  tournament: Tournament;
}

export default function TimetableConfigurationsForm({
  tournamentTables,
  tournament,
}: Props) {
  const { t } = useTranslation();

  // Global configuration state
  const [avgMatchDuration, setAvgMatchDuration] = useState(20);
  const [breakDuration, setBreakDuration] = useState(5);
  const [concurrencyPriority, setConcurrencyPriority] = useState(false);
  const [selectedTables, setSelectedTables] = useState<Set<number>>(new Set());
  const [tableStartTimes, setTableStartTimes] = useState<Map<number, { date: string; time: string }>>(new Map());
  const [isGenerating, setIsGenerating] = useState(false);

  const timetableMutation = UseGenerateTimeTable(tournament.id);
  const timetableVisibilityMutation = UseUpdateTimetableVisibility(tournament.id);

  const getTournamentDateRange = () => {
    const parseDate = (dateString: string) => {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const startDate = tournament.start_date
      ? parseDate(tournament.start_date)
      : new Date().toISOString().split("T")[0];
    const endDate = tournament.end_date
      ? parseDate(tournament.end_date)
      : startDate;
    return { startDate, endDate };
  };

  const { startDate: tournamentStartDate, endDate: tournamentEndDate } = getTournamentDateRange();

  useEffect(() => {
    const enabledTables = new Set<number>();
    const startTimes = new Map<number, { date: string; time: string }>();

    tournamentTables.forEach(table => {
      if (table.time_table) {
        enabledTables.add(table.id);

        if (table.start_date) {
          setAvgMatchDuration(table.avg_match_duration || 20);
          setBreakDuration(table.break_duration || 5);
          setConcurrencyPriority(table.concurrency_priority);
          try {
            const date = new Date(table.start_date);
            if (!isNaN(date.getTime())) {
              const formattedDate = date.toISOString().split("T")[0];
              const formattedTime = `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
              startTimes.set(table.id, {
                date: formattedDate,
                time: formattedTime
              });
            } else {
              startTimes.set(table.id, {
                date: tournamentStartDate,
                time: "12:00"
              });
            }
          } catch (error) {
            startTimes.set(table.id, {
              date: tournamentStartDate,
              time: "12:00"
            });
          }
        } else {
          startTimes.set(table.id, {
            date: tournamentStartDate,
            time: "12:00"
          });
        }
      } else {
        startTimes.set(table.id, {
          date: tournamentStartDate,
          time: "12:00"
        });
      }
    });

    setSelectedTables(enabledTables);
    setTableStartTimes(startTimes);
  }, [tournamentTables, tournamentStartDate]);

  const handleTableToggle = (tableId: number, checked: boolean) => {
    const newSelectedTables = new Set(selectedTables);
    if (checked) {
      newSelectedTables.add(tableId);
    } else {
      newSelectedTables.delete(tableId);
    }
    setSelectedTables(newSelectedTables);
  };

  const handleTableTimeChange = (tableId: number, field: 'date' | 'time', value: string) => {
    const newStartTimes = new Map(tableStartTimes);
    const current = newStartTimes.get(tableId) || { date: tournamentStartDate, time: "12:00" };
    newStartTimes.set(tableId, {
      ...current,
      [field]: value
    });
    setTableStartTimes(newStartTimes);
  };

  const handleTimetableVisibilityToggle = async (isPublic: boolean) => {
    try {
      await timetableVisibilityMutation.mutateAsync({
        visibility: isPublic
      });
      // setIsTTPublic(isPublic);
      toast.success(isPublic ?
        t('admin.tournaments.timetable.made_public') :
        t('admin.tournaments.timetable.made_private'));
    } catch {
      toast.error(t('admin.tournaments.timetable.visibility_error'));
    }
  };

  const handleGenerateTimetable = async () => {
    setIsGenerating(true);
    const tt_info: TimeTableFormValues[] = [];
    try {
      // Send all tables with their timetable status
      for (const table of tournamentTables) {
        const isSelected = selectedTables.has(table.id);
        const tableStartTime = tableStartTimes.get(table.id);

        const values: TimeTableFormValues = {
          id: table.id,
          time_table: isSelected, // Include the enabled/disabled status
          start_date: isSelected && tableStartTime ? tableStartTime.date : null,
          start_time: isSelected && tableStartTime ? new Date(`${tableStartTime.date}T${tableStartTime.time}:00`).toISOString() : null,
          avg_match_duration: isSelected ? avgMatchDuration : null,
          break_duration: isSelected ? breakDuration : null,
          concurrency_priority: isSelected ? concurrencyPriority : false,
        };
        tt_info.push(values);
      }


      await timetableMutation.mutateAsync(tt_info);

      toast.success(t("admin.tournaments.timetable.generated_successfully"));
    } catch {
      toast.error(t("admin.tournaments.timetable.generation_error"));
    }
    setIsGenerating(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base text-gray-700">
            {tournament.timetable_visibility ? (
              <Globe className="h-4 w-4" />
            ) : (
              <Lock className="h-4 w-4" />
            )}
            <span className="text-sm font-medium">{t("admin.tournaments.timetable.visibility")}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">
                {t("admin.tournaments.timetable.public_timetable")}
              </p>
              <p className="text-xs text-gray-500">
                {t("admin.tournaments.timetable.public_timetable_desc")}
              </p>
            </div>
            <Switch
              checked={tournament.timetable_visibility}
              onCheckedChange={handleTimetableVisibilityToggle}
              disabled={timetableVisibilityMutation.isPending}
            />
          </div>
        </CardContent>
      </Card>

      {/* Global Configuration */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base text-gray-700">
            <Settings className="h-4 w-4" />
            <span className="text-sm font-medium">{t("admin.tournaments.timetable.global_configuration")}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 2xl:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium mb-2 block">
                {t("admin.tournaments.timetable.match_duration")}
              </label>
              <div className="flex items-center gap-3">
                <Slider
                  min={5}
                  max={120}
                  step={5}
                  value={[avgMatchDuration]}
                  onValueChange={(values) => setAvgMatchDuration(values[0])}
                  className="flex-1"
                />
                <span className="text-sm font-medium w-12 text-right">{avgMatchDuration}m</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {t("admin.tournaments.timetable.match_duration_desc")}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                {t("admin.tournaments.timetable.break_duration")}
              </label>
              <div className="flex items-center gap-3">
                <Slider
                  min={1}
                  max={30}
                  step={1}
                  value={[breakDuration]}
                  onValueChange={(values) => setBreakDuration(values[0])}
                  className="flex-1"
                />
                <span className="text-sm font-medium w-12 text-right">{breakDuration}m</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {t("admin.tournaments.timetable.break_duration_desc")}
              </p>
            </div>

            <div className="flex flex-col w-full">
              <label className="text-sm font-medium mb-2 block">
                {t("admin.tournaments.timetable.concurrency_priority")}
              </label>
              <Switch
                checked={concurrencyPriority}
                onCheckedChange={setConcurrencyPriority}
              />
              <p className="text-xs text-gray-500 mt-1">
                {t("admin.tournaments.timetable.concurrency_priority_desc")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">
            {t("admin.tournaments.timetable.select_tables")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {tournamentTables && tournamentTables.sort((a, b) => a.id - b.id).map((table) => (
              <div key={table.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id={`table-${table.id}`}
                    checked={selectedTables.has(table.id)}
                    onCheckedChange={(checked) => handleTableToggle(table.id, checked as boolean)}
                  />
                  <label
                    htmlFor={`table-${table.id}`}
                    className="text-sm font-medium cursor-pointer flex-1 sm:min-w-[100px]"
                  >
                    {table.class}
                  </label>
                </div>

                <div className="flex gap-2 sm:ml-auto">
                  <Input
                    type="date"
                    min={tournamentStartDate}
                    max={tournamentEndDate}
                    value={tableStartTimes.get(table.id)?.date || tournamentStartDate}
                    onChange={(e) => handleTableTimeChange(table.id, 'date', e.target.value)}
                    disabled={!selectedTables.has(table.id)}
                    className="flex-1 sm:w-36"
                  />

                  <Input
                    type="time"
                    value={tableStartTimes.get(table.id)?.time || "12:00"}
                    onChange={(e) => handleTableTimeChange(table.id, 'time', e.target.value)}
                    disabled={!selectedTables.has(table.id)}
                    className="flex-1 sm:w-24"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-6 border-t mt-6">
            <Button
              onClick={handleGenerateTimetable}
              disabled={isGenerating}
              className="flex items-center gap-2 w-full sm:w-auto"
            >
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
