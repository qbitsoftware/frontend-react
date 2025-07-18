import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Plus,
  X,
  ShoppingCart,
  User as UserIcon,
  ArrowLeft,
  UserPlus,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { UseGetUsersDebounce } from "@/queries/users";
import { UseGetClubsQuery } from "@/queries/clubs";
import { capitalizeWords, useDebounce } from "@/lib/utils";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { User } from "@/types/users";
import { LicenseType } from "@/types/license";
import { useCreatePayment, useCheckPaymentStatus } from "@/queries/licenses";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const Route = createFileRoute("/litsents/")({
  component: RouteComponent,
});

const getLicenseTypePrice = (licenseType: LicenseType): number => {
  const priceMap = {
    [LicenseType.ADULT]: 40,
    [LicenseType.CHILD]: 15,
    [LicenseType.YOUTH]: 25,
    [LicenseType.SENIOR]: 25,
    [LicenseType.FOREIGNER]: 40,
    [LicenseType.NO_CLUB]: 65,
    [LicenseType.ONE_TIME]: 15,
    [LicenseType.NONE]: 0,
  };
  return priceMap[licenseType] || 0;
};

const getLicenseTypeFromString = (value: string): LicenseType => {
  return Object.values(LicenseType).includes(value as LicenseType)
    ? (value as LicenseType)
    : LicenseType.ADULT;
};

