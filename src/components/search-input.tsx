import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export interface SearchInputProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({
  searchQuery,
  onSearchChange,
  placeholder = "Search...",
  className = "",
}: SearchInputProps) {
  return (
    <div className={`relative w-full ${className}`}>
      <Input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="h-8 w-full pl-4 pr-10 py-2 border rounded-md text-sm bg-white focus:outline-none"
      />
      <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
    </div>
  );
}
