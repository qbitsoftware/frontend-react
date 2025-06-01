import { Input } from "@/components/ui/input";
import { Search, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { MatchWrapper } from "@/types/matches";

interface ScheduleFiltersProps {
  matches: MatchWrapper[];
  gamedays: string[];
  activeDay: number;
  setActiveDay: (day: number) => void;
  totalDays: number;
  classes: string[];
  activeClass: string;
  setActiveClass: (classValue: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export const Filters = ({
  matches,
  gamedays,
  activeDay,
  setActiveDay,
  totalDays,
  classes,
  activeClass,
  setActiveClass,
  searchTerm,
  setSearchTerm,
}: ScheduleFiltersProps) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-wrap gap-4 justify-between rounded-[10px]">
      <div className="flex items-center gap-4">
        {classes.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-12 flex items-center space-x-2 px-4 py-2 rounded-lg border text-sm bg-[#E9F2FC]"
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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-12 flex items-center space-x-2 px-4 py-2 rounded-lg border text-sm bg-[#E9F2FC]"
            >
              <span>
                {/* (${getFormattedDate(gamedays[activeDay])}) */}
                {gamedays[activeDay]
                  ? `${t("competitions.timetable.gameday")} ${activeDay + 1} `
                  : `${t("competitions.timetable.gameday")} ${activeDay + 1}`}
              </span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="space-y-1">
            {Array.from({ length: totalDays }).map((_, index) => (
              <DropdownMenuItem
                key={index}
                onClick={() => setActiveDay(index)}
                className={activeDay === index ? "bg-slate-100" : ""}
              >
                {gamedays[index]
                  ? // (${getFormattedDate(gamedays[index])})
                    `${t("competitions.timetable.gameday")} ${index + 1} `
                  : `${t("competitions.timetable.gameday")} ${index + 1}`}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-2 px-2">
        <div className="relative">
          <Input
            type="text"
            placeholder={t("competitions.timetable.search_placeholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10 pl-4 pr-10 py-2 text-slate-900 bg-[#FCFCFD] focus:outline-none focus:ring-1 focus:ring-gray-300 border-[#EBEEF4]"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2  text-gray-400" />
        </div>
        <p className="text-[#15803D] bg-[#EBFEF2] py-1 px-4 flex items-center rounded-lg font-medium text-sm">
          {matches.length} mängu
        </p>
      </div>
    </div>
  );
};