function RouteComponent() {
  const { t } = useTranslation();
  const [players, setPlayers] = useState<User[]>([]);
  const [newPlayer, setNewPlayer] = useState({
    first_name: "",
    last_name: "",
    birth_date: "",
    isikukood: "",
    club_name: "",
    sex: "",
  });
  const [validationErrors, setValidationErrors] = useState({
    isikukood: "",
    birth_date: "",
  });
  const [noEstonianId, setNoEstonianId] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { data: playerSuggestions } = UseGetUsersDebounce(debouncedSearchTerm);
  const { data: clubsData } = UseGetClubsQuery();
  const createPaymentMutation = useCreatePayment();
  const checkPaymentStatusMutation = useCheckPaymentStatus();
  
  const clubs = clubsData?.data || [];
  const [clubDropdownOpen, setClubDropdownOpen] = useState(false);
  const [clubSearchTerm, setClubSearchTerm] = useState("");

  const licenseTypes = [
    {
      id: LicenseType.ADULT,
      name: t("licenses.types.adult"),
      price: getLicenseTypePrice(LicenseType.ADULT),
    },
    {
      id: LicenseType.CHILD,
      name: t("licenses.types.child"),
      price: getLicenseTypePrice(LicenseType.CHILD),
    },
    {
      id: LicenseType.YOUTH,
      name: t("licenses.types.youth"),
      price: getLicenseTypePrice(LicenseType.YOUTH),
    },
    {
      id: LicenseType.SENIOR,
      name: t("licenses.types.senior"),
      price: getLicenseTypePrice(LicenseType.SENIOR),
    },
    {
      id: LicenseType.FOREIGNER,
      name: t("licenses.types.foreign"),
      price: getLicenseTypePrice(LicenseType.FOREIGNER),
    },
    {
      id: LicenseType.NO_CLUB,
      name: t("licenses.types.no_club"),
      price: getLicenseTypePrice(LicenseType.NO_CLUB),
    },
    {
      id: LicenseType.ONE_TIME,
      name: t("licenses.types.one_time"),
      price: getLicenseTypePrice(LicenseType.ONE_TIME),
    },
  ];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (debouncedSearchTerm) {
      const timeout = setTimeout(() => setPopoverOpen(true), 50);
      return () => clearTimeout(timeout);
    } else {
      setPopoverOpen(false);
    }
  }, [debouncedSearchTerm]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('order_id');
    const status = urlParams.get('status');

    if (status === 'cancel') {
      toast.message('Payment was cancelled');
      window.location.href = '/litsents/cancel';
      return;
    } else if (status === 'failed') {
      toast.error(t('licenses.payment.status.failed'));
      window.location.href = '/litsents/cancel';
      return;
    }

    if (orderId || status === 'success') {
      const orderIdToCheck = orderId || new URLSearchParams(window.location.search).get('order_id');
      
      if (orderIdToCheck) {
        checkPaymentStatusMutation.mutateAsync(orderIdToCheck)
          .then((result) => {
            if (result.data?.status === 'active') {
              toast.success(t('licenses.payment.status.success'));
              window.location.href = '/litsents/success';
            } else if (result.data?.status === 'pending') {
              toast.message(t('licenses.payment.status.pending'));
            } else {
              toast.error(t('licenses.payment.status.failed'));
              // Redirect to cancel page
              window.location.href = '/litsents/cancel';
            }
          })
          .catch((error) => {
            console.error('Payment status check failed:', error);
            toast.error(t('licenses.payment.status.check_failed'));
          });
      } else if (status === 'success') {
        toast.success(t('licenses.payment.status.success'));
        window.location.href = '/litsents/success';
      }
    }
  }, [t]);

  const addPlayer = () => {
    const requiredFieldsPresent = newPlayer.first_name && newPlayer.last_name && 
        newPlayer.birth_date && newPlayer.sex && (noEstonianId || newPlayer.isikukood);
    
    
    if (requiredFieldsPresent) {
      if (!noEstonianId && newPlayer.isikukood) {
        const validation = validateIsikukoodWithBirthDate(newPlayer.isikukood, newPlayer.birth_date);
        if (!validation.isValid) {
          validateForm(newPlayer.isikukood, newPlayer.birth_date);
          toast.error(validation.message);
          return;
        }
      }
      
      const birthDate = new Date(newPlayer.birth_date);
      const currentDate = new Date();
      const age = currentDate.getFullYear() - birthDate.getFullYear();

      const clubName = newPlayer.club_name.trim() || "KLUBITU";

      let defaultLicenseType = LicenseType.NO_CLUB;
      let foreignerStatus = 0;
      
      if (noEstonianId) {
        defaultLicenseType = LicenseType.FOREIGNER;
        foreignerStatus = 1;
      } else if (clubName !== "KLUBITU") {
        if (age < 15) {
          defaultLicenseType = LicenseType.CHILD;
        } else if (age >= 15 && age <= 19) {
          defaultLicenseType = LicenseType.YOUTH;
        } else if (age >= 65) {
          defaultLicenseType = LicenseType.SENIOR;
        } else {
          defaultLicenseType = LicenseType.ADULT;
        }
      }

      const newUser: User = {
        id: Date.now(),
        email: "",
        organization_id: 0,
        first_name: newPlayer.first_name,
        last_name: newPlayer.last_name,
        created_at: new Date().toISOString(),
        eltl_id: 0,
        birth_date: newPlayer.birth_date,
        sex: newPlayer.sex,
        foreigner: foreignerStatus,
        club_name: clubName,
        rate_order: 0,
        rate_pl_points: 0,
        rate_points: 0,
        rate_weigth: 0,
        role: 0,
        license: null,
        expiration_date: null,
        isikukood: noEstonianId ? undefined : newPlayer.isikukood,
        selectedLicenseType: defaultLicenseType,
      };

      setPlayers([...players, newUser]);
      setNewPlayer({ 
        first_name: "", 
        last_name: "", 
        birth_date: "", 
        isikukood: "", 
        club_name: "", 
        sex: "" 
      });
      setValidationErrors({
        isikukood: "",
        birth_date: "",
      });
      setNoEstonianId(false);
      setClubDropdownOpen(false);
      setClubSearchTerm("");
      setSearchTerm("");
      setShowManualEntry(false);
      toast.success(t("licenses.toasts.player_added"));
    } else {
      const missingFields = [];
      if (!newPlayer.first_name) missingFields.push("First name");
      if (!newPlayer.last_name) missingFields.push("Last name");
      if (!newPlayer.birth_date) missingFields.push("Birth date");
      if (!newPlayer.sex) missingFields.push("Gender");
      if (!noEstonianId && !newPlayer.isikukood) missingFields.push("Estonian ID code");
      
      toast.error(`Please fill in all required fields: ${missingFields.join(", ")}`);
    }
  };

  const handlePlayerSelect = (user: User) => {
    const currentYear = new Date().getFullYear();
    const birthDate = user.birth_date || "";
    const birthYear = birthDate ? parseInt(birthDate) : 0;
    const age = birthYear ? currentYear - birthYear : 0;

    let defaultLicenseType = LicenseType.ADULT;
    if (age < 15) {
      defaultLicenseType = LicenseType.CHILD;
    } else if (age >= 15 && age <= 19) {
      defaultLicenseType = LicenseType.YOUTH;
    } else if (age >= 65) {
      defaultLicenseType = LicenseType.SENIOR;
    }

    const finalLicenseType = user.club_name === "KLUBITU" ? LicenseType.NO_CLUB : defaultLicenseType;

    const newUser: User = {
      id: Date.now(),
      email: "",
      organization_id: 0,
      first_name: user.first_name,
      last_name: user.last_name,
      created_at: new Date().toISOString(),
      eltl_id: user.eltl_id || 0,
      birth_date: birthDate,
      sex: "",
      foreigner: 0,
      club_name: user.club_name,
      rate_order: 0,
      rate_pl_points: 0,
      rate_points: 0,
      rate_weigth: 0,
      role: 0,
      license: null,
      expiration_date: null,
      selectedLicenseType: finalLicenseType,
    };

    setPlayers([...players, newUser]);
    setSearchTerm("");
    setPopoverOpen(false);
    toast.success(t("licenses.toasts.player_added"));
  };

  const removePlayer = (id: number) => {
    setPlayers(players.filter((p) => p.id !== id));
    toast.success(t("licenses.toasts.player_removed"));
  };

  const updateLicenseType = (playerId: number, licenseType: LicenseType) => {
    setPlayers(
      players.map((p) => (p.id === playerId ? { ...p, selectedLicenseType: licenseType } : p)),
    );
  };

  const handleLicenseTypeChange = (playerId: number, value: string) => {
    const licenseType = getLicenseTypeFromString(value);
    updateLicenseType(playerId, licenseType);
  };

  const getAvailableLicenseTypes = (player: User) => {
    let availableTypes = [];

    if (player.foreigner === 1) {
      availableTypes = licenseTypes.filter(type => 
        type.id === LicenseType.FOREIGNER || 
        type.id === LicenseType.ONE_TIME
      );
    }
    else if (player.club_name === "KLUBITU") {
      availableTypes = licenseTypes.filter(type => 
        type.id === LicenseType.NO_CLUB || 
        type.id === LicenseType.FOREIGNER || 
        type.id === LicenseType.ONE_TIME
      );
    }
    else {
      const currentYear = new Date().getFullYear();
      const birthDate = player.birth_date || "";
      let age = 0;
      
      if (birthDate.includes("-")) {
        age = currentYear - new Date(birthDate).getFullYear();
      } else {
        const birthYear = parseInt(birthDate);
        age = birthYear ? currentYear - birthYear : 0;
      }

      let defaultLicenseType = LicenseType.ADULT;
      if (age < 15) {
        defaultLicenseType = LicenseType.CHILD;
      } else if (age >= 15 && age <= 19) {
        defaultLicenseType = LicenseType.YOUTH;
      } else if (age >= 65) {
        defaultLicenseType = LicenseType.SENIOR;
      }

      availableTypes = licenseTypes.filter(type => 
        type.id === defaultLicenseType || 
        type.id === LicenseType.FOREIGNER || 
        type.id === LicenseType.ONE_TIME
      );
    }

    const hasOneTime = availableTypes.some(type => type.id === LicenseType.ONE_TIME);
    if (!hasOneTime) {
      const oneTimeType = licenseTypes.find(type => type.id === LicenseType.ONE_TIME);
      if (oneTimeType) {
        availableTypes.push(oneTimeType);
      }
    }

    return availableTypes;
  };

  const calculateTotal = () => {
    return players.reduce((total, player) => {
      return total + getLicenseTypePrice(player.selectedLicenseType || LicenseType.ADULT);
    }, 0);
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const getClubImage = (clubName: string) => {
    const club = clubs.find((club) => club.name === clubName);
    return club?.image_url || "";
  };

  const filteredClubs = clubs.filter(club => 
    club.name.toLowerCase().includes(clubSearchTerm.toLowerCase())
  );

  const clubOptions = [
    { name: "KLUBITU", image_url: "" },
    ...filteredClubs.filter(club => club.name !== "KLUBITU")
  ];

  const handleClubSelect = (clubName: string) => {
    setNewPlayer({ ...newPlayer, club_name: clubName });
    setClubDropdownOpen(false);
    setClubSearchTerm("");
  };

  const extractBirthDateFromIsikukood = (isikukood: string) => {
    if (!isikukood || isikukood.length < 7) return null;
    
    const firstDigit = parseInt(isikukood[0]);
    const year = isikukood.substring(1, 3);
    const month = isikukood.substring(3, 5);
    const day = isikukood.substring(5, 7);
    
    let century;
    if (firstDigit >= 1 && firstDigit <= 2) {
      century = 1800;
    } else if (firstDigit >= 3 && firstDigit <= 4) {
      century = 1900;
    } else if (firstDigit >= 5 && firstDigit <= 6) {
      century = 2000;
    } else if (firstDigit >= 7 && firstDigit <= 8) {
      century = 2100;
    } else {
      return null; 
    }
    
    const fullYear = century + parseInt(year);
    
    const monthNum = parseInt(month);
    const dayNum = parseInt(day);
    
    if (monthNum < 1 || monthNum > 12 || dayNum < 1 || dayNum > 31) {
      return null;
    }
    
    return {
      year: fullYear,
      month: monthNum,
      day: dayNum,
      dateString: `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    };
  };

  const validateIsikukoodWithBirthDate = (isikukood: string, birthDate: string) => {
    if (!isikukood || !birthDate) return { isValid: true, message: "" };
    
    const extractedDate = extractBirthDateFromIsikukood(isikukood);
    if (!extractedDate) {
      return { 
        isValid: false, 
        message: t("licenses.validation.invalid_isikukood") 
      };
    }
    
    if (extractedDate.dateString !== birthDate) {
      return { 
        isValid: false, 
        message: t("licenses.validation.birth_date_mismatch") 
      };
    }
    
    return { isValid: true, message: "" };
  };

  const validateForm = (isikukood: string, birthDate: string, skipIdValidation = false) => {
    if (skipIdValidation) {
      setValidationErrors({
        isikukood: "",
        birth_date: "",
      });
      return;
    }
    
    const validation = validateIsikukoodWithBirthDate(isikukood, birthDate);
    
    if (!validation.isValid) {
      setValidationErrors({
        isikukood: validation.message,
        birth_date: validation.message,
      });
    } else {
      setValidationErrors({
        isikukood: "",
        birth_date: "",
      });
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (emailError && validateEmail(value)) {
      setEmailError("");
    }
  };

  const handleCompletePayment = async () => {
    if (!email) {
      setEmailError("Email address is required");
      return;
    }
    
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    if (players.length === 0) {
      toast.error("Please add at least one player to continue");
      return;
    }

    setEmailError("");

    try {
      const result = await createPaymentMutation.mutateAsync({
        email: email,
        players: players.map(p => ({
          id: p.id,
          first_name: p.first_name.toUpperCase(),
          last_name: p.last_name.toUpperCase(),
          birth_date: p.birth_date.split(' ')[0], // Only send date part (YYYY-MM-DD)
          licenseType: p.selectedLicenseType || LicenseType.ADULT,
          eltl_id: p.eltl_id,
          club_name: p.club_name,
          sex: p.sex,
          isikukood: p.isikukood,
          foreigner: p.foreigner,
        })),
        total: calculateTotal(),
        currency: 'EUR'
      });
      
      if (result.data?.payment_url) {
        window.location.href = result.data.payment_url;
      } else {
        toast.error(result.error || t("licenses.payment.payment_failed"));
      }
    } catch (error) {
      console.error('Payment initialization error:', error);
      toast.error(t("licenses.payment.payment_failed"));
    }
  };

  return (
    <div className="w-full mx-auto lg:px-4 max-w-[85%]">
      <div className='py-6'>
        <div className="bg-white border border-gray-200/50 shadow-lg rounded-2xl px-6 sm:px-8 md:px-12 py-8 space-y-8">
          <div className="flex items-center gap-4 pb-6 border-b border-gray-200/50">
            <div className="w-1 h-8 bg-[#4C97F1] rounded-full"></div>
            <h1 className="text-2xl font-bold text-gray-900">{t("licenses.page_title")}</h1>
          </div>
          <div className="bg-gradient-to-br from-[#4C97F1]/5 to-blue-50/50 border border-[#4C97F1]/20 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-6 bg-[#4C97F1] rounded-full"></div>
              <h2 className="text-xl font-bold text-gray-900">{t("licenses.add_player.title")}</h2>
            </div>

          {!showManualEntry ? (
            <div>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="relative flex-grow w-full sm:max-w-md">
                  <Popover
                    open={popoverOpen}
                    onOpenChange={(open) => {
                      setPopoverOpen(open);
                    }}
                  >
                    <PopoverTrigger asChild>
                      <Input
                        type="text"
                        placeholder={t(
                          "licenses.add_player.search_placeholder",
                        )}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full border-2 border-gray-200 hover:border-[#4C97F1]/50 focus:border-[#4C97F1] rounded-xl px-4 py-3 shadow-sm transition-all"
                        autoComplete="off"
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
                        {playerSuggestions.data.length > 0 ? (
                          playerSuggestions.data.map((user, i) => (
                            <div
                              key={i}
                              className="px-4 py-3 cursor-pointer hover:bg-[#4C97F1]/10 hover:text-[#4C97F1] transition-colors rounded-lg mx-1 my-1"
                              onClick={() => handlePlayerSelect(user)}
                            >
                              <div className="font-medium">
                                {capitalizeWords(user.first_name)}{" "}
                                {capitalizeWords(user.last_name)}
                              </div>
                              {user.eltl_id && (
                                <div className="text-xs text-gray-500">ELTL ID: {user.eltl_id}</div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-6 text-sm text-gray-500 text-center">
                            <UserIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                            {t("licenses.add_player.no_players_found")}
                          </div>
                        )}
                      </PopoverContent>
                    )}
                  </Popover>
                </div>
                <div className="w-full sm:w-auto sm:border-l-2 sm:border-gray-200 sm:pl-4 sm:ml-4">
                  <button
                    onClick={() => setShowManualEntry(true)}
                    className="w-full sm:w-auto bg-[#4C97F1] hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap flex items-center justify-center shadow-lg hover:shadow-xl"
                    title={t("licenses.add_player.add_new_player")}
                  >
                    <UserPlus className="w-5 h-5 mr-2" />
                    {t("licenses.add_player.add_new_player")}
                  </button>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700">
                  {t("licenses.add_player.help_text")}
                </p>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-6 bg-green-600 rounded-full"></div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {t("licenses.add_player.manual_entry_title")}
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setShowManualEntry(false);
                    setNewPlayer({
                      first_name: "",
                      last_name: "",
                      birth_date: "",
                      isikukood: "",
                      club_name: "",
                      sex: "",
                    });
                    setValidationErrors({
                      isikukood: "",
                      birth_date: "",
                    });
                    setNoEstonianId(false);
                    setClubDropdownOpen(false);
                    setClubSearchTerm("");
                  }}
                  className="text-gray-600 hover:text-[#4C97F1] flex items-center text-sm font-medium transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t("licenses.add_player.back_to_search")}
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder={t("licenses.add_player.first_name")}
                  value={newPlayer.first_name}
                  onChange={(e) =>
                    setNewPlayer({ ...newPlayer, first_name: e.target.value })
                  }
                  className="px-4 py-3 border-2 border-gray-200 hover:border-[#4C97F1]/50 focus:border-[#4C97F1] rounded-xl focus:outline-none transition-all shadow-sm"
                />
                <input
                  type="text"
                  placeholder={t("licenses.add_player.surname")}
                  value={newPlayer.last_name}
                  onChange={(e) =>
                    setNewPlayer({ ...newPlayer, last_name: e.target.value })
                  }
                  className="px-4 py-3 border-2 border-gray-200 hover:border-[#4C97F1]/50 focus:border-[#4C97F1] rounded-xl focus:outline-none transition-all shadow-sm"
                />
                <input
                  type="date"
                  placeholder={t("licenses.add_player.birth_date")}
                  value={newPlayer.birth_date}
                  onChange={(e) => {
                    const newBirthDate = e.target.value;
                    setNewPlayer({ ...newPlayer, birth_date: newBirthDate });
                    validateForm(newPlayer.isikukood, newBirthDate, noEstonianId);
                  }}
                  className={`px-4 py-3 border-2 rounded-xl focus:outline-none transition-all shadow-sm ${
                    validationErrors.birth_date 
                      ? "border-red-300 hover:border-red-400 focus:border-red-500" 
                      : "border-gray-200 hover:border-[#4C97F1]/50 focus:border-[#4C97F1]"
                  }`}
                />
                <input
                  type="text"
                  placeholder={t("licenses.add_player.isikukood")}
                  value={newPlayer.isikukood}
                  onChange={(e) => {
                    const newIsikukood = e.target.value;
                    setNewPlayer({ ...newPlayer, isikukood: newIsikukood });
                    validateForm(newIsikukood, newPlayer.birth_date, noEstonianId);
                  }}
                  className={`px-4 py-3 border-2 rounded-xl focus:outline-none transition-all shadow-sm ${
                    validationErrors.isikukood 
                      ? "border-red-300 hover:border-red-400 focus:border-red-500" 
                      : "border-gray-200 hover:border-[#4C97F1]/50 focus:border-[#4C97F1]"
                  }`}
                  disabled={noEstonianId}
                />
                
                {/* Checkbox for no Estonian ID */}
                <div className="sm:col-span-2 flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="noEstonianId"
                    checked={noEstonianId}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setNoEstonianId(checked);
                      if (checked) {
                        // Clear isikukood and validation errors when opting out
                        setNewPlayer({ ...newPlayer, isikukood: "" });
                        setValidationErrors({ isikukood: "", birth_date: "" });
                      }
                      // Re-validate form with new state
                      validateForm(newPlayer.isikukood, newPlayer.birth_date, checked);
                    }}
                    className="w-4 h-4 text-[#4C97F1] border-2 border-gray-300 rounded focus:ring-[#4C97F1] focus:ring-2"
                  />
                  <label htmlFor="noEstonianId" className="text-sm font-medium text-gray-700 cursor-pointer">
                    {t("licenses.add_player.no_estonian_id")}
                  </label>
                </div>
                
                <div className="relative">
                  <Popover open={clubDropdownOpen} onOpenChange={setClubDropdownOpen}>
                    <PopoverTrigger asChild>
                      <div className="px-4 py-3 border-2 border-gray-200 hover:border-[#4C97F1]/50 focus:border-[#4C97F1] rounded-xl focus:outline-none transition-all shadow-sm cursor-pointer bg-white">
                        {newPlayer.club_name ? (
                          <div className="flex items-center space-x-2">
                            <Avatar className="w-6 h-6 flex-shrink-0">
                              <AvatarImage
                                src={getClubImage(newPlayer.club_name)}
                                alt={`${newPlayer.club_name} logo`}
                              />
                              <AvatarFallback className="text-xs font-semibold bg-gray-100">
                                {newPlayer.club_name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{newPlayer.club_name}</span>
                          </div>
                        ) : (
                          <span className="text-gray-500 text-sm">{t("licenses.add_player.club")}</span>
                        )}
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0" align="start">
                      <div className="p-3">
                        <Input
                          placeholder={t("licenses.add_player.search_club")}
                          value={clubSearchTerm}
                          onChange={(e) => setClubSearchTerm(e.target.value)}
                          className="mb-2"
                        />
                        <div className="max-h-48 overflow-y-auto">
                          {clubOptions.map((club, index) => (
                            <div
                              key={index}
                              className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
                              onClick={() => handleClubSelect(club.name)}
                            >
                              <Avatar className="w-8 h-8 flex-shrink-0">
                                <AvatarImage
                                  src={club.image_url}
                                  alt={`${club.name} logo`}
                                />
                                <AvatarFallback className="text-xs font-semibold bg-gray-100">
                                  {club.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-medium">{club.name}</span>
                            </div>
                          ))}
                          {clubOptions.length === 0 && (
                            <div className="p-2 text-sm text-gray-500 text-center">
                              {t("licenses.add_player.no_clubs_found")}
                            </div>
                          )}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <select
                  value={newPlayer.sex}
                  onChange={(e) =>
                    setNewPlayer({ ...newPlayer, sex: e.target.value })
                  }
                  className="px-4 py-3 border-2 border-gray-200 hover:border-[#4C97F1]/50 focus:border-[#4C97F1] rounded-xl focus:outline-none transition-all shadow-sm"
                >
                  <option value="">{t("licenses.add_player.gender")}</option>
                  <option value="M">{t("licenses.add_player.gender_male")}</option>
                  <option value="N">{t("licenses.add_player.gender_female")}</option>
                </select>
              </div>
              
              {/* Validation errors */}
              {(validationErrors.isikukood || validationErrors.birth_date) && (
                <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm text-red-700">
                    {validationErrors.isikukood || validationErrors.birth_date}
                  </p>
                </div>
              )}
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700">
                  {t("licenses.add_player.club_help")}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-start gap-4 mt-6">
                <button
                  onClick={addPlayer}
                  className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  {t("licenses.add_player.add_to_list")}
                </button>
                <div className="flex-1 p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-700">
                    {t("licenses.add_player.manual_help_text")}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

          {players.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-6 bg-[#4C97F1] rounded-full"></div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {t("licenses.table.title")}
                  </h2>
                </div>
              </div>
              <div className="overflow-x-auto -mx-2 sm:mx-0">
                <table className="w-full min-w-[600px]">
                  <thead className="bg-gradient-to-r from-[#4C97F1]/5 to-blue-50">
                    <tr>
                      <th className="px-3 sm:px-6 py-4 text-left text-xs sm:text-sm font-bold text-gray-700">
                        {t("licenses.table.player")}
                      </th>
                      <th className="px-3 sm:px-6 py-4 text-left text-xs sm:text-sm font-bold text-gray-700">
                        {t("licenses.table.birth_year")}
                      </th>
                      <th className="px-3 sm:px-6 py-4 text-left text-xs sm:text-sm font-bold text-gray-700">
                        {t("licenses.table.club")}
                      </th>
                      <th className="px-3 sm:px-6 py-4 text-left text-xs sm:text-sm font-bold text-gray-700">
                        {t("licenses.table.license_type")}
                      </th>
                      <th className="px-3 sm:px-6 py-4 text-left text-xs sm:text-sm font-bold text-gray-700">
                        {t("licenses.table.price")}
                      </th>
                      <th className="px-3 sm:px-6 py-4 text-left text-xs sm:text-sm font-bold text-gray-700">
                        {t("licenses.table.action")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {players.map((player) => {
                      const license = licenseTypes.find(
                        (l) => l.id === player.selectedLicenseType,
                      );
                      return (
                        <tr key={player.id} className="hover:bg-[#4C97F1]/5 transition-colors">
                          <td className="px-3 sm:px-6 py-4 sm:py-5 whitespace-nowrap">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#4C97F1] rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                                {player.first_name.charAt(0)}{player.last_name.charAt(0)}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                                  {player.first_name} {player.last_name}
                                  {player.foreigner === 1 && (
                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                      {t("licenses.table.foreigner")}
                                    </span>
                                  )}
                                </div>
                                {player.eltl_id && player.eltl_id > 0 && (
                                  <div className="text-xs text-gray-500 hidden sm:block">
                                    {t("licenses.table.eltl_id")}: {player.eltl_id}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-4 sm:py-5 whitespace-nowrap">
                            <div className="text-xs sm:text-sm font-medium text-gray-700">
                              {player.birth_date
                                ? new Date(player.birth_date).getFullYear()
                                : "---"}
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-4 sm:py-5">
                            <div className="text-xs sm:text-sm text-gray-600 truncate max-w-[100px] sm:max-w-none">
                              {player.club_name || "---"}
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-4 sm:py-5 whitespace-nowrap">
                            <select
                              value={player.selectedLicenseType || LicenseType.ADULT}
                              onChange={(e) =>
                                handleLicenseTypeChange(player.id, e.target.value)
                              }
                              className="w-full px-2 sm:px-3 py-1 sm:py-2 border-2 border-gray-200 hover:border-[#4C97F1]/50 focus:border-[#4C97F1] rounded-lg text-xs sm:text-sm focus:outline-none transition-all"
                            >
                              {getAvailableLicenseTypes(player).map((type) => (
                                <option key={type.id} value={type.id}>
                                  {type.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 sm:px-6 py-4 sm:py-5 whitespace-nowrap">
                            <div className="text-sm sm:text-lg font-bold text-[#4C97F1]">
                              €{license
                                ? license.price
                                : getLicenseTypePrice(player.selectedLicenseType || LicenseType.ADULT)}
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-4 sm:py-5 whitespace-nowrap">
                            <button
                              onClick={() => removePlayer(player.id)}
                              className="p-1 sm:p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <X className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                          </td>
                        </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

          {players.length > 0 && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 shadow-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-1 h-6 bg-green-600 rounded-full"></div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {t("licenses.summary.title")}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    {players.length}{" "}
                    {players.length === 1
                      ? t("licenses.summary.license_single")
                      : t("licenses.summary.license_plural")}{" "}
                    {t("licenses.summary.selected")}
                  </p>
                </div>
                <div className="w-full sm:w-auto text-left sm:text-right">
                  <p className="text-sm text-gray-600 mb-1">
                    {t("licenses.summary.total_amount")}
                  </p>
                  <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-green-200">
                    <p className="text-3xl font-bold text-green-600">
                      €{calculateTotal()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("licenses.payment.email_label")}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  placeholder={t("licenses.payment.email_placeholder")}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all shadow-sm ${
                    emailError 
                      ? 'border-red-300 focus:border-red-500' 
                      : 'border-gray-200 hover:border-green-400 focus:border-green-500'
                  }`}
                />
                {emailError && (
                  <p className="mt-2 text-sm text-red-600">{emailError}</p>
                )}
                <p className="mt-2 text-sm text-gray-600">
                  {t("licenses.payment.email_help")}
                </p>
              </div>

              <button
                onClick={handleCompletePayment}
                disabled={createPaymentMutation.isPending}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 px-6 rounded-xl font-bold transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                {createPaymentMutation.isPending ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                ) : (
                  <ShoppingCart className="w-5 h-5 mr-3" />
                )}
                {createPaymentMutation.isPending ? t("licenses.payment.processing") : t("licenses.payment.complete_payment")}
              </button>
            </div>
          )}

          {players.length === 0 && (
            <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">{t("licenses.empty_state_title")}</h3>
              <p className="text-gray-500">{t("licenses.empty_state")}</p>
            </div>
          )}

          <div className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
              <h3 className="text-xl font-bold text-blue-900">
                {t("licenses.info.title")}
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {licenseTypes.map((type) => (
                <div key={type.id} className="bg-white p-3 sm:p-4 rounded-lg border border-blue-200 flex justify-between items-center">
                  <span className="font-medium text-blue-800 text-sm sm:text-base">{type.name}</span>
                  <span className="font-bold text-blue-600 text-base sm:text-lg">€{type.price}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-blue-100 rounded-lg border border-blue-300">
              <p className="text-sm text-blue-700 font-medium">
                {t("licenses.info.validity")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
