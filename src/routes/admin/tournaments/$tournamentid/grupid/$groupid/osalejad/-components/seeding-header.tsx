import { Button } from "@/components/ui/button";
import { CardHeader } from "@/components/ui/card";
import { UsePostOrder, UsePostSeeding, UsePostOrderReset, UseImportParticipants, UsePostParticipantJoin, UsePostParticipantMove } from "@/queries/participants";
import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "@tanstack/react-router";
import { DialogType } from "@/types/groups";
import { toast } from 'sonner';
import { GroupType, TTState } from "@/types/matches";
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
import { Upload, Download, TrendingUp, CheckCircle, Users, Settings, Play, ChevronRight, Grid2x2, Zap, UserPlus } from "lucide-react";
import * as XLSX from 'xlsx';
import { TournamentTableWithStages } from "@/queries/tables";
import { axiosInstance } from '@/queries/axiosconf';

interface SeedingHeaderProps {
  tournament_id: number;
  data: TournamentTableWithStages;
  onHighlightInput?: () => void;
  onGlowBracketTabs?: () => void;
}

const SeedingHeader = ({
  tournament_id,
  data,
  onHighlightInput,
  onGlowBracketTabs,
}: SeedingHeaderProps) => {
  const table_data = data.group
  const updateSeeding = UsePostSeeding(tournament_id, table_data.id);
  const updateOrder = UsePostOrder(tournament_id, table_data.id);
  const resetSeedingMutation = UsePostOrderReset(tournament_id, table_data.id);
  const assignPairs = UsePostParticipantJoin(tournament_id, table_data.id, 'doubles')
  const assignRoundRobin = UsePostParticipantJoin(tournament_id, table_data.id, 'dynamic')
  const moveParticipant = UsePostParticipantMove(tournament_id, table_data.id);
  const importMutation = UseImportParticipants(tournament_id, table_data.id)

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [disabled, setDisabled] = useState(table_data.state > TTState.TT_STATE_MATCHES_CREATED);
  const [canMove, setCanMove] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setDisabled(table_data.state > TTState.TT_STATE_MATCHES_CREATED);
    if (table_data.state >= TTState.TT_STATE_FINISHED) {
      setCanMove(false);
    }
    if (data.stages && data.stages.length > 1) {
      if (data.stages[1].state >= TTState.TT_STATE_MATCHES_ASSIGNED) {
        setCanMove(true);
      }
    }
  }, [table_data.state])

  const { t } = useTranslation();
  const navigate = useNavigate();

  const executeSeeding = async (order: string) => {
    setIsLoading(true);
    try {
      await updateSeeding.mutateAsync({ order });
      toast.message(t('toasts.participants.seeding_success'));
      navigate({
        to: "/admin/tournaments/$tournamentid/grupid/$groupid/mangud",
        params: {
          tournamentid: tournament_id.toString(),
          groupid: table_data.id.toString()
        },
        search: {
          filter: undefined,
          openMatch: undefined
        }
      });
    } catch (error) {
      void error;
      toast.error(t('toasts.participants.seeding_error'));
    }
    setIsLoading(false);
  };

  const handleSeeding = async (order: string | undefined) => {
    setIsLoading(true);
    if (!order) {
      return;
    }
    await executeSeeding(order);
    setIsLoading(false)
  };

  const handleOrder = async () => {
    setIsLoading(true)
    try {
      await updateOrder.mutateAsync();
      toast.message(t('toasts.participants.order_success'))
    } catch (error) {
      void error;
      toast.error(t("toasts.participants.order_error"))
    }
    setIsLoading(false)
  }

  const handleReset = async () => {
    setIsLoading(true)
    try {
      await resetSeedingMutation.mutateAsync();
      toast.message(t('toasts.participants.reset_success'))
    } catch (error) {
      void error;
      toast.error(t("toasts.participants.reset_error"))
    }
    setIsLoading(false)
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error(t('toasts.participants.invalid_file_format'));
      return;
    }

    try {
      await importMutation.mutateAsync(file)
      toast.message(t('toasts.participants.import_success'));
    } catch (error: unknown) {
      const errorMessage = (error as any)?.response?.data?.error?.message ?? 'Import failed';
      toast.error(errorMessage);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDoublePairing = async () => {
    setIsLoading(true)
    try {
      await assignPairs.mutateAsync()
      toast.message(t('toasts.participants.double_pairing_success'));
    } catch (error) {
      void error
      toast.error(t('toasts.participants.double_pairing_error'));
    }
    setIsLoading(false)
  }

  const handleRoundRobinPairing = async () => {
    setIsLoading(true)
    try {
      await assignRoundRobin.mutateAsync()
      toast.message(t('toasts.participants.double_pairing_success'));
    } catch (error) {
      void error
      toast.error(t('toasts.participants.double_pairing_error'));
    }
    setIsLoading(false)
  }

  const handleParticipantMoving = async () => {
    setIsLoading(true)
    try {
      await moveParticipant.mutateAsync()
      toast.message(t('toasts.participants.advance_success'))
      // Trigger glow effect on bracket tabs after successful advancement
      onGlowBracketTabs?.()
    } catch (error) {
      void error
      toast.error(t('toasts.participants.advance_error'))
    }
    setIsLoading(false)
  }

  const downloadRatingsXML = async () => {

    try {
      const response = await axiosInstance.get(`/api/v1/tournaments/${tournament_id}/tables/${table_data.id}/participants/export`, {
        responseType: "blob",
        withCredentials: true,
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "ratings.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed", error);
      toast.error(t('toasts.export.error'));
    }
  };

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
    const hasParticipants = data.participants ? data.participants.length > 0 : false;
    const isDoubles = table_data.dialog_type === DialogType.DT_DOUBLES || table_data.dialog_type === DialogType.DT_FIXED_DOUBLES;
    const isDynamic = table_data.type === GroupType.DYNAMIC;
    const isFinished = table_data.state === TTState.TT_STATE_FINISHED;

    return [
      {
        id: 1,
        title: t('admin.tournaments.setup.step1.title'),
        description: t('admin.tournaments.setup.step1.description'),
        completed: hasParticipants,
        icon: Users,
        actions: 'import'
      },
      {
        id: 2,
        title: isDoubles ? t('admin.tournaments.setup.step2.pairs') :
          isDynamic ? t('admin.tournaments.setup.step2.subgroups') :
            t('admin.tournaments.setup.step2.seeding'),
        description: isDoubles ? t('admin.tournaments.setup.step2.pairs_desc') :
          isDynamic ? t('admin.tournaments.setup.step2.subgroups_desc') :
            t('admin.tournaments.setup.step2.seeding_desc'),
        completed: disabled,
        icon: Settings,
        actions: 'seeding'
      },
      ...(isDynamic && isFinished ? [{
        id: 3,
        title: t('admin.tournaments.setup.step3.advance'),
        description: t('admin.tournaments.setup.step3.advance_desc'),
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
                  const pairs = data.participants.filter((participant) => participant.players.length > 1);
                  return pairs.length;
                }
                if (table_data.type == GroupType.ROUND_ROBIN || table_data.type == GroupType.ROUND_ROBIN_FULL_PLACEMENT) {
                  return data.participants.filter((participant) => participant.type === "round_robin").length;
                }
                if (table_data.type == GroupType.DYNAMIC) {
                  return data.participants.filter((participant) => participant.type !== "round_robin").length;
                }
                return data.participants.length;
              })()} / {table_data.size}{" "}
            </p>
            {(table_data.dialog_type === DialogType.DT_DOUBLES || table_data.dialog_type === DialogType.DT_FIXED_DOUBLES) && (
              <p className="bg-blue-50 font-medium px-3 py-1 rounded-full border border-blue-200 text-blue-700 text-sm">
                {data.participants.filter((participant) => participant.players.length == 1).length} {t('admin.tournaments.participants.players')}
                {t('admin.tournaments.participants.players')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Step-by-step workflow */}
      <div className="w-full space-y-2">
        {steps.map((step, index) => {
          const StepIcon = step.icon;
          const isCurrentStep = !step.completed && (index === 0 || steps[index - 1]?.completed);

          return (
            <div key={step.id} className={`border rounded-md p-2.5 transition-all ${step.completed ? 'bg-green-50 border-green-200' :
              isCurrentStep ? 'bg-blue-50 border-blue-200' :
                'bg-gray-50 border-gray-200'
              }`}>
              <div className="flex items-start gap-2.5">
                <div className={`flex-shrink-0 mt-0.5 ${step.completed ? 'text-green-600' :
                  isCurrentStep ? 'text-blue-600' :
                    'text-gray-400'
                  }`}>
                  {step.completed ? <CheckCircle className="h-4 w-4" /> : <StepIcon className="h-4 w-4" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h6 className={`font-medium text-xs ${step.completed ? 'text-green-800' :
                      isCurrentStep ? 'text-blue-800' :
                        'text-gray-600'
                      }`}>
                      {step.title}
                    </h6>
                    {step.completed && (
                      <span className="text-xs text-green-600 font-medium">{t('common.completed')}</span>
                    )}
                  </div>

                  <p className="text-xs text-gray-600 mb-1.5">{step.description}</p>

                  {/* Action buttons for current/available steps */}
                  {(step.actions === 'import' || isCurrentStep || (step.actions === 'advance' && step.id === 3)) && (
                    <div className="flex flex-wrap gap-2">
                      {step.actions === 'import' && (
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Manual addition option */}
                          <Button
                            onClick={() => onHighlightInput?.()}
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs flex items-center gap-1.5"
                          >
                            <UserPlus className="h-3 w-3" />
                            {t('admin.tournaments.setup.add_manually')}
                          </Button>

                          {/* Divider */}
                          <span className="text-xs text-gray-400 font-medium">{t('common.or')}</span>

                          {/* Excel import option */}
                          <Button
                            onClick={handleDownloadTemplate}
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs flex items-center gap-1.5"
                          >
                            <Download className="h-3 w-3" />
                            {t('admin.tournaments.setup.download_template')}
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
                            {t('admin.tournaments.setup.import_excel')}
                          </Button>

                          {table_data.solo && (
                            <Button
                              onClick={downloadRatingsXML}
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs flex items-center gap-1.5"
                            >
                              <Download className="h-3 w-3" />
                              {t('admin.tournaments.setup.export_participants')}
                            </Button>
                          )}
                        </div>
                      )}

                      {step.actions === 'seeding' && (
                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            onClick={handleOrder}
                            disabled={isLoading || disabled}
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs flex items-center gap-1.5"
                          >
                            <TrendingUp className="h-3 w-3" />
                            {t('admin.tournaments.setup.order_rating')}
                          </Button>

                          {table_data.dialog_type === DialogType.DT_FIXED_DOUBLES && (
                            <>
                              <ChevronRight className="hidden md:block h-4 w-4 text-gray-400 flex-shrink-0" />
                              <Button
                                disabled={isLoading || disabled}
                                onClick={handleDoublePairing}
                                size="sm"
                                className="h-7 text-xs flex items-center gap-1.5"
                              >
                                {t('admin.tournaments.setup.generate_pairs')}
                              </Button>
                            </>
                          )}

                          {table_data.type === GroupType.DYNAMIC && (
                            <>
                              <ChevronRight className="hidden md:block h-4 w-4 text-gray-400 flex-shrink-0" />
                              <Button
                                disabled={isLoading || disabled}
                                onClick={handleRoundRobinPairing}
                                size="sm"
                                className="h-7 text-xs flex items-center gap-1.5"
                              >
                                <Grid2x2 className="h-3 w-3" />
                                {t('admin.tournaments.setup.generate_subgroups')}
                              </Button>
                            </>
                          )}

                          {(!disabled || table_data.type === GroupType.DYNAMIC) && (
                            <>
                              <ChevronRight className="hidden md:block h-4 w-4 text-gray-400 flex-shrink-0" />
                              <Button
                                onClick={() => handleSeeding("rating")}
                                disabled={isLoading}
                                size="sm"
                                className="h-7 text-xs flex items-center gap-1.5"
                              >
                                <Zap className="h-3 w-3" />
                                {disabled && table_data.type === GroupType.DYNAMIC
                                  ? t('admin.tournaments.setup.generate_tables')
                                  : t('admin.tournaments.setup.generate_seeding')
                                }
                              </Button>
                            </>
                          )}
                        </div>
                      )}

                      {step.actions === 'advance' && (
                        <Button
                          onClick={handleParticipantMoving}
                          size="sm"
                          disabled={isLoading || canMove}
                          className="h-7 text-xs flex items-center gap-1.5"
                        >
                          <Zap className="h-3 w-3" />
                          {t('admin.tournaments.setup.advance_players')}
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Reset option for completed tournaments */}
                  {disabled && step.actions === 'seeding' && (
                    <div className="mt-1.5 pt-1.5 border-t border-gray-200">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            {t('admin.tournaments.setup.reset_seeding')}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {t('admin.tournaments.groups.reset_seeding.title')}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {t('admin.tournaments.groups.reset_seeding.subtitle')}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>
                              {t('common.cancel')}
                            </AlertDialogCancel>
                            <AlertDialogAction onClick={handleReset}>
                              {t('common.confirm')}
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
    </CardHeader>
  );
};

export default SeedingHeader;
