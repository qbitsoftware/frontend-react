import { UserIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { usePlayerSearch, UsePlayerSearchOptions } from "@/hooks/usePlayerSearch";
import { capitalizeWords } from "@/lib/utils";
import { User } from "@/types/users";
import { useTranslation } from "react-i18next";

export interface PlayerSearchInputProps extends UsePlayerSearchOptions {
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
  isLoading?: boolean;
  translationPrefix?: string;
}

export function PlayerSearchInput({
  placeholder,
  className = "",
  inputClassName = "",
  disabled = false,
  isLoading: externalLoading = false,
  translationPrefix = "player_search",
  ...searchOptions
}: PlayerSearchInputProps) {
  const { t } = useTranslation();
  const {
    searchTerm,
    setSearchTerm,
    popoverOpen,
    setPopoverOpen,
    playerSuggestions,
    isLoading: searchLoading,
    handlePlayerSelect,
  } = usePlayerSearch(searchOptions);

  const isLoading = externalLoading || searchLoading;

  return (
    <div className={`relative ${className}`}>
      <Popover
        open={popoverOpen}
        onOpenChange={(open) => {
          setPopoverOpen(open);
        }}
      >
        <PopoverTrigger asChild>
          <Input
            type="text"
            placeholder={placeholder || t(`${translationPrefix}.placeholder`)}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full ${inputClassName}`}
            autoComplete="off"
            disabled={disabled}
          />
        </PopoverTrigger>
        {playerSuggestions && playerSuggestions.data && (
          <PopoverContent
            className="p-0 w-[300px] max-h-[400px] overflow-y-auto"
            align="start"
            sideOffset={5}
            onInteractOutside={(e) => {
              if ((e.target as HTMLElement).closest("input")) {
                e.preventDefault();
              } else {
                setPopoverOpen(false);
              }
            }}
            onOpenAutoFocus={(e) => {
              e.preventDefault();
            }}
          >
            <div
              className="p-1 space-y-1 overflow-y-auto max-h-[400px]"
              onWheel={(e) => {
                e.stopPropagation();
              }}
            >
              {playerSuggestions.data.length > 0 ? (
                playerSuggestions.data.map((user: User, i: number) => (
                  <div
                    key={i}
                    className={`px-3 py-2 cursor-pointer hover:bg-[#4C97F1]/10 hover:text-[#4C97F1] transition-colors rounded-md ${
                      isLoading ? "opacity-50 pointer-events-none" : ""
                    }`}
                    onClick={() => !isLoading && handlePlayerSelect(user)}
                  >
                    <div className="font-medium flex items-center gap-2">
                      <span>
                        {capitalizeWords(user.first_name)}{" "}
                        {capitalizeWords(user.last_name)}
                      </span>
                      {isLoading && (
                        <div className="w-3 h-3 animate-spin rounded-full border border-[#4C97F1] border-t-transparent" />
                      )}
                    </div>
                    {user.eltl_id && (
                      <div className="text-xs text-gray-500">
                        ELTL ID: {user.eltl_id}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="px-4 py-6 text-sm text-gray-500 text-center">
                  <UserIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  {t(`${translationPrefix}.no_results`)}
                </div>
              )}
            </div>
          </PopoverContent>
        )}
      </Popover>
    </div>
  );
}
