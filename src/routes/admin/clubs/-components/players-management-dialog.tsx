import { useState, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Plus, X, UserIcon, ArrowLeft, UserPlus } from "lucide-react";
import { Club } from "@/types/clubs";
import { User } from "@/types/users";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "@/queries/axiosconf";
import { UseGetUsersDebounce } from "@/queries/users";
import { capitalizeWords, extractBirthDateFromIsikukood, useDebounce } from "@/lib/utils";
import { toast } from 'sonner';
import { handleApiError } from "@/lib/api-error-handler";

interface PlayersManagementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedClub: Club | null;
  onPlayersUpdate: () => void;
}

export function PlayersManagementDialog({
  isOpen,
  onClose,
  selectedClub,
  onPlayersUpdate,
}: PlayersManagementDialogProps) {
  const { t } = useTranslation();

  const [clubPlayers, setClubPlayers] = useState<User[]>([]);
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(false);

  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [newPlayer, setNewPlayer] = useState({
    first_name: "",
    last_name: "",
    birth_date: "",
    isikukood: "",
    sex: "",
  });
  const [validationErrors, setValidationErrors] = useState({
    isikukood: "",
    birth_date: "",
  });
  const [noEstonianId, setNoEstonianId] = useState(false);
  const [isVerifyingId, setIsVerifyingId] = useState(false);
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);

  const [isRemovePlayerDialogOpen, setIsRemovePlayerDialogOpen] = useState(false);
  const [playerToRemove, setPlayerToRemove] = useState<User | null>(null);

  const [isAddPlayerDialogOpen, setIsAddPlayerDialogOpen] = useState(false);
  const [playerToAdd, setPlayerToAdd] = useState<User | null>(null);
  const [isAddNewPlayerDialogOpen, setIsAddNewPlayerDialogOpen] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const { data: playerSuggestions } = UseGetUsersDebounce(debouncedSearchTerm);

  const fetchClubPlayers = useCallback(async (clubName: string) => {
    setIsLoadingPlayers(true);
    try {
      const { data } = await axiosInstance.get(`/api/v1/clubs/${clubName}/players`, {
        withCredentials: true,
      });
      setClubPlayers(data.data || []);
    } catch (error) {
      console.error("Error fetching club players:", error);
      setClubPlayers([]);
    } finally {
      setIsLoadingPlayers(false);
    }
  }, []);

  const getLicenseInfo = (license: string | null, expirationDate: string | null) => {
    if (license && license !== null && license !== "") {
      if (expirationDate) {
        const expDate = new Date(expirationDate);
        const now = new Date();
        if (expDate < now) {
          return {
            text: t("rating.license_status.missing"),
            isActive: false
          };
        }
        const formattedDate = expDate.toLocaleDateString('et-EE', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
        return {
          text: formattedDate,
          isActive: true
        };
      }
      return {
        text: t("rating.license_status.active"),
        isActive: true
      };
    }
    return {
      text: t("rating.license_status.missing"),
      isActive: false
    };
  };

  const validateIsikukoodWithBirthDate = (isikukood: string, birthDate: string) => {
    if (!isikukood || !birthDate) return { isValid: true, message: "" };

    const extractedDate = extractBirthDateFromIsikukood(isikukood);
    if (!extractedDate) {
      return {
        isValid: false,
        message: t("admin.clubs.validation.invalid_estonian_id")
      };
    }

    if (extractedDate.dateString !== birthDate) {
      return {
        isValid: false,
        message: t("admin.clubs.validation.birth_date_mismatch")
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

  const addPlayerToClub = async () => {
    if (!selectedClub) return;

    setIsVerifyingId(true);
    try {
      validateForm(newPlayer.isikukood, newPlayer.birth_date, noEstonianId);
      if (validationErrors.isikukood || validationErrors.birth_date) {
        setIsVerifyingId(false);
        return;
      }

      setIsAddingPlayer(true);
      setIsVerifyingId(false);

      await axiosInstance.post('/api/v1/clubs/players', {
        player_id: null, 
        club_id: selectedClub?.id,
        first_name: newPlayer.first_name,
        last_name: newPlayer.last_name,
        birth_date: newPlayer.birth_date,
        sex: newPlayer.sex,
        isikukood: noEstonianId ? undefined : newPlayer.isikukood,
        foreigner: noEstonianId ? 1 : 0,
      }, {
        withCredentials: true
      });

      // Use specific success message for new player creation
      const playerName = `${capitalizeWords(newPlayer.first_name)} ${capitalizeWords(newPlayer.last_name)}`;
      const clubName = selectedClub.name;
      toast.message(t("admin.clubs.toast.new_player_created_and_added", { 
        playerName, 
        clubName 
      }));

      setNewPlayer({
        first_name: "",
        last_name: "",
        birth_date: "",
        isikukood: "",
        sex: ""
      });
      setValidationErrors({
        isikukood: "",
        birth_date: "",
      });
      setNoEstonianId(false);
      setShowManualEntry(false);
      setShowAddPlayer(false);

      setTimeout(() => {
        if (selectedClub) {
          fetchClubPlayers(selectedClub.name);
        }
      }, 100);
    } catch (error) {
      console.error('Failed to add player to club:', error);
      const errorMessage = handleApiError(error, t, t("admin.clubs.toast.failed_to_add_player"));
      toast.error(errorMessage);
    } finally {
      setIsAddingPlayer(false);
      setIsVerifyingId(false);
      setIsAddNewPlayerDialogOpen(false);
    }
  };

  const handleAddNewPlayerClick = () => {
    if (!selectedClub) return;

    validateForm(newPlayer.isikukood, newPlayer.birth_date, noEstonianId);
    if (validationErrors.isikukood || validationErrors.birth_date) {
      return;
    }

    setIsAddNewPlayerDialogOpen(true);
  };

  const handlePlayerSelectClick = (user: User) => {
    setPlayerToAdd(user);
    setIsAddPlayerDialogOpen(true);
  };

  const handlePlayerSelect = async (user: User) => {
    setIsAddingPlayer(true);
    try {
      await axiosInstance.post('/api/v1/clubs/players', {
        player_id: user.id,
        club_id: selectedClub?.id,
      }, {
        withCredentials: true
      });

      const playerName = `${capitalizeWords(user.first_name)} ${capitalizeWords(user.last_name)}`;
      const clubName = selectedClub?.name;
      toast.message(t("admin.clubs.toast.player_added_to_club", { 
        playerName, 
        clubName 
      }));

      setSearchTerm("");
      setPopoverOpen(false);

      setTimeout(() => {
        if (selectedClub) {
          fetchClubPlayers(selectedClub.name);
        }
      }, 100);
    } catch (error) {
      console.error('Failed to add player to club:', error);
      const errorMessage = handleApiError(error, t, t("admin.clubs.toast.failed_to_add_player"));
      toast.error(errorMessage);
    } finally {
      setIsAddingPlayer(false);
      setIsAddPlayerDialogOpen(false);
      setPlayerToAdd(null);
    }
  };

  const handleRemovePlayerClick = (player: User) => {
    setPlayerToRemove(player);
    setIsRemovePlayerDialogOpen(true);
  };

  const removePlayerFromClub = async () => {
    if (!selectedClub || !playerToRemove) return;

    try {
      await axiosInstance.delete('/api/v1/clubs/players', {
        data: {
          player_id: playerToRemove.id,
          club_id: selectedClub.id,
        },
        withCredentials: true,
      });

      const playerName = `${capitalizeWords(playerToRemove.first_name)} ${capitalizeWords(playerToRemove.last_name)}`;
      const clubName = selectedClub.name;
      toast.success(t("admin.clubs.toast.player_removed_from_club", { 
        playerName, 
        clubName 
      }));
      fetchClubPlayers(selectedClub.name);
      onPlayersUpdate();
    } catch (error: unknown) {
      const errorMessage = handleApiError(error, t, t("admin.clubs.players_modal.remove.error"));
      toast.error(errorMessage);
    } finally {
      setIsRemovePlayerDialogOpen(false);
      setPlayerToRemove(null);
    }
  };

  const resetForm = () => {
    setShowAddPlayer(false);
    setShowManualEntry(false);
    setNewPlayer({
      first_name: "",
      last_name: "",
      birth_date: "",
      isikukood: "",
      sex: "",
    });
    setValidationErrors({
      isikukood: "",
      birth_date: "",
    });
    setNoEstonianId(false);
    setSearchTerm("");
    setPopoverOpen(false);
  };

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [onClose]);

  const handleOpenChange = useCallback((open: boolean) => {
    if (!open && (isRemovePlayerDialogOpen || isAddPlayerDialogOpen || isAddNewPlayerDialogOpen)) {
      return;
    }
    
    if (open && selectedClub) {
      fetchClubPlayers(selectedClub.name);
    } else if (!open) {
      handleClose();
    }
  }, [selectedClub, fetchClubPlayers, handleClose, isRemovePlayerDialogOpen, isAddPlayerDialogOpen, isAddNewPlayerDialogOpen]);

  useEffect(() => {
    if (isOpen && selectedClub) {
      fetchClubPlayers(selectedClub.name);
    }
  }, [isOpen, selectedClub, fetchClubPlayers]);

  if (!selectedClub) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="pb-4 border-b">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Users className="w-5 h-5" />
              {t("admin.clubs.players_modal.title", { clubName: selectedClub.name })}
            </DialogTitle>
            <DialogDescription className="text-base">
              {t("admin.clubs.players_modal.description")}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-auto space-y-4">
            {showAddPlayer && (
              <div className="bg-gradient-to-br from-[#4C97F1]/5 to-blue-50/50 border border-[#4C97F1]/20 rounded-xl p-6 shadow-sm">
                {!showManualEntry ? (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-6 bg-[#4C97F1] rounded-full"></div>
                        <h4 className="font-semibold text-gray-900 text-lg">{t("admin.clubs.players_modal.search.title")}</h4>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAddPlayer(false)}
                        className="hover:bg-red-50 hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-col gap-4">
                      <div className="relative">
                        <Popover
                          open={popoverOpen}
                          onOpenChange={(open) => {
                            setPopoverOpen(open);
                          }}
                        >
                          <PopoverTrigger asChild>
                            <Input
                              type="text"
                              placeholder={t("admin.clubs.players_modal.search.placeholder")}
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="w-full"
                              autoComplete="off"
                            />
                          </PopoverTrigger>
                          {playerSuggestions && playerSuggestions.data && (
                            <PopoverContent
                              className="p-0 w-[300px] max-h-[400px]"
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
                              <div 
                                className="p-1 space-y-1 overflow-y-auto max-h-[400px]"
                                onWheel={(e) => {
                                  e.stopPropagation();
                                }}
                              >
                                {playerSuggestions.data.length > 0 ? (
                                  playerSuggestions.data.map((user, i) => (
                                    <div
                                      key={i}
                                      className={`px-3 py-2 cursor-pointer hover:bg-[#4C97F1]/10 hover:text-[#4C97F1] transition-colors rounded-md ${isAddingPlayer ? 'opacity-50 pointer-events-none' : ''}`}
                                      onClick={() => !isAddingPlayer && handlePlayerSelectClick(user)}
                                    >
                                    <div className="font-medium flex items-center gap-2">
                                      <span>
                                        {capitalizeWords(user.first_name)}{" "}
                                        {capitalizeWords(user.last_name)}
                                      </span>
                                      {isAddingPlayer && (
                                        <div className="w-3 h-3 animate-spin rounded-full border border-[#4C97F1] border-t-transparent" />
                                      )}
                                    </div>
                                    {user.eltl_id && (
                                      <div className="text-xs text-gray-500">ELTL ID: {user.eltl_id}</div>
                                    )}
                                  </div>
                                  ))
                                ) : (
                                  <div className="px-4 py-6 text-sm text-gray-500 text-center">
                                    <UserIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                    {t("admin.clubs.players_modal.search.no_results")}
                                  </div>
                                )}
                              </div>
                            </PopoverContent>
                          )}
                        </Popover>
                      </div>
                      <div className="text-center pt-4">
                        <div className="flex items-center justify-center gap-4">
                          <div className="flex-1 border-t border-gray-200"></div>
                          <span className="text-sm text-gray-500 font-medium">{t("admin.clubs.players_modal.or")}</span>
                          <div className="flex-1 border-t border-gray-200"></div>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => setShowManualEntry(true)}
                          className="mt-4 flex items-center gap-2 bg-white hover:bg-gray-50 border-2 border-[#4C97F1] text-[#4C97F1] hover:text-[#4C97F1] font-semibold"
                        >
                          <UserPlus className="w-4 h-4" />
                          {t("admin.clubs.players_modal.create_new_button")}
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-6 bg-green-600 rounded-full"></div>
                        <h4 className="font-semibold text-gray-900 text-lg">{t("admin.clubs.players_modal.create_new.title")}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowManualEntry(false)}
                          className="hover:bg-blue-50 hover:text-[#4C97F1]"
                        >
                          <ArrowLeft className="w-4 h-4 mr-1" />
                          {t("admin.clubs.players_modal.create_new.back_button")}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={resetForm}
                          className="hover:bg-red-50 hover:text-red-600"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        type="text"
                        placeholder={t("admin.clubs.players_modal.create_new.form.first_name")}
                        value={newPlayer.first_name}
                        onChange={(e) =>
                          setNewPlayer({ ...newPlayer, first_name: e.target.value })
                        }
                      />
                      <Input
                        type="text"
                        placeholder={t("admin.clubs.players_modal.create_new.form.last_name")}
                        value={newPlayer.last_name}
                        onChange={(e) =>
                          setNewPlayer({ ...newPlayer, last_name: e.target.value })
                        }
                      />
                      {noEstonianId && (
                        <Input
                          type="date"
                          placeholder={t("admin.clubs.players_modal.create_new.form.birth_date")}
                          value={newPlayer.birth_date}
                          onChange={(e) => {
                            const newBirthDate = e.target.value;
                            setNewPlayer({ ...newPlayer, birth_date: newBirthDate });
                            validateForm(newPlayer.isikukood, newBirthDate, noEstonianId);
                          }}
                          className={validationErrors.birth_date ? "border-red-300" : ""}
                        />
                      )}
                      {!noEstonianId && newPlayer.birth_date && (
                        <div className="px-3 py-2 border rounded-md bg-gray-50">
                          <div className="text-xs text-gray-600 mb-1">{t("admin.clubs.players_modal.create_new.form.birth_date")}</div>
                          <div className="text-sm font-medium">{newPlayer.birth_date}</div>
                          <div className="text-xs text-gray-500">{t("admin.clubs.players_modal.create_new.form.auto_generated")}</div>
                        </div>
                      )}
                      <Input
                        type="text"
                        placeholder={t("admin.clubs.players_modal.create_new.form.estonian_id")}
                        value={newPlayer.isikukood}
                        onChange={(e) => {
                          const newIsikukood = e.target.value;

                          let updatedPlayer = { ...newPlayer, isikukood: newIsikukood };
                          if (newIsikukood && !noEstonianId) {
                            const extractedDate = extractBirthDateFromIsikukood(newIsikukood);
                            if (extractedDate) {
                              updatedPlayer = { ...updatedPlayer, birth_date: extractedDate.dateString, sex: extractedDate.sex };
                            }
                          }

                          setNewPlayer(updatedPlayer);
                          validateForm(newIsikukood, updatedPlayer.birth_date, noEstonianId);
                        }}
                        disabled={noEstonianId}
                        className={validationErrors.isikukood ? "border-red-300" : ""}
                      />
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="noEstonianIdClub"
                          checked={noEstonianId}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setNoEstonianId(checked);
                            if (checked) {
                              setNewPlayer({ ...newPlayer, isikukood: "", birth_date: "" });
                              setValidationErrors({ isikukood: "", birth_date: "" });
                            } else {
                              setNewPlayer({ ...newPlayer, birth_date: "" });
                            }
                            validateForm("", "", checked);
                          }}
                          className="w-4 h-4"
                        />
                        <label htmlFor="noEstonianIdClub" className="text-sm font-medium">
                          {t("admin.clubs.players_modal.create_new.form.no_estonian_id")}
                        </label>
                      </div>
                      <select
                        value={newPlayer.sex}
                        onChange={(e) =>
                          setNewPlayer({ ...newPlayer, sex: e.target.value })
                        }
                        className="px-3 py-2 border rounded-md"
                      >
                        <option value="">{t("admin.clubs.players_modal.create_new.form.gender.placeholder")}</option>
                        <option value="M">{t("admin.clubs.players_modal.create_new.form.gender.male")}</option>
                        <option value="N">{t("admin.clubs.players_modal.create_new.form.gender.female")}</option>
                      </select>
                    </div>
                    {(validationErrors.isikukood || validationErrors.birth_date) && (
                      <div className="mt-2 p-2 bg-red-50 rounded border border-red-200">
                        <p className="text-sm text-red-700">
                          {validationErrors.isikukood || validationErrors.birth_date}
                        </p>
                      </div>
                    )}
                    <div className="mt-4">
                      <Button
                        onClick={handleAddNewPlayerClick}
                        disabled={isVerifyingId || isAddingPlayer}
                        className="w-full"
                      >
                        {isVerifyingId ? (
                          <>
                            <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            {t("admin.clubs.players_modal.create_new.form.verifying_id")}
                          </>
                        ) : isAddingPlayer ? (
                          <>
                            <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            {t("admin.clubs.players_modal.create_new.form.adding_player")}
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            {t("admin.clubs.players_modal.create_new.form.add_button")}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              {!showAddPlayer && (
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-6 bg-gray-600 rounded-full"></div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{t("admin.clubs.players_modal.list.title")}</h4>
                      <span className="text-sm text-gray-500">
                        {isLoadingPlayers ? t("admin.clubs.players_modal.list.loading") : `${clubPlayers.length} ${clubPlayers.length === 1 ? t("admin.clubs.players_modal.list.count.singular") : t("admin.clubs.players_modal.list.count.plural")}`}
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={() => setShowAddPlayer(true)}
                    size="sm"
                    className="flex items-center gap-2 bg-[#4C97F1] hover:bg-blue-600"
                  >
                    <Plus className="w-4 h-4" />
                    {t("admin.clubs.players_modal.list.add_player_button")}
                  </Button>
                </div>
              )}

              <div className="p-4">
                {isLoadingPlayers ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4C97F1] mx-auto mb-4"></div>
                    <p className="text-gray-500">{t("admin.clubs.players_modal.list.loading")}</p>
                  </div>
                ) : clubPlayers.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="font-semibold text-gray-700">{t("admin.clubs.players_modal.list.table.name")}</TableHead>
                          <TableHead className="font-semibold text-gray-700">{t("admin.clubs.players_modal.list.table.birth_year")}</TableHead>
                          <TableHead className="font-semibold text-gray-700">{t("admin.clubs.players_modal.list.table.gender")}</TableHead>
                          <TableHead className="font-semibold text-gray-700">{t("admin.clubs.players_modal.list.table.eltl_id")}</TableHead>
                          <TableHead className="font-semibold text-gray-700">{t("admin.clubs.players_modal.list.table.rating_points")}</TableHead>
                          <TableHead className="font-semibold text-gray-700">{t("admin.clubs.players_modal.list.table.rating_position")}</TableHead>
                          <TableHead className="font-semibold text-gray-700">{t("admin.clubs.players_modal.list.table.license")}</TableHead>
                          <TableHead className="font-semibold text-gray-700">{t("admin.clubs.players_modal.list.table.actions")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {clubPlayers.map((player, index) => (
                          <TableRow key={player.id || index} className="hover:bg-gray-50 transition-colors">
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-[#4C97F1] rounded-full flex items-center justify-center text-white font-bold text-sm">
                                  {player.first_name.charAt(0)}{player.last_name.charAt(0)}
                                </div>
                                <span>{player.first_name} {player.last_name}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {player.birth_date ? new Date(player.birth_date).getFullYear() : '---'}
                            </TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${player.sex === 'M' ? 'bg-blue-100 text-blue-800' :
                                player.sex === 'N' ? 'bg-pink-100 text-pink-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                {player.sex === 'M' ? t("admin.clubs.players_modal.list.table.gender_male") : player.sex === 'N' ? t("admin.clubs.players_modal.list.table.gender_female") : '---'}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="font-mono text-sm">
                                {player.eltl_id || '---'}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="font-medium">
                                {player.rate_points || '---'}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="font-medium">
                                {player.rate_order || '---'}
                              </span>
                            </TableCell>
                            <TableCell>
                              {(() => {
                                const licenseInfo = getLicenseInfo(player.license, player.expiration_date);
                                return (
                                  <span
                                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${licenseInfo.isActive
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                      }`}
                                  >
                                    {licenseInfo.text}
                                  </span>
                                );
                              })()}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemovePlayerClick(player)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                                title={`Remove ${player.first_name} ${player.last_name} from club`}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="font-medium text-gray-900 mb-2">{t("admin.clubs.players_modal.list.empty_state.title")}</h3>
                    <p className="text-gray-500 mb-4">{t("admin.clubs.players_modal.list.empty_state.description")}</p>
                    <Button
                      onClick={() => setShowAddPlayer(true)}
                      className="flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      {t("admin.clubs.players_modal.list.empty_state.add_first_button")}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              {t("admin.clubs.players_modal.close_button")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isRemovePlayerDialogOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4"
          onClick={(e) => {
            e.stopPropagation();
            // Close on backdrop click
            if (e.target === e.currentTarget) {
              setIsRemovePlayerDialogOpen(false);
              setPlayerToRemove(null);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.stopPropagation();
              setIsRemovePlayerDialogOpen(false);
              setPlayerToRemove(null);
            }
          }}
          tabIndex={-1}
          style={{ pointerEvents: 'auto' }}
        >
          <div
            className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
            style={{ pointerEvents: 'auto' }}
          >
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t("admin.clubs.players_modal.remove_confirmation.title")}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {t("admin.clubs.players_modal.remove_confirmation.description", {
                  playerName: `${playerToRemove?.first_name} ${playerToRemove?.last_name}`,
                  clubName: selectedClub?.name
                })}
              </p>
              <p className="text-sm text-gray-500 mb-6">
                {t("admin.clubs.players_modal.remove_confirmation.note")}
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsRemovePlayerDialogOpen(false);
                    setPlayerToRemove(null);
                  }}
                  style={{ pointerEvents: 'auto' }}
                >
                  {t("admin.clubs.players_modal.remove_confirmation.cancel")}
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    removePlayerFromClub();
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white"
                  style={{ pointerEvents: 'auto' }}
                >
                  {t("admin.clubs.players_modal.remove_confirmation.confirm")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Existing Player Confirmation Dialog */}
      {isAddPlayerDialogOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4"
          onClick={(e) => {
            e.stopPropagation();
            if (e.target === e.currentTarget) {
              setIsAddPlayerDialogOpen(false);
              setPlayerToAdd(null);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.stopPropagation();
              setIsAddPlayerDialogOpen(false);
              setPlayerToAdd(null);
            }
          }}
          tabIndex={-1}
          style={{ pointerEvents: 'auto' }}
        >
          <div
            className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
            style={{ pointerEvents: 'auto' }}
          >
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t("admin.clubs.players_modal.add_confirmation.title")}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {t("admin.clubs.players_modal.add_confirmation.description", {
                  playerName: `${playerToAdd?.first_name} ${playerToAdd?.last_name}`,
                  clubName: selectedClub?.name
                })}
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsAddPlayerDialogOpen(false);
                    setPlayerToAdd(null);
                  }}
                  style={{ pointerEvents: 'auto' }}
                >
                  {t("admin.clubs.players_modal.add_confirmation.cancel")}
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (playerToAdd) {
                      handlePlayerSelect(playerToAdd);
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  style={{ pointerEvents: 'auto' }}
                >
                  {t("admin.clubs.players_modal.add_confirmation.confirm")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add New Player Confirmation Dialog */}
      {isAddNewPlayerDialogOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4"
          onClick={(e) => {
            e.stopPropagation();
            if (e.target === e.currentTarget) {
              setIsAddNewPlayerDialogOpen(false);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.stopPropagation();
              setIsAddNewPlayerDialogOpen(false);
            }
          }}
          tabIndex={-1}
          style={{ pointerEvents: 'auto' }}
        >
          <div
            className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
            style={{ pointerEvents: 'auto' }}
          >
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t("admin.clubs.players_modal.add_new_confirmation.title")}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {t("admin.clubs.players_modal.add_new_confirmation.description", {
                  playerName: `${newPlayer.first_name} ${newPlayer.last_name}`,
                  clubName: selectedClub?.name
                })}
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsAddNewPlayerDialogOpen(false);
                  }}
                  style={{ pointerEvents: 'auto' }}
                >
                  {t("admin.clubs.players_modal.add_new_confirmation.cancel")}
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    addPlayerToClub();
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  style={{ pointerEvents: 'auto' }}
                >
                  {t("admin.clubs.players_modal.add_new_confirmation.confirm")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
