import { User } from "lucide-react";
import { cn } from "@/lib/utils";
import { TournamentTable } from "@/types/groups";

interface ClassFiltersProps {
  availableTables: TournamentTable[];
  activeGroupId: number;
  onGroupChange: (groupId: number) => void;
}

export const ClassFilters = ({
  availableTables,
  activeGroupId,
  onGroupChange,
}: ClassFiltersProps) => {
  const activeTable = availableTables.find(
    (table) =>
      table.id === activeGroupId ||
      (table.stages && table.stages.some((stage) => stage.id === activeGroupId))
  );

  if (availableTables.length <= 1) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 shadow-sm mb-4 sm:mb-6 rounded-lg">
      {/* Main Table Filters */}
      <div className="px-2 sm:px-4">
        <div className="flex items-center justify-between">
          <div className="flex overflow-x-auto scrollbar-hide flex-1">
            <div className="flex space-x-1 sm:space-x-2 py-3">
              {availableTables.map((table) => {
                const isActive =
                  table.id === activeGroupId ||
                  (table.stages && table.stages.some((stage) => stage.id === activeGroupId));

                return (
                  <button
                    key={table.id}
                    onClick={() => onGroupChange(table.id)}
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

          {/* Participant Count - Moved to the right side */}
          <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-md ml-4">
            <User className="h-3 w-3" />
            <span className="font-medium">
              {activeTable ? activeTable.participants.length : 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
