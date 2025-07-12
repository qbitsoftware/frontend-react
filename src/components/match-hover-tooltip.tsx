import React from "react";
import { TableMatch } from "@/types/brackets";
import { capitalizeWords, cn } from "@/lib/utils";
import { extractMatchSets } from "./utils/utils";

interface MatchHoverTooltipProps {
  match: TableMatch;
  visible: boolean;
  position: { x: number; y: number };
}

const MatchHoverTooltip: React.FC<MatchHoverTooltipProps> = ({
  match,
  visible,
  position,
}) => {
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

  // Since we're using fixed positioning, use viewport coordinates directly
  let left = position.x + margin;
  let top = position.y - margin;
  const transform = "translateY(0)";

  // If tooltip would go off the right edge, position it to the left instead
  if (left + tooltipWidth > viewportWidth - margin) {
    left = position.x - tooltipWidth - margin;
  }

  // Ensure tooltip doesn't go off the left edge
  if (left < margin) {
    left = margin;
  }

  // Ensure tooltip doesn't go off the top edge
  if (top < margin) {
    top = margin;
  }

  // Ensure tooltip doesn't go off the bottom edge  
  if (top + tooltipHeight > viewportHeight - margin) {
    top = viewportHeight - tooltipHeight - margin;
  }

  return (
    <div
      className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[280px] max-w-[320px] pointer-events-none"
      style={{
        left: left,
        top: top,
        transform: transform,
      }}
    >
      <div className="space-y-3">
        <div className="border-b border-gray-100 pb-2">
          <div className="text-sm font-semibold text-gray-700">
            Match {match.match.readable_id > 0 ? match.match.readable_id : ""}
          </div>
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
              {capitalizeWords(match.participant_1.name)}
            </span>
            <span className={cn(
              "font-bold text-lg text-gray-600",
              (match.match.forfeit
                ? match.match.winner_id === match.participant_1.id
                : p1_sets > p2_sets
              ) && "text-green-700",
            )}>
              {match.match.forfeit
                ? (match.match.winner_id === match.participant_1.id ? "w" : "o")
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
              {capitalizeWords(match.participant_2.name)}
            </span>
            <span className={cn(
              "font-bold text-lg text-gray-600",
              (match.match.forfeit
                ? match.match.winner_id === match.participant_2.id
                : p2_sets > p1_sets
              ) && "text-green-700",
            )}>
              {match.match.forfeit
                ? (match.match.winner_id === match.participant_2.id ? "w" : "o")
                : p2_sets
              }
            </span>
          </div>
        </div>

        {/* Set Scores - Only show if there are actual point scores */}
        {scores.length > 0 && hasActualPointScores && (
          <div className="space-y-2">
            <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Set Scores
            </div>
            <div className="grid gap-1">
              {scores.map((score: any, index: number) => {
                const p1Won = score.p1_score >= 11 && score.p1_score - score.p2_score >= 2;
                const p2Won = score.p2_score >= 11 && score.p2_score - score.p1_score >= 2;

                return (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Set {index + 1}</span>
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

        {/* Show message when only set scores are available */}
        {scores.length > 0 && !hasActualPointScores && (
          <div className="text-xs text-gray-500 text-center py-2">
            Match scored by sets only
          </div>
        )}

        {/* No scores available */}
        {scores.length === 0 && (
          <div className="text-xs text-gray-500 text-center py-2">
            No detailed scores available
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchHoverTooltip;
