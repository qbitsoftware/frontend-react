import { Button } from "@/components/ui/button";
import { CardHeader } from "@/components/ui/card";
import { MatchesResponse, UseGetMatchesQuery } from "@/queries/match";
import { UsePostOrder, UsePostSeeding, UsePostOrderReset, UseImportParticipants, UsePostParticipantJoin, UsePostParticipantMove } from "@/queries/participants";
import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import seeds3 from "@/assets/seeds3.png";
import { DialogType, TournamentTable } from "@/types/groups";
import { toast } from 'sonner';
import { GroupType, TTState } from "@/types/matches";
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
import { Upload, Download, TrendingUp, CheckCircle, Users, Settings, Play } from "lucide-react";
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
  const moveParticipant = UsePostParticipantMove(tournament_id, table_data.id);
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
      const pairs = participants?.filter((participant) => participant.players.length == 2) || [];
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
      const pairs = participants?.filter((participant) => participant.players.length == 2) || [];
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

  const handleParticipantMoving = async () => {
    try {
      await moveParticipant.mutateAsync()
      toast.message("Siia tuleb toast, aga success")
    } catch (error) {
      void error
      toast.error("siia tuleb toast, aga mingi kala on kuskil")
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

  const getSteps = () => {
    const hasParticipants = participants.length > 0;
    const isDoubles = table_data.dialog_type === DialogType.DT_DOUBLES || table_data.dialog_type === DialogType.DT_FIXED_DOUBLES;
    // const isRoundRobin = table_data.type === GroupType.ROUND_ROBIN || table_data.type === GroupType.ROUND_ROBIN_FULL_PLACEMENT;
    const isDynamic = table_data.type === GroupType.DYNAMIC;
    const isFinished = table_data.state === TTState.TT_STATE_FINISHED;

    return [
      {
        id: 1,
        title: t('admin.tournaments.setup.step1.title', 'Import Participants'),
        description: t('admin.tournaments.setup.step1.description', 'Download template and import participants'),
        completed: hasParticipants,
        icon: Users,
        actions: 'import'
      },
      {
        id: 2,
        title: isDoubles ? t('admin.tournaments.setup.step2.pairs', 'Generate Pairs') :
          isDynamic ? t('admin.tournaments.setup.step2.subgroups', 'Generate Subgroups') :
            t('admin.tournaments.setup.step2.seeding', 'Set Order & Seeding'),
        description: isDoubles ? t('admin.tournaments.setup.step2.pairs_desc', 'Create doubles pairs automatically') :
          isDynamic ? t('admin.tournaments.setup.step2.subgroups_desc', 'Organize into round robin groups') :
            t('admin.tournaments.setup.step2.seeding_desc', 'Order by rating and generate bracket'),
        completed: disabled,
        icon: Settings,
        actions: 'seeding'
      },
      ...(isDynamic && isFinished ? [{
        id: 3,
        title: t('admin.tournaments.setup.step3.advance', 'Advance Players'),
        description: t('admin.tournaments.setup.step3.advance_desc', 'Move qualified players to next round'),
        completed: false,
        icon: Play,
        actions: 'advance'
      }] : [])
    ];
  };

  const steps = getSteps();

  return (
    <CardHeader className="flex flex-col items-start gap-4 space-y-0">
      {/* Header with counts */}
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
                  const pairs = participants.filter((participant) => participant.players.length > 1);
                  return pairs.length;
                }
                if (table_data.type == GroupType.ROUND_ROBIN || table_data.type == GroupType.ROUND_ROBIN_FULL_PLACEMENT) {
                  return participants.filter((participant) => participant.type === "round_robin").length;
                }
                if (table_data.type == GroupType.DYNAMIC) {
                  return participants.filter((participant) => participant.type !== "round_robin").length;
                }
                return participants.length;
              })()} / {table_data.size}{" "}
            </p>
            {(table_data.dialog_type === DialogType.DT_DOUBLES || table_data.dialog_type === DialogType.DT_FIXED_DOUBLES) && (
              <p className="bg-blue-50 font-medium px-3 py-1 rounded-full border border-blue-200 text-blue-700 text-sm">
                {participants.filter((participant) => participant.players.length == 1).length} {t('admin.tournaments.participants.players')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Step-by-step workflow */}
      <div className="w-full space-y-3">
        {steps.map((step, index) => {
          const StepIcon = step.icon;
          const isCurrentStep = !step.completed && (index === 0 || steps[index - 1]?.completed);

          return (
            <div key={step.id} className={`border rounded-lg p-3 transition-all ${step.completed ? 'bg-green-50 border-green-200' :
              isCurrentStep ? 'bg-blue-50 border-blue-200' :
                'bg-gray-50 border-gray-200'
              }`}>
              <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 mt-0.5 ${step.completed ? 'text-green-600' :
                  isCurrentStep ? 'text-blue-600' :
                    'text-gray-400'
                  }`}>
                  {step.completed ? <CheckCircle className="h-5 w-5" /> : <StepIcon className="h-5 w-5" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h6 className={`font-medium text-sm ${step.completed ? 'text-green-800' :
                      isCurrentStep ? 'text-blue-800' :
                        'text-gray-600'
                      }`}>
                      {step.title}
                    </h6>
                    {step.completed && (
                      <span className="text-xs text-green-600 font-medium">{t('common.completed', 'Completed')}</span>
                    )}
                  </div>

                  <p className="text-xs text-gray-600 mb-2">{step.description}</p>

                  {/* Action buttons for current/available steps */}
                  {(isCurrentStep || (step.actions === 'advance' && step.id === 3)) && (
                    <div className="flex flex-wrap gap-2">
                      {step.actions === 'import' && (
                        <>
                          <Button
                            onClick={handleDownloadTemplate}
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs flex items-center gap-1.5"
                          >
                            <Download className="h-3 w-3" />
                            {t('admin.tournaments.setup.download_template', 'Download Template')}
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
                            size="sm"
                            className="h-8 text-xs flex items-center gap-1.5"
                          >
                            <Upload className="h-3 w-3" />
                            {t('admin.tournaments.setup.import_excel', 'Import Excel')}
                          </Button>
                        </>
                      )}

                      {step.actions === 'seeding' && (
                        <>
                          <Button
                            onClick={handleOrder}
                            disabled={disabled}
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs flex items-center gap-1.5"
                          >
                            <TrendingUp className="h-3 w-3" />
                            {t('admin.tournaments.setup.order_rating', 'Order by Rating')}
                          </Button>

                          {table_data.dialog_type === DialogType.DT_FIXED_DOUBLES && (
                            <Button
                              disabled={disabled}
                              onClick={handleDoublePairing}
                              size="sm"
                              className="h-8 text-xs flex items-center gap-1.5"
                            >
                              {t('admin.tournaments.setup.generate_pairs', 'Generate Pairs')}
                            </Button>
                          )}

                          {table_data.type === GroupType.DYNAMIC && (
                            <Button
                              disabled={disabled}
                              onClick={handleRoundRobinPairing}
                              size="sm"
                              className="h-8 text-xs flex items-center gap-1.5"
                            >
                              {t('admin.tournaments.setup.generate_subgroups', 'Generate Subgroups')}
                            </Button>
                          )}

                          {(!disabled || table_data.type === GroupType.DYNAMIC) && (
                            <Button
                              onClick={() => handleSeeding("rating")}
                              size="sm"
                              className="h-8 text-xs flex items-center gap-1.5"
                            >
                              <img src={seeds3} className="h-3 w-3 object-contain" />
                              {disabled && table_data.type === GroupType.DYNAMIC
                                ? t('admin.tournaments.setup.generate_tables', 'Generate Tables')
                                : t('admin.tournaments.setup.generate_seeding', 'Generate Seeding')
                              }
                            </Button>
                          )}
                        </>
                      )}

                      {step.actions === 'advance' && (
                        <Button
                          onClick={handleParticipantMoving}
                          size="sm"
                          className="h-8 text-xs flex items-center gap-1.5"
                        >
                          <Play className="h-3 w-3" />
                          {t('admin.tournaments.setup.advance_players', 'Advance Players')}
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Reset option for completed tournaments */}
                  {disabled && step.actions === 'seeding' && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            {t('admin.tournaments.setup.reset_seeding', 'Reset Seeding')}
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
                  )}
                </div>
              </div>
            </div>
          );
        })}
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
