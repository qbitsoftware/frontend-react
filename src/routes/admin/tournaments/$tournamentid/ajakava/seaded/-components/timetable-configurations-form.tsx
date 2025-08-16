import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Settings, Play, Pause } from "lucide-react";
import { TournamentTable } from "@/types/groups";
import { Tournament } from "@/types/tournaments";
import { UseGetTournamentTable, UseGenerateTimeTable } from "@/queries/tables";
import { toast } from "sonner";

interface Props {
  tournamentTables: TournamentTable[];
  tournament: Tournament;
}

interface TableConfigProps {
  table: TournamentTable;
  tournament: Tournament;
}

function TableConfiguration({ table, tournament }: TableConfigProps) {
  const { t } = useTranslation();

  const tableQuery = useQuery(UseGetTournamentTable(tournament.id, table.id));

  const getTournamentDateRange = () => {
    // Parse dates safely without timezone issues
    const parseDate = (dateString: string) => {
      const date = new Date(dateString);
      // Get the date in YYYY-MM-DD format without timezone conversion
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

  const { startDate: tournamentStartDate, endDate: tournamentEndDate } =
    getTournamentDateRange();

  // Handle both TournamentTable and TournamentTableWithStages
  const detailedTable = tableQuery.data?.data?.group || table;

  const getInitialDateTime = () => {
    console.log("detailedTable data:", detailedTable);
    console.log("detailedTable.start_date:", detailedTable.start_date);

    const hasStartDate = detailedTable.start_date && detailedTable.start_date !== "";
    let formattedDate = tournamentStartDate;
    let formattedTime = "12:00";

    if (hasStartDate) {
      try {
        console.log("Parsing start_date:", detailedTable.start_date);
        const date = new Date(detailedTable.start_date);
        console.log("Parsed date object:", date);
        if (!isNaN(date.getTime())) {
          formattedDate = date.toISOString().split("T")[0];
          formattedTime = `${date.getHours().toString().padStart(2, "0")}:${date
            .getMinutes()
            .toString()
            .padStart(2, "0")}`;
          console.log("Formatted date/time:", formattedDate, formattedTime);
        }
      } catch (error) {
        void error
      }
    } else {
      console.log("No start_date found, using defaults");
    }

    return { formattedDate, formattedTime };
  };

  const { formattedDate, formattedTime } = getInitialDateTime();
  console.log("Initial detailedTable.time_table:", detailedTable.time_table);
  const [enabled, setEnabled] = useState(detailedTable.time_table || false);
  const [startDate, setStartDate] = useState(formattedDate);
  const [startTime, setStartTime] = useState(formattedTime);
  const [avgMatchDuration, setAvgMatchDuration] = useState(detailedTable.avg_match_duration || 20);
  const [breakDuration, setBreakDuration] = useState(detailedTable.break_duration || 5);
  const [isGenerating, setIsGenerating] = useState(false);

  const timetableMutation = UseGenerateTimeTable(tournament.id, table.id);

  const hasGeneratedTimetable = () => {
    return !!(detailedTable.start_date && detailedTable.start_date !== "");
  };

  const handleGenerateTimetable = async () => {
    if (!enabled) {
      toast.error(t("admin.tournaments.timetable.enable_first"));
      return;
    }

    const isUpdate = hasGeneratedTimetable();
    setIsGenerating(true);
    try {
      const combinedDateTime = new Date(`${startDate}T${startTime}:00`);
      const values = {
        start_date: startDate,
        start_time: combinedDateTime.toISOString(),
        avg_match_duration: avgMatchDuration,
        break_duration: breakDuration,
      };

      await timetableMutation.mutateAsync(values);

      const successMessage = isUpdate
        ? t("admin.tournaments.timetable.updated_successfully")
        : t("admin.tournaments.timetable.generated_successfully");
      toast.success(successMessage);
    } catch (error) {
      const errorMessage = isUpdate
        ? t("admin.tournaments.timetable.update_error")
        : t("admin.tournaments.timetable.generation_error");
      toast.error(errorMessage);
    }
    setIsGenerating(false);
  };

  useEffect(() => {
    if (tableQuery.data?.data) {
      const newTable = tableQuery.data.data?.group || table;
      console.log("useEffect - newTable.time_table:", newTable.time_table);
      setEnabled(newTable.time_table || false);
      setAvgMatchDuration(newTable.avg_match_duration || 20);
      setBreakDuration(newTable.break_duration || 5);

      if (newTable.start_date) {
        try {
          console.log("useEffect - Parsing start_date:", newTable.start_date);
          const date = new Date(newTable.start_date);
          console.log("useEffect - Parsed date object:", date);
          if (!isNaN(date.getTime())) {
            const newFormattedDate = date.toISOString().split("T")[0];
            const newFormattedTime = `${date.getHours().toString().padStart(2, "0")}:${date
              .getMinutes()
              .toString()
              .padStart(2, "0")}`;
            console.log("useEffect - Setting new date/time:", newFormattedDate, newFormattedTime);
            setStartDate(newFormattedDate);
            setStartTime(newFormattedTime);
          }
        } catch (error) {
          void error;
        }
      } else {
        console.log("useEffect - No start_date in newTable:", newTable);
      }
    }
  }, [tableQuery.data]);

  if (tableQuery.isLoading) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center justify-center">
            <div className="text-sm text-gray-500">
              {t("common.loading")}...
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-base">
            <Settings className="h-5 w-5" />
            <span>{detailedTable.class}</span>
          </div>
          <div className="flex flex-row items-center space-x-2 space-y-0">
            <label className="text-sm font-normal">
              {t("admin.tournaments.timetable.enable_timetabling")}
            </label>
            <Switch
              checked={enabled}
              onCheckedChange={setEnabled}
            />
          </div>
        </CardTitle>
      </CardHeader>

      {enabled && (
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                {t("admin.tournaments.timetable.start_date")}
              </label>
              <Input
                type="date"
                min={tournamentStartDate}
                max={tournamentEndDate}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                {t("admin.tournaments.timetable.date_range_info", {
                  start: tournamentStartDate,
                  end: tournamentEndDate,
                })}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                {t("admin.tournaments.timetable.start_time")}
              </label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
          </div>

          {/* Duration Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium mb-2 block">
                {t("admin.tournaments.timetable.match_duration")}
              </label>
              <div className="grid grid-cols-[1fr,80px] items-center gap-4">
                <Slider
                  min={5}
                  max={120}
                  step={5}
                  value={[avgMatchDuration]}
                  onValueChange={(values) => setAvgMatchDuration(values[0])}
                  className="pt-2"
                />
                <Input
                  type="number"
                  min={5}
                  max={120}
                  value={avgMatchDuration}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value)) {
                      setAvgMatchDuration(Math.min(120, Math.max(5, value)));
                    }
                  }}
                  className="w-20"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {t("admin.tournaments.timetable.match_duration_desc")}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                {t("admin.tournaments.timetable.break_duration")}
              </label>
              <div className="grid grid-cols-[1fr,80px] items-center gap-4">
                <Slider
                  min={0}
                  max={60}
                  step={1}
                  value={[breakDuration]}
                  onValueChange={(values) => setBreakDuration(values[0])}
                  className="pt-2"
                />
                <Input
                  type="number"
                  min={0}
                  max={60}
                  value={breakDuration}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value)) {
                      setBreakDuration(Math.min(60, Math.max(0, value)));
                    }
                  }}
                  className="w-20"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {t("admin.tournaments.timetable.break_duration_desc")}
              </p>
            </div>
          </div>

          {/* Generate/Update Timetable Button */}
          <div className="flex justify-end pt-4 border-t">
            <Button
              onClick={handleGenerateTimetable}
              disabled={isGenerating || !enabled}
              className="flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Pause className="h-4 w-4 animate-spin" />
                  {hasGeneratedTimetable()
                    ? t("admin.tournaments.timetable.updating")
                    : t("admin.tournaments.timetable.generating")
                  }
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  {hasGeneratedTimetable()
                    ? t("admin.tournaments.timetable.update")
                    : t("admin.tournaments.timetable.generate")
                  }
                </>
              )}
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export default function TimetableConfigurationsForm({
  tournamentTables,
  tournament,
}: Props) {
  return (
    <div className="space-y-6">
      {tournamentTables.map((table) => (
        <TableConfiguration
          key={table.id}
          table={table}
          tournament={tournament}
        />
      ))}
    </div>
  );
}
