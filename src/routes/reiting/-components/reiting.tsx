import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlayerProfileModal } from "./player-profile-modal";
import { useTranslation } from "react-i18next";
import { useState, useEffect, useRef } from "react";
import {
  filterByAgeClass,
  filterByGender,
  modifyTitleDependingOnFilter,
} from "@/lib/rating-utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Info } from "lucide-react";
import { User } from "@/types/users";
import { UseGetClubsQuery } from "@/queries/clubs";
import { Link } from "@tanstack/react-router";
import RatingContent from "./rating-content";
import { UseGetUsersQuery } from "@/queries/users";
import RatingCalculator from "./rating-calc";
import UserRow from "./user-row";
import { Club } from "@/types/clubs";
import UserRowSkeleton from "./user-row-skeleton";
import { RatingFilters } from "@/components/rating-filters";


export function Reiting() {
  const { t } = useTranslation();

  const [gender, setGender] = useState("M");
  const [ageClass, setAgeClass] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [SelectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRatingCalculatorOpen, setIsRatingCalculatorOpen] = useState(false);
  const [isRatingInfoOpen, setIsRatingInfoOpen] = useState(false);
  const [showForeigners, setShowForeigners] = useState(false);

  const { data, isLoading } = UseGetUsersQuery("")
  const { data: clubsData } = UseGetClubsQuery();
  const [users, setUsers] = useState<User[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  useEffect(() => {
    if (data && data.data) {
      setUsers(data.data);
    }
  }, [data])

  useEffect(() => {
    if (clubsData && clubsData.data) {
      setClubs(clubsData.data);
    }
  }, [clubsData])

  const windowScrollRef = useRef(0);


  const handleAgeClassChange = (value: string) => {
    setAgeClass(value);
  };

  const handleGenderChange = (value: string) => {
    setGender(value);
  };

  useEffect(() => {
    if (isModalOpen) {
      windowScrollRef.current = window.scrollY;
    } else {
      if (windowScrollRef.current !== undefined) {
        const restoreScroll = () => {
          window.scrollTo(0, windowScrollRef.current);
        };

        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(restoreScroll);
        });
      }
    }
  }, [isModalOpen]);

  const handleModalOpen = (user: User) => {
    setSelectedPlayerId(user.id);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const filteredUsers = users
    .filter((user) => {
      const matchesGender = filterByGender(user, gender);
      const matchesAgeClass = filterByAgeClass(user, ageClass);
      const hasELTLId = user.eltl_id != 0;

      const searchLower = searchQuery.toLowerCase().trim();
      const firstNameLower = user.first_name.toLowerCase();
      const lastNameLower = user.last_name.toLowerCase();
      const fullNameLower = `${firstNameLower} ${lastNameLower}`;
      const clubNameLower = user.club?.name.toLowerCase() || "";
      const eltlIdString = user.eltl_id.toString();

      const matchesSearchQuery =
        searchLower === "" ||
        firstNameLower.includes(searchLower) ||
        lastNameLower.includes(searchLower) ||
        fullNameLower.includes(searchLower) ||
        eltlIdString.includes(searchQuery) ||
        clubNameLower.includes(searchLower) ||

        searchLower.split(/\s+/).every(word =>
          word.length > 0 && (
            firstNameLower.includes(word) ||
            lastNameLower.includes(word)
          )
        );

      const isEstonianPlayer = hasELTLId && user.rate_order > 0;
      const isForeigner = showForeigners && user.rate_order === 0 && user.foreigner === 1;

      return matchesGender && matchesAgeClass && matchesSearchQuery && (isEstonianPlayer || isForeigner);
    })
    .sort((a, b) => {
      if (a.rate_order > 0 && b.rate_order > 0) {
        return a.rate_order - b.rate_order;
      }
      
      if (a.rate_order === 0 && b.rate_order === 0) {
        return b.rate_points - a.rate_points;
      }
      
      return b.rate_points - a.rate_points;
    });

  const selectedPlayer = users.find((user) => user.id === SelectedPlayerId);

  const getTuesdayOfCurrentWeek = () => {
    const today = new Date();
    const day = today.getDay();
    const hour = today.getHours();

    let diff;
    if (day === 1 || day === 0) { 
      diff = day === 1 ? today.getDate() - 6 : today.getDate() - 5;
    } else if (day === 2 && hour < 9) { 
      diff = today.getDate() - 7;
    } else { 
      diff = today.getDate() - day + 2;
    }

    const tuesday = new Date(today.setDate(diff));
    tuesday.setHours(9, 0, 0, 0);

    const dd = String(tuesday.getDate()).padStart(2, "0");
    const mm = String(tuesday.getMonth() + 1).padStart(2, "0");
    const yyyy = tuesday.getFullYear();
    const hours = tuesday.getHours();

    return `${dd}.${mm}.${yyyy}, ${hours}:00`;
  };




  return (
    <div className="py-2 sm:py-4">
      <div className="lg:rounded-lg px-2 sm:px-4 lg:px-12 py-4 sm:py-6">
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center gap-4 pb-6 border-b border-gray-200/50">
            <div className="w-1 h-8 bg-[#4C97F1] rounded-full"></div>
            <h2 className="text-2xl font-bold text-gray-900">
              {modifyTitleDependingOnFilter(t, gender, ageClass)}
            </h2>
          </div>
          <p className="font-medium pb-1 text-sm sm:text-base">
            {t("rating.last_updated")}:{" "}
            <span className="bg-[#FBFBFB] px-2 sm:px-3 py-1 rounded-full border border-[#EAEAEA] text-xs sm:text-sm">
              {getTuesdayOfCurrentWeek()}
            </span>
          </p>
          <p className="pb-4 text-xs sm:text-sm text-gray-600">
            {t("rating.abbreviations")}
          </p>

          <div className="mb-6 sm:mb-12 p-4 bg-blue-50 border border-blue-200 rounded-lg hidden sm:block">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-sm font-bold">i</span>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900 mb-1">
                  {t("rating.license_info.title", "License Information")}
                </p>
                <p className="text-sm text-blue-700">
                  {t(
                    "rating.license_info.message",
                    "Licenses will be required starting from January 1, 2026, and can be bought"
                  )}{" "}
                  <Link
                    to="/litsents"
                    className="text-blue-600 hover:text-blue-800 underline font-medium"
                  >
                    {t("rating.license_info.link_text", "here")}
                  </Link>
                  .{" "}
                  {t(
                    "rating.license_info.additional_info",
                    "Before then, they are not required for participating in tournaments."
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 border rounded-t-[12px]">
          <RatingFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            ageClass={ageClass}
            onAgeClassChange={handleAgeClassChange}
            gender={gender}
            onGenderChange={handleGenderChange}
            showForeigners={showForeigners}
            onShowForeignersChange={setShowForeigners}
            showCalculator
            onCalculatorClick={() => setIsRatingCalculatorOpen(true)}
            showInfo
            onInfoClick={() => setIsRatingInfoOpen(true)}
          />

          <div className="w-full overflow-auto rounded-t-md max-h-[70vh]">
            <Table className="w-full mx-auto border-collapse rounded-t-lg shadow-lg">
              <TableHeader className="rounded-lg">
                <TableRow className="bg-white sticky top-0 z-10">
                  <TableHead className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-left font-medium text-xs sm:text-sm">
                    NR
                  </TableHead>
                  <TableHead className="px-1 sm:px-2 lg:px-6 py-2 sm:py-3 text-left font-medium text-xs sm:text-sm">
                    {t("rating.table.head.player")}
                  </TableHead>
                  <TableHead className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-left font-medium text-xs sm:text-sm">
                    PP
                  </TableHead>
                  <TableHead className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-left font-medium text-xs sm:text-sm">
                    RP
                  </TableHead>
                  <TableHead className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-left font-medium text-xs sm:text-sm">
                    KA
                  </TableHead>
                  <TableHead className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-left font-medium text-xs sm:text-sm">
                    ID
                  </TableHead>
                  <TableHead className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-left font-medium text-xs sm:text-sm hidden sm:table-cell">
                    {t("rating.table.head.birthyear")}
                  </TableHead>
                  <TableHead className="px-1 sm:px-2 lg:px-6 py-2 sm:py-3 text-left font-medium text-xs sm:text-sm">
                    {t("rating.table.head.club")}
                  </TableHead>
                  <TableHead className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-left font-medium text-xs sm:text-sm hidden lg:table-cell">
                    {t("rating.table.head.license")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 9 }).map((_, index) => (
                    <UserRowSkeleton key={index} index={index} />
                  ))
                ) : (
                  filteredUsers && filteredUsers.map((user, index) => (
                    <UserRow
                      clubs={clubs}
                      key={user.id}
                      user={user}
                      index={index}
                      handleModalOpen={handleModalOpen}
                      displayIndex={user.rate_order > 0 ? user.rate_order : undefined}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {selectedPlayer && <PlayerProfileModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          user={selectedPlayer}
        />
        }

        <RatingCalculator
          isRatingCalculatorOpen={isRatingCalculatorOpen}
          setIsRatingCalculatorOpen={setIsRatingCalculatorOpen}
          users={users}
        />


        <Dialog open={isRatingInfoOpen} onOpenChange={setIsRatingInfoOpen}>
          <DialogContent className="w-[85vw] max-w-lg mx-auto max-h-[85vh] overflow-y-auto rounded-xl animate-in fade-in-0 zoom-in-95 duration-200">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-[#4C97F1]">
                <Info className="h-5 w-5" />
                {t("rating.calculator.info_title")}
              </DialogTitle>
            </DialogHeader>
            <RatingContent onClose={() => setIsRatingInfoOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
