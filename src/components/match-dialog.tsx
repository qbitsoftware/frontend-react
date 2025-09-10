import React, { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { Plus, Minus, HelpCircle } from "lucide-react";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogFooter } from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";
import { Button } from "./ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { UsePatchMatch, UsePatchMatchReset } from "@/queries/match";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Match, MatchWrapper, Score } from "@/types/matches";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Switch } from "./ui/switch";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { extractSetsFromPoints } from "./utils/utils";
import { ProtocolDownloadButton } from "@/routes/admin/tournaments/$tournamentid/-components/download-protocol";

interface MatchDialogProps {
  open: boolean;
  onClose: (open: boolean) => void;
  match: MatchWrapper;
  tournamentId: number;
}

const scoreSchema = z.object({
  player1: z.number().min(0).max(99),
  player2: z.number().min(0).max(99),
});

const matchFormSchema = z.object({
  tableReferee: z.string().optional(),
  mainReferee: z.string().optional(),
  scores: z
    .array(scoreSchema)
    .max(7, "A maximum of 7 scores are allowed for best of 7!"),
});

type MatchFormValues = z.infer<typeof matchFormSchema>;

export type ForFeitType = "" | "DSQ" | "RET" | "WO";

const MatchDialog: React.FC<MatchDialogProps> = ({
  open,
  onClose,
  match,
  tournamentId,
}) => {
  const form = useForm<MatchFormValues>({
    resolver: zodResolver(matchFormSchema),
    defaultValues: {
      tableReferee: "",
      mainReferee: "",
      scores: [{ player1: 0, player2: 0 }],
    },
  });

  const { t } = useTranslation();
  const { reset } = form;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usePoints, setUsePoints] = useState(false);
  const [matchOutcome, setMatchOutcome] = useState<ForFeitType>("");
  const [outcomeWinner, setOutcomeWinner] = useState<string>("");
  const [setsError, setSetsError] = useState<string>("");
  const [hoveredOutcome, setHoveredOutcome] = useState<ForFeitType | null>(null);

  useEffect(() => {
    if (match && open) {
      // Determine match outcome from existing match data
      if (match.match.forfeit) {
        switch (match.match.forfeit_type) {
          case "WO":
            setMatchOutcome("WO");
            setOutcomeWinner(match.match.winner_id);
            break;
          case "RET":
            setMatchOutcome("RET");
            setOutcomeWinner(match.match.winner_id);
            break;
          case "DSQ":
            setMatchOutcome("DSQ");
            setOutcomeWinner(match.match.winner_id);
            break;
          default:
            setMatchOutcome("");
        }
      } else {
        setMatchOutcome("");
        setOutcomeWinner("");
      }

      if (match.match.extra_data.score && Array.isArray(match.match.extra_data.score) && match.match.extra_data.score.length > 0) {
        setUsePoints(!match.match.use_sets || false);
      } else {
        setUsePoints(false)
      }

      reset({
        tableReferee: match.match.extra_data?.table_referee || "",
        mainReferee: match.match.extra_data?.head_referee || "",
        scores:
          Array.isArray(match.match.extra_data?.score) &&
            match.match.extra_data.score.length > 0
            ? match.match.extra_data.score.map((s: Score) => ({
              player1: typeof s.p1_score === "number" ? s.p1_score : 0,
              player2: typeof s.p2_score === "number" ? s.p2_score : 0,
            }))
            : [{ player1: 0, player2: 0 }],
      });
    }
  }, [match, reset, open]);

  const handleClose = () => {
    form.reset({ scores: [] });
    setSetsError("")
    setMatchOutcome("");
    setOutcomeWinner("");
    onClose(false);
  };

  const usePatchMatch = UsePatchMatch(
    tournamentId,
    match.match.tournament_table_id,
    match.match.id,
  );

  const useResetMatch = UsePatchMatchReset(
    tournamentId,
    match.match.tournament_table_id,
    match.match.id,
  );

  const resetMatch = async () => {
    setIsSubmitting(true);
    try {
      await useResetMatch.mutateAsync();
      toast.success(t("toasts.protocol_modals.match_reset_success"));
    } catch (error) {
      void error;
      toast.error(t("toasts.protocol_modals.match_reset_error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const { append, remove } = useFieldArray({
    name: "scores",
    control: form.control,
  });

  const handleSubmit = async (data: MatchFormValues) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    let sendMatch: Match

    if (matchOutcome !== "") {
      sendMatch = match.match
      sendMatch.winner_id = outcomeWinner
      sendMatch.forfeit = true;
      sendMatch.forfeit_type = matchOutcome
      sendMatch.extra_data = {
        ...sendMatch.extra_data,
        head_referee: data.mainReferee,
        table_referee: data.tableReferee,
      };
      if (matchOutcome === "RET" || matchOutcome === "DSQ") {
        const scores: Score[] = data.scores.map((score, index) => ({
          number: index,
          p1_score: score.player1,
          p2_score: score.player2,
        }));
        sendMatch.extra_data.score = scores;
      }
    } else {
      const scores: Score[] = data.scores.map((score, index) => ({
        number: index,
        p1_score: score.player1,
        p2_score: score.player2,
      }));

      sendMatch = {
        id: match.match.id,
        tournament_table_id: match.match.tournament_table_id,
        type: match.match.type,
        round: match.match.round,
        p1_id: match.match.p1_id,
        p2_id: match.match.p2_id,
        winner_id: match.match.winner_id,
        order: match.match.order,
        sport_type: match.match.sport_type,
        location: match.match.location,
        start_date: match.match.start_date,
        bracket: match.match.bracket,
        finish_date: match.match.finish_date,
        version: match.match.version,
        forfeit: false,
        forfeit_type: "",
        state: match.match.state,
        use_sets: !usePoints,
        extra_data: {
          head_referee: data.mainReferee,
          table_referee: data.tableReferee,
          score: scores,
          table: match.match.extra_data.table,
          parent_match_id: "",
        },
        readable_id: match.match.readable_id,
        topCoord: 0,
        table_type: match.match.table_type,
        previous_match_readable_id_1: 0,
        previous_match_readable_id_2: 0,
      };
    }

    try {
      await usePatchMatch.mutateAsync(sendMatch);
      toast.message(t("toasts.protocol_modals.updated_match_score"));
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      void error;
      toast.error(t("toasts.protocol_modals.updated_match_score_error"));
    } finally {
      setIsSubmitting(false);
    }
    handleClose();
  };

  const handleSetChange = (playerIndex: 1 | 2, value: string) => {
    if (!/^\d*$/.test(value)) {
      return;
    }

    const cleanedValue = value.replace(/^0+(\d)/, "$1");
    const newSetValue = cleanedValue === "" ? 0 : Number.parseInt(cleanedValue);

    const currentSets = extractSetsFromPoints(form.watch("scores"));

    const p1Sets = playerIndex === 1 ? newSetValue : currentSets.p1_sets;
    const p2Sets = playerIndex === 2 ? newSetValue : currentSets.p2_sets;

    const totalSets = p1Sets + p2Sets;

    // Validate total sets
    if (totalSets > 7) {
      setSetsError(t("admin.tournaments.errors.general.max_sets", "Maximum of 7 sets allowed for best of 7"));
      return;
    } else {
      setSetsError("");
    }

    const newScores = [];

    for (let i = 0; i < totalSets; i++) {
      if (i < p1Sets) {
        newScores.push({ player1: 11, player2: 0 });
      } else {
        newScores.push({ player1: 0, player2: 11 });
      }
    }

    form.setValue("scores", newScores);
  };

  const getOutcomeDescription = (outcome: ForFeitType | null) => {
    switch (outcome) {
      case "WO":
        return t("protocol.match_outcome.walkover_tooltip");
      case "RET":
        return t("protocol.match_outcome.retirement_tooltip");
      case "DSQ":
        return t("protocol.match_outcome.disqualification_tooltip");
      default:
        return "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl p-0 overflow-y-scroll bg-white dark:bg-gray-800 rounded-lg shadow-lg border-none">
        <DialogHeader className="py-10 pb-2 rounded-t-lg text-2xl font-bold text-center mx-auto flex">
          <DialogTitle>
            {t("protocol.title")}
          </DialogTitle>
          <ProtocolDownloadButton
            tournamentId={tournamentId}
            groupId={match.match.tournament_table_id}
            matchId={match.match.id}
          />

        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <ScrollArea className="h-[60vh]">
              <div className="p-6 space-y-6">
                <div className="flex justify-center items-center gap-4">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t("protocol.round")}:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {match.match.round + 1}
                  </span>
                </div>
                <div className="grid grid-cols-3 items-center py-4">
                  <div className="text-right pr-4">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {match.p1.name}
                    </span>
                  </div>
                  <div className="text-center font-bold text-lg">VS</div>
                  <div className="text-left pl-4">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {match.p2.name}
                    </span>
                  </div>
                </div>

                {/* Match Outcome Section */}
                <Card className="bg-white dark:bg-gray-800 shadow-sm rounded-lg">
                  <CardHeader className="bg-gray-50 dark:bg-gray-900 rounded-t-lg">
                    <CardTitle className="text-lg text-gray-900 dark:text-white">
                      {t("protocol.match_outcome.title", "Match Outcome")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4">
                    <RadioGroup
                      value={matchOutcome}
                      onValueChange={(value: ForFeitType) => {
                        setMatchOutcome(value);
                        if (value === "") {
                          setOutcomeWinner("");
                        }
                      }}
                      className="grid grid-cols-2 sm:grid-cols-4 gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="" id="normal" />
                        <label htmlFor="normal" className="text-sm font-medium">
                          {t("protocol.match_outcome.normal", "Normal")}
                        </label>
                      </div>
                      <div className="flex items-center space-x-2 relative">
                        <RadioGroupItem value="WO" id="walkover" />
                        <label htmlFor="walkover" className="text-sm font-medium">
                          {t("protocol.match_outcome.walkover", "WO")}
                        </label>
                        <div
                          className="relative"
                          onMouseEnter={() => setHoveredOutcome("WO")}
                          onMouseLeave={() => setHoveredOutcome(null)}
                        >
                          <HelpCircle className="h-4 w-4 text-gray-400 dark:text-gray-500 cursor-help" />
                          {hoveredOutcome === "WO" && (
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 w-48 bg-gray-900 text-white text-xs rounded py-1 px-2 z-50">
                              {getOutcomeDescription("WO")}
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-2 border-transparent border-t-gray-900"></div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 relative">
                        <RadioGroupItem value="RET" id="retirement" />
                        <label htmlFor="retirement" className="text-sm font-medium">
                          {t("protocol.match_outcome.retirement", "RET")}
                        </label>
                        <div
                          className="relative"
                          onMouseEnter={() => setHoveredOutcome("RET")}
                          onMouseLeave={() => setHoveredOutcome(null)}
                        >
                          <HelpCircle className="h-4 w-4 text-gray-400 dark:text-gray-500 cursor-help" />
                          {hoveredOutcome === "RET" && (
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 w-48 bg-gray-900 text-white text-xs rounded py-1 px-2 z-50">
                              {getOutcomeDescription("RET")}
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-2 border-transparent border-t-gray-900"></div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 relative">
                        <RadioGroupItem value="DSQ" id="disqualification" />
                        <label htmlFor="disqualification" className="text-sm font-medium">
                          {t("protocol.match_outcome.disqualification", "DSQ")}
                        </label>
                        <div
                          className="relative"
                          onMouseEnter={() => setHoveredOutcome("DSQ")}
                          onMouseLeave={() => setHoveredOutcome(null)}
                        >
                          <HelpCircle className="h-4 w-4 text-gray-400 dark:text-gray-500 cursor-help" />
                          {hoveredOutcome === "DSQ" && (
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 w-48 bg-gray-900 text-white text-xs rounded py-1 px-2 z-50">
                              {getOutcomeDescription("DSQ")}
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-2 border-transparent border-t-gray-900"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    </RadioGroup>

                    {(matchOutcome === "WO" || matchOutcome === "DSQ") && (
                      <div className="mt-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {matchOutcome === "WO" && t("protocol.match_outcome.walkover_description", "Select winner by walkover")}
                          {matchOutcome === "DSQ" && t("protocol.match_outcome.disqualification_description", "Select winner by disqualification")}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <Button
                            type="button"
                            variant={outcomeWinner === match.p1.id ? "default" : "outline"}
                            onClick={() => setOutcomeWinner(match.p1.id)}
                            className={`py-2 ${outcomeWinner === match.p1.id
                              ? "bg-blue-600 text-white hover:bg-blue-700"
                              : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                              }`}
                          >
                            {match.p1.name}
                          </Button>
                          <Button
                            type="button"
                            variant={outcomeWinner === match.p2.id ? "default" : "outline"}
                            onClick={() => setOutcomeWinner(match.p2.id)}
                            className={`py-2 ${outcomeWinner === match.p2.id
                              ? "bg-blue-600 text-white hover:bg-blue-700"
                              : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                              }`}
                          >
                            {match.p2.name}
                          </Button>
                        </div>
                      </div>
                    )}

                    {matchOutcome === "RET" && (
                      <div className="mt-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {t("protocol.match_outcome.retirement_description", "Select winner and optionally enter scores before retirement")}
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <Button
                            type="button"
                            variant={outcomeWinner === match.p1.id ? "default" : "outline"}
                            onClick={() => setOutcomeWinner(match.p1.id)}
                            className={`py-2 ${outcomeWinner === match.p1.id
                              ? "bg-blue-600 text-white hover:bg-blue-700"
                              : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                              }`}
                          >
                            {match.p1.name}
                          </Button>
                          <Button
                            type="button"
                            variant={outcomeWinner === match.p2.id ? "default" : "outline"}
                            onClick={() => setOutcomeWinner(match.p2.id)}
                            className={`py-2 ${outcomeWinner === match.p2.id
                              ? "bg-blue-600 text-white hover:bg-blue-700"
                              : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                              }`}
                          >
                            {match.p2.name}
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Scores Section - Hidden when match outcome is WO or DSQ */}
                {(matchOutcome === "" || matchOutcome === "RET" || matchOutcome === "DSQ") && (
                  <Card className="bg-white dark:bg-gray-800 shadow-sm rounded-lg">
                    <CardHeader className="bg-gray-50 dark:bg-gray-900 rounded-t-lg">
                      <CardTitle className="text-lg text-gray-900 dark:text-white">
                        <div className="flex items-center justify-between gap-2">
                          {t("protocol.table.sets")} {usePoints ? t("protocol.table.points_mode") : t("protocol.table.sets_mode")}
                          {matchOutcome === "RET" && (
                            <span className="text-sm text-orange-600 dark:text-orange-400">
                              {t("protocol.match_outcome.retirement_scores", "Scores before retirement")}
                            </span>
                          )}
                          {matchOutcome === "DSQ" && (
                            <span className="text-sm text-orange-600 dark:text-orange-400">
                              {t("protocol.match_outcome.disqualification_scores", "Scores before disqualification")}
                            </span>
                          )}
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              {t("protocol.table.use_points")}
                            </span>
                            <Switch
                              checked={usePoints}
                              onCheckedChange={setUsePoints}
                            />
                          </div>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                      <div className="grid grid-cols-2 gap-4 mb-2">
                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          {match.p1.name}
                        </div>
                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          {match.p2.name}
                        </div>
                      </div>
                      {usePoints ? (
                        form.watch("scores").map((_, index) => (
                          <div key={index} className="flex items-start space-x-2">
                            <FormField
                              control={form.control}
                              name={`scores.${index}.player1`}
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormControl>
                                    <Input
                                      type="text"
                                      {...field}
                                      value={field.value}
                                      onChange={(e) => {
                                        const value = e.target.value;

                                        if (value === "") {
                                          field.onChange(0);
                                          return;
                                        }

                                        if (!/^\d*$/.test(value)) {
                                          return;
                                        }

                                        const cleanedValue = value.replace(
                                          /^0+(\d)/,
                                          "$1",
                                        );
                                        const numberValue =
                                          cleanedValue === ""
                                            ? 0
                                            : Number.parseInt(cleanedValue);

                                        field.onChange(numberValue);
                                      }}
                                      className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`scores.${index}.player2`}
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormControl>
                                    <Input
                                      type="text"
                                      {...field}
                                      value={field.value}
                                      onChange={(e) => {
                                        const value = e.target.value;

                                        if (value === "") {
                                          field.onChange(0);
                                          return;
                                        }

                                        if (!/^\d*$/.test(value)) {
                                          return;
                                        }

                                        const cleanedValue = value.replace(
                                          /^0+(\d)/,
                                          "$1",
                                        );
                                        const numberValue =
                                          cleanedValue === ""
                                            ? 0
                                            : Number.parseInt(cleanedValue);

                                        field.onChange(numberValue);
                                      }}
                                      className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            {index >= 0 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => remove(index)}
                                className="bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800 rounded-md"
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-start space-x-2">
                            <Input
                              type="text"
                              value={
                                extractSetsFromPoints(form.watch("scores")).p1_sets
                              }
                              onChange={(e) => handleSetChange(1, e.target.value)}
                            />
                            <Input
                              type="text"
                              value={
                                extractSetsFromPoints(form.watch("scores")).p2_sets
                              }
                              onChange={(e) => handleSetChange(2, e.target.value)}
                            />
                          </div>
                          {setsError && (
                            <p className="text-red-500 text-sm">
                              {setsError}
                            </p>
                          )}
                        </div>
                      )}
                      {form.formState.errors.scores &&
                        form.formState.errors.scores.root &&
                        form.formState.errors.scores.root.message && (
                          <p className="text-red-500 text-sm">
                            {form.formState.errors.scores.root.message}
                          </p>
                        )}
                      {usePoints && form.watch("scores").length < 7 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => append({ player1: 0, player2: 0 })}
                          className="bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800 rounded-md"
                        >
                          <Plus className="h-4 w-4 mr-2" />{" "}
                          {t("protocol.actions.add_set")}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}

                <Card className="bg-white dark:bg-gray-800 shadow-sm rounded-lg">
                  <CardHeader className="bg-gray-50 dark:bg-gray-900 rounded-t-lg">
                    <CardTitle className="text-lg text-gray-900 dark:text-white">
                      {t("protocol.referees")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4">
                    <FormField
                      control={form.control}
                      name="tableReferee"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t("protocol.table_referee")}{" "}
                            <span className="text-gray-400">
                              ({t("protocol.actions.optional")})
                            </span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder={t(
                                "protocol.table_referee_placeholder",
                              )}
                              {...field}
                              className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="mainReferee"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t("protocol.head_referee")}{" "}
                            <span className="text-gray-400">
                              ({t("protocol.actions.optional")})
                            </span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder={t(
                                "protocol.head_referee_placeholder",
                              )}
                              {...field}
                              className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
            <DialogFooter className="flex flex-col sm:flex-row gap-4 p-6 pt-2 bg-gray-50 dark:bg-gray-900 rounded-b-lg">
              <div className="flex sm:order-2 w-full sm:justify-end">
                <Button
                  disabled={isSubmitting}
                  type="submit"
                  className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 rounded-md w-full sm:w-1/2"
                >
                  {t("protocol.actions.save")}
                </Button>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onClose(false)}
                  className="bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 rounded-md w-full"
                >
                  {t("protocol.actions.cancel")}
                </Button>
                <Button
                  type="button"
                  disabled={isSubmitting}
                  className="bg-black/90 w-full sm:w-auto"
                  onClick={resetMatch}
                >
                  {t("protocol.reset_game")}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default MatchDialog;
