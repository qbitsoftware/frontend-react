import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TeamPlayers from "./team";
import { Button } from "@/components/ui/button";
import { GitCompareArrowsIcon } from "lucide-react";
import { useProtocolModal } from "@/providers/protocolProvider";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import Scores from "./scores";
import Forfeit from "./forfeit";
import { useTranslation } from "react-i18next";

export function Content() {
  const {
    match,
    notes,
    headReferee,
    tableReferee,
    forfeitMatch,
    childMatches,
    isPending,
    handleSwitchParticipants,
    handleMatchStart,
    handleMatchReset,
    handleMatchFinish,
    handleTableRefereeChange,
    handleNotesChange,
    handleHeadRefereeChange
  } = useProtocolModal()

  const getAvailablePlayers = (teamNumber: number) => {
    const playersArray =
      teamNumber === 1 ? match.p1?.players : match.p2?.players;

    if (
      !playersArray ||
      !Array.isArray(playersArray) ||
      playersArray.length === 0
    ) {
      return [];
    }

    return playersArray.filter(
      (player) => player && player.id && (player.first_name || player.last_name)
    );
  };

  const { t } = useTranslation()

  return (
    <div>
      <Tabs
        defaultValue="players"
        className="flex-grow flex flex-col min-h-0"
      >
        <TabsList className="mx-auto my-2 space-x-1 p-1 bg-stone-200/40 rounded-lg w-auto">
          <TabsTrigger
            value="players"
            className="py-2 px-4 rounded-md data-[state=active]:bg-stone-800 data-[state=active]:shadow-sm flex items-center gap-1"
          >
            <span>{t('protocol.players')}</span>
          </TabsTrigger>
          <TabsTrigger
            value="scores"
            className="py-2 px-4 rounded-md data-[state=active]:bg-stone-800 data-[state=active]:shadow-sm flex items-center gap-1"
          >
            <span>{t('protocol.table.score')}</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent
          value="players"
          className="flex-grow p-3 md:p-4 overflow-auto m-0"
        >
          <div className="flex items-center justify-center w-full mb-1">
            <Button
              onClick={handleSwitchParticipants}
              variant="outline"
              disabled={isPending || (childMatches && childMatches.data && childMatches.data.matches && childMatches.data.matches.length > 0)}
              size="sm"
              className=""
            >
              <GitCompareArrowsIcon size={16} />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TeamPlayers key={1} team={1} players={getAvailablePlayers(1)} />
            <TeamPlayers key={2} team={2} players={getAvailablePlayers(2)} />
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1">
              <h6 className="font-semibold text-sm">{t('protocol.notes')}</h6>
              <div className="flex gap-5">
                <Button
                  disabled={childMatches && childMatches.data && childMatches.data.matches && childMatches.data.matches.length > 0}
                  onClick={handleMatchStart}
                  size="sm"
                  className="h-8 px-3 text-xs"
                >
                  {t("protocol.start_game")}
                </Button>
                <Button
                  onClick={handleMatchReset}
                  size="sm"
                  className="h-8 px-3 text-xs"
                >
                  {t("protocol.reset_game")}
                </Button>

              </div>
            </div>
            <Textarea
              placeholder={t("protocol.notes_placeholder")}
              onChange={(e) => handleNotesChange(e.target.value)}
              value={notes}
              className="w-full min-h-[60px] text-sm mt-4"
            />
          </div>
        </TabsContent>
        {forfeitMatch && (
          <Forfeit match={forfeitMatch} />
        )}
        <TabsContent value="scores" className="flex-grow p-0 overflow-auto m-0 flex flex-col min-h-0">
          <Scores />
        </TabsContent>
      </Tabs>
      <div className="bg-gray-100 p-3 border-t flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col">
            <label className="text-xs text-gray-600 mb-1">{t('protocol.table_referee')}</label>
            <Input
              className="h-8 text-sm"
              value={tableReferee}
              placeholder={t('protocol.table_referee_placeholder')}
              onChange={(e) => handleTableRefereeChange(e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-600 mb-1">{t('protocol.head_referee')}</label>
            <Input
              className="h-8 text-sm"
              value={headReferee}
              placeholder={t('protocol.head_referee_placeholder')}
              onChange={(e) => handleHeadRefereeChange(e.target.value)}
            />
          </div>
        </div>
        <Button
          disabled={match.match.winner_id !== ""}
          onClick={handleMatchFinish}
          className="w-full h-9 font-medium"
          variant={match.match.winner_id !== "" ? "outline" : "default"}
        >
          {match.match.winner_id !== "" ? t('protocol.game_finished') : t('protocol.finish_game')}
        </Button>
      </div>
    </div>
  )
}
