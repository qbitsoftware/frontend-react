import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Calculator, Info } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

export interface RatingFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  ageClass: string;
  onAgeClassChange: (ageClass: string) => void;
  gender: string;
  onGenderChange: (gender: string) => void;
  showForeigners: boolean;
  onShowForeignersChange: (show: boolean) => void;
  showCalculator?: boolean;
  onCalculatorClick?: () => void;
  showInfo?: boolean;
  onInfoClick?: () => void;
}

export function RatingFilters({
  searchQuery,
  onSearchChange,
  ageClass,
  onAgeClassChange,
  gender,
  onGenderChange,
  showForeigners,
  onShowForeignersChange,
  showCalculator = false,
  onCalculatorClick,
  showInfo = false,
  onInfoClick,
}: RatingFiltersProps) {
  const { t } = useTranslation();

  return (
    <div className="border-b border-stone-200 bg-[#EBEFF5] rounded-t-[12px] flex flex-col gap-3 sm:gap-4 lg:grid lg:grid-cols-12 lg:gap-4 items-stretch lg:items-center w-full p-3 sm:p-4 lg:p-1 mb-1">
      {(showCalculator || showInfo) && (
        <div className="w-full lg:col-span-3 flex flex-row gap-2">
          {showCalculator && onCalculatorClick && (
            <Button
              onClick={onCalculatorClick}
              className="bg-[#4C97F1] hover:bg-[#4C97F1]/90 text-white px-2 sm:px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 flex-1 min-w-0"
            >
              <Calculator className="h-3 w-3 shrink-0" />
              <span className="hidden sm:inline">
                {t("rating.calculator.button")}
              </span>
              <span className="sm:hidden">
                {t("rating.calculator.button_short", "Calculator")}
              </span>
            </Button>
          )}
          {showInfo && onInfoClick && (
            <Button
              onClick={onInfoClick}
              variant="outline"
              className="border-[#4C97F1] text-[#4C97F1] hover:bg-[#4C97F1] hover:text-white px-2 sm:px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 flex-1 min-w-0"
            >
              <Info className="h-3 w-3 shrink-0" />
              <span className="hidden sm:inline truncate ">
                {t("rating.calculator.info_button")}
              </span>
              <span className="sm:hidden">
                {t("rating.calculator.info_button_short", "Info")}
              </span>
            </Button>
          )}
        </div>
      )}

      <div className={`relative w-full ${showCalculator || showInfo ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
        <Input
          type="text"
          placeholder={t("rating.filtering.search_placeholder")}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-10 sm:h-12 w-full pl-4 pr-10 py-2 border rounded-lg text-[16px] sm:text-sm bg-[#F7F6F7] focus:outline-none focus:ring-1 focus:ring-gray-300"
        />
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
      </div>

      <div className={`w-full ${showCalculator || showInfo ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
        <Select value={ageClass} onValueChange={onAgeClassChange}>
          <SelectTrigger className="w-full h-10 sm:h-12 flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg border text-[16px] sm:text-sm bg-[#F7F6F7]">
            <SelectValue
              placeholder={t("rating.filtering.select.options.all")}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              {t("rating.filtering.select.options.all")}
            </SelectItem>
            <SelectItem value="u9">
              {t("rating.filtering.select.options.u9", "U9")}
            </SelectItem>
            <SelectItem value="u11">
              {t("rating.filtering.select.options.u11", "U11")}
            </SelectItem>
            <SelectItem value="u13">
              {t("rating.filtering.select.options.u13", "U13")}
            </SelectItem>
            <SelectItem value="u15">
              {t("rating.filtering.select.options.u15", "U15")}
            </SelectItem>
            <SelectItem value="u19">
              {t("rating.filtering.select.options.u19", "U19")}
            </SelectItem>
            <SelectItem value="u21">
              {t("rating.filtering.select.options.u21", "U21")}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="w-full flex gap-2 lg:hidden">
        <div className="flex-1">
          <Select value={gender} onValueChange={onGenderChange}>
            <SelectTrigger className="w-full h-10 flex items-center space-x-2 px-3 py-2 rounded-lg border text-[16px] md:text-xs bg-[#F7F6F7]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="N">
                {t("rating.filtering.buttons.women")}
              </SelectItem>
              <SelectItem value="M">
                {t("rating.filtering.buttons.men")}
              </SelectItem>
              <SelectItem value="combined">
                {t("rating.filtering.buttons.combined")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center space-x-2 px-3 py-2 rounded-lg border bg-[#F7F6F7] text-xs sm:text-sm hover:bg-gray-100 transition-colors">
          <Checkbox 
            id="show-foreigners-mobile"
            checked={showForeigners}
            onCheckedChange={(checked) => onShowForeignersChange(checked === true)}
            className="data-[state=checked]:bg-[#4C97F1] data-[state=checked]:border-[#4C97F1]"
          />
          <label 
            htmlFor="show-foreigners-mobile" 
            className="text-xs cursor-pointer whitespace-nowrap select-none"
          >
            {t("rating.filtering.show_foreigners", "Show foreigners")}
          </label>
        </div>
      </div>

      <div className={`w-full ${showCalculator || showInfo ? 'lg:col-span-3' : 'lg:col-span-2'} hidden lg:flex gap-2`}>              
        <div className="flex items-center space-x-2 h-12 px-4 py-2 rounded-lg border bg-[#F7F6F7] text-sm hover:bg-gray-100 transition-colors w-fit">
          <Checkbox 
            id="show-foreigners-desktop"
            checked={showForeigners}
            onCheckedChange={(checked) => onShowForeignersChange(checked === true)}
            className="data-[state=checked]:bg-[#4C97F1] data-[state=checked]:border-[#4C97F1]"
          />
          <label 
            htmlFor="show-foreigners-desktop" 
            className="text-sm cursor-pointer whitespace-nowrap select-none"
          >
            {t("rating.filtering.show_foreigners", "Show foreigners")}
          </label>
        </div>
      </div>

      <div className={`w-full ${showCalculator || showInfo ? 'lg:col-span-4' : 'lg:col-span-6'} hidden sm:block`}>
        <Tabs
          value={gender}
          onValueChange={onGenderChange}
          className="w-full"
        >
          <TabsList className="justify-start w-full rounded-[2px] py-1.5 sm:py-2 gap-0.5 sm:gap-1 h-10 sm:h-auto">
            <TabsTrigger
              value="N"
              className="rounded-[4px] flex-1 text-xs sm:text-sm px-2 sm:px-3"
            >
              {t("rating.filtering.buttons.women")}
            </TabsTrigger>
            <TabsTrigger
              value="M"
              className="rounded-[4px] flex-1 text-xs sm:text-sm px-2 sm:px-3"
            >
              {t("rating.filtering.buttons.men")}
            </TabsTrigger>
            <TabsTrigger
              value="combined"
              className="rounded-[4px] flex-1 text-xs sm:text-sm px-2 sm:px-3"
            >
              {t("rating.filtering.buttons.combined")}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
