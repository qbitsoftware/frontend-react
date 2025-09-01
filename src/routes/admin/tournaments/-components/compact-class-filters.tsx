import { User } from "lucide-react";
import { cn } from "@/lib/utils";
import { TournamentTable } from "@/types/groups";
import { useTranslation } from "react-i18next";
import { useParams } from "@tanstack/react-router";

interface CompactClassFiltersProps {
  availableTables: TournamentTable[];
  activeGroupId: number[];
  onGroupChange: (groupId: number) => void;
}

export const CompactClassFilters = ({
  availableTables,
  activeGroupId,
  onGroupChange,
}: CompactClassFiltersProps) => {
  if (availableTables.length <= 1) {
    return null;
  }

  const { t } = useTranslation()
  const params = useParams({ strict: false })

  return (
    <div className="bg-white border border-gray-200 shadow-sm mb-3 rounded-b-lg">
      <div className="px-3">
        <div className="flex overflow-x-auto scrollbar-hide">
          <div className="flex space-x-1 py-2">
            {/* {activeGroupId.includes(0) && (<button
              key={0}
              onClick={() => onGroupChange(0)}
              className={cn(
                "flex-shrink-0 px-2 py-1.5 text-xs font-medium transition-all duration-200 border border-transparent rounded-md min-w-[60px] whitespace-nowrap",
                !params.groupid
                  ? "border-[#4C97F1] text-[#4C97F1] bg-blue-50/50"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300"
              )}
            >
              <div className="flex items-center justify-center gap-1">
                <span className="font-medium text-center">
                  {t('competitions.all')}
                </span>
              </div>
            </button>
            )
            } */}
            <button
              key="all"
              onClick={() => onGroupChange(0)}
              className={cn(
                "flex-shrink-0 px-2 py-1.5 text-xs font-medium transition-all duration-200 border border-transparent rounded-md min-w-[60px] whitespace-nowrap",
                !params.groupid
                  ? "border-[#4C97F1] text-[#4C97F1] bg-blue-50/50"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300"
              )}
              style={{ display: activeGroupId.includes(0) ? 'block' : 'none' }}
            >
              <div className="flex items-center justify-center gap-1">
                <span className="font-medium text-center">
                  {t('competitions.all')}
                </span>
              </div>
            </button>
            {availableTables.map((table) => (
              <button
                key={`table-${table.id}`}
                onClick={() => onGroupChange(table.id)}
                className={cn(
                  "flex-shrink-0 px-2 py-1.5 text-xs font-medium transition-all duration-200 border border-transparent rounded-md min-w-[60px] whitespace-nowrap",
                  activeGroupId.includes(table.id)
                    ? "border-[#4C97F1] text-[#4C97F1] bg-blue-50/50"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300"
                )}
              >
                <div className="flex items-center justify-center gap-1">
                  <span className="font-medium text-center">
                    {table.class}
                  </span>
                  <div className="flex items-center gap-0.5">
                    <User className="h-2.5 w-2.5 text-gray-400 flex-shrink-0" />
                    <span className="text-xs text-gray-400">
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
