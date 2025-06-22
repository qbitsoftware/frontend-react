import React, { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { Plus, Minus } from "lucide-react";
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
import { extractSetsFromPoints } from "./utils/utils";

interface MatchDialogProps {
  open: boolean;
  onClose: (open: boolean) => void;
  match: MatchWrapper;
  tournament_id: number;
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
    .max(7, "A maximum of 7 scores are allowed for best of 7"),
});

type MatchFormValues = z.infer<typeof matchFormSchema>;

const MatchDialog: React.FC<MatchDialogProps> = ({
  open,
  onClose,
  match,
  tournament_id,
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

  const [useSets, setUseSets] = useState(match.match.use_sets || false);
  const [isForfeit, setIsForfeit] = useState(match.match.forfeit || false);
  const [forfeitWinner, setForfeitWinner] = useState<string>("");



  useEffect(() => {
    if (match && open) {
      setIsForfeit(match.match.forfeit || false);
      if (match.match.forfeit) {
        setForfeitWinner(match.match.winner_id)
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
    onClose(false);
  };

  const usePatchMatch = UsePatchMatch(
    tournament_id,
    match.match.tournament_table_id,
    match.match.id,
  );

  const useResetMatch = UsePatchMatchReset(
    tournament_id,
    match.match.tournament_table_id,
    match.match.id,
  );

  const resetMatch = async () => {
    try {
      await useResetMatch.mutateAsync();
      toast.success(t("toasts.protocol_modals.match_reset_success"));
    } catch (error) {
      void error;
      toast.error(t("toasts.protocol_modals.match_reset_error"));
    }
  };

  const { append, remove } = useFieldArray({
    name: "scores",
    control: form.control,
  });

  const handleSubmit = async (data: MatchFormValues) => {
    let sendMatch: Match
    if (isForfeit) {
      sendMatch = match.match
      sendMatch.winner_id = forfeitWinner 
      sendMatch.forfeit = true;

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
        start_date: new Date().toISOString(),
        bracket: match.match.bracket,
        forfeit: match.match.forfeit,
        state: match.match.state,
        use_sets: useSets,
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
    } catch (error) {
      void error;
      toast.error(t("toasts.protocol_modals.updated_match_score_error"));
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

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl p-0 overflow-y-scroll bg-white dark:bg-gray-800 rounded-lg shadow-lg border-none">
        <DialogHeader className="py-10 pb-2 rounded-t-lg text-2xl font-bold text-center mx-auto">
          <DialogTitle>{t("protocol.title")}</DialogTitle>
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

                {/* Forfeit Section */}
                <Card className="bg-white dark:bg-gray-800 shadow-sm rounded-lg">
                  <CardHeader className="bg-gray-50 dark:bg-gray-900 rounded-t-lg">
                    <CardTitle className="text-lg text-gray-900 dark:text-white">
                      <div className="flex items-center justify-between gap-2">
                        {t("protocol.forfeit.title", "Forfeit")}
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            {t("protocol.forfeit.enable", "Enable Forfeit")}
                          </span>
                          <Switch
                            checked={isForfeit}
                            onCheckedChange={setIsForfeit}
                          />
                        </div>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  {isForfeit && (
                    <CardContent className="space-y-4 pt-4">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {t("protocol.forfeit.description", "Select the winner by forfeit")}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Button
                          type="button"
                          variant={forfeitWinner === match.p1.id ? "default" : "outline"}
                          onClick={() => setForfeitWinner(match.p1.id)}
                          className={`p-4 h-auto ${forfeitWinner === match.p1.id
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                            }`}
                        >
                          <div className="text-center">
                            <div className="font-medium">{match.p1.name}</div>
                          </div>
                        </Button>
                        <Button
                          type="button"
                          variant={forfeitWinner === match.p2.id ? "default" : "outline"}
                          onClick={() => setForfeitWinner(match.p2.id)}
                          className={`p-4 h-auto ${forfeitWinner === match.p2.id
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                            }`}
                        >
                          <div className="text-center">
                            <div className="font-medium">{match.p2.name}</div>
                          </div>
                        </Button>
                      </div>
                    </CardContent>
                  )}
                </Card>

                {/* Scores Section - Hidden when forfeit is enabled */}
                {!isForfeit && (
                  <Card className="bg-white dark:bg-gray-800 shadow-sm rounded-lg">
                    <CardHeader className="bg-gray-50 dark:bg-gray-900 rounded-t-lg">
                      <CardTitle className="text-lg text-gray-900 dark:text-white">
                        <div className="flex items-center justify-between gap-2">
                          {t("protocol.table.sets")}
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              {t("protocol.table.use_sets")}
                            </span>
                            <Switch
                              checked={useSets}
                              onCheckedChange={setUseSets}
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
                      {!useSets ? (
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
                      )}
                      {form.formState.errors.scores &&
                        form.formState.errors.scores.root &&
                        form.formState.errors.scores.root.message && (
                          <p className="text-red-500 text-sm">
                            {form.formState.errors.scores.root.message}
                          </p>
                        )}
                      {!useSets && form.watch("scores").length < 7 && (
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
            <DialogFooter className="p-6 pt-2 bg-gray-50 dark:bg-gray-900 rounded-b-lg">
              <div>
                <Button
                  type="button"
                  className="bg-black/90"
                  onClick={resetMatch}
                >
                  {t("protocol.reset_game")}
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onClose(false)}
                  className="bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 rounded-md"
                >
                  {t("protocol.actions.cancel")}
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 rounded-md"
                >
                  {t("protocol.actions.save")}
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
