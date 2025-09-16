import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import { TournamentTableWithStages } from "@/queries/tables";

interface ResponsiveClassSelectorProps {
  // For tulemused route (TournamentTable objects)
  availableTables?: TournamentTableWithStages[];
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

  if (variant === "tables") {
    if (availableTables.length <= 1) {
      return null;
    }

    const sortedTables = [...availableTables].sort((a, b) => {
      const parseClass = (className: string) => {
        const match = className.match(/^(Poisid|Tüdrukud)\s*U?(\d+)$/i);
        if (match) {
          return {
            gender: match[1].toLowerCase(),
            age: parseInt(match[2])
          };
        }
        return { gender: className.toLowerCase(), age: 0 };
      };

      const classA = parseClass(a.group.class);
      const classB = parseClass(b.group.class);

      if (classA.gender !== classB.gender) {
        return classA.gender.localeCompare(classB.gender);
      }

      return classA.age - classB.age;
    });

    const activeTable = sortedTables.find(
      (table) =>
        table.group.id === activeGroupId ||
        (table.stages && table.stages.some((stage) => stage.id === activeGroupId))
    );

    return (
      <div className="bg-white border border-gray-200 shadow-sm mb-0 sm:mb-6 rounded-lg">
        <div className="px-0">
          <div className="flex items-center justify-between">
            {/* Mobile Dropdown (hidden on md and up) */}
            <div className="flex-1 md:hidden ">
              <Select
                value={activeGroupId?.toString()}
                onValueChange={(value) => onGroupChange?.(parseInt(value))}
              >
                <SelectTrigger className="w-full h-9 text-sm">
                  <SelectValue>
                    {activeTable ? activeTable.group.class : "Select class"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="z-[150]">
                  {sortedTables.map((table) => (
                    <SelectItem key={table.group.id} value={table.group.id.toString()}>
                      {table.group.class}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Desktop Horizontal Scroll (hidden on mobile) */}
            <div className="hidden md:flex overflow-x-auto scrollbar-hide flex-1">
              <div className="flex space-x-1 sm:space-x-2 py-2">
                {sortedTables.map((table) => {
                  const isActive =
                    table.group.id === activeGroupId ||
                    (table.stages && table.stages.some((stage) => stage.id === activeGroupId));

                  return (
                    <button
                      key={table.group.id}
                      onClick={() => onGroupChange?.(table.group.id)}
                      className={cn(
                        "flex-shrink-0 px-3 sm:px-4 py-2 text-sm font-medium transition-all duration-200 border-b-2 rounded-t-md min-w-[80px] sm:min-w-[100px]",
                        isActive
                          ? "border-[#4C97F1] text-gray-800 bg-blue-50/30"
                          : "border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                      )}
                    >
                      <span
                        className="font-medium text-center leading-tight truncate"
                        title={table.group.class}
                      >
                        {table.group.class}
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

    const sortedClasses = [...classes].sort((a, b) => {
      // Extract gender and age from class names like "Poisid U11", "Tudrukud U9"
      const parseClass = (className: string) => {
        const match = className.match(/^(Poisid|Tudrukud)\s*U?(\d+)$/i);
        if (match) {
          return {
            gender: match[1].toLowerCase(),
            age: parseInt(match[2])
          };
        }
        return { gender: className.toLowerCase(), age: 0 };
      };

      const classA = parseClass(a);
      const classB = parseClass(b);

      // Sort by gender first (Poisid before Tudrukud)
      if (classA.gender !== classB.gender) {
        return classA.gender.localeCompare(classB.gender);
      }

      // Then sort by age
      return classA.age - classB.age;
    });
    const currentSelection = activeClass || "all";

    return (
      <div className="bg-white border border-gray-200 shadow-sm mb-4 sm:mb-6 rounded-lg">
        <div className="px-0">
          <div className="flex items-center justify-between">
            {/* Mobile Dropdown (hidden on md and up) */}
            <div className="flex-1 md:hidden py-0">
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
                <SelectContent className="z-[150]">
                  <SelectItem value="all">
                    {t("competitions.timetable.all_groups")}
                  </SelectItem>
                  {sortedClasses.map((classValue) => (
                    <SelectItem key={classValue} value={classValue}>
                      {classValue}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Desktop Horizontal Scroll (hidden on mobile) */}
            <div className="hidden md:flex overflow-x-auto scrollbar-hide flex-1">
              <div className="flex space-x-1 sm:space-x-2 py-2">
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
                {sortedClasses.map((classValue) => (
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
