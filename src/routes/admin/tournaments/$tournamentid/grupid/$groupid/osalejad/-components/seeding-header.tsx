import { Button } from "@/components/ui/button";
import { CardHeader } from "@/components/ui/card";
import { MatchesResponse, UseGetMatchesQuery } from "@/queries/match";
import { UsePostOrder, UsePostSeeding, UsePostOrderReset } from "@/queries/participants";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import seeds3 from "@/assets/seeds3.png";
import { TournamentTable } from "@/types/groups";
import { toast } from 'sonner';
import { GroupType } from "@/types/matches";
import { Participant } from "@/types/participants";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface SeedingHeaderProps {
  tournament_id: number;
  table_data: TournamentTable;
  participants: Participant[]
}

const SeedingHeader = ({
  tournament_id,
  table_data,
  participants,
}: SeedingHeaderProps) => {
  const { data: matches_data } = UseGetMatchesQuery(
    tournament_id,
    table_data.id
  );

  const updateSeeding = UsePostSeeding(tournament_id, table_data.id);
  const updateOrder = UsePostOrder(tournament_id, table_data.id);
  const resetSeedingMutation = UsePostOrderReset(tournament_id, table_data.id);

  const [disabled, setDisabled] = useState(false);
  const isDisabled = (data: MatchesResponse | undefined): boolean => {
    if (!data || !data.data) {
      return false;
    }
    const winners = data.data.find((match) => {
      return match.match.winner_id != "";
    });

    if (!winners) {
      return false;
    } else {
      return true;
    }
  };

  useEffect(() => {
    setDisabled(isDisabled(matches_data));
  }, [matches_data]);

  const { t } = useTranslation();

  const handleSeeding = async (order: string | undefined) => {
    if (!order) {
      return;
    }
    try {
      await updateSeeding.mutateAsync({ order });
      toast.message(t('toasts.participants.seeding_success'))
    } catch (error) {
      void error;
      toast.error(t("toasts.participants.seeding_error"))
    }
  };

  const handleOrder = async () => {
    try {
      await updateOrder.mutateAsync();
      toast.message(t('toasts.participants.order_success'))
    } catch (error) {
      void error;
      toast.error(t("toasts.participants.order_error"))
    }
  }

  const handleReset = async () => {
    try {
      await resetSeedingMutation.mutateAsync();
      toast.message(t('toasts.participants.reset_success'))
    } catch (error) {
      void error;
      toast.error(t("toasts.participants.reset_error"))
    }
  };

  return (
    <CardHeader className="flex flex-col items-start gap-4 space-y-0">
      <div className="flex gap-2 items-center">
        <h5 className="font-medium">{(table_data.type == GroupType.ROUND_ROBIN || table_data.type == GroupType.ROUND_ROBIN_FULL_PLACEMENT) ? t("admin.tournaments.groups.participants.subgroups") : t("admin.tournaments.info.participants")}</h5>
        <p className="bg-[#FBFBFB] font-medium px-3 py-1 rounded-full border border-[#EAEAEA] ">
          {((table_data.type == GroupType.ROUND_ROBIN || table_data.type == GroupType.ROUND_ROBIN_FULL_PLACEMENT) && participants.filter((participant) => participant.type === "round_robin").length) || (participants && participants.length)} / {table_data.size}{" "}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 w-full">
        <div className="flex flex-col sm:flex-row gap-2 flex-1">
          <Button
            onClick={handleOrder}
            disabled={disabled}
            variant="outline"
            size="sm"
            className="w-full sm:flex-1 h-9 text-sm font-medium"
          >
            {t("admin.tournaments.groups.order.order_by_rating")}
          </Button>

          <Button
            disabled={disabled}
            onClick={() => handleSeeding("rating")}
            size="sm"
            className="w-full sm:flex-1 h-9 text-sm font-medium flex items-center justify-center gap-1.5 bg-midnightTable hover:bg-midnightTable/90"
          >
            <span>{t("admin.tournaments.groups.order.title")}</span>
            <img src={seeds3} className="h-4 w-4 object-contain" />
          </Button>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-full sm:w-auto h-9 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 hover:border-red-300"
            >
              {t('admin.tournaments.groups.reset_seeding.title')}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {t('admin.tournaments.groups.reset_seeding.title', 'Reset Seeding')}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {t('admin.tournaments.groups.reset_seeding.subtitle', 'Are you sure you want to reset the seeding? This action cannot be undone.')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>
                {t('common.cancel', 'Cancel')}
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleReset}>
                {t('common.confirm', 'Confirm')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </CardHeader>
  );
};

export default SeedingHeader;
