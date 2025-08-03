import { Button } from "@/components/ui/button";
import { CardHeader } from "@/components/ui/card";
import { MatchesResponse, UseGetMatchesQuery } from "@/queries/match";
import { UsePostOrder, UsePostSeeding, UsePostOrderReset, UseImportParticipants, UsePostParticipantJoin } from "@/queries/participants";
import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import seeds3 from "@/assets/seeds3.png";
import { DialogType, TournamentTable } from "@/types/groups";
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
import { Upload, Download, TrendingUp, FileSpreadsheet } from "lucide-react";
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
  const assignPairs = UsePostParticipantJoin(tournament_id, table_data.id, 'doubles')
  const assignRoundRobin = UsePostParticipantJoin(tournament_id, table_data.id, 'dynamic')
  const importMutation = UseImportParticipants(tournament_id, table_data.id)
  const [showWarningModal, setShowWarningModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getClosestPowerOf2 = (num: number): number => {
    if (num <= 8) return 8;
    return Math.pow(2, Math.ceil(Math.log2(num)));
  };

  const checkPowerOf2Warning = (): boolean => {
    let participantCount = participants?.length || 0;
    if (table_data.dialog_type === DialogType.DT_DOUBLES || table_data.dialog_type === DialogType.DT_FIXED_DOUBLES) {
      const pairs = participants?.filter((participant) => participant.extra_data?.is_parent === true) || [];
      participantCount = pairs.length;
    }

    const closestPowerOf2 = getClosestPowerOf2(participantCount);
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
    const showWarning = !(table_data.type == GroupType.ROUND_ROBIN || table_data.type == GroupType.ROUND_ROBIN_FULL_PLACEMENT || table_data.type == GroupType.DYNAMIC) && checkPowerOf2Warning();
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
    let participantCount = participants?.length || 0;
    if (table_data.dialog_type === DialogType.DT_DOUBLES || table_data.dialog_type === DialogType.DT_FIXED_DOUBLES) {
      const pairs = participants?.filter((participant) => participant.extra_data?.is_parent === true) || [];
      participantCount = pairs.length;
    }

    const closestPowerOf2 = getClosestPowerOf2(participantCount);
    return t('admin.tournaments.warnings.bracket_size_mismatch.body', { participants: participantCount, closestPowerOf2, tableSize: table_data.size });
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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error && 'response' in error
        ? (error as { response?: { data: { error: string } } }).response?.data.error
        : 'Import failed';
      toast.error(errorMessage);
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

  const handleRoundRobinPairing = async () => {
    try {
      await assignRoundRobin.mutateAsync()
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
    const hasTeams = !table_data.solo && table_data.dialog_type !== DialogType.DT_DOUBLES && table_data.dialog_type !== DialogType.DT_FIXED_DOUBLES;

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
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 items-start sm:items-center justify-between w-full">
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
          <h5 className="font-medium">
            {table_data.class}
            {" "}
            {(() => {
              if (table_data.dialog_type === DialogType.DT_DOUBLES || table_data.dialog_type === DialogType.DT_FIXED_DOUBLES) {
                return t("admin.tournaments.participants.pairs");
              }
              if (table_data.type == GroupType.ROUND_ROBIN || table_data.type == GroupType.ROUND_ROBIN_FULL_PLACEMENT) {
                return t("admin.tournaments.groups.participants.subgroups");
              }
              return t("admin.tournaments.info.participants");
            })()}
          </h5>
          <div className="flex flex-wrap gap-2 items-center">
            <p className="bg-[#FBFBFB] font-medium px-3 py-1 rounded-full border border-[#EAEAEA] text-sm">
              {(() => {
                if (table_data.dialog_type === DialogType.DT_DOUBLES || table_data.dialog_type === DialogType.DT_FIXED_DOUBLES) {
                  const pairs = participants.filter((participant) => participant.extra_data?.is_parent === true);
                  return pairs.length;
                }
                if (table_data.type == GroupType.ROUND_ROBIN || table_data.type == GroupType.ROUND_ROBIN_FULL_PLACEMENT) {
                  return participants.filter((participant) => participant.type === "round_robin").length;
                }
                return participants.length;
              })()} / {table_data.size}{" "}
            </p>
            {(table_data.dialog_type === DialogType.DT_DOUBLES || table_data.dialog_type === DialogType.DT_FIXED_DOUBLES) && (
              <p className="bg-blue-50 font-medium px-3 py-1 rounded-full border border-blue-200 text-blue-700 text-sm">
                {participants.filter((participant) => participant.extra_data?.is_parent === false).length} {t('admin.tournaments.participants.players')}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 w-full">
        {/* Main Action Row */}
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          {/* Left Column - Tournament Management */}
          <div className="flex flex-col gap-2 flex-1">
            <div className="text-xs font-medium text-gray-600 sm:hidden">Tournament Management</div>
            
            {/* Order by Rating Button */}
            <Button
              onClick={handleOrder}
              disabled={disabled}
              variant="outline"
              size="sm"
              className="w-full h-9 text-sm font-medium flex items-center justify-center gap-1.5"
            >
              <TrendingUp className="h-4 w-4" />
              {t("admin.tournaments.groups.order.order_by_rating")}
            </Button>

            {/* Generate Matches Button - show when games are NOT generated, OR when it's a dynamic tournament */}
            {(!disabled || table_data.type === GroupType.DYNAMIC) && (
              <Button
                onClick={() => handleSeeding("rating")}
                size="sm"
                className="w-full h-9 text-sm font-medium flex items-center justify-center gap-1.5 bg-midnightTable hover:bg-midnightTable/90"
              >
                <span>
                  {disabled && table_data.type === GroupType.DYNAMIC
                    ? t("admin.tournaments.groups.participants.actions.generate_tables")
                    : t("admin.tournaments.groups.order.title")
                  }
                </span>
                <img src={seeds3} className="h-4 w-4 object-contain" />
              </Button>
            )}

            {/* Reset Games Button - only show when games ARE generated */}
            {disabled && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full h-9 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 hover:border-red-300"
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
            )}

            {/* Pairing buttons (conditionally shown) */}
            {table_data.dialog_type === DialogType.DT_FIXED_DOUBLES && (
              <Button
                disabled={disabled}
                onClick={handleDoublePairing}
                size="sm"
                className="w-full h-9 text-sm font-medium flex items-center justify-center gap-1.5 bg-midnightTable hover:bg-midnightTable/90"
              >
                <span>{t("admin.tournaments.groups.participants.actions.generate_pairs")}</span>
              </Button>
            )}
            {table_data.type === GroupType.DYNAMIC && (
              <Button
                disabled={disabled}
                onClick={handleRoundRobinPairing}
                size="sm"
                className="w-full h-9 text-sm font-medium flex items-center justify-center gap-1.5 bg-midnightTable hover:bg-midnightTable/90"
              >
                <span>{t("admin.tournaments.groups.participants.actions.generate_subgroups")}</span>
              </Button>
            )}

          </div>

          <div className="flex flex-col gap-2 flex-1">
            <div className="text-xs font-medium text-gray-600 sm:hidden">Excel Actions</div>
            
            <Button
              onClick={handleDownloadTemplate}
              variant="outline"
              size="sm"
              className="bg-green-50 w-full h-9 text-sm font-medium flex items-center justify-center gap-1.5"
            >
              <Download className="h-4 w-4" />
              {t('admin.tournaments.groups.import.download_template', 'Download Template')}
              <FileSpreadsheet className="h-3 w-3 text-green-600" />
            </Button>
            
            {/* Import Excel Button */}
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
              className="bg-green-50 w-full h-9 text-sm font-medium flex items-center justify-center gap-1.5"
            >
              <Upload className="h-4 w-4" />
              <span>{t("admin.tournaments.groups.import.title", "Import Excel")}</span>
              <FileSpreadsheet className="h-3 w-3 text-green-600" />
            </Button>
          </div>
        </div>
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
    </CardHeader>
  );
};

export default SeedingHeader;
