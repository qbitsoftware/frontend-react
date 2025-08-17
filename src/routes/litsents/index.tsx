import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Plus,
  X,
  ShoppingCart,
  User as UserIcon,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { User } from "@/types/users";
import { LicenseType } from "@/types/license";
import { useCreatePayment, useCheckPaymentStatus } from "@/queries/licenses";
import { PlayerSearchInput } from "@/components/shared/PlayerSearchInput";
import { PlayerManualEntryForm } from "@/components/shared/PlayerManualEntryForm";
import { 
  extractGenderFromIsikukood, 
  PlayerFormData,
} from "@/lib/player-validation";

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
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const createPaymentMutation = useCreatePayment();
  const checkPaymentStatusMutation = useCheckPaymentStatus();


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
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get("order_id");
    const status = urlParams.get("status");

    if (status === "cancel") {
      toast.message("Payment was cancelled");
      window.location.href = "/litsents/cancel";
      return;
    } else if (status === "failed") {
      toast.error(t("licenses.payment.status.failed"));
      window.location.href = "/litsents/cancel";
      return;
    }

    if (orderId || status === "success") {
      const orderIdToCheck =
        orderId || new URLSearchParams(window.location.search).get("order_id");

      if (orderIdToCheck) {
        checkPaymentStatusMutation
          .mutateAsync(orderIdToCheck)
          .then((result) => {
            if (result.data?.status === "active") {
              toast.success(t("licenses.payment.status.success"));
              window.location.href = "/litsents/success";
            } else if (result.data?.status === "pending") {
              toast.message(t("licenses.payment.status.pending"));
            } else {
              toast.error(t("licenses.payment.status.failed"));
              // Redirect to cancel page
              window.location.href = "/litsents/cancel";
            }
          })
          .catch((error) => {
            void error;
            toast.error(t("licenses.payment.status.check_failed"));
          });
      } else if (status === "success") {
        toast.success(t("licenses.payment.status.success"));
        window.location.href = "/litsents/success";
      }
    }
  }, [t]);

  const addPlayerDirectly = async (playerData: PlayerFormData, noEstId: boolean) => {
    const birthDate = new Date(playerData.birth_date);
    const currentDate = new Date();
    const age = currentDate.getFullYear() - birthDate.getFullYear();

    const clubName = playerData.club_name?.trim() || "KLUBITU";

    let defaultLicenseType = LicenseType.NO_CLUB;
    let foreignerStatus = 0;

    if (noEstId) {
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
      first_name: playerData.first_name,
      last_name: playerData.last_name,
      created_at: new Date().toISOString(),
      eltl_id: 0,
      birth_date: playerData.birth_date,
      sex: playerData.sex,
      foreigner: foreignerStatus,
      club:
        clubName !== "KLUBITU"
          ? {
              id: 0,
              name: clubName,
              created_at: "",
              updated_at: "",
              deleted_at: null,
              email: "",
              phone: "",
              contact_person: "",
              address: "",
              website: "",
              organization_id: 0,
              image_url: "",
            }
          : {
              id: 0,
              name: "KLUBITU",
              created_at: "",
              updated_at: "",
              deleted_at: null,
              email: "",
              phone: "",
              contact_person: "",
              address: "",
              website: "",
              organization_id: 0,
              image_url: "",
            },
      rate_order: 0,
      rate_pl_points: 0,
      rate_points: 0,
      rate_weigth: 0,
      role: 0,
      license: null,
      expiration_date: null,
      isikukood: noEstId ? undefined : playerData.isikukood,
      selectedLicenseType: defaultLicenseType,
    };

    setPlayers([...players, newUser]);
    setShowManualEntry(false);
    toast.success(t("licenses.toasts.player_added"));
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

    const finalLicenseType =
      !user.club || user.club.name === "KLUBITU"
        ? LicenseType.NO_CLUB
        : defaultLicenseType;

    const newUser: User = {
      id: Date.now(),
      email: "",
      organization_id: 0,
      first_name: user.first_name,
      last_name: user.last_name,
      created_at: new Date().toISOString(),
      eltl_id: user.eltl_id || 0,
      birth_date: birthDate,
      sex:
        user.sex ||
        (user.isikukood ? extractGenderFromIsikukood(user.isikukood) : "") ||
        "",
      foreigner: 0,
      club: user.club,
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
    toast.success(t("licenses.toasts.player_added"));
  };

  const removePlayer = (id: number) => {
    setPlayers(players.filter((p) => p.id !== id));
    toast.success(t("licenses.toasts.player_removed"));
  };

  const updateLicenseType = (playerId: number, licenseType: LicenseType) => {
    setPlayers(
      players.map((p) =>
        p.id === playerId ? { ...p, selectedLicenseType: licenseType } : p
      )
    );
  };

  const handleLicenseTypeChange = (playerId: number, value: string) => {
    const licenseType = getLicenseTypeFromString(value);
    updateLicenseType(playerId, licenseType);
  };

  const getAvailableLicenseTypes = (player: User) => {
    let availableTypes = [];

    if (player.foreigner === 1) {
      availableTypes = licenseTypes.filter(
        (type) =>
          type.id === LicenseType.FOREIGNER || type.id === LicenseType.ONE_TIME
      );
    } else if (player.club?.name === "KLUBITU") {
      const hasEstonianId = player.isikukood && player.isikukood.trim() !== "";

      availableTypes = licenseTypes.filter((type) => {
        if (
          type.id === LicenseType.NO_CLUB ||
          type.id === LicenseType.ONE_TIME
        ) {
          return true;
        }
        if (type.id === LicenseType.FOREIGNER) {
          return !hasEstonianId;
        }
        return false;
      });
    } else {
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

      const hasEstonianId = player.isikukood && player.isikukood.trim() !== "";

      availableTypes = licenseTypes.filter((type) => {
        if (
          type.id === defaultLicenseType ||
          type.id === LicenseType.ONE_TIME
        ) {
          return true;
        }
        if (type.id === LicenseType.FOREIGNER) {
          return !hasEstonianId;
        }
        return false;
      });
    }

    const hasOneTime = availableTypes.some(
      (type) => type.id === LicenseType.ONE_TIME
    );
    if (!hasOneTime) {
      const oneTimeType = licenseTypes.find(
        (type) => type.id === LicenseType.ONE_TIME
      );
      if (oneTimeType) {
        availableTypes.push(oneTimeType);
      }
    }

    return availableTypes;
  };

  const calculateTotal = () => {
    return players.reduce((total, player) => {
      return (
        total +
        getLicenseTypePrice(player.selectedLicenseType || LicenseType.ADULT)
      );
    }, 0);
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };


  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (emailError && validateEmail(value)) {
      setEmailError("");
    }
  };

  const handleCompletePayment = async () => {
    toast.message(t("licenses.payment.september_notice"));
  };

  return (
    <div className="w-full mx-auto lg:px-4 max-w-[98%]">
      <div className="py-2 sm:py-4">
        <div className="lg:rounded-lg px-3 sm:px-4 lg:px-12 py-3 sm:py-6">
          <div className="space-y-4 sm:space-y-6 lg:space-y-8">
          <div className="flex items-center gap-4 pb-6 border-b border-gray-200/50">
            <div className="w-1 h-8 bg-[#4C97F1] rounded-full"></div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t("licenses.page_title")}
            </h1>
          </div>
          <div className="bg-gradient-to-br from-[#4C97F1]/5 to-blue-50/50 border border-[#4C97F1]/20 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">

            {!showManualEntry ? (
              <div>
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  <div className="relative flex-grow w-full sm:max-w-md">
                    <PlayerSearchInput
                      placeholder={t("licenses.add_player.search_placeholder")}
                      className="w-full"
                      inputClassName="border-2 border-gray-200 hover:border-[#4C97F1]/50 focus:border-[#4C97F1] rounded-xl px-4 py-3 shadow-sm transition-all"
                      onPlayerSelect={handlePlayerSelect}
                      translationPrefix="licenses.add_player"
                    />
                  </div>
                  <div className="w-full sm:w-auto sm:border-l-2 sm:border-gray-200 sm:pl-4 sm:ml-4">
                    <button
                      onClick={() => setShowManualEntry(true)}
                      className="w-full sm:w-auto bg-[#4C97F1] hover:bg-blue-600 text-white px-3 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap flex items-center justify-center shadow-lg hover:shadow-xl text-xs sm:text-base"
                      title={t("licenses.add_player.add_new_player")}
                    >
                      <UserPlus className="w-3 h-3 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">{t("licenses.add_player.add_new_player")}</span>
                      <span className="sm:hidden">{t("licenses.add_player.add_player_short", "Add New")}</span>
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
              <PlayerManualEntryForm
                onBack={() => setShowManualEntry(false)}
                onSubmit={(playerData, noEstId) => {
                  addPlayerDirectly(playerData, noEstId);
                }}
                onValidationError={(errors) => {
                  toast.error(`Please fill in all required fields: ${errors.join(", ")}`);
                }}
                translationPrefix="licenses.add_player"
                submitButtonText={t("licenses.add_player.add_to_list")}
                submitButtonIcon={<Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />}
                submitButtonClassName="w-full sm:w-auto bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl text-xs sm:text-base"
              />
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
                        (l) => l.id === player.selectedLicenseType
                      );
                      return (
                        <tr
                          key={player.id}
                          className="hover:bg-[#4C97F1]/5 transition-colors"
                        >
                          <td className="px-3 sm:px-6 py-4 sm:py-5 whitespace-nowrap">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#4C97F1] rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                                {player.first_name.charAt(0)}
                                {player.last_name.charAt(0)}
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
                                    {t("licenses.table.eltl_id")}:{" "}
                                    {player.eltl_id}
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
                              {player.club?.name || "KLUBITU"}
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-4 sm:py-5 whitespace-nowrap">
                            <select
                              value={
                                player.selectedLicenseType || LicenseType.ADULT
                              }
                              onChange={(e) =>
                                handleLicenseTypeChange(
                                  player.id,
                                  e.target.value
                                )
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
                              €
                              {license
                                ? license.price
                                : getLicenseTypePrice(
                                    player.selectedLicenseType ||
                                      LicenseType.ADULT
                                  )}
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
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 sm:p-6 shadow-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-4 sm:mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-1 h-6 bg-green-600 rounded-full"></div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">
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

              <div className="mb-4 sm:mb-6">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  {t("licenses.payment.email_label")}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  placeholder={t("licenses.payment.email_placeholder")}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-xl focus:outline-none transition-all shadow-sm text-sm ${
                    emailError
                      ? "border-red-300 focus:border-red-500"
                      : "border-gray-200 hover:border-green-400 focus:border-green-500"
                  }`}
                />
                {emailError && (
                  <p className="mt-2 text-xs sm:text-sm text-red-600">{emailError}</p>
                )}
                <p className="mt-2 text-xs sm:text-sm text-gray-600">
                  {t("licenses.payment.email_help")}
                </p>
              </div>

              <button
                onClick={handleCompletePayment}
                disabled={createPaymentMutation.isPending}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-bold transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-[1.02] text-sm sm:text-base"
              >
                {createPaymentMutation.isPending ? (
                  <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2 sm:mr-3"></div>
                ) : (
                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                )}
                {createPaymentMutation.isPending
                  ? t("licenses.payment.processing")
                  : t("licenses.payment.complete_payment")}
              </button>
            </div>
          )}

          {players.length === 0 && (
            <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                {t("licenses.empty_state_title")}
              </h3>
              <p className="text-gray-500">{t("licenses.empty_state")}</p>
            </div>
          )}

          <div className="mt-4 sm:mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-6">
              <div className="w-1 h-5 sm:h-6 bg-blue-600 rounded-full"></div>
              <h3 className="text-base sm:text-xl font-bold text-blue-900">
                {t("licenses.info.title")}
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
              {licenseTypes.map((type) => (
                <div
                  key={type.id}
                  className="bg-white p-2 sm:p-3 rounded-lg border border-blue-200 flex justify-between items-center"
                >
                  <span className="font-medium text-blue-800 text-xs sm:text-sm">
                    {type.name}
                  </span>
                  <span className="font-bold text-blue-600 text-xs sm:text-base">
                    €{type.price}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 sm:mt-6 p-2 sm:p-4 bg-blue-100 rounded-lg border border-blue-300">
              <p className="text-xs sm:text-sm text-blue-700 font-medium">
                {t("licenses.info.validity")}
              </p>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
