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
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Club } from "@/types/clubs";
import { useTranslation } from "react-i18next";
import { toast } from 'sonner'

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
  const { myClubs, isLoadingMyClubs, fetchMyClubs } = useMyClubs();

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

  if (isLoading) return <div>{t("admin.clubs.loading")}</div>;
  if (!clubsData || !clubsData.data) return <div>{t("admin.clubs.error")}</div>;

  const clubs = clubsData.data;

  return (
    <div className="px-2 py-8 md:p-8 overflow-hidden">
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

      <ClubTable
        clubs={clubs}
        variant="all-clubs"
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
  );
}

