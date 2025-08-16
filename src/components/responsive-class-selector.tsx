import { cn } from "@/lib/utils";
import { TournamentTable } from "@/types/groups";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";

interface ResponsiveClassSelectorProps {
  // For tulemused route (TournamentTable objects)
  availableTables?: TournamentTable[];
  activeGroupId?: number;
  onGroupChange?: (groupId: number) => void;
  
  // For ajakava route (string classes)
  classes?: string[];
  activeClass?: string;
  onClassChange?: (classValue: string) => void;
  
  // Required prop
  variant?: "tables" | "classes";
}

export const ResponsiveClassSelector = ({
  availableTables = [],
  activeGroupId,
  onGroupChange,
  classes = [],
  activeClass = "all",
  onClassChange,
  variant = "tables",
}: ResponsiveClassSelectorProps) => {
  const { t } = useTranslation();

  // For tulemused route (tables variant)
  if (variant === "tables") {
    if (availableTables.length <= 1) {
      return null;
    }

    const activeTable = availableTables.find(
      (table) =>
        table.id === activeGroupId ||
        (table.stages && table.stages.some((stage) => stage.id === activeGroupId))
    );

    return (
      <div className="bg-white border border-gray-200 shadow-sm mb-4 sm:mb-6 rounded-lg">
        <div className="px-4">
          <div className="flex items-center justify-between">
            {/* Mobile Dropdown (hidden on md and up) */}
            <div className="flex-1 md:hidden py-3">
              <Select
                value={activeGroupId?.toString()}
                onValueChange={(value) => onGroupChange?.(parseInt(value))}
              >
                <SelectTrigger className="w-full h-9 text-sm">
                  <SelectValue>
                    {activeTable ? activeTable.class : "Select class"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {availableTables.map((table) => (
                    <SelectItem key={table.id} value={table.id.toString()}>
                      {table.class}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Desktop Horizontal Scroll (hidden on mobile) */}
            <div className="hidden md:flex overflow-x-auto scrollbar-hide flex-1">
              <div className="flex space-x-1 sm:space-x-2 py-3">
                {availableTables.map((table) => {
                  const isActive =
                    table.id === activeGroupId ||
                    (table.stages && table.stages.some((stage) => stage.id === activeGroupId));

                  return (
                    <button
                      key={table.id}
                      onClick={() => onGroupChange?.(table.id)}
                      className={cn(
                        "flex-shrink-0 px-3 sm:px-4 py-2 text-sm font-medium transition-all duration-200 border-b-2 rounded-t-md min-w-[80px] sm:min-w-[100px]",
                        isActive
                          ? "border-[#4C97F1] text-gray-800 bg-blue-50/30"
                          : "border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                      )}
                    >
                      <span
                        className="font-medium text-center leading-tight truncate"
                        title={table.class}
                      >
                        {table.class}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // For ajakava route (classes variant)
  if (variant === "classes") {
    if (classes.length <= 1) {
      return null;
    }

    const currentSelection = activeClass || "all";

    return (
      <div className="bg-white border border-gray-200 shadow-sm mb-4 sm:mb-6 rounded-lg">
        <div className="px-4">
          <div className="flex items-center justify-between">
            {/* Mobile Dropdown (hidden on md and up) */}
            <div className="flex-1 md:hidden py-3">
              <Select
                value={currentSelection}
                onValueChange={(value) => onClassChange?.(value)}
              >
                <SelectTrigger className="w-full h-9 text-sm">
                  <SelectValue>
                    {currentSelection === "all" 
                      ? t("competitions.timetable.all_groups") 
                      : currentSelection}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("competitions.timetable.all_groups")}
                  </SelectItem>
                  {classes.map((classValue) => (
                    <SelectItem key={classValue} value={classValue}>
                      {classValue}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Desktop Horizontal Scroll (hidden on mobile) */}
            <div className="hidden md:flex overflow-x-auto scrollbar-hide flex-1">
              <div className="flex space-x-1 sm:space-x-2 py-3">
                {/* All Classes Button */}
                <button
                  onClick={() => onClassChange?.("all")}
                  className={cn(
                    "flex-shrink-0 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-all duration-200 border-b-2 rounded-t-md min-w-[80px] sm:min-w-[100px]",
                    currentSelection === "all"
                      ? "border-[#4C97F1] text-gray-800 bg-blue-50/30"
                      : "border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                  )}
                >
                  <span className="font-medium max-w-[100px] sm:max-w-[130px] text-center">
                    {t("competitions.timetable.all_groups")}
                  </span>
                </button>
                
                {/* Individual Class Buttons */}
                {classes.map((classValue) => (
                  <button
                    key={classValue}
                    onClick={() => onClassChange?.(classValue)}
                    className={cn(
                      "flex-shrink-0 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-all duration-200 border-b-2 rounded-t-md min-w-[80px] sm:min-w-[100px]",
                      currentSelection === classValue
                        ? "border-[#4C97F1] text-gray-800 bg-blue-50/30"
                        : "border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                    )}
                  >
                    <span className="font-medium max-w-[100px] sm:max-w-[130px] text-center">
                      {classValue}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};