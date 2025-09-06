import { TableMatch } from "@/types/brackets";
import { TournamentTable } from "@/types/groups";
import {
  capitalizeWords,
  cn,
  formatDateGetDayMonth,
  formatDateGetHours,
} from "@/lib/utils";
import { extractMatchSets } from "./utils/utils";
import { MatchState, MatchWrapper } from "@/types/matches";
import { TableNumberForm } from "@/routes/admin/tournaments/$tournamentid/-components/table-number-form";
import { useTranslation } from "react-i18next";
import { Clock } from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";
import MatchHoverTooltip from "./match-hover-tooltip";

interface EliminationMatchProps {
  match: TableMatch;
  tournamentTable: TournamentTable;
  handleSelectMatch?: (match: MatchWrapper) => void;
  admin: boolean;
  hoveredPlayerId?: string | null;
  onPlayerHover?: (playerId: string | null) => void;
}

const EliminationMatch = ({
  match,
  tournamentTable,
  handleSelectMatch,
  admin = false,
  hoveredPlayerId,
  onPlayerHover,
}: EliminationMatchProps) => {
  void tournamentTable;

  const { t } = useTranslation();
  const { p1_sets, p2_sets } = extractMatchSets(match);
  const [showTooltip, setShowTooltip] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isTransformed, setIsTransformed] = useState(false);

  const handlePlayerHover = (playerId: string | null) => {
    onPlayerHover?.(playerId);
  };

  const handleMatchMouseEnter = (event: React.MouseEvent) => {
    const hasValidParticipants =
      match.participant_1.id &&
      match.participant_2.id &&
      match.participant_1.id !== "" &&
      match.participant_2.id !== "" &&
      match.participant_1.id !== "empty" &&
      match.participant_2.id !== "empty";

    if (hasValidParticipants) {
      const rect = event.currentTarget.getBoundingClientRect();
      const parentElement = event.currentTarget.parentElement;

      // Check if element is inside a TransformWrapper (zoom container)
      const isInsideTransformWrapper =
        event.currentTarget.closest(
          '[data-testid="react-transform-wrapper"]'
        ) !== null ||
        event.currentTarget.closest(".react-transform-wrapper") !== null ||
        event.currentTarget.closest(".react-transform-component") !== null;

      const hasTranslateTransform =
        parentElement?.classList.contains("-translate-y-1/2");
      const hasTransform = hasTranslateTransform || isInsideTransformWrapper;

      setMousePosition({
        x: rect.right,
        y: rect.top,
      });
      setIsTransformed(hasTransform || false);
      setShowTooltip(true);
    }
  };

  const handleMatchMouseLeave = () => {
    setShowTooltip(false);
  };

  const handleMatchMouseMove = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: rect.right,
      y: rect.top,
    });
  };

  const isTournamentWinner = (
    match: TableMatch,
    participant_id: string
  ): boolean => {
    const parts = match.match.bracket.split("-");
    if (parts.length == 2) {
      if (Math.abs(Number(parts[0]) - Number(parts[1])) == 1) {
        return (
          match.match.winner_id == participant_id && match.match.winner_id != ""
        );
      }
      return false;
    }
    return false;
  };

  const getIndividualPlacement = (
    match: TableMatch,
    participantId: string
  ): string | null => {
    const parts = match.match.bracket.split("-");
    if (parts.length === 2) {
      const lowerPlace = Number(parts[0]);
      const higherPlace = Number(parts[1]);

      // Only show individual placement for consecutive placement matches (difference of 1)
      if (Math.abs(higherPlace - lowerPlace) === 1 && match.match.winner_id) {
        if (match.match.winner_id === participantId) {
          // Winner gets the lower place (better position - lower number is better)
          return lowerPlace.toString();
        } else if (
          match.participant_1.id === participantId ||
          match.participant_2.id === participantId
        ) {
          // Loser gets the higher place (worse position - higher number is worse)
          return higherPlace.toString();
        }
      }
    }
    return null;
  };

  const isEmptyDate = (date: string | Date) => {
    const dateObj = new Date(date);
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1;
    const day = dateObj.getDate();

    return (month === 1 && day === 1) || year === 1;
  };

  const bracket =
    Math.abs(
      Number(match.match.bracket.split("-")[0]) -
        Number(match.match.bracket.split("-")[1])
    ) == 1
      ? match.match.bracket
      : "";

  // Check if both participants have individual placements visible
  const hasIndividualPlacements = 
    getIndividualPlacement(match, match.participant_1.id) !== null &&
    getIndividualPlacement(match, match.participant_2.id) !== null;

  // Hide bracket number if match is finished and individual placements are shown
  const shouldShowBracket = bracket && !hasIndividualPlacements;

  const onMatchClick = (match: TableMatch) => {
    if (handleSelectMatch) {
      const matchWrapper: MatchWrapper = {
        match: match.match,
        p1: match.participant_1,
        p2: match.participant_2,
        class: "",
      };
      handleSelectMatch(matchWrapper);
    }
  };

  const matchDate = match.match.start_date;

  return (
    <>
      <div
        onClick={() => onMatchClick(match)}
        onMouseEnter={handleMatchMouseEnter}
        onMouseLeave={handleMatchMouseLeave}
        onMouseMove={handleMatchMouseMove}
        className="relative w-[198px] h-[60px] bg-white flex flex-col border border-gray-200 rounded-md hover:shadow-md transition-shadow cursor-pointer"
      >
        {shouldShowBracket && (
          <div className="absolute -right-[40px] top-1/2 -translate-y-1/2 text-[9px] font-medium text-gray-600 bg-white px-1 border border-gray-200 rounded max-w-10 text-left">
            {bracket}
          </div>
        )}
        {!match.match.table_type?.startsWith("single_elimination") && (
          <div className="absolute -top-[18px] right-0 text-[9px] font-medium text-gray-600 bg-white px-1 border border-blue-300 rounded">
            {match.match.readable_id}
          </div>
        )}
        <div className="absolute text-[10px] -top-[15px]">
          {match.match.state !== MatchState.FINISHED &&
          match.participant_1.id != "" &&
          match.participant_2.id != "" &&
          match.participant_1.id != "empty" &&
          match.participant_2.id != "empty" &&
          admin ? (
            <div className="flex items-center w-full hide-in-pdf">
              <TableNumberForm
                brackets={true}
                match={match.match}
                initialTableNumber={
                  match.match.extra_data && match.match.extra_data.table
                }
                showLabel={true}
              />
              {matchDate &&
                match.match.extra_data.table != "" &&
                !isEmptyDate(matchDate) && (
                  <div className="mb-1 flex items-center gap-1 ml-3 whitespace-nowrap">
                    <Clock className="h-3 w-3" />
                    <span className="font-semibold">
                      {formatDateGetHours(matchDate)}
                    </span>
                  </div>
                )}
            </div>
          ) : match.match.extra_data &&
            match.match.extra_data.table &&
            match.match.p1_id != "empty" &&
            match.match.p2_id != "empty" ? (
            <div className="flex items-center w-full">
              <span className="whitespace-nowrap">
                {t("admin.tournaments.matches.table.table")}{" "}
                {match.match.extra_data.table}
              </span>
              {matchDate && !isEmptyDate(matchDate) && (
                <div className="flex items-center gap-1 ml-2 whitespace-nowrap">
                  <Clock className="h-3 w-3 mb-0.5" />
                  <span>{formatDateGetDayMonth(matchDate)}</span>
                  <span className="font-semibold">
                    {formatDateGetHours(matchDate)}
                  </span>
                </div>
              )}
            </div>
          ) : null}
        </div>
        <div
          className={cn(
            "relative flex w-full h-1/2 items-center transition-all duration-200 border-b border-gray-200",
            isTournamentWinner(match, match.participant_1.id) &&
              "bg-green-200/50",
            hoveredPlayerId === match.participant_1.id &&
              "ring-2 ring-blue-400 bg-blue-50 shadow-md"
          )}
        >
          {match.match.previous_match_readable_id_1 < 0 && (
            <div className="absolute text-[9px] left-1">
              {match.match.previous_match_readable_id_1}
            </div>
          )}
          {match.participant_1.id === "empty" ? (
            <>
              <div className="text-center px-2">{""}</div>
              <div className="w-full text-gray-500 ml-2 pdf-participant text-xs">
                (Bye)
              </div>
              <div className="text-right pr-4">{""}</div>
            </>
          ) : match.participant_1.id === "" ? (
            <div className="w-full" />
          ) : (
            <>
              <span
                className={cn(
                  "ml-1 font-medium text-xs flex items-center h-full justify-center",
                  match.match.type == "winner" && match.match.round == 0
                    ? "w-[30px]"
                    : "w-[15px]"
                )}
              >
                {match.match.type == "winner" && match.match.round == 0
                  ? match.participant_1.rr_order &&
                    match.participant_1.rr_order !== ""
                    ? match.participant_1.rr_order
                    : match.participant_1.order
                  : ""}
              </span>
              <div
                className={cn(
                  "relative",
                  match.match.previous_match_readable_id_1 < 0
                    ? "w-[calc(100%-15px)] ml-4"
                    : "w-full"
                )}
              >
                <p
                  className={cn(
                    "w-full text-xs cursor-pointer hover:text-blue-600 transition-colors flex items-center",
                    // p1_sets > p2_sets && "font-semibold",
                    (match.match.forfeit
                      ? match.match.winner_id === match.participant_1.id
                      : p1_sets > p2_sets) && "font-semibold"
                  )}
                  onMouseEnter={() => handlePlayerHover(match.participant_1.id)}
                  onMouseLeave={() => handlePlayerHover(null)}
                >
                  {capitalizeWords(match.participant_1.name)}
                </p>
                {(() => {
                  const placement = getIndividualPlacement(
                    match,
                    match.participant_1.id
                  );
                  return placement ? (
                    <span className="absolute right-[-60px] top-1/2 -translate-y-1/2 text-[9px] font-medium text-gray-600 bg-white px-1 border border-gray-200 rounded flex items-center justify-center w-6 h-4">
                      {placement}
                    </span>
                  ) : null;
                })()}
              </div>
              <p
                className={cn(
                  "px-3 h-full flex items-center justify-center w-8 text-center",
                  (match.match.forfeit
                    ? match.match.winner_id === match.participant_1.id
                    : p1_sets > p2_sets) && "bg-[#F3F9FC] font-semibold"
                )}
              >
                {match.participant_2.id === "empty"
                  ? "→"
                  : match.participant_2.id === ""
                    ? ""
                    : match.match.forfeit && match.match.forfeit_type === "WO"
                      ? match.match.winner_id === match.participant_1.id
                        ? "w"
                        : "o"
                      : match.match.forfeit &&
                          match.match.forfeit_type === "RET"
                        ? match.match.winner_id === match.participant_1.id
                          ? "-"
                          : "RET"
                        : match.match.forfeit &&
                            match.match.forfeit_type === "DSQ"
                          ? match.match.winner_id === match.participant_1.id
                            ? "-"
                            : "DQ"
                          : p1_sets}
              </p>
            </>
          )}
        </div>
        <div
          className={cn(
            "relative flex w-full h-1/2 items-center transition-all duration-200",
            isTournamentWinner(match, match.participant_2.id) &&
              "bg-green-200/50",
            hoveredPlayerId === match.participant_2.id &&
              "ring-2 ring-blue-400 bg-blue-50 shadow-md"
          )}
        >
          {match.match.previous_match_readable_id_2 < 0 && (
            <div className="absolute text-[9px] left-1">
              {match.match.previous_match_readable_id_2}
            </div>
          )}
          {match.participant_2.id === "empty" ? (
            <>
              <div className="text-center px-2">{""}</div>
              <div className="w-full text-gray-500 ml-2 pdf-participant text-xs">
                (Bye)
              </div>
              <div className="text-right pr-4">{""}</div>
            </>
          ) : match.participant_2.id === "" ? (
            <div className="w-full" />
          ) : (
            <>
              <span
                className={cn(
                  "ml-1 font-medium text-xs flex items-center h-full justify-center",
                  match.match.type == "winner" && match.match.round == 0
                    ? "w-[30px]"
                    : "w-[15px]"
                )}
              >
                {match.match.type == "winner" && match.match.round == 0
                  ? match.participant_2.rr_order &&
                    match.participant_2.rr_order !== ""
                    ? match.participant_2.rr_order
                    : match.participant_2.order
                  : ""}
              </span>
              <div
                className={cn(
                  "relative",
                  match.match.previous_match_readable_id_2 < 0
                    ? "w-[calc(100%-15px)] ml-4"
                    : "w-full"
                )}
              >
                <p
                  className={cn(
                    "w-full text-xs cursor-pointer hover:text-blue-600 transition-colors flex items-center",
                    (match.match.forfeit
                      ? match.match.winner_id === match.participant_2.id
                      : p2_sets > p1_sets) && "font-semibold"
                  )}
                  onMouseEnter={() => handlePlayerHover(match.participant_2.id)}
                  onMouseLeave={() => handlePlayerHover(null)}
                >
                  {capitalizeWords(match.participant_2.name)}
                </p>
                {(() => {
                  const placement = getIndividualPlacement(
                    match,
                    match.participant_2.id
                  );
                  return placement ? (
                    <span className="absolute right-[-60px] top-1/2 -translate-y-1/2 text-[9px] font-medium text-gray-600 bg-white px-1 border border-gray-200 rounded flex items-center justify-center w-6 h-4">
                      {placement}
                    </span>
                  ) : null;
                })()}
              </div>
              <p
                className={cn(
                  "px-3 h-full flex items-center justify-center w-8 text-center",
                  (match.match.forfeit
                    ? match.match.winner_id === match.participant_2.id
                    : p2_sets > p1_sets) && "bg-[#F3F9FC] font-semibold"
                )}
              >
                {match.participant_1.id === "empty"
                  ? "→"
                  : match.participant_1.id === ""
                    ? ""
                    : match.match.forfeit && match.match.forfeit_type === "WO"
                      ? match.match.winner_id === match.participant_2.id
                        ? "w"
                        : "o"
                      : match.match.forfeit &&
                          match.match.forfeit_type === "RET"
                        ? match.match.winner_id === match.participant_2.id
                          ? "-"
                          : "RET"
                        : match.match.forfeit &&
                            match.match.forfeit_type === "DSQ"
                          ? match.match.winner_id === match.participant_2.id
                            ? "-"
                            : "DQ"
                          : p2_sets}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Render tooltip using portal when transformed to avoid CSS transform issues */}
      {!admin && isTransformed &&
        showTooltip &&
        createPortal(
          <MatchHoverTooltip
            match={match}
            visible={showTooltip}
            position={mousePosition}
          />,
          document.body
        )}

      {/* Render tooltip normally when not transformed */}
      {!admin && !isTransformed && (
        <MatchHoverTooltip
          match={match}
          visible={showTooltip}
          position={mousePosition}
        />
      )}
    </>
  );
};

export default EliminationMatch;
