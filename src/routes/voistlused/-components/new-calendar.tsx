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
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import CalTableView from "./cal-table-view";
import Cal1YearView from "./cal-1-year";

export function TournamentsCalendar() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])


  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [activeTab, setActiveTab] = useState<string>("three-month");
  const [searchQuery, setSearchQuery] = useState("");

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

            {activeTab === "three-month" && (
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={t('calendar.search_placeholder')}
                  className="pl-10 bg-white border border-gray-200 hover:border-[#4C97F1]/50 focus:border-[#4C97F1] focus:ring-[#4C97F1]/20 rounded-lg text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            )}
          </div>

          <div>
            <Tabs value={activeTab} onValueChange={(value) => {
              setActiveTab(value);
              setSearchQuery(""); 
            }}>
              <TabsList className="grid grid-cols-2 bg-white p-1 rounded-lg border border-gray-200 h-8">
                <TabsTrigger
                  value="three-month"
                  className="data-[state=active]:bg-[#4C97F1] data-[state=active]:text-white bg-transparent text-gray-600 rounded transition-all duration-200 font-medium text-xs px-2"
                >
                  {t('calendar.3_months')}
                </TabsTrigger>
                <TabsTrigger
                  value="year"
                  className="data-[state=active]:bg-[#4C97F1] data-[state=active]:text-white bg-transparent text-gray-600 rounded transition-all duration-200 font-medium text-xs px-2"
                >
                  {t('calendar.full_year')}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200/30 rounded-lg p-4">
        <TooltipProvider>
          {activeTab === "three-month" ? (
            <CalTableView
              selectedYear={selectedYear}
              isLoading={isLoading}
              error={error}
              tournaments={tournaments}
              searchQuery={searchQuery}
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
