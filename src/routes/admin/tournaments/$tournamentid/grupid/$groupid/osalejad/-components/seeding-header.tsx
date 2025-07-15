import { Button } from "@/components/ui/button";
import { CardHeader } from "@/components/ui/card";
import { MatchesResponse, UseGetMatchesQuery } from "@/queries/match";
import { UsePostOrder, UsePostSeeding, UsePostOrderReset, UseImportParticipants, UsePostParticipantDoublePairs } from "@/queries/participants";
import { useEffect, useState, useRef } from "react";
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Upload, Download } from "lucide-react";
import * as XLSX from 'xlsx';

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
  const assignPairs = UsePostParticipantDoublePairs(tournament_id, table_data.id)
  const importMutation = UseImportParticipants(tournament_id, table_data.id)
  const [showWarningModal, setShowWarningModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getClosestPowerOf2 = (num: number): number => {
    if (num <= 8) return 8;
    return Math.pow(2, Math.ceil(Math.log2(num)));
  };

  const checkPowerOf2Warning = (): boolean => {
    const closestPowerOf2 = getClosestPowerOf2(participants?.length);
    return closestPowerOf2 !== table_data.size;
  };


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

  const executeSeeding = async (order: string) => {
    try {
      await updateSeeding.mutateAsync({ order });
      toast.message(t('toasts.participants.seeding_success'));
    } catch (error) {
      void error;
      toast.error(t('toasts.participants.seeding_error'));
    }
  };


  const handleSeeding = async (order: string | undefined) => {
    if (!order) {
      return;
    }
    const showWarning = !(table_data.type == GroupType.ROUND_ROBIN || table_data.type == GroupType.ROUND_ROBIN_FULL_PLACEMENT) && checkPowerOf2Warning();
    if (showWarning) {
      setShowWarningModal(true);
    } else {
      await executeSeeding(order);
    }

  };

  const handleWarningConfirm = async () => {
    setShowWarningModal(false);
    await executeSeeding("rating");
  };

  const handleWarningCancel = () => {
    setShowWarningModal(false);
  };

  const getWarningMessage = () => {
    const closestPowerOf2 = getClosestPowerOf2(participants?.length || 0);
    return t('admin.tournaments.warnings.bracket_size_mismatch.body', { participants: participants?.length, closestPowerOf2, tableSize: table_data.size });
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

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error(t('toasts.participants.invalid_file_format', 'Please select an Excel file (.xlsx or .xls)'));
      return;
    }

    try {
      await importMutation.mutateAsync(file)

      toast.message(t('toasts.participants.import_success', 'Participants imported successfully'));
    } catch (error: any) {
      toast.error(error.response?.data.error);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDoublePairing = async () => {
    try {
      await assignPairs.mutateAsync()
      toast.message(t('toasts.participants.double_pairing_success', 'Double pairs assigned successfully'));
    } catch (error) {
      void error
      toast.error(t('toasts.participants.double_pairing_error', 'Error assigning double pairs'));
    }
  }

  const handleDownloadTemplate = () => {
    let headers: string[];
    let filename: string;

    const isRoundRobin = table_data.type === GroupType.ROUND_ROBIN || table_data.type === GroupType.ROUND_ROBIN_FULL_PLACEMENT;
    const hasTeams = !table_data.solo;

    if (isRoundRobin && hasTeams) {
      headers = ['id', 'name', 'team', 'group'];
      filename = 'participants_roundrobin_teams_template.xlsx';
    } else if (isRoundRobin && !hasTeams) {
      headers = ['id', 'name', 'group'];
      filename = 'participants_roundrobin_solo_template.xlsx';
    } else if (!isRoundRobin && hasTeams) {
      headers = ['id', 'name', 'team'];
      filename = 'participants_teams_template.xlsx';
    } else {
      headers = ['id', 'name'];
      filename = 'participants_solo_template.xlsx';
    }

    const wsData = [headers];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    XLSX.utils.book_append_sheet(wb, ws, 'Participants');

    XLSX.writeFile(wb, filename);
  };

  return (
    <CardHeader className="flex flex-col items-start gap-4 space-y-0">
      <div className="flex gap-2 items-center justify-between w-full">
        <div className="flex gap-2 items-center">
          <h5 className="font-medium">{(table_data.type == GroupType.ROUND_ROBIN || table_data.type == GroupType.ROUND_ROBIN_FULL_PLACEMENT) ? t("admin.tournaments.groups.participants.subgroups") : t("admin.tournaments.info.participants")}</h5>
          <p className="bg-[#FBFBFB] font-medium px-3 py-1 rounded-full border border-[#EAEAEA] ">
            {((table_data.type == GroupType.ROUND_ROBIN || table_data.type == GroupType.ROUND_ROBIN_FULL_PLACEMENT) && participants.filter((participant) => participant.type === "round_robin").length) || (participants && participants.length)} / {table_data.size}{" "}
          </p>
        </div>
        <Button
          onClick={handleDownloadTemplate}
          variant="outline"
          size="sm"
          className="flex items-center gap-1.5"
        >
          <Download className="h-4 w-4" />
          {t('admin.tournaments.groups.import.download_template', 'Download Template')}
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-2 w-full">
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

          <Button
            disabled={disabled}
            onClick={handleDoublePairing}
            size="sm"
            className="w-full sm:flex-1 h-9 text-sm font-medium flex items-center justify-center gap-1.5 bg-midnightTable hover:bg-midnightTable/90"
          >
            <span>{t("admin.tournaments.groups.participants.actions.generate_pairs")}</span>
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
          />

          <Button
            onClick={handleImportClick}
            disabled={disabled}
            variant="outline"
            size="sm"
            className="w-full sm:flex-1 h-9 text-sm font-medium flex items-center justify-center gap-1.5"
          >
            <Upload className="h-4 w-4" />
            <span>{t("admin.tournaments.groups.import.title", "Import Excel")}</span>
          </Button>
        </div>

        <Dialog open={showWarningModal} onOpenChange={setShowWarningModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("admin.tournaments.groups.order.title")}</DialogTitle>
              <DialogDescription>
                {getWarningMessage()}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={handleWarningCancel}>
                {t("admin.tournaments.groups.participants.actions.cancel")}
              </Button>
              <Button onClick={handleWarningConfirm}>
                {t("admin.tournaments.groups.participants.actions.continue_anyway")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
