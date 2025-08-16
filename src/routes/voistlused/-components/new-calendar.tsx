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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useTranslation } from "react-i18next";
import { TournamentEvent, UseGetHomePageTournamentsQuery } from "@/queries/tournaments";
import Calendar3MonthView from "./cal-3-month";
import Cal1YearView from "./cal-1-year";

export function TournamentsCalendar() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])


  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [activeTab, setActiveTab] = useState<string>("three-month");

  const { t } = useTranslation()

  const { data, isLoading, error } = UseGetHomePageTournamentsQuery(false);

  const [tournaments, setTournaments] = useState<TournamentEvent[]>([]);
  useEffect(() => {
    if (data && data.data) {
      setTournaments(data.data);
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
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="flex items-center gap-4">
          <Select
            value={selectedYear.toString()}
            onValueChange={(value) => setSelectedYear(Number.parseInt(value))}
          >
            <SelectTrigger className="bg-white border-2 border-gray-200 hover:border-[#4C97F1]/50 text-gray-700 font-semibold rounded-xl px-3 sm:px-4 py-2 sm:py-3 shadow-sm focus:ring-2 focus:ring-[#4C97F1]/20 transition-all text-sm sm:text-base">
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-2 border-gray-100 shadow-xl">
              {availableYears.map((year) => (
                <SelectItem key={year} value={year.toString()} className="rounded-lg hover:bg-[#4C97F1]/10">
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 bg-gray-100 p-1 rounded-xl border border-gray-200 h-9 sm:h-10">
              <TabsTrigger
                value="three-month"
                className="data-[state=active]:bg-[#4C97F1] data-[state=active]:text-white data-[state=active]:shadow-lg bg-transparent text-gray-600 rounded-lg transition-all duration-300 font-medium text-xs sm:text-sm px-2 sm:px-3"
              >
                {t('calendar.3_months')}
              </TabsTrigger>
              <TabsTrigger
                value="year"
                className="data-[state=active]:bg-[#4C97F1] data-[state=active]:text-white data-[state=active]:shadow-lg bg-transparent text-gray-600 rounded-lg transition-all duration-300 font-medium text-xs sm:text-sm px-2 sm:px-3"
              >
                {t('calendar.full_year')}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="bg-gray-50/50 rounded-xl sm:rounded-2xl p-3 sm:p-6">
        <TooltipProvider>
          {activeTab === "three-month" ? (
            <Calendar3MonthView
              selectedYear={selectedYear}
              isLoading={isLoading}
              error={error}
              tournaments={tournaments}
            />) : (
            <Cal1YearView
              selectedYear={selectedYear}
              isLoading={isLoading}
              error={error}
              tournaments={tournaments}
            />
          )}
        </TooltipProvider>
      </div>
    </div>
  );
}
