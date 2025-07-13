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
import { capitalizeWords, useDebounce } from "@/lib/utils";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { User } from "@/types/users";
import { LicenseType } from "@/types/license";

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
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { data: playerSuggestions } = UseGetUsersDebounce(debouncedSearchTerm);

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

  const addPlayer = () => {
    if (newPlayer.first_name && newPlayer.last_name && newPlayer.birth_date) {
      const currentYear = new Date().getFullYear();
      const birthYear = parseInt(newPlayer.birth_date);
      const age = currentYear - birthYear;

      let defaultLicenseType = LicenseType.ADULT;
      if (age < 15) {
        defaultLicenseType = LicenseType.CHILD;
      } else if (age >= 15 && age <= 19) {
        defaultLicenseType = LicenseType.YOUTH;
      } else if (age >= 65) {
        defaultLicenseType = LicenseType.SENIOR;
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
        sex: "",
        foreigner: 0,
        club_name: "",
        rate_order: 0,
        rate_pl_points: 0,
        rate_points: 0,
        rate_weigth: 0,
        oragnization_id: 0,
        role: 0,
        licenseType: defaultLicenseType,
      };

      setPlayers([...players, newUser]);
      setNewPlayer({ first_name: "", last_name: "", birth_date: "" });
      setSearchTerm("");
      setShowManualEntry(false);
      toast.success(t("licenses.toasts.player_added"));
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
      oragnization_id: 0,
      role: 0,
      licenseType: defaultLicenseType,
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
      players.map((p) => (p.id === playerId ? { ...p, licenseType } : p)),
    );
  };

  const handleLicenseTypeChange = (playerId: number, value: string) => {
    const licenseType = getLicenseTypeFromString(value);
    updateLicenseType(playerId, licenseType);
  };

  const getAvailableLicenseTypes = (player: User) => {
    // Get the player's age-based default license type
    const currentYear = new Date().getFullYear();
    const birthDate = player.birth_date || "";
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

    // Return only the default license type and foreigner license
    return licenseTypes.filter(type => 
      type.id === defaultLicenseType || type.id === LicenseType.FOREIGNER
    );
  };

  const calculateTotal = () => {
    return players.reduce((total, player) => {
      return total + getLicenseTypePrice(player.licenseType);
    }, 0);
  };

  const handleCompletePayment = () => {
    // Here you would implement the payment logic
    toast.success(t("licenses.toasts.redirecting"));
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
                    });
                  }}
                  className="text-gray-600 hover:text-[#4C97F1] flex items-center text-sm font-medium transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t("licenses.add_player.back_to_search")}
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                  type="number"
                  placeholder={t("licenses.add_player.birth_year")}
                  value={newPlayer.birth_date}
                  onChange={(e) =>
                    setNewPlayer({ ...newPlayer, birth_date: e.target.value })
                  }
                  className="px-4 py-3 border-2 border-gray-200 hover:border-[#4C97F1]/50 focus:border-[#4C97F1] rounded-xl focus:outline-none transition-all shadow-sm"
                />
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
                        (l) => l.id === player.licenseType,
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
                              value={player.licenseType}
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
                                : getLicenseTypePrice(player.licenseType)}
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

              <button
                onClick={handleCompletePayment}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 px-6 rounded-xl font-bold transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                <ShoppingCart className="w-5 h-5 mr-3" />
                {t("licenses.summary.complete_payment")}
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
