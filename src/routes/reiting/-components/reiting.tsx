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
  modifyTitleDependingOnFilter,
} from "@/lib/rating-utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, Calculator, Info } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { User } from "@/types/users";
import { UseGetClubsQuery } from "@/queries/clubs";
import { Link } from "@tanstack/react-router";
import RatingContent from "./rating-content";
import { UseGetUsersQuery } from "@/queries/users";
import RatingCalculator from "./rating-calc";
import UserRow from "./user-row";
import { Club } from "@/types/clubs";
import UserRowSkeleton from "./user-row-skeleton";


export function Reiting() {
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState("men");
  const [ageClass, setAgeClass] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [SelectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRatingCalculatorOpen, setIsRatingCalculatorOpen] = useState(false);
  const [isRatingInfoOpen, setIsRatingInfoOpen] = useState(false);

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


  const getSexAndCombined = (tab: string) => {
    switch (tab) {
      case "men":
        return { sex: "M", showCombined: false };
      case "women":
        return { sex: "N", showCombined: false };
      case "combined":
        return { sex: "", showCombined: true };
      default:
        return { sex: "M", showCombined: false };
    }
  };

  const { sex, showCombined } = getSexAndCombined(activeTab);

  const handleAgeClassChange = (value: string) => {
    setAgeClass(value);

    if (["cadet_boys", "junior_boys", "senior_men"].includes(value)) {
      setActiveTab("men");
    } else if (
      ["cadet_girls", "junior_girls", "senior_women"].includes(value)
    ) {
      setActiveTab("women");
    } else {
      setActiveTab("combined");
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "combined") {
      setAgeClass("all");
    }
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
      const matchesSex = showCombined || sex === "" || user.sex === sex;
      const matchesAgeClass = showCombined || filterByAgeClass(user, ageClass);
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

      return matchesSex && matchesAgeClass && matchesSearchQuery && hasELTLId;
    })
    .sort((a, b) => {
      // Players with rate_order > 0 come first, sorted by rate_order
      if (a.rate_order > 0 && b.rate_order === 0) return -1;
      if (a.rate_order === 0 && b.rate_order > 0) return 1;

      // Both have rate_order > 0, sort by rate_order
      if (a.rate_order > 0 && b.rate_order > 0) {
        return a.rate_order - b.rate_order;
      }

      // Both have rate_order = 0, sort by rating_points descending
      if (a.rate_order === 0 && b.rate_order === 0) {
        return b.rate_points - a.rate_points;
      }

      return 0;
    });

  const selectedPlayer = users.find((user) => user.id === SelectedPlayerId);

  const getMondayOfCurrentWeek = () => {
    const today = new Date();
    const day = today.getDay();

    const diff = today.getDate() - day + (day === 0 ? -6 : 2);

    const monday = new Date(today.setDate(diff));
    monday.setHours(9, 0, 0, 0);

    const dd = String(monday.getDate()).padStart(2, "0");
    const mm = String(monday.getMonth() + 1).padStart(2, "0");
    const yyyy = monday.getFullYear();
    const hours = monday.getHours();

    return `${dd}.${mm}.${yyyy}, ${hours}:00`;
  };




  return (
    <div className="py-2 sm:py-4">
      <div className="lg:rounded-lg px-2 sm:px-4 lg:px-12 py-4 sm:py-6">
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center gap-4 pb-6 border-b border-gray-200/50">
            <div className="w-1 h-8 bg-[#4C97F1] rounded-full"></div>
            <h2 className="text-2xl font-bold text-gray-900">
              {modifyTitleDependingOnFilter(t, showCombined, sex, ageClass)}
            </h2>
          </div>
          <p className="font-medium pb-1 text-sm sm:text-base">
            {t("rating.last_updated")}:{" "}
            <span className="bg-[#FBFBFB] px-2 sm:px-3 py-1 rounded-full border border-[#EAEAEA] text-xs sm:text-sm">
              {getMondayOfCurrentWeek()}
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
          <div className="border-b border-stone-200 bg-[#EBEFF5] rounded-t-[12px] flex flex-col gap-3 sm:gap-4 lg:grid lg:grid-cols-12 lg:gap-4 items-stretch lg:items-center w-full p-3 sm:p-4 lg:p-1 mb-1">
            <div className="w-full lg:col-span-3 flex flex-row gap-2">
              <Button
                onClick={() => setIsRatingCalculatorOpen(true)}
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
              <Button
                onClick={() => setIsRatingInfoOpen(true)}
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
            </div>
            <div className="relative w-full lg:col-span-3">
              <Input
                type="text"
                placeholder={t("rating.filtering.search_placeholder")}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 sm:h-12 w-full pl-4 pr-10 py-2 border rounded-lg text-xs sm:text-sm bg-[#F7F6F7] focus:outline-none focus:ring-1 focus:ring-gray-300"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
            </div>

            <div className="w-full lg:col-span-3 flex gap-2">
              <div className="flex-1">
                <Select value={ageClass} onValueChange={handleAgeClassChange}>
                  <SelectTrigger className="w-full h-10 sm:h-12 flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg border text-xs sm:text-sm bg-[#F7F6F7]">
                    <SelectValue
                      placeholder={t("rating.filtering.select.options.all")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {t("rating.filtering.select.options.all")}
                    </SelectItem>
                    <SelectItem value="cadet_boys">
                      {t("rating.filtering.select.options.cadets_boys")}
                    </SelectItem>
                    <SelectItem value="cadet_girls">
                      {t("rating.filtering.select.options.cadets_girls")}
                    </SelectItem>
                    <SelectItem value="junior_boys">
                      {t("rating.filtering.select.options.juniors_boys")}
                    </SelectItem>
                    <SelectItem value="junior_girls">
                      {t("rating.filtering.select.options.juniors_girls")}
                    </SelectItem>
                    <SelectItem value="senior_men">
                      {t("rating.filtering.select.options.seniors_men")}
                    </SelectItem>
                    <SelectItem value="senior_women">
                      {t("rating.filtering.select.options.seniors_women")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Gender filter - dropdown on mobile, tabs on larger screens */}
              <div className="flex-1 sm:hidden">
                <Select value={activeTab} onValueChange={handleTabChange}>
                  <SelectTrigger className="w-full h-10 flex items-center space-x-2 px-3 py-2 rounded-lg border text-xs bg-[#F7F6F7]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="women">
                      {t("rating.filtering.buttons.women")}
                    </SelectItem>
                    <SelectItem value="men">
                      {t("rating.filtering.buttons.men")}
                    </SelectItem>
                    <SelectItem value="combined">
                      {t("rating.filtering.buttons.combined")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="w-full lg:col-span-4 hidden sm:block">
              <Tabs
                defaultValue="men"
                value={activeTab}
                onValueChange={handleTabChange}
                className="w-full"
              >
                <TabsList className="justify-start w-full rounded-[2px] py-1.5 sm:py-2 gap-0.5 sm:gap-1 h-10 sm:h-auto">
                  <TabsTrigger
                    value="women"
                    className="rounded-[4px] flex-1 text-xs sm:text-sm px-2 sm:px-3"
                  >
                    {t("rating.filtering.buttons.women")}
                  </TabsTrigger>
                  <TabsTrigger
                    value="men"
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
