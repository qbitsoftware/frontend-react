import React from "react";
import { TableMatch } from "@/types/brackets";
import { capitalizeWords, cn } from "@/lib/utils";
import { extractMatchSets } from "./utils/utils";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";

interface MatchHoverTooltipProps {
  match: TableMatch;
  visible: boolean;
  position: { x: number; y: number };
  onClose?: () => void;
}

const MatchHoverTooltip: React.FC<MatchHoverTooltipProps> = ({
  match,
  visible,
  position,
  onClose,
}) => {
  const { t } = useTranslation();
  const { p1_sets, p2_sets } = extractMatchSets(match);
  const scores = match.match?.extra_data?.score || [];

  const hasActualPointScores = scores.some((score: any) =>
    !(score.p1_score === 11 && score.p2_score === 0) &&
    !(score.p1_score === 0 && score.p2_score === 11)
  );

  if (!visible) return null;

  const tooltipWidth = 280;
  const tooltipHeight = 250;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const margin = 15;
  const isMobile = window.innerWidth < 768;

  let left = position.x + margin;
  let top = position.y - margin;
  let transform = "translateY(0)";

  if (isMobile) {
    // On mobile, position as full width at bottom of screen
    left = 0;
    top = viewportHeight - tooltipHeight;
    transform = "translateY(0)";
  } else {
    // Desktop positioning logic (existing behavior)
    if (left + tooltipWidth > viewportWidth - margin) {
      left = position.x - tooltipWidth - margin;
    }

    if (left < margin) {
      left = margin;
    }

    if (top < margin) {
      top = margin;
    }

    if (top + tooltipHeight > viewportHeight - margin) {
      top = viewportHeight - tooltipHeight - margin;
    }
  }

  return (
    <div
      className={`fixed z-50 bg-white border border-gray-200 shadow-lg p-4 ${
        isMobile ? 'pointer-events-auto' : 'pointer-events-none'
      } ${
        isMobile 
          ? 'w-full rounded-t-lg border-b-0 bottom-0' 
          : 'rounded-lg min-w-[280px] max-w-[320px]'
      }`}
      style={isMobile ? { bottom: 0, left: 0 } : {
        left: left,
        top: top,
        transform: transform,
      }}
    >
      <div className="space-y-3">
        <div className="border-b border-gray-100 pb-2 relative">
          <div className="text-sm font-semibold text-gray-700">
            {t("match_tooltip.match")} {match.match.readable_id > 0 ? match.match.readable_id : ""}
          </div>
          {isMobile && onClose && (
            <button
              onClick={onClose}
              className="absolute top-0 right-0 p-1 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          )}
        </div>

        <div className="space-y-2">
          <div className={cn(
            "flex items-center justify-between p-2 rounded bg-gray-50",
            (match.match.forfeit
              ? match.match.winner_id === match.participant_1.id
              : p1_sets > p2_sets
            ) && "bg-green-50",
          )}>
            <span className="font-medium text-sm">
              {match.participant_1.rank > 0 && <span className="text-gray-500 mr-2">({match.participant_1.rank})</span>}
              {capitalizeWords(match.participant_1.name)}
            </span>
            <span className={cn(
              "font-bold text-lg text-gray-600",
              (match.match.forfeit
                ? match.match.winner_id === match.participant_1.id
                : p1_sets > p2_sets
              ) && "text-green-700",
            )}>
              {/* {match.match.forfeit
                ? (match.match.winner_id === match.participant_1.id ? "w" : "o")
                : p1_sets
              } */}
              {match.match.forfeit && match.match.forfeit_type === "WO"
                ? (match.match.winner_id === match.participant_1.id ? "w" : "o")
                : (match.match.forfeit && match.match.forfeit_type === "RET") ?
                  (match.match.winner_id === match.participant_1.id ? "" : "RET")
                  : (match.match.forfeit && match.match.forfeit_type === "DSQ") ?
                    (match.match.winner_id === match.participant_1.id ? "" : "DQ")
                    : p1_sets
              }
            </span>
          </div>

          <div className={cn(
            "flex items-center justify-between p-2 rounded bg-gray-50",
            (match.match.forfeit
              ? match.match.winner_id === match.participant_2.id
              : p2_sets > p1_sets
            ) && "bg-green-50",

          )}>
            <span className="font-medium text-sm">
              {match.participant_2.rank > 0 && <span className="text-gray-500 mr-2">({match.participant_2.rank})</span>}
              {capitalizeWords(match.participant_2.name)}
            </span>
            <span className={cn(
              "font-bold text-lg text-gray-600",
              (match.match.forfeit
                ? match.match.winner_id === match.participant_2.id
                : p2_sets > p1_sets
              ) && "text-green-700",
            )}>
              {/* {match.match.forfeit
                ? (match.match.winner_id === match.participant_2.id ? "w" : "o")
                : p2_sets
              } */}
              {match.match.forfeit && match.match.forfeit_type === "WO"
                ? (match.match.winner_id === match.participant_2.id ? "w" : "o")
                : (match.match.forfeit && match.match.forfeit_type === "RET") ?
                  (match.match.winner_id === match.participant_2.id ? "-" : "RET")
                  : (match.match.forfeit && match.match.forfeit_type === "DSQ") ?
                    (match.match.winner_id === match.participant_2.id ? "-" : "DQ")
                    : p2_sets
              }
            </span>
          </div>
        </div>

        {/* Set Scores - Only show if there are actual point scores and not on mobile */}
        {!isMobile && scores.length > 0 && hasActualPointScores && (
          <div className="space-y-2">
            <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              {t("match_tooltip.set_scores")}
            </div>
            <div className="grid gap-1">
              {scores.map((score: any, index: number) => {
                const p1Won = score.p1_score >= 11 && score.p1_score - score.p2_score >= 2;
                const p2Won = score.p2_score >= 11 && score.p2_score - score.p1_score >= 2;

                return (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{t("match_tooltip.set")} {index + 1}</span>
                    <div className="flex items-center space-x-1">
                      <span className={cn(
                        "font-mono",
                        p1Won ? "font-bold text-green-700" : "text-gray-600"
                      )}>
                        {score.p1_score}
                      </span>
                      <span className="text-gray-400">-</span>
                      <span className={cn(
                        "font-mono",
                        p2Won ? "font-bold text-green-700" : "text-gray-600"
                      )}>
                        {score.p2_score}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Show message when only set scores are available - desktop only */}
        {!isMobile && scores.length > 0 && !hasActualPointScores && (
          <div className="text-xs text-gray-500 text-center py-2">
            {t("match_tooltip.match_scored_by_sets_only")}
          </div>
        )}

        {/* No scores available - desktop only */}
        {!isMobile && scores.length === 0 && (
          <div className="text-xs text-gray-500 text-center py-2">
            {t("match_tooltip.no_detailed_scores_available")}
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchHoverTooltip;
