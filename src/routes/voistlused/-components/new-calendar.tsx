import { useEffect, useMemo, useState } from "react";
import {
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useTranslation } from "react-i18next";
import { TournamentEvent, UseGetTournamentsPublicQuery } from "@/queries/tournaments";
import { Tournament } from "@/types/tournaments";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import CalTableView from "./cal-table-view";

export function TournamentsCalendar() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])


  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [searchQuery, setSearchQuery] = useState("");

  const { t } = useTranslation()

  const { data, isLoading, error } = UseGetTournamentsPublicQuery();

  const [tournaments, setTournaments] = useState<TournamentEvent[]>([]);
  useEffect(() => {
    if (data && data.data) {
      const tournamentEvents: TournamentEvent[] = data.data.map((tournament: Tournament) => ({
        tournament,
        is_gameday: false,
        is_finals: false,
        gameday_date: tournament.start_date,
        class: '',
        order: 0,
        parent_tournament_id: tournament.id
      }));
      setTournaments(tournamentEvents);
    }
  }, [data])

  const availableYears = useMemo(() => {
    const yearsSet = new Set<number>();
    yearsSet.add(currentYear);

    tournaments.forEach(tournament => {
      if (tournament.tournament.start_date) {
        const startYear = new Date(tournament.tournament.start_date).getFullYear();
        yearsSet.add(startYear);
      }

      if (tournament.tournament.end_date) {
        const endYear = new Date(tournament.tournament.end_date).getFullYear();
        yearsSet.add(endYear);
      }
    });

    return Array.from(yearsSet).sort((a, b) => a - b);
  }, [tournaments, currentYear]);

  return (
    <div className="w-full">
      <div className="bg-gray-50 border border-gray-200/30 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-4 bg-[#4C97F1] rounded-full"></div>
          <h3 className="text-lg font-semibold text-gray-800">{t('calendar.filters_title')}</h3>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <Select
              value={selectedYear.toString()}
              onValueChange={(value) => setSelectedYear(Number.parseInt(value))}
            >
              <SelectTrigger className="bg-white border border-gray-200 hover:border-[#4C97F1]/50 text-gray-700 font-medium rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-[#4C97F1]/20 transition-all">
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent className="rounded-lg border border-gray-200">
                {availableYears.map((year) => (
                  <SelectItem key={year} value={year.toString()} className="rounded hover:bg-[#4C97F1]/5">
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t('calendar.search_placeholder')}
                className="pl-10 bg-white border border-gray-200 hover:border-[#4C97F1]/50 focus:border-[#4C97F1] focus:ring-[#4C97F1]/20 rounded-lg text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

        </div>
      </div>

      <div className="bg-white border border-gray-200/30 rounded-lg p-4">
        <TooltipProvider>
          <CalTableView
            selectedYear={selectedYear}
            isLoading={isLoading}
            error={error}
            tournaments={tournaments}
            searchQuery={searchQuery}
          />
        </TooltipProvider>
      </div>
    </div>
  );
}
