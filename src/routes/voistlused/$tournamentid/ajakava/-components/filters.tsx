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
import { cn } from "@/lib/utils";

interface ScheduleFiltersProps {
  gamedays: string[];
  activeDay: number | string;
  setActiveDay: (day: number | string) => void;
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
  classes,
  activeClass,
  setActiveClass,
  activeStatus,
  setActiveStatus,
  searchTerm,
  setSearchTerm,
}: ScheduleFiltersProps) => {
  const { t } = useTranslation();

  // Format date for display
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        // Fallback: try to format manually if Date parsing fails
        const parts = dateString.split('-');
        if (parts.length === 3) {
          const [, month, day] = parts;
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          return `${day.padStart(2, '0')} ${monthNames[parseInt(month) - 1]}`;
        }
        return dateString;
      }
      
      return date.toLocaleDateString('en', {
        day: '2-digit',
        month: 'short'
      });
    } catch (error) {
      console.error('Date formatting error:', error, 'for date:', dateString);
      // Fallback: try to format manually
      const parts = dateString.split('-');
      if (parts.length === 3) {
        const [, month, day] = parts;
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${day.padStart(2, '0')} ${monthNames[parseInt(month) - 1]}`;
      }
      return dateString;
    }
  };

  // Get display text for active day
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
      {/* Class Navigation Bar */}
      {classes.length > 0 && (
        <div className="bg-white border border-gray-200 shadow-sm mb-4 sm:mb-6 rounded-lg">
          <div className="px-2 sm:px-4">
            <div className="flex overflow-x-auto scrollbar-hide">
              <div className="flex space-x-1 sm:space-x-2 py-3">
                {/* All Classes Button */}
                <button
                  onClick={() => setActiveClass("all")}
                  className={cn(
                    "flex-shrink-0 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-all duration-200 border-b-2 rounded-t-md min-w-[80px] sm:min-w-[100px]",
                    activeClass === "all"
                      ? "border-[#4C97F1] text-gray-800 bg-blue-50/30"
                      : "border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                  )}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-medium max-w-[100px] sm:max-w-[130px] text-center">
                      {t("competitions.timetable.all_groups")}
                    </span>
                  </div>
                </button>
                
                {/* Individual Class Buttons */}
                {classes.map((classValue) => (
                  <button
                    key={classValue}
                    onClick={() => setActiveClass(classValue)}
                    className={cn(
                      "flex-shrink-0 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-all duration-200 border-b-2 rounded-t-md min-w-[80px] sm:min-w-[100px]",
                      activeClass === classValue
                        ? "border-[#4C97F1] text-gray-800 bg-blue-50/30"
                        : "border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                    )}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span className="font-medium max-w-[100px] sm:max-w-[130px] text-center">
                        {classValue}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile: Stack all filters vertically */}
      {/* Desktop: Original layout */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-3 lg:gap-4">

        {/* Date Filter */}
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
            
            {/* Individual Date Options */}
            {gamedays.map((date, index) => (
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

        {/* Status Filter */}
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
                {StatusIcon && <StatusIcon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />}
                <span className="truncate">
                  {statusOptions.find((opt) => opt.value === activeStatus)?.label}
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

      {/* Search and Results */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
        <div className="relative flex-1 sm:max-w-xs">
          <Input
            type="text"
            placeholder={t("competitions.timetable.search_placeholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9 sm:h-10 pl-4 pr-10 py-2 text-slate-900 bg-[#FCFCFD] focus:outline-none focus:ring-1 focus:ring-gray-300 border-[#EBEEF4] text-sm"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4" />
        </div>
        <div className="text-center sm:text-left">
          <p className="text-[#15803D] bg-[#EBFEF2] py-1.5 sm:py-1 px-3 sm:px-4 flex items-center justify-center rounded-lg font-medium text-xs sm:text-sm">
            {filteredMatchCount} games
          </p>
        </div>
      </div>
    </div>
  );
};
