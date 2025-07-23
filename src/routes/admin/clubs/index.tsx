import { createFileRoute } from "@tanstack/react-router";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@/components/ui/table";
import {
  UseGetClubsQuery,
  useCreateClub,
  useUpdateClub,
  useDeleteClub,
  CreateClubInput,
} from "@/queries/clubs";
import { Button } from "@/components/ui/button";
import { PlusCircle, MoreHorizontal, Users, Settings, Plus, X, UserIcon, ArrowLeft, UserPlus } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { axiosInstance } from "@/queries/axiosconf";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQueryClient } from "@tanstack/react-query";
import { Club } from "@/types/clubs";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { UseGetUsersDebounce } from "@/queries/users";
import { capitalizeWords, useDebounce } from "@/lib/utils";
import { User } from "@/types/users";

export const Route = createFileRoute("/admin/clubs/")({
  component: RouteComponent,
});

function RouteComponent() {
  const queryClient = useQueryClient();
  const { data: clubsData, isLoading } = UseGetClubsQuery();
  const createClubMutation = useCreateClub();
  const updateClubMutation = useUpdateClub();
  const deleteClubMutation = useDeleteClub();
  const { t } = useTranslation();

  const { toast } = useToast();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  
  // My clubs state
  const [myClubs, setMyClubs] = useState<Club[]>([]);
  const [isLoadingMyClubs, setIsLoadingMyClubs] = useState(false);
  
  // Club players state
  const [isPlayersDialogOpen, setIsPlayersDialogOpen] = useState(false);
  const [selectedClubForPlayers, setSelectedClubForPlayers] = useState<Club | null>(null);
  const [clubPlayers, setClubPlayers] = useState<User[]>([]);
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(false);
  
  // Player management state
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
  
  // Player removal confirmation state
  const [isRemovePlayerDialogOpen, setIsRemovePlayerDialogOpen] = useState(false);
  const [playerToRemove, setPlayerToRemove] = useState<User | null>(null);
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const { data: playerSuggestions } = UseGetUsersDebounce(debouncedSearchTerm);
  const [newClub, setNewClub] = useState<CreateClubInput>({
    name: "",
    contact_person: "",
    email: "",
    phone: "",
    address: "",
    website: "",
    image_url: "",
  });

  // Fetch admin clubs
  const fetchMyClubs = useCallback(async () => {
    setIsLoadingMyClubs(true);
    try {
      const { data } = await axiosInstance.get('/api/v1/me/admin-clubs', {
        withCredentials: true
      });
      // API response structure: { data: { clubs: [...], club_count: number, ... } }
      setMyClubs(data.data?.clubs || []);
    } catch (error) {
      console.error('Failed to fetch admin clubs:', error);
      toast({
        title: t("admin.clubs.toast.error"),
        description: t("admin.clubs.toast.failed_to_load_my_clubs"),
        variant: "destructive",
      });
      setMyClubs([]);
    } finally {
      setIsLoadingMyClubs(false);
    }
  }, [toast, t]);

  useEffect(() => {
    fetchMyClubs();
  }, [fetchMyClubs]);

  // Handle player search popover
  useEffect(() => {
    if (debouncedSearchTerm) {
      const timeout = setTimeout(() => setPopoverOpen(true), 50);
      return () => clearTimeout(timeout);
    } else {
      setPopoverOpen(false);
    }
  }, [debouncedSearchTerm]);

  // Reset player form when dialog closes
  useEffect(() => {
    if (!isPlayersDialogOpen) {
      setShowAddPlayer(false);
      setShowManualEntry(false);
      setSearchTerm("");
      setPopoverOpen(false);
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
      
      // Ensure focus is properly restored after modal closes
      setTimeout(() => {
        document.body.style.pointerEvents = '';
        const focusableElement = document.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])') as HTMLElement;
        if (focusableElement) {
          focusableElement.focus();
        }
      }, 50);
    }
  }, [isPlayersDialogOpen]);

  // Fetch club players
  const fetchClubPlayers = async (clubName: string) => {
    setIsLoadingPlayers(true);
    try {
      const { data } = await axiosInstance.get(`/api/v1/clubs/${clubName}/players`, {
        withCredentials: true
      });
      setClubPlayers(data.data || []);
    } catch (error) {
      console.error('Failed to fetch club players:', error);
      toast({
        title: t("admin.clubs.toast.error"),
        description: t("admin.clubs.toast.failed_to_load_players"),
        variant: "destructive",
      });
      setClubPlayers([]);
    } finally {
      setIsLoadingPlayers(false);
    }
  };

  const handleManagePlayers = (club: Club) => {
    setSelectedClubForPlayers(club);
    setIsPlayersDialogOpen(true);
    fetchClubPlayers(club.name);
  };

  const handleNewClubChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewClub((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditClubChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (selectedClub) {
      setSelectedClub({ ...selectedClub, [name]: value });
    }
  };

  const handleCreateClub = async () => {
    try {
      await createClubMutation.mutateAsync(newClub, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["clubs_query"] });
          setIsCreateDialogOpen(false);
          setNewClub({
            name: "",
            contact_person: "",
            email: "",
            phone: "",
            address: "",
            website: "",
            image_url: "",
          });
          toast({
            title: t("admin.clubs.toast.club_created"),
          });
        },
      });
    } catch (error) {
      void error;
      toast({
        title: t("admin.clubs.toast.error"),
        description: t("admin.clubs.toast.club_created_error"),
        variant: "destructive",
      });
    }
  };

  const handleUpdateClub = async () => {
    if (!selectedClub) return;

    try {
      await updateClubMutation.mutateAsync(selectedClub, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["clubs_query"] });
          setIsEditDialogOpen(false);
          setSelectedClub(null);
          toast({
            title: t("admin.clubs.toast.club_updated"),
          });
        },
      });
    } catch (error) {
      void error;
      toast({
        title: t("admin.clubs.toast.error"),
        description: t("admin.clubs.toast.club_updated_error"),
        variant: "destructive",
      });
    }
  };

  // Handle delete club submission
  const handleDeleteClub = async () => {
    if (!selectedClub) return;

    try {
      await deleteClubMutation.mutateAsync(selectedClub.name, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["clubs_query"] });
          setIsDeleteDialogOpen(false);
          setSelectedClub(null);
          toast({
            title: t("admin.clubs.toast.club_deleted"),
          });
        },
      });
    } catch (error) {
      void error;
      toast({
        title: t("admin.clubs.toast.error"),
        description: t("admin.clubs.toast.club_deleted_error"),
        variant: "destructive",
      });
    }
  };

  // License info function (same as in reiting.tsx)
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

  // Player management functions
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

  const verifyEstonianId = async (isikukood: string, firstName: string, lastName: string) => {
    if (!isikukood || !firstName || !lastName || noEstonianId) {
      return { isValid: true, message: "" };
    }

    try {
      setIsVerifyingId(true);
      const response = await axiosInstance.post('/api/v1/verify-estonian-id', {
        isikukood: isikukood,
        first_name: firstName.toUpperCase(),
        last_name: lastName.toUpperCase(),
      }, {
        withCredentials: true
      });

      const result = response.data;
      
      return {
        isValid: result.isValid,
        message: result.isValid ? "" : t("admin.clubs.validation.name_id_mismatch")
      };
    } catch (error) {
      console.error('ID verification error:', error);
      return {
        isValid: true,
        message: t("admin.clubs.validation.verification_unavailable")
      };
    } finally {
      setIsVerifyingId(false);
    }
  };

  const addPlayerToClub = async () => {
    const requiredFieldsPresent = newPlayer.first_name && newPlayer.last_name && 
        newPlayer.birth_date && newPlayer.sex && (noEstonianId || newPlayer.isikukood);
    
    if (requiredFieldsPresent) {
      setIsAddingPlayer(true);
      if (!noEstonianId && newPlayer.isikukood) {
        const validation = validateIsikukoodWithBirthDate(newPlayer.isikukood, newPlayer.birth_date);
        if (!validation.isValid) {
          validateForm(newPlayer.isikukood, newPlayer.birth_date);
          toast({
            title: t("admin.clubs.toast.error"),
            description: validation.message,
            variant: "destructive",
          });
          setIsAddingPlayer(false);
          return;
        }

        const verificationResult = await verifyEstonianId(
          newPlayer.isikukood, 
          newPlayer.first_name, 
          newPlayer.last_name
        );
        
        if (!verificationResult.isValid && verificationResult.message) {
          toast({
            title: t("admin.clubs.toast.error"), 
            description: verificationResult.message,
            variant: "destructive",
          });
          setIsAddingPlayer(false);
          return;
        }

        if (verificationResult.isValid && verificationResult.message === "") {
          toast({
            title: t("admin.clubs.toast.success"),
            description: t("admin.clubs.toast.id_verification_success"),
          });
        }
      }

      try {
        // Create new player in database
        await axiosInstance.post('/api/v1/clubs/players', {
          player_id: null, // Will be created
          club_id: selectedClubForPlayers?.id,
          first_name: newPlayer.first_name,
          last_name: newPlayer.last_name,
          birth_date: newPlayer.birth_date,
          sex: newPlayer.sex,
          isikukood: noEstonianId ? undefined : newPlayer.isikukood,
          foreigner: noEstonianId ? 1 : 0,
        }, {
          withCredentials: true
        });

        toast({
          title: t("admin.clubs.toast.success"),
          description: t("admin.clubs.toast.player_added"),
        });

        // Reset form and refresh players list
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
        
        // Small delay to allow proper modal cleanup before refetching
        setTimeout(() => {
          if (selectedClubForPlayers) {
            fetchClubPlayers(selectedClubForPlayers.name);
          }
        }, 100);
      } catch (error) {
        console.error('Failed to add player to club:', error);
        const errorMessage = error instanceof Error && 'response' in error && 
          error.response && typeof error.response === 'object' && 
          'data' in error.response && error.response.data &&
          typeof error.response.data === 'object' && 'message' in error.response.data 
          ? String(error.response.data.message) : t("admin.clubs.toast.failed_to_add_player");
        toast({
          title: t("admin.clubs.toast.error"),
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsAddingPlayer(false);
      }
    } else {
      const missingFields = [];
      if (!newPlayer.first_name) missingFields.push(t("admin.clubs.players_modal.create_new.form.first_name"));
      if (!newPlayer.last_name) missingFields.push(t("admin.clubs.players_modal.create_new.form.last_name"));
      if (!newPlayer.birth_date) missingFields.push(t("admin.clubs.players_modal.create_new.form.birth_date"));
      if (!newPlayer.sex) missingFields.push(t("admin.clubs.players_modal.create_new.form.gender.placeholder"));
      if (!noEstonianId && !newPlayer.isikukood) missingFields.push(t("admin.clubs.players_modal.create_new.form.estonian_id"));
      
      toast({
        title: t("admin.clubs.toast.error"),
        description: t("admin.clubs.toast.missing_required_fields", { fields: missingFields.join(", ") }),
        variant: "destructive",
      });
    }
  };

  const handlePlayerSelect = async (user: User) => {
    setIsAddingPlayer(true);
    try {
      await axiosInstance.post('/api/v1/clubs/players', {
        player_id: user.id,
        club_id: selectedClubForPlayers?.id,
      }, {
        withCredentials: true
      });

      toast({
        title: t("admin.clubs.toast.success"),
        description: t("admin.clubs.toast.player_added_to_club", { playerName: `${user.first_name} ${user.last_name}` }),
      });

      setSearchTerm("");
      setPopoverOpen(false);
      
      // Small delay to allow proper modal cleanup before refetching
      setTimeout(() => {
        if (selectedClubForPlayers) {
          fetchClubPlayers(selectedClubForPlayers.name);
        }
      }, 100);
    } catch (error) {
      console.error('Failed to add player to club:', error);
      const errorMessage = error instanceof Error && 'response' in error && 
        error.response && typeof error.response === 'object' && 
        'data' in error.response && error.response.data &&
        typeof error.response.data === 'object' && 'message' in error.response.data 
        ? String(error.response.data.message) : t("admin.clubs.toast.failed_to_add_player");
      toast({
        title: t("admin.clubs.toast.error"),
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsAddingPlayer(false);
    }
  };

  const handleRemovePlayerClick = (player: User) => {
    setPlayerToRemove(player);
    setIsRemovePlayerDialogOpen(true);
  };

  const removePlayerFromClub = async () => {
    if (!playerToRemove) return;

    try {
      await axiosInstance.delete('/api/v1/clubs/players', {
        data: {
          player_id: playerToRemove.id,
          club_id: selectedClubForPlayers?.id,
        },
        withCredentials: true
      });

      toast({
        title: t("admin.clubs.toast.success"),
        description: t("admin.clubs.toast.player_removed_from_club", { playerName: `${playerToRemove.first_name} ${playerToRemove.last_name}` }),
      });
      
      setIsRemovePlayerDialogOpen(false);
      setPlayerToRemove(null);
      
      // Simple cleanup since we no longer have nested modals
      if (selectedClubForPlayers) {
        fetchClubPlayers(selectedClubForPlayers.name);
      }
    } catch (error) {
      console.error('Failed to remove player from club:', error);
      const errorMessage = error instanceof Error && 'response' in error && 
        error.response && typeof error.response === 'object' && 
        'data' in error.response && error.response.data &&
        typeof error.response.data === 'object' && 'message' in error.response.data 
        ? String(error.response.data.message) : t("admin.clubs.toast.failed_to_remove_player");
      toast({
        title: t("admin.clubs.toast.error"),
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  if (isLoading) return <div>{t("admin.clubs.loading")}</div>;
  if (!clubsData || !clubsData.data) return <div>{t("admin.clubs.error")}</div>;

  const clubs = clubsData.data;

  return (
    <div className="px-2 py-8 md:p-8 overflow-hidden">
      {/* My Clubs Section */}
      <div className="mb-12">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <h3 className="font-bold">{t("admin.clubs.my_clubs.title")}</h3>
            <p className="text-gray-600 mt-1">{t("admin.clubs.my_clubs.subtitle")}</p>
          </div>
        </div>

        {isLoadingMyClubs ? (
          <div className="text-center py-8">{t("admin.clubs.my_clubs.loading")}</div>
        ) : myClubs.length > 0 ? (
          <>
            <span className="font-medium text-sm px-1 mb-4 block">
              {myClubs.length} {myClubs.length === 1 ? t("admin.clubs.my_clubs.count.singular") : t("admin.clubs.my_clubs.count.plural")}
            </span>
            
            <Table className="mb-8">
              <TableHeader>
                <TableRow>
                  <TableHead>{t("admin.clubs.table.actions")}</TableHead>
                  <TableHead>{t("admin.clubs.table.image")}</TableHead>
                  <TableHead>{t("admin.clubs.table.name")}</TableHead>
                  <TableHead>{t("admin.clubs.table.contact_person")}</TableHead>
                  <TableHead>{t("admin.clubs.table.email")}</TableHead>
                  <TableHead>{t("admin.clubs.table.phone")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myClubs.map((club) => (
                  <TableRow key={club.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedClub(club);
                            setIsEditDialogOpen(true);
                          }}
                          className="flex items-center gap-1"
                        >
                          <Settings className="h-3 w-3" />
                        {t("admin.clubs.buttons.manage_info")}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleManagePlayers(club)}
                          className="flex items-center gap-1"
                        >
                          <Users className="h-3 w-3" />
                          {t("admin.clubs.buttons.manage_players")}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={club.image_url} alt={club.name} />
                        <AvatarFallback>
                          {club.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">{club.name}</TableCell>
                    <TableCell className="truncate">{club.contact_person}</TableCell>
                    <TableCell className="truncate">{club.email}</TableCell>
                    <TableCell className="truncate">{club.phone}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            {t("admin.clubs.my_clubs.empty_state")}
          </div>
        )}
      </div>

      {/* All Clubs Section */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div className="text-center md:text-left mb-4 md:mb-0">
          <h3 className="font-bold">{t("admin.clubs.title")}</h3>
          <p className="text-gray-600 mt-1">{t("admin.clubs.subtitle")}</p>
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          {t("admin.clubs.add_new")}
        </Button>
      </div>
      <span className="font-medium text-sm px-1">
        {clubs.length} {t("admin.clubs.clubs")}
      </span>

      <Table className="">
        <TableHeader>
          <TableRow>
            <TableHead className="">{t("admin.clubs.table.actions")}</TableHead>
            <TableHead>{t("admin.clubs.table.image")}</TableHead>
            <TableHead>{t("admin.clubs.table.name")}</TableHead>
            <TableHead>{t("admin.clubs.table.contact_person")}</TableHead>
            <TableHead>{t("admin.clubs.table.email")}</TableHead>
            <TableHead>{t("admin.clubs.table.phone")}</TableHead>
            <TableHead>{t("admin.clubs.table.address")}</TableHead>
            <TableHead>{t("admin.clubs.table.website")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clubs
            .slice()
            .reverse()
            .map((club) => (
              <TableRow key={club.id}>
                <TableCell className="">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className=" px-2 py-1">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedClub(club);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        {t("admin.clubs.dropdown.edit")}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => {
                          setSelectedClub(club);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        {t("admin.clubs.dropdown.delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
                <TableCell>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={club.image_url} alt={club.name} />
                    <AvatarFallback>
                      {club.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="font-medium">{club.name}</TableCell>
                <TableCell className="truncate">
                  {club.contact_person}
                </TableCell>
                <TableCell className="truncate">{club.email}</TableCell>
                <TableCell className="truncate">{club.phone}</TableCell>
                <TableCell className="truncate">{club.address}</TableCell>
                <TableCell>
                  <a
                    href={club.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    {club.website.replace(/^https?:\/\//, "")}
                  </a>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>

      {/* Create Club Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("admin.clubs.add_new")}</DialogTitle>
            <DialogDescription>
              {t("admin.clubs.add_new_details")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                {t("admin.clubs.table.name")}
              </Label>
              <Input
                id="name"
                name="name"
                value={newClub.name}
                onChange={handleNewClubChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="contact_person" className="text-right">
                {t("admin.clubs.table.contact_person")}
              </Label>
              <Input
                id="contact_person"
                name="contact_person"
                value={newClub.contact_person}
                onChange={handleNewClubChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                {t("admin.clubs.table.email")}
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={newClub.email}
                onChange={handleNewClubChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                {t("admin.clubs.table.phone")}
              </Label>
              <Input
                id="phone"
                name="phone"
                value={newClub.phone}
                onChange={handleNewClubChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">
                {t("admin.clubs.table.address")}
              </Label>
              <Input
                id="address"
                name="address"
                value={newClub.address}
                onChange={handleNewClubChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="website" className="text-right">
                {t("admin.clubs.table.website")}
              </Label>
              <Input
                id="website"
                name="website"
                value={newClub.website}
                onChange={handleNewClubChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="image_url" className="text-right">
                {t("admin.clubs.table.image")}
              </Label>
              <Input
                id="image_url"
                name="image_url"
                value={newClub.image_url}
                onChange={handleNewClubChange}
                className="col-span-3"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t("admin.clubs.cancel")}</Button>
            </DialogClose>
            <Button
              onClick={handleCreateClub}
              disabled={createClubMutation.isPending}
            >
              {createClubMutation.isPending
                ? t("admin.clubs.creating")
                : t("admin.clubs.create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Club Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("admin.clubs.edit")}</DialogTitle>
            <DialogDescription>
              {t("admin.clubs.edit_details")}
            </DialogDescription>
          </DialogHeader>
          {selectedClub && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  {t("admin.clubs.table.name")}
                </Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={selectedClub.name}
                  onChange={handleEditClubChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-contact_person" className="text-right">
                  {t("admin.clubs.table.contact_person")}
                </Label>
                <Input
                  id="edit-contact_person"
                  name="contact_person"
                  value={selectedClub.contact_person}
                  onChange={handleEditClubChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-email" className="text-right">
                  {t("admin.clubs.table.email")}
                </Label>
                <Input
                  id="edit-email"
                  name="email"
                  type="email"
                  value={selectedClub.email}
                  onChange={handleEditClubChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-phone" className="text-right">
                  {t("admin.clubs.table.phone")}
                </Label>
                <Input
                  id="edit-phone"
                  name="phone"
                  value={selectedClub.phone}
                  onChange={handleEditClubChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-address" className="text-right">
                  {t("admin.clubs.table.address")}
                </Label>
                <Input
                  id="edit-address"
                  name="address"
                  value={selectedClub.address}
                  onChange={handleEditClubChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-website" className="text-right">
                  {t("admin.clubs.table.website")}
                </Label>
                <Input
                  id="edit-website"
                  name="website"
                  value={selectedClub.website}
                  onChange={handleEditClubChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-image_url" className="text-right">
                  {t("admin.clubs.table.image")}
                </Label>
                <Input
                  id="edit-image_url"
                  name="image_url"
                  value={selectedClub.image_url}
                  onChange={handleEditClubChange}
                  className="col-span-3"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t("admin.clubs.cancel")}</Button>
            </DialogClose>
            <Button
              onClick={handleUpdateClub}
              disabled={updateClubMutation.isPending}
            >
              {updateClubMutation.isPending
                ? t("admin.clubs.updating")
                : t("admin.clubs.update")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("admin.clubs.alert_dialog.confirmation")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("admin.clubs.alert_dialog.description")}{" "}
              <span className="font-semibold">{selectedClub?.name}</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("admin.clubs.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteClub}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteClubMutation.isPending}
            >
              {deleteClubMutation.isPending
                ? t("admin.clubs.deleting")
                : t("admin.clubs.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Club Players Dialog */}
      <Dialog open={isPlayersDialogOpen} onOpenChange={setIsPlayersDialogOpen}>
        <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="pb-4 border-b">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Users className="w-5 h-5" />
              {t("admin.clubs.players_modal.title", { clubName: selectedClubForPlayers?.name })}
            </DialogTitle>
            <DialogDescription className="text-base">
              {t("admin.clubs.players_modal.description")}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-auto space-y-4">
            {/* Add Player Section */}
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
                                    className={`px-4 py-3 cursor-pointer hover:bg-[#4C97F1]/10 hover:text-[#4C97F1] transition-colors rounded-lg mx-1 my-1 ${
                                      isAddingPlayer ? 'opacity-50 pointer-events-none' : ''
                                    }`}
                                    onClick={() => !isAddingPlayer && handlePlayerSelect(user)}
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
                          onClick={() => {
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
                          }}
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
                              updatedPlayer = { ...updatedPlayer, birth_date: extractedDate.dateString };
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
                        onClick={addPlayerToClub}
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

            {/* Players List */}
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
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                player.sex === 'M' ? 'bg-blue-100 text-blue-800' :
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
                                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                      licenseInfo.isActive
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
            <Button variant="outline" onClick={() => setIsPlayersDialogOpen(false)}>
              {t("admin.clubs.players_modal.close_button")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Player Confirmation Dialog - Custom modal to avoid nesting issues */}
      {isRemovePlayerDialogOpen && (
        <div 
          className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4"
          onClick={(e) => {
            // Close on backdrop click
            if (e.target === e.currentTarget) {
              setIsRemovePlayerDialogOpen(false);
              setPlayerToRemove(null);
            }
          }}
          onKeyDown={(e) => {
            // Close on Escape key
            if (e.key === 'Escape') {
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
                  clubName: selectedClubForPlayers?.name
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
    </div>
  );
}

