import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlayerProfileModal } from "./player-profile-modal";
import { useTranslation } from "react-i18next";
import { useState, useEffect, useRef } from "react";
import {
  filterByAgeClass,
  modifyTitleDependingOnFilter,
  getYear,
} from "@/lib/rating-utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, Calculator, Check, ChevronsUpDown, Info } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { User } from "@/types/users";
import { UseGetClubsQuery } from "@/queries/clubs";
import placeholderImg from "@/assets/blue-profile.png";
import { Link } from "@tanstack/react-router";
import RatingContent from "./rating-content";

interface UserTableProps {
  users: User[];
}

export function Reiting({ users }: UserTableProps = { users: [] }) {
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState("men");
  const [ageClass, setAgeClass] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [SelectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRatingCalculatorOpen, setIsRatingCalculatorOpen] = useState(false);
  const [isRatingInfoOpen, setIsRatingInfoOpen] = useState(false);
  const [calculatorForm, setCalculatorForm] = useState({
    winner: "",
    loser: "",
    date: "",
  });
  const [openWinner, setOpenWinner] = useState(false);
  const [openLoser, setOpenLoser] = useState(false);
  const [calculatorResult, setCalculatorResult] = useState<{
    winner: { name: string; change: number; rating: number; hv: number; rawChange: number };
    loser: { name: string; change: number; rating: number; hk: number; rawChange: number };
  } | null>(null);

  const windowScrollRef = useRef(0);

  const { data: clubsData } = UseGetClubsQuery();
  const clubs = clubsData?.data || [];

  const getClubName = (user: User) => {
    return user.club?.name || "KLUBITU";
  };

  const getClubImage = (user: User) => {
    if (user.club?.image_url) {
      return user.club.image_url;
    }

    const clubName = getClubName(user);
    const club = clubs.find((club) => club.name === clubName);
    return club?.image_url || "";
  };

  const getLicenseInfo = (
    license: string | null,
    expirationDate: string | null
  ) => {
    if (license && license !== null && license !== "") {
      if (expirationDate) {
        const expDate = new Date(expirationDate);
        const now = new Date();
        if (expDate < now) {
          return {
            text: t("rating.license_status.missing"),
            isActive: false,
          };
        }
        const formattedDate = expDate.toLocaleDateString("et-EE", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
        return {
          text: formattedDate,
          isActive: true,
        };
      }
      return {
        text: t("rating.license_status.active"),
        isActive: true,
      };
    }
    return {
      text: t("rating.license_status.missing"),
      isActive: false,
    };
  };

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
      const matchesSearchQuery =
        user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getClubName(user).toLowerCase().includes(searchQuery.toLowerCase());
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

  const calculateRatingGain = (winnerRating: number, loserRating: number, winnerWeight: number, loserWeight: number) => {
    const Rv = Math.abs(winnerRating - loserRating);
    let Hv = 0; // win value for winner
    let Hk = 0; // loss value for loser (positive, will be made negative)

    if (winnerRating >= loserRating) {
      if (Rv <= 10) {
        Hv = 2;
        Hk = 2;
      } else if (Rv >= 11 && Rv <= 40) {
        Hv = 1;
        Hk = 1;
      } else {
        Hv = 0;
        Hk = 0;
      }
    } else {
      const points = Math.round((Rv + 5) / 3);
      Hv = points;
      if (Hv > 15) {
        Hv = 15
      }
      Hk = points;
    }

    const coef = 1;
    let winnerKa = Math.min(winnerWeight, 30);
    const loserKa = Math.min(loserWeight, 30);
    winnerKa = 20

    const winnerRatingChange = (((Hv - 0) * 10) + (Hv * coef)) / (winnerKa + (Hv + 0));

    const loserRatingChange = (((0 - Hk) * 10) + (0 * coef)) / (loserKa + (0 + Hk));

    return {
      winnerGain: Math.round(winnerRatingChange),
      loserLoss: Math.round(loserRatingChange),
      winnerHv: Hv,
      loserHk: Hk,
      winnerRawChange: Hv,
      loserRawChange: -Hk
    };
  };

  const handleCalculatorSubmit = () => {
    if (
      !calculatorForm.winner ||
      !calculatorForm.loser ||
      !calculatorForm.date
    ) {
      alert(t("rating.calculator.fill_all_fields"));
      return;
    }

    const winnerPlayer = users.find(
      (u) => `${u.first_name} ${u.last_name}` === calculatorForm.winner
    );
    const loserPlayer = users.find(
      (u) => `${u.first_name} ${u.last_name}` === calculatorForm.loser
    );

    if (!winnerPlayer || !loserPlayer) {
      alert(t("rating.calculator.players_not_found"));
      return;
    }

    const ratingChange = calculateRatingGain(
      winnerPlayer.rate_points,
      loserPlayer.rate_points,
      winnerPlayer.rate_weigth,
      loserPlayer.rate_weigth
    );

    setCalculatorResult({
      winner: {
        name: `${winnerPlayer.first_name} ${winnerPlayer.last_name}`,
        change: ratingChange.winnerGain,
        rating: winnerPlayer.rate_points,
        hv: ratingChange.winnerHv,
        rawChange: ratingChange.winnerRawChange,
      },
      loser: {
        name: `${loserPlayer.first_name} ${loserPlayer.last_name}`,
        change: ratingChange.loserLoss,
        rating: loserPlayer.rate_points,
        hk: ratingChange.loserHk,
        rawChange: ratingChange.loserRawChange,
      },
    });
  };

  const resetCalculatorForm = () => {
    setCalculatorForm({
      winner: "",
      loser: "",
      date: "",
    });
    setOpenWinner(false);
    setOpenLoser(false);
    setCalculatorResult(null);
  };

  return (
    <div className="py-2 sm:py-4">
      <div className="lg:rounded-lg px-2 sm:px-4 lg:px-12 py-4 sm:py-6">
        <div className="space-y-3 sm:space-y-4">
          <h2 className="font-bold text-lg sm:text-xl lg:text-2xl">
            {modifyTitleDependingOnFilter(t, showCombined, sex, ageClass)}
          </h2>
          <p className="font-medium pb-1 text-sm sm:text-base">
            {t("rating.last_updated")}:{" "}
            <span className="bg-[#FBFBFB] px-2 sm:px-3 py-1 rounded-full border border-[#EAEAEA] text-xs sm:text-sm">
              {getMondayOfCurrentWeek()}
            </span>
          </p>
          <p className="pb-4 text-xs sm:text-sm text-gray-600">
            {t("rating.abbreviations")}
          </p>

          <div className="mb-6 sm:mb-12 p-4 bg-blue-50 border border-blue-200 rounded-lg">
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
            <div className="w-full lg:col-span-3 flex flex-col sm:flex-row gap-2">
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

            <div className="w-full lg:col-span-3">
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

            <div className="w-full lg:col-span-4">
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
                {filteredUsers.map((user, index) => (
                  <TableRow
                    onClick={() => handleModalOpen(user)}
                    key={user.id}
                    className={`group cursor-pointer transition-colors ${index % 2 === 0
                      ? "bg-white hover:bg-blue-50"
                      : "bg-blue-50/30 hover:bg-blue-50/50"
                      }`}
                  >
                    <TableCell className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-sm sm:text-lg font-bold text-[#4C97F1]">
                      {user.rate_order}
                    </TableCell>
                    <TableCell className="px-1 sm:px-2 lg:px-6 py-2 sm:py-3 flex items-center space-x-2 sm:space-x-3">
                      <Avatar className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
                        <AvatarImage
                          src=""
                          alt={`${user.first_name} ${user.last_name}'s profile`}
                        />
                        <AvatarFallback>
                          <img
                            src={placeholderImg}
                            className="rounded-full h-full w-full object-cover"
                            alt="Profile"
                          />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs sm:text-sm font-semibold group-hover:text-blue-600 group-hover:underline truncate">
                          {user.last_name}
                        </span>
                        <span className="text-xs sm:text-sm text-gray-600 truncate">
                          {user.first_name}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-xs sm:text-sm">
                      {user.rate_pl_points}
                    </TableCell>
                    <TableCell className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-xs sm:text-sm">
                      {user.rate_points}
                    </TableCell>
                    <TableCell className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-xs sm:text-sm">
                      {user.rate_weigth}
                    </TableCell>
                    <TableCell className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-xs sm:text-sm">
                      {user.eltl_id}
                    </TableCell>
                    <TableCell className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-xs sm:text-sm hidden sm:table-cell">
                      {getYear(user.birth_date)}
                    </TableCell>
                    <TableCell className="px-1 sm:px-2 lg:px-6 py-2 sm:py-3 flex items-center space-x-1 sm:space-x-2">
                      <Avatar className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0">
                        <AvatarImage
                          src={getClubImage(user)}
                          alt={`${getClubName(user)} logo`}
                        />
                        <AvatarFallback className="text-[10px] sm:text-xs font-semibold bg-gray-100">
                          {getClubName(user).substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs sm:text-sm truncate min-w-0">
                        {getClubName(user)}
                      </span>
                    </TableCell>
                    <TableCell className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-xs sm:text-sm hidden lg:table-cell">
                      {(() => {
                        const licenseInfo = getLicenseInfo(
                          user.license,
                          user.expiration_date
                        );
                        return (
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${licenseInfo.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                              }`}
                          >
                            {licenseInfo.text}
                          </span>
                        );
                      })()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div style={{ position: "fixed", top: 0, left: 0, zIndex: 50 }}>
          <PlayerProfileModal
            isOpen={isModalOpen}
            onClose={handleModalClose}
            user={selectedPlayer || null}
          />
        </div>

        <Dialog
          open={isRatingCalculatorOpen}
          onOpenChange={setIsRatingCalculatorOpen}
        >
          <DialogContent className="sm:max-w-md animate-in fade-in-0 zoom-in-95 duration-200">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-[#4C97F1]">
                <Calculator className="h-5 w-5" />
                {t("rating.calculator.title")}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="winner">{t("rating.calculator.winner")}</Label>
                <Popover open={openWinner} onOpenChange={setOpenWinner}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openWinner}
                      className="w-full justify-between"
                    >
                      {calculatorForm.winner ||
                        t("rating.calculator.select_player")}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput
                        placeholder={t("rating.calculator.search_player")}
                      />
                      <CommandList>
                        <CommandEmpty>
                          {t("rating.calculator.no_player_found")}
                        </CommandEmpty>
                        <CommandGroup>
                          {filteredUsers.map((user) => (
                            <CommandItem
                              key={user.id}
                              value={`${user.first_name} ${user.last_name}`}
                              onSelect={(currentValue) => {
                                setCalculatorForm((prev) => ({
                                  ...prev,
                                  winner: currentValue,
                                }));
                                setOpenWinner(false);
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${calculatorForm.winner ===
                                  `${user.first_name} ${user.last_name}`
                                  ? "opacity-100"
                                  : "opacity-0"
                                  }`}
                              />
                              {user.first_name} {user.last_name} (
                              {user.rate_points} RP)
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="loser">{t("rating.calculator.loser")}</Label>
                <Popover open={openLoser} onOpenChange={setOpenLoser}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openLoser}
                      className="w-full justify-between"
                    >
                      {calculatorForm.loser ||
                        t("rating.calculator.select_player")}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput
                        placeholder={t("rating.calculator.search_player")}
                      />
                      <CommandList>
                        <CommandEmpty>
                          {t("rating.calculator.no_player_found")}
                        </CommandEmpty>
                        <CommandGroup>
                          {filteredUsers.map((user) => (
                            <CommandItem
                              key={user.id}
                              value={`${user.first_name} ${user.last_name}`}
                              onSelect={(currentValue) => {
                                setCalculatorForm((prev) => ({
                                  ...prev,
                                  loser: currentValue,
                                }));
                                setOpenLoser(false);
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${calculatorForm.loser ===
                                  `${user.first_name} ${user.last_name}`
                                  ? "opacity-100"
                                  : "opacity-0"
                                  }`}
                              />
                              {user.first_name} {user.last_name} (
                              {user.rate_points} RP)
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">{t("rating.calculator.date")}</Label>
                <Input
                  id="date"
                  type="date"
                  value={calculatorForm.date}
                  onChange={(e) =>
                    setCalculatorForm((prev) => ({
                      ...prev,
                      date: e.target.value,
                    }))
                  }
                  className="w-full"
                />
              </div>

              {calculatorResult && (
                <div className="mt-6 p-4 bg-[#4C97F1]/5 border border-[#4C97F1]/20 rounded-lg animate-in slide-in-from-top-2 fade-in-0 duration-300">
                  <h3 className="text-lg font-semibold text-[#4C97F1] mb-4 flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    {t("rating.calculator.result_title")} (Full Formula)
                  </h3>
                  <div className="space-y-4">
                    <div className="p-3 bg-white rounded-md border">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">
                            {calculatorResult.winner.name} (Võitja)
                          </span>
                          <span className="text-sm text-gray-600">
                            {calculatorResult.winner.rating} RP
                          </span>
                        </div>
                        <div
                          className={`px-3 py-1 rounded-full text-sm font-medium ${calculatorResult.winner.change >= 0
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                            }`}
                        >
                          {calculatorResult.winner.change >= 0 ? "+" : ""}
                          {calculatorResult.winner.change}{" "}
                          {t("rating.calculator.points")}
                        </div>
                      </div>
                      <div className="text-xs text-gray-600 space-y-1">
                        <div className="flex justify-between">
                          <span>Hv (võidupunktid):</span>
                          <span className="font-mono">{calculatorResult.winner.hv}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Punktid enne kaalude arvestust:</span>
                          <span className="font-mono">+{calculatorResult.winner.rawChange}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Punktid pärast kaalude arvestust:</span>
                          <span className="font-mono">{calculatorResult.winner.change >= 0 ? "+" : ""}{calculatorResult.winner.change}</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 bg-white rounded-md border">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">
                            {calculatorResult.loser.name} (Kaotaja)
                          </span>
                          <span className="text-sm text-gray-600">
                            {calculatorResult.loser.rating} RP
                          </span>
                        </div>
                        <div
                          className={`px-3 py-1 rounded-full text-sm font-medium ${calculatorResult.loser.change >= 0
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                            }`}
                        >
                          {calculatorResult.loser.change >= 0 ? "+" : ""}
                          {calculatorResult.loser.change}{" "}
                          {t("rating.calculator.points")}
                        </div>
                      </div>
                      <div className="text-xs text-gray-600 space-y-1">
                        <div className="flex justify-between">
                          <span>Hk (kaotuspunktid):</span>
                          <span className="font-mono">{calculatorResult.loser.hk}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Punktid enne kaalude arvestust:</span>
                          <span className="font-mono">{calculatorResult.loser.rawChange}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Punktid pärast kaalude arvestust:</span>
                          <span className="font-mono">{calculatorResult.loser.change >= 0 ? "+" : ""}{calculatorResult.loser.change}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetCalculatorForm();
                    setIsRatingCalculatorOpen(false);
                  }}
                >
                  {t("rating.calculator.cancel")}
                </Button>
                <Button
                  type="button"
                  onClick={handleCalculatorSubmit}
                  className="bg-[#4C97F1] hover:bg-[#4C97F1]/90"
                >
                  {t("rating.calculator.calculate")}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isRatingInfoOpen} onOpenChange={setIsRatingInfoOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-200">
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
