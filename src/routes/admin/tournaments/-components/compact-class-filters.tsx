import { User } from "lucide-react";
import { cn } from "@/lib/utils";
import { DialogType, TournamentTable } from "@/types/groups";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { FilterOptions } from "../$tournamentid/-components/matches";
import { useMemo } from "react";
import { GroupType } from "@/types/matches";

interface CompactClassFiltersProps {
  availableTables: TournamentTable[];
  activeGroupId: number[];
}

export const CompactClassFilters = ({
  availableTables,
  activeGroupId,
}: CompactClassFiltersProps) => {
  const navigate = useNavigate();
  const params = useParams({ strict: false })
  const { filter: filterParam } = useSearch({ strict: false })
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
      href = "/admin/tournaments/$tournamentid/grupid/$groupid/mangud"
      search = {
        filter: filterValue.join(","),
        openMatch: undefined,
      }
    } else {
      href = "/admin/tournaments/$tournamentid/grupid/$groupid"
    }

    if (newGroupId == 0 && location.includes("/mangud")) {
      href = "/admin/tournaments/$tournamentid/mangud"
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
            )}
            {availableTables.map((table) => (
              <button
                key={`table-${table.id}`}
                onClick={() => handleGroupChange(table.id)}
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
                      {(() => {
                        if (table.dialog_type === DialogType.DT_DOUBLES || table.dialog_type === DialogType.DT_FIXED_DOUBLES) {
                          const pairs = table.participants.filter((participant) => participant.players.length > 1);
                          return pairs.length;
                        }
                        if (table.type == GroupType.ROUND_ROBIN || table.type == GroupType.ROUND_ROBIN_FULL_PLACEMENT) {
                          return table.participants.filter((participant) => participant.type === "round_robin").length;
                        }
                        if (table.type == GroupType.DYNAMIC) {
                          return table.participants.filter((participant) => participant.type !== "round_robin").length;
                        }
                        return table.participants.length;
                      })()}
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


