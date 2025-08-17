import { useTranslation } from "react-i18next";
import { ClubProfileModal } from "./club-profile-modal";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Club } from "@/types/clubs";
import { UseGetClubsQuery } from "@/queries/clubs";
import ClubCard from "./club-card";
import ClubCardSkeleton from "./club-card-skeleton";
import ClubCardSkeletonError from "./club-card-error-skeleton";



export function ClubGrid() {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { data, isLoading, error } = UseGetClubsQuery()
  const [clubs, setClubs] = useState<Club[]>(data?.data || []);
  useEffect(() => {
    if (data) {
      setClubs(data.data);
    }

  }, [data])

  const filteredClubs = clubs
    .filter((club) => {
      return club.name.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .reverse();

  return (
    <div className="rounded-t-lg space-y-6">
      <div className="relative md:w-1/4 md:col-span-3">
        <Input
          type="text"
          placeholder={t("clubs.search_placeholder")}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-12 w-full pl-4 pr-10 py-2 border rounded-lg text-sm bg-[#F7F6F7] focus:outline-none focus:ring-1 focus:ring-gray-300"
          disabled={isLoading}
        />
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 21 }).map((_, index) => (
            <ClubCardSkeleton key={`skeleton-${index}`} />
          ))
        ) : error ? (
          Array.from({ length: 21 }).map((_, index) => (
            <ClubCardSkeletonError key={`error-${index}`} />
          ))
        ) : (
          filteredClubs.map((club) => (
            <ClubCard
              key={club.id}
              setSelectedClub={setSelectedClub}
              setIsModalOpen={setIsModalOpen}
              club={club}
            />
          ))
        )}
      </div>
      {selectedClub && <ClubProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        club={selectedClub}
      />
      }
    </div>
  );
}


