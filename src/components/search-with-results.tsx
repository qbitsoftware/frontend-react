import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SearchWithResultsProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchWithResults = ({
  searchTerm,
  setSearchTerm,
  placeholder,
  className = "",
}: SearchWithResultsProps) => {
  const { t } = useTranslation();

  const defaultPlaceholder = placeholder || t("competitions.timetable.search_placeholder");

  return (
    <div className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 ${className}`}>
      <div className="relative flex-1 sm:max-w-xs">
        <Input
          type="text"
          placeholder={defaultPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-9 sm:h-10 pl-4 pr-10 py-2 text-slate-900 bg-[#FCFCFD] focus:outline-none focus:ring-1 focus:ring-gray-300 border-[#EBEEF4] text-sm"
        />
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4" />
      </div>
    </div>
  );
};
