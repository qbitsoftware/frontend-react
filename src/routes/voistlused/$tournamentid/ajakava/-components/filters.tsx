import { Input } from "@/components/ui/input";
import { Search, ChevronDown, Clock, PlayCircle, Trophy } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface ScheduleFiltersProps {
  gamedays: string[];
  activeDay: number;
  setActiveDay: (day: number) => void;
  totalDays: number;
  classes: string[];
  activeClass: string;
  setActiveClass: (classValue: string) => void;
  activeStatus: string;
  setActiveStatus: (status: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredMatchCount: number;
}

export const Filters = ({
  filteredMatchCount,
  gamedays,
  activeDay,
  setActiveDay,
  totalDays,
  classes,
  activeClass,
  setActiveClass,
  activeStatus,
  setActiveStatus,
  searchTerm,
  setSearchTerm,
}: ScheduleFiltersProps) => {
  const { t } = useTranslation();

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
    <div className="flex flex-col md:flex-row flex-wrap gap-4 justify-between rounded-[10px]">
      <div className="flex items-center gap-4 px-2">
        {/* Class Filter */}
        {classes.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center space-x-2 px-4 py-2 rounded-lg border text-sm bg-[#f1f2f7]/70"
              >
                <span>
                  {activeClass === "all"
                    ? t("competitions.timetable.all_groups")
                    : `${activeClass}`}
                </span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="space-y-1">
              <DropdownMenuItem
                onClick={() => setActiveClass("all")}
                className={activeClass === "all" ? "bg-slate-100" : ""}
              >
                {t("competitions.timetable.all_groups")}
              </DropdownMenuItem>
              {classes.map((classValue) => (
                <DropdownMenuItem
                  key={classValue}
                  onClick={() => setActiveClass(classValue)}
                  className={activeClass === classValue ? "bg-slate-100" : ""}
                >
                  {classValue}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Gameday Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center space-x-2 px-4 py-2 rounded-lg border text-sm bg-[#f1f2f7]/70"
            >
              <span>
                {gamedays[activeDay]
                  ? `${t("competitions.timetable.gameday")} ${activeDay + 1}`
                  : `${t("competitions.timetable.gameday")} ${activeDay + 1}`}
              </span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="space-y-1 max-h-[240px] overflow-y-scroll">
            {Array.from({ length: totalDays }).map((_, index) => (
              <DropdownMenuItem
                key={index}
                onClick={() => setActiveDay(index)}
                className={activeDay === index ? "bg-slate-100" : ""}
              >
                {gamedays[index]
                  ? `${t("competitions.timetable.gameday")} ${index + 1}`
                  : `${t("competitions.timetable.gameday")} ${index + 1}`}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Status Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border text-sm ${
                activeStatus === "all"
                  ? "bg-[#f1f2f7]/70"
                  : activeStatus === "upcoming"
                    ? "bg-blue-50 border-blue-200 text-blue-700"
                    : activeStatus === "ongoing"
                      ? "bg-orange-50 border-orange-200 text-orange-700"
                      : "bg-green-50 border-green-200 text-green-700"
              }`}
            >
              {StatusIcon && <StatusIcon className="h-4 w-4" />}
              <span>
                {statusOptions.find((opt) => opt.value === activeStatus)?.label}
              </span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="space-y-1">
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

      <div className="flex items-start md:items-center flex-col gap-4 md:flex-row md:gap-2 px-2">
        <div className="relative">
          <Input
            type="text"
            placeholder={t("competitions.timetable.search_placeholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10 pl-4 pr-10 py-2 text-slate-900 bg-[#FCFCFD] focus:outline-none focus:ring-1 focus:ring-gray-300 border-[#EBEEF4]"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
        <p className="text-[#15803D] bg-[#EBFEF2] py-1 px-4 flex items-center rounded-lg font-medium text-sm">
          {filteredMatchCount} games
        </p>
      </div>
    </div>
  );
};
