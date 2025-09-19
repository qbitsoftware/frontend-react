import { User } from "lucide-react";
import { cn } from "@/lib/utils";
import { DialogType } from "@/types/groups";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { FilterOptions } from "../$tournamentid/-components/matches";
import { useMemo } from "react";
import { TournamentTableWithStages } from "@/queries/tables";
import { getRealParticipantLength } from "@/components/utils/utils";

interface CompactClassFiltersProps {
  availableTables: TournamentTableWithStages[];
  activeGroupId: number[];
}

export const CompactClassFilters = ({
  availableTables,
  activeGroupId,
}: CompactClassFiltersProps) => {
  const navigate = useNavigate();
  const params = useParams({ strict: false })
  const { filter: filterParam, activeGroups } = useSearch({ strict: false })
  const location = useLocation();


  const showAllButton = useMemo(() =>
    location.pathname.includes("/mangud"),
    [location.pathname]
  );

  const { t } = useTranslation()

  const filterValue: FilterOptions[] = filterParam
    ? filterParam.split(',') as FilterOptions[]
    : ["all"];

  if (availableTables.length <= 1) {
    return null;
  }

  const handleGroupChange = (newGroupId: number) => {
    const location = window.location.pathname;
    let href = ""
    let search = undefined

    if (location.includes("/tabelid")) {
      href = "/admin/tournaments/$tournamentid/grupid/$groupid/tabelid"
    } else if (location.includes("/kohad")) {
      href = "/admin/tournaments/$tournamentid/grupid/$groupid/kohad"
    } else if (location.includes("/osalejad")) {
      href = "/admin/tournaments/$tournamentid/grupid/$groupid/osalejad"
    } else if (location.includes("/mangud")) {
      href = "/admin/tournaments/$tournamentid/mangud"

      const currentActiveGroups = activeGroups ? activeGroups.split(',') : [];
      let updatedActiveGroups = [...currentActiveGroups];

      if (newGroupId != 0) {
        const groupIdStr = newGroupId.toString();
        if (updatedActiveGroups.includes(groupIdStr)) {
          updatedActiveGroups = updatedActiveGroups.filter(id => id !== groupIdStr);
        } else {
          updatedActiveGroups.push(groupIdStr);
        }
      } else {
        updatedActiveGroups = [];
      }
      search = {
        filter: filterValue.join(","),
        openMatch: undefined,
        activeGroups: updatedActiveGroups.length > 0 ? updatedActiveGroups.join(',') : undefined,
      }
    } else {
      href = "/admin/tournaments/$tournamentid/grupid/$groupid"
    }

    navigate({
      to: href,
      params: {
        tournamentid: params.tournamentid!,
        groupid: newGroupId.toString(),
      },
      search,
    });
  };

  return (
    <div className="bg-white border border-gray-200 shadow-sm mb-3 rounded-b-lg">
      <div className="px-3">
        <div className="flex overflow-x-auto scrollbar-hide">
          <div className="flex space-x-1 py-2">
            {showAllButton && (
              <button
                key="all"
                onClick={() => handleGroupChange(0)}
                className={cn(
                  "flex-shrink-0 px-2 py-1.5 text-xs font-medium transition-all duration-200 border border-transparent rounded-md min-w-[60px] whitespace-nowrap",
                  (!activeGroups || activeGroups === "")
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
            )}
            {availableTables.map((table) => {
              const isActive = location.pathname.includes("/mangud")
                ? activeGroups?.split(',').includes(table.group.id.toString()) || false
                : activeGroupId.includes(table.group.id);
              return (
                <button
                  key={`table-${table.group.id}`}
                  onClick={() => handleGroupChange(table.group.id)}
                  className={cn(
                    "flex-shrink-0 px-2 py-1.5 text-xs font-medium transition-all duration-200 border border-transparent rounded-md min-w-[60px] whitespace-nowrap",
                    isActive
                      ? "border-[#4C97F1] text-[#4C97F1] bg-blue-50/50"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300"
                  )}
                >
                  <div className="flex items-center justify-center gap-1">
                    <span className="font-medium text-center">
                      {table.group.class}
                    </span>
                    <div className="flex items-center gap-0.5">
                      <User className="h-2.5 w-2.5 text-gray-400 flex-shrink-0" />
                      <span className="text-xs text-gray-400">
                        {(() => {
                          const r_participants = getRealParticipantLength(table.participants, table.group)
                          return table.group.dialog_type === DialogType.DT_DOUBLES || table.group.dialog_type === DialogType.DT_FIXED_DOUBLES ? r_participants.right_side : r_participants.total
                        })()}
                      </span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  );
};


