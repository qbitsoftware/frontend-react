import { BracketReponse } from "@/queries/tournaments";
import React, { useEffect, useState } from "react";
import GroupStageBracket from "@/components/group-stage-bracket";
import { DialogType, TournamentTable } from "@/types/groups";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { EliminationBrackets } from "@/components/elimination-brackets";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GroupType, MatchWrapper } from "@/types/matches";
import GroupBracket from "@/components/group-bracket";
import { ProtocolModalProvider } from "@/providers/protocolProvider";
import MatchDialog from "@/components/match-dialog";
import { TableTennisProtocolModal } from "../$tournamentid/-components/tt-modal/tt-modal";
import { UseGetMatchesQuery } from "@/queries/match";
import { useParams } from "@tanstack/react-router";

interface BracketComponentProps {
  bracket: BracketReponse;
  tournament_table: TournamentTable | null;
}

const BracketComponent: React.FC<BracketComponentProps> = ({
  bracket,
  tournament_table,
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<MatchWrapper | null>(null);
  const [activeTab, setActiveTab] = useState<string>("");
  const params = useParams({ strict: false })

  const { data: matches } = UseGetMatchesQuery(
    Number(params.tournamentid),
    Number(params.groupid)
  );

  useEffect(() => {
    if (selectedMatch && matches && matches.data) {
      const updatedMatch = matches.data.find(
        (match) => match.match.id === selectedMatch.match.id
      );
      if (updatedMatch) {
        setSelectedMatch(updatedMatch);
      }
    }
  }, [matches, selectedMatch]);

  useEffect(() => {
    if (!bracket.data || !tournament_table) return;
    
    const hasEliminations = !!bracket.data.eliminations && bracket.data.eliminations.length > 0;
    
    const defaultTab = hasEliminations ? "eliminations" : "round_robins";
    setActiveTab(defaultTab);
  }, [bracket.data, tournament_table]);

  if (!bracket.data || !tournament_table) {
    return <div>{t('admin.tournaments.groups.tables.no_data')}</div>;
  }

  const hasEliminations = !!bracket.data.eliminations && bracket.data.eliminations.length > 0;
  const hasRoundRobins = !!bracket.data.round_robins && bracket.data.round_robins.length > 0;

  const isMeistrikad = tournament_table.type === GroupType.CHAMPIONS_LEAGUE;
  const isRoundRobinFull =
    tournament_table.type === GroupType.ROUND_ROBIN ||
    tournament_table.type === GroupType.ROUND_ROBIN_FULL_PLACEMENT ||
    tournament_table.type === GroupType.DYNAMIC;

  const handleSelectMatch = (match: MatchWrapper) => {
    if ((match.match.p1_id === "" || match.match.p1_id === "empty") && (match.match.p2_id === "" || match.match.p2_id === "empty")) {
      return
    }
    if (match.match.p1_id === "empty" || match.match.p2_id === "empty") {
      return
    }
    setSelectedMatch(match);
    setIsOpen(true);
  };


  return (
    <div className="w-full h-full">
      <Card className="border-stone-100">
        <div className="flex flex-col">
          <CardContent className="p-0">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full bg-[#F8F9FA]"
            >
              {hasEliminations && hasRoundRobins && (
                <TabsList>
                  <TabsTrigger value="eliminations">
                    {t(
                      "admin.tournaments.bracket.eliminations",
                      "Eliminations"
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="round_robins">
                    {t(
                      "admin.tournaments.bracket.round_robins",
                      "Group Stage"
                    )}
                  </TabsTrigger>
                </TabsList>
              )}
              {hasEliminations && (
                <TabsContent value="eliminations">
                  <EliminationBrackets
                    admin
                    data={bracket.data}
                    tournament_table={tournament_table}
                    handleSelectMatch={handleSelectMatch}
                  />
                </TabsContent>
              )}
              {hasRoundRobins && (
                <TabsContent value="round_robins">
                  {isMeistrikad && bracket.data.round_robins?.[0] && (
                    <GroupBracket
                      brackets={bracket.data.round_robins[0]}
                      onMatchSelect={handleSelectMatch}
                    />
                  )}
                  {isRoundRobinFull && bracket.data.round_robins?.[0] && (
                    <GroupStageBracket
                      tournament_table={tournament_table}
                      brackets={bracket.data.round_robins[0]}
                      onMatchSelect={handleSelectMatch}
                      name={tournament_table.class}
                    />
                  )}
                </TabsContent>
              )}
            </Tabs>
          </CardContent>
        </div>
      </Card>

      {selectedMatch && (tournament_table.solo || (!tournament_table.solo && tournament_table.dialog_type != DialogType.DT_TEAM_LEAGUES)) ? (
        <MatchDialog
          open={isOpen}
          onClose={() => setIsOpen(false)}
          match={selectedMatch}
          tournamentId={tournament_table.tournament_id}
        />
      )
        : (
          selectedMatch &&
          tournament_table.dialog_type == DialogType.DT_TEAM_LEAGUES && (
            <ProtocolModalProvider
              isOpen={isOpen}
              onClose={() => setIsOpen(false)}
              tournamentId={tournament_table.tournament_id}
              match={selectedMatch}
              playerCount={tournament_table.min_team_size}
            >
              <TableTennisProtocolModal />
            </ProtocolModalProvider>
          )
        )}
    </div>
  );
};

export default BracketComponent;
