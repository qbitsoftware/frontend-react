import TournamentCard from './TournamentCard';
import { useTranslation } from 'react-i18next';
import { Search, CalendarX2 } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useMemo, useState } from 'react';
import { UseGetTournamentCategories } from '@/queries/tournaments';
import { Tournament } from '@/types/tournaments';


interface CalendarViewProps {
    tournaments: Tournament[];
}

export const CalendarView: React.FC<CalendarViewProps> = ({ tournaments }) => {
    const { t } = useTranslation()
    const categoriesQuery = UseGetTournamentCategories()
    const availableYears = useMemo(() => {
        const years = tournaments.map(tournament => new Date(tournament.start_date).getFullYear());
        return Array.from(new Set(years)).sort((a, b) => a - b);
    }, [tournaments]);

    const categories = useMemo(() => {
        if (!categoriesQuery.data) return [];
        return categoriesQuery.data.data || [];
    }, [categoriesQuery.data]);

    const defaultYear = useMemo(() => {
        const currentYear = new Date().getFullYear();
        return availableYears.includes(currentYear)
            ? currentYear
            : availableYears[0] || currentYear;
    }, [availableYears]);

    const [selectedYear, setSelectedYear] = useState(defaultYear);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const filteredTournaments = useMemo(() => {
        return tournaments.filter(tournament => {
            const tournamentYear = new Date(tournament.start_date).getFullYear();
            const matchesYear = tournamentYear === selectedYear;
            const matchesCategory = selectedCategory === 'all' || tournament.category === selectedCategory;

            const matchesSearch = searchTerm === '' ||
                tournament.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                tournament.location.toLowerCase().includes(searchTerm.toLowerCase());

            return matchesYear && matchesCategory && matchesSearch;

        });
    }, [tournaments, selectedYear, searchTerm, selectedCategory]);


    const handleYearChange = (year: string) => {
        setSelectedYear(Number(year));
    };
    const handleCategoryChange = (category: string) => {
        setSelectedCategory(category);
    };

    const tournamentsByMonth = useMemo(() => {
        const grouped: Record<string, Tournament[]> = {};

        for (let i = 0; i < 12; i++) {
            const monthTournaments = filteredTournaments.filter(
                tournament => new Date(tournament.start_date).getMonth() === i
            ).sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());

            const monthKey = new Date(selectedYear, i).toLocaleString('en-US', { month: 'long' }).toLowerCase();
            const monthName = t(`calendar.months.${monthKey}`);
            grouped[monthName] = monthTournaments;
        }

        return grouped;
    }, [filteredTournaments, selectedYear, t]);


    const months = Object.keys(tournamentsByMonth).map(month => ({
        name: month,
        tournaments: tournamentsByMonth[month],
    }));

    const columnCount = 3;
    const monthsPerColumn = Math.ceil(months.length / columnCount);
    const columns = [];

    for (let i = 0; i < columnCount; i++) {
        columns.push(months.slice(i * monthsPerColumn, (i + 1) * monthsPerColumn));
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const isTournamentEnd = (endDate: string) => {
        const now = new Date();
        const tournamentEndDate = new Date(endDate);
        return now > tournamentEndDate;
    };


    if (tournaments) {
        return (
            <div className="py-4 sm:py-6 lg:py-8">
                <div className="lg:rounded-2xl bg-white shadow-lg border border-gray-200 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
                    <div className="text-center sm:text-left">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">{t("calendar.title")}</h1>
                        <p className="text-gray-600 text-sm sm:text-base">{t("calendar.subtitle", "Discover upcoming tournaments and events")}</p>
                    </div>

                    <div className="flex flex-col space-y-4 lg:flex-row lg:space-y-0 lg:space-x-6">
                        <div className="relative flex-1 lg:max-w-md">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder={t("calendar.search_placeholder") || "Search tournaments..."}
                                className="h-12 sm:h-14 w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-2xl text-sm sm:text-base bg-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
                            <Select
                                value={selectedCategory}
                                onValueChange={handleCategoryChange}
                                defaultValue='all'
                            >
                                <SelectTrigger className="h-12 sm:h-14 flex items-center space-x-2 px-4 py-3 rounded-2xl border-2 border-gray-200 text-sm sm:text-base bg-white w-full sm:w-[200px] focus:border-blue-500 transition-colors shadow-sm">
                                    <SelectValue placeholder={t("calendar.all_categories") || "All categories"} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        {t("calendar.all_categories") || "All categories"}
                                    </SelectItem>
                                    {categories.map(category => category && category.category != "" && (
                                        <SelectItem key={category.id} value={category.category}>
                                            {category.category}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select
                                value={selectedYear.toString()}
                                onValueChange={handleYearChange}
                            >
                                <SelectTrigger className="h-12 sm:h-14 flex items-center space-x-2 px-4 py-3 rounded-2xl border-2 border-gray-200 text-sm sm:text-base bg-white w-full sm:w-[140px] focus:border-blue-500 transition-colors shadow-sm">
                                    <SelectValue placeholder={t("calendar.select_year") || "Select Year"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableYears.map(year => (
                                        <SelectItem key={year} value={year.toString()}>
                                            {year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8 pt-2">
                        {columns.map((columnMonths, columnIndex) => (
                            <div key={columnIndex} className="space-y-8">
                                {columnMonths.map(month => (
                                    <div
                                        key={month.name}
                                        className={`${month.tournaments.length === 0 ? 'opacity-70' : ''}`}
                                    >
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-1 h-6 sm:h-8 bg-blue-500 rounded-full"></div>
                                            <h2 className={`text-lg sm:text-xl lg:text-2xl font-bold ${month.tournaments.length > 0 ? 'text-gray-900' : 'text-gray-400'}`}>
                                                {month.name} {selectedYear}
                                            </h2>
                                        </div>

                                        <div className="space-y-3">
                                            {month.tournaments.length > 0 ? (
                                                month.tournaments.map(tournament => (
                                                    <TournamentCard
                                                        id={tournament.id}
                                                        key={tournament.id}
                                                        date={formatDate(tournament.start_date)}
                                                        name={tournament.name}
                                                        category={tournament.category}
                                                        location={tournament.location}
                                                        isCompleted={tournament.state === 'completed'}
                                                        hasEnded={isTournamentEnd(tournament.end_date)}
                                                    />
                                                ))
                                            ) : (
                                                <div className="bg-gray-50/80 border-2 border-dashed border-gray-200 rounded-xl py-6 px-4 text-center">
                                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                                        <CalendarX2 className="h-6 w-6 text-gray-400" />
                                                    </div>
                                                    <p className="text-gray-500 text-sm font-medium">{t("calendar.no_tournaments")}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }
};

export default CalendarView;
