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
  if (availableTables.length <= 1) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 shadow-sm mb-4 sm:mb-6 rounded-lg">
      <div className="px-2 sm:px-4">
        <div className="flex overflow-x-auto scrollbar-hide">
          <div className="flex space-x-1 sm:space-x-2 py-3">
            {availableTables.map((table) => (
              <button
                key={table.id}
                onClick={() => onGroupChange(table.id)}
                className={cn(
                  "flex-shrink-0 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-all duration-200 border-b-2 rounded-t-md min-w-[80px] sm:min-w-[100px]",
                  activeGroupId === table.id
                    ? "border-[#4C97F1] text-gray-800 bg-blue-50/30"
                    : "border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                )}
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="font-medium max-w-[100px] sm:max-w-[130px] text-center">
                    {table.class}
                  </span>
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3 text-gray-500 flex-shrink-0" />
                    <span className="text-xs text-gray-500">
                      {table.participants.length}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
