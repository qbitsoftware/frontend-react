import { ChevronDown, Clock, PlayCircle, Trophy } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { SearchWithResults } from "@/components/search-with-results";

interface ScheduleFiltersProps {
  gamedays: string[];
  activeDay: number | string;
  setActiveDay: (day: number | string) => void;
  totalDays: number;
  activeStatus: string;
  setActiveStatus: (status: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export const Filters = ({
  gamedays,
  activeDay,
  setActiveDay,
  activeStatus,
  setActiveStatus,
  searchTerm,
  setSearchTerm,
}: ScheduleFiltersProps) => {
  const { t } = useTranslation();

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        const parts = dateString.split("-");
        if (parts.length === 3) {
          const [, month, day] = parts;
          const monthNames = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ];
          return `${day.padStart(2, "0")} ${monthNames[parseInt(month) - 1]}`;
        }
        return dateString;
      }

      return date.toLocaleDateString("en", {
        day: "2-digit",
        month: "short",
      });
    } catch (error) {
      const parts = dateString.split("-");
      if (parts.length === 3) {
        const [, month, day] = parts;
        const monthNames = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        return `${day.padStart(2, "0")} ${monthNames[parseInt(month) - 1]}`;
      }
      return dateString;
    }
  };

  const getActiveDayDisplay = (): string => {
    if (activeDay === "all") {
      return "All Dates";
    }
    if (typeof activeDay === "number" && gamedays[activeDay]) {
      return formatDate(gamedays[activeDay]);
    }
    return "All Dates";
  };

  const statusOptions = [
    {
      value: "all",
      label: t("competitions.timetable.status_all"),
      icon: null,
    },
    {
      value: "created",
      label: t("competitions.timetable.status_scheduled"),
      icon: Clock,
    },
    {
      value: "ongoing",
      label: t("competitions.timetable.status_pending"),
      icon: PlayCircle,
    },
    {
      value: "finished",
      label: t("competitions.timetable.status_completed"),
      icon: Trophy,
    },
  ];

  const getStatusIcon = () => {
    const option = statusOptions.find((opt) => opt.value === activeStatus);
    return option?.icon || null;
  };

  const StatusIcon = getStatusIcon();

  return (
    <div className="flex flex-col gap-3 sm:gap-4 rounded-[10px] mb-4 sm:mb-6">
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-3 lg:gap-4">
        <SearchWithResults
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          placeholder={t("competitions.timetable.search_placeholder")}
        />

        {gamedays.length > 1 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center justify-between sm:justify-center space-x-2 px-3 sm:px-4 py-2 rounded-lg border text-xs sm:text-sm bg-[#f1f2f7]/70 w-full sm:w-auto"
              >
                <span className="truncate">{getActiveDayDisplay()}</span>
                <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="space-y-1 max-h-[240px] overflow-y-scroll w-64 sm:w-auto">
            {/* All Dates Option */}
            <DropdownMenuItem
              onClick={() => setActiveDay("all")}
              className={activeDay === "all" ? "bg-slate-100" : ""}
            >
              All Dates
            </DropdownMenuItem>

            {gamedays
              .map((date, index) => ({ date, index }))
              .filter(({ date }) => {
                const formatted = formatDate(date);
                return formatted !== "01 Jan";
              })
              .map(({ date, index }) => (
                <DropdownMenuItem
                  key={date}
                  onClick={() => setActiveDay(index)}
                  className={activeDay === index ? "bg-slate-100" : ""}
                >
                  {formatDate(date)}
                </DropdownMenuItem>
              ))}
          </DropdownMenuContent>
          </DropdownMenu>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={`flex items-center justify-between sm:justify-center space-x-2 px-3 sm:px-4 py-2 rounded-lg border text-xs sm:text-sm w-full sm:w-auto ${
                activeStatus === "all"
                  ? "bg-[#f1f2f7]/70"
                  : activeStatus === "upcoming"
                    ? "bg-blue-50 border-blue-200 text-blue-700"
                    : activeStatus === "ongoing"
                      ? "bg-orange-50 border-orange-200 text-orange-700"
                      : "bg-green-50 border-green-200 text-green-700"
              }`}
            >
              <div className="flex items-center space-x-1 sm:space-x-2 truncate">
                {StatusIcon && (
                  <StatusIcon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                )}
                <span className="truncate">
                  {
                    statusOptions.find((opt) => opt.value === activeStatus)
                      ?.label
                  }
                </span>
              </div>
              <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="space-y-1 w-64 sm:w-auto">
            {statusOptions.map((option) => {
              const Icon = option.icon;
              return (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setActiveStatus(option.value)}
                  className={`flex items-center space-x-2 ${activeStatus === option.value ? "bg-slate-100" : ""}`}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  <span>{option.label}</span>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
