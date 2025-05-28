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
    [LicenseType.ADULT]: 25,
    [LicenseType.CHILD]: 10,
    [LicenseType.YOUTH]: 15,
    [LicenseType.SENIOR]: 20,
    [LicenseType.FOREIGNER]: 25,
    [LicenseType.NO_CLUB]: 35,
    [LicenseType.ONE_TIME]: 10,
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
    <div className="min-h-screen bg-white">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <span className="text-xl font-semibold">
                {t("licenses.title")}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-semibold mb-8">
          {t("licenses.page_title")}
        </h1>
        <div className="bg-gray-100 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <UserIcon className="w-5 h-5 mr-2" />
            {t("licenses.add_player.title")}
          </h2>

          {!showManualEntry ? (
            <div>
              <div className="flex gap-4 items-start">
                <div className="relative flex-grow max-w-md">
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
                        className="w-full"
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
                              className="px-3 py-2 cursor-pointer hover:bg-accent"
                              onClick={() => handlePlayerSelect(user)}
                            >
                              {capitalizeWords(user.first_name)}{" "}
                              {capitalizeWords(user.last_name)}{" "}
                              {user.eltl_id && `(${user.eltl_id})`}
                            </div>
                          ))
                        ) : (
                          <div className="px-3 py-4 text-sm text-gray-500 text-center">
                            {t("licenses.add_player.no_players_found")}
                          </div>
                        )}
                      </PopoverContent>
                    )}
                  </Popover>
                </div>
                <div className="border-l pl-4 ml-2">
                  <button
                    onClick={() => setShowManualEntry(true)}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-md font-medium transition-colors whitespace-nowrap flex items-center"
                    title={t("licenses.add_player.add_new_player")}
                  >
                    <UserPlus className="w-5 h-5 mr-1" />
                    {t("licenses.add_player.add_new_player")}
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-3">
                {t("licenses.add_player.help_text")}
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-md font-medium text-gray-700">
                  {t("licenses.add_player.manual_entry_title")}
                </h3>
                <button
                  onClick={() => {
                    setShowManualEntry(false);
                    setNewPlayer({
                      first_name: "",
                      last_name: "",
                      birth_date: "",
                    });
                  }}
                  className="text-gray-600 hover:text-gray-800 flex items-center text-sm"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  {t("licenses.add_player.back_to_search")}
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder={t("licenses.add_player.first_name")}
                  value={newPlayer.first_name}
                  onChange={(e) =>
                    setNewPlayer({ ...newPlayer, first_name: e.target.value })
                  }
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder={t("licenses.add_player.surname")}
                  value={newPlayer.last_name}
                  onChange={(e) =>
                    setNewPlayer({ ...newPlayer, last_name: e.target.value })
                  }
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder={t("licenses.add_player.birth_year")}
                  value={newPlayer.birth_date}
                  onChange={(e) =>
                    setNewPlayer({ ...newPlayer, birth_date: e.target.value })
                  }
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mt-4">
                <button
                  onClick={addPlayer}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md font-medium transition-colors flex items-center"
                >
                  <Plus className="w-5 h-5 mr-1" />
                  {t("licenses.add_player.add_to_list")}
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {t("licenses.add_player.manual_help_text")}
              </p>
            </div>
          )}
        </div>

        {players.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border mb-8">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">
                {t("licenses.table.title")}
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("licenses.table.player")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("licenses.table.birth_year")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("licenses.table.club")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("licenses.table.license_type")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("licenses.table.price")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("licenses.table.action")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {players.map((player) => {
                    const license = licenseTypes.find(
                      (l) => l.id === player.licenseType,
                    );
                    return (
                      <tr key={player.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {player.first_name} {player.last_name}
                          </div>
                          {player.eltl_id && player.eltl_id > 0 && (
                            <div className="text-xs text-gray-500">
                              {t("licenses.table.eltl_id")}: {player.eltl_id}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {player.birth_date
                            ? new Date(player.birth_date).getFullYear()
                            : ""}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {player.club_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={player.licenseType}
                            onChange={(e) =>
                              handleLicenseTypeChange(player.id, e.target.value)
                            }
                            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {licenseTypes.map((type) => (
                              <option key={type.id} value={type.id}>
                                {type.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          €
                          {license
                            ? license.price
                            : getLicenseTypePrice(player.licenseType)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => removePlayer(player.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="w-5 h-5" />
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
          <div className="bg-gray-100 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold">
                  {t("licenses.summary.title")}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {players.length}{" "}
                  {players.length === 1
                    ? t("licenses.summary.license_single")
                    : t("licenses.summary.license_plural")}{" "}
                  {t("licenses.summary.selected")}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">
                  {t("licenses.summary.total_amount")}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  €{calculateTotal()}
                </p>
              </div>
            </div>

            <button
              onClick={handleCompletePayment}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-md font-medium transition-colors flex items-center justify-center"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              {t("licenses.summary.complete_payment")}
            </button>
          </div>
        )}

        {players.length === 0 && (
          <div className="text-center py-12 bg-gray-100 rounded-lg">
            <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">{t("licenses.empty_state")}</p>
          </div>
        )}

        <div className="mt-12 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-blue-900">
            {t("licenses.info.title")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {licenseTypes.map((type) => (
              <div key={type.id} className="flex justify-between text-blue-800">
                <span>{type.name}:</span>
                <span className="font-medium">€{type.price}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-blue-700 mt-4">
            * {t("licenses.info.validity")}
          </p>
        </div>
      </div>
    </div>
  );
}
