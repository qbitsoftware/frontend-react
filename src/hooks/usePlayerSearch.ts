import { useState, useEffect } from "react";
import { useDebounce } from "@/lib/utils";
import { UseGetUsersDebounce } from "@/queries/users";
import { User } from "@/types/users";

export interface UsePlayerSearchOptions {
  onPlayerSelect?: (user: User) => void;
  onClearSearch?: () => void;
  debounceMs?: number;
}

export interface UsePlayerSearchReturn {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  popoverOpen: boolean;
  setPopoverOpen: (open: boolean) => void;
  playerSuggestions: { data: User[] } | undefined;
  isLoading: boolean;
  handlePlayerSelect: (user: User) => void;
  clearSearch: () => void;
}

export const usePlayerSearch = (options: UsePlayerSearchOptions = {}): UsePlayerSearchReturn => {
  const {
    onPlayerSelect,
    onClearSearch,
    debounceMs = 300
  } = options;

  const [searchTerm, setSearchTerm] = useState("");
  const [popoverOpen, setPopoverOpen] = useState(false);
  
  const debouncedSearchTerm = useDebounce(searchTerm, debounceMs);
  const { data: playerSuggestions, isLoading } = UseGetUsersDebounce(debouncedSearchTerm);

  useEffect(() => {
    if (debouncedSearchTerm) {
      const timeout = setTimeout(() => setPopoverOpen(true), 50);
      return () => clearTimeout(timeout);
    } else {
      setPopoverOpen(false);
    }
  }, [debouncedSearchTerm]);

  const handlePlayerSelect = (user: User) => {
    onPlayerSelect?.(user);
    clearSearch();
  };

  const clearSearch = () => {
    setSearchTerm("");
    setPopoverOpen(false);
    onClearSearch?.();
  };

  return {
    searchTerm,
    setSearchTerm,
    popoverOpen,
    setPopoverOpen,
    playerSuggestions,
    isLoading,
    handlePlayerSelect,
    clearSearch,
  };
};