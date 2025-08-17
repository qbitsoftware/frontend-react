import { createFileRoute } from "@tanstack/react-router";
import { ClubTable } from "./-components/club-table";
import { ClubFormDialog } from "./-components/club-form-dialog";
import { PlayersManagementDialog } from "./-components/players-management-dialog";
import { DeleteConfirmationDialog } from "./-components/delete-confirmation-dialog";
import { useMyClubs } from "./-hooks/use-my-clubs";
import {
  UseGetClubsQuery,
  useCreateClub,
  useUpdateClub,
  useDeleteClub,
  CreateClubInput,
} from "@/queries/clubs";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Club } from "@/types/clubs";
import { useTranslation } from "react-i18next";
import { toast } from 'sonner'
import AdminHeader from "../-components/admin-header";

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
  const { myClubs, fetchMyClubs, isLoadingMyClubs } = useMyClubs();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);

  // Club players state
  const [isPlayersDialogOpen, setIsPlayersDialogOpen] = useState(false);
  const [selectedClubForPlayers, setSelectedClubForPlayers] = useState<Club | null>(null);
  const [newClub, setNewClub] = useState<CreateClubInput>({
    name: "",
    contact_person: "",
    email: "",
    phone: "",
    address: "",
    website: "",
    image_url: "",
  });

  useEffect(() => {
    fetchMyClubs();
  }, [fetchMyClubs]);



  const handleManagePlayers = (club: Club) => {
    setSelectedClubForPlayers(club);
    setIsPlayersDialogOpen(true);
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
          toast.message(t("admin.clubs.toast.club_created"));
        },
      });
    } catch (error) {
      void error;
      toast.error(t("admin.clubs.toast.error"));
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
          toast.message(t("admin.clubs.toast.club_updated"));
        },
      });
    } catch (error) {
      void error;
      toast.error(t("admin.clubs.toast.error"));
    }
  };

  const handleDeleteClub = async () => {
    if (!selectedClub) return;

    try {
      await deleteClubMutation.mutateAsync(selectedClub.name, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["clubs_query"] });
          setIsDeleteDialogOpen(false);
          setSelectedClub(null);
          toast.message(t("admin.clubs.toast.club_deleted"));
        },
      });
    } catch (error) {
      void error;
      toast.error(t("admin.clubs.toast.error"));
    }
  };

  if (!clubsData || !clubsData.data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
        <div className="px-2 py-8 md:p-8 overflow-hidden">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{t("admin.clubs.error")}</h3>
          <p className="text-gray-500">Unable to load clubs data</p>
        </div>
        </div>
      </div>
    );
  }

  const clubs = clubsData.data;
  const openCreateDialog = () => {
    setIsCreateDialogOpen(true);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      <div className="px-2 py-8 md:p-8 overflow-hidden">
      <div className="mb-12">
        <AdminHeader
          title={t("admin.clubs.my_clubs.title")}
          description={t("admin.clubs.my_clubs.subtitle")}
          add_new={t("admin.clubs.add_new")}
          href={openCreateDialog}
          club={true}
        />

        {isLoadingMyClubs ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500 mr-3" />
            <span className="text-gray-600">{t("admin.clubs.my_clubs.loading")}</span>
          </div>
        ) : myClubs.length > 0 ? (
          <>
            <span className="font-medium text-sm px-1 mb-4 block">
              {myClubs.length} {myClubs.length === 1 ? t("admin.clubs.my_clubs.count.singular") : t("admin.clubs.my_clubs.count.plural")}
            </span>

            <ClubTable
              clubs={myClubs}
              variant="my-clubs"
              onEditClub={(club) => {
                setSelectedClub(club);
                setIsEditDialogOpen(true);
              }}
              onManagePlayers={handleManagePlayers}
            />
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            {t("admin.clubs.my_clubs.empty_state")}
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div className="text-center md:text-left mb-4 md:mb-0">
          <h3 className="font-bold">{t("admin.clubs.title")}</h3>
          <p className="text-gray-600 mt-1">{t("admin.clubs.subtitle")}</p>
        </div>
      </div>

      <span className="font-medium text-sm px-1">
        {clubs.length} {t("admin.clubs.clubs")}
      </span>

      <ClubTable
        clubs={clubs}
        variant="all-clubs"
        isLoading={isLoading}
      />

      <ClubFormDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        mode="create"
        formData={newClub}
        onFormChange={handleNewClubChange}
        onSubmit={handleCreateClub}
        isLoading={createClubMutation.isPending}
      />

      {selectedClub && (
        <ClubFormDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          mode="edit"
          club={selectedClub}
          formData={selectedClub}
          onFormChange={handleEditClubChange}
          onSubmit={handleUpdateClub}
          isLoading={updateClubMutation.isPending}
        />
      )}

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        selectedClub={selectedClub}
        onConfirm={handleDeleteClub}
        isLoading={deleteClubMutation.isPending}
      />

      <PlayersManagementDialog
        isOpen={isPlayersDialogOpen}
        onClose={() => setIsPlayersDialogOpen(false)}
        selectedClub={selectedClubForPlayers}
        onPlayersUpdate={() => fetchMyClubs()}
      />
      </div>
    </div>
  );
}

