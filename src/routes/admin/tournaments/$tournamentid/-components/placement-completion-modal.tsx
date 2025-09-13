import { useEffect, useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { MatchWrapper, MatchState } from "@/types/matches";
import { Trophy, Medal } from "lucide-react";

interface PlacementCompletionModalProps {
  matches: MatchWrapper[];
  isOpen: boolean;
  onClose: () => void;
}

interface PlacementResult {
  playerName: string;
  finalPlace: string;
  isWinner: boolean;
}

const extractPlacementFromMatch = (match: MatchWrapper): { places: string; isPlacementMatch: boolean } => {
  const matchName = match.class || "";
  const bracket = match.match.bracket || "";

  const placementPatterns = [
    /(\d+)-(\d+)/,
  ];

  for (const pattern of placementPatterns) {
    const nameMatch = matchName.match(pattern);
    const bracketMatch = bracket.match(pattern);

    if (nameMatch || bracketMatch) {
      const match = nameMatch || bracketMatch;
      if (match && match[1] && match[2]) {
        return {
          places: `${match[1]}-${match[2]}`,
          isPlacementMatch: true
        };
      }
    }
  }

  return { places: "", isPlacementMatch: false };
};

const determinePlacementResults = (match: MatchWrapper): PlacementResult[] => {
  const { places } = extractPlacementFromMatch(match);

  if (!places) return [];

  const [lowerPlace, higherPlace] = places.split("-").map(Number);
  const winner = match.match.winner_id;

  const results: PlacementResult[] = [];

  if (winner === match.p1.id) {
    results.push({
      playerName: match.p1.name,
      finalPlace: lowerPlace.toString(),
      isWinner: true
    });
    results.push({
      playerName: match.p2.name,
      finalPlace: higherPlace.toString(),
      isWinner: false
    });
  } else if (winner === match.p2.id) {
    results.push({
      playerName: match.p2.name,
      finalPlace: lowerPlace.toString(),
      isWinner: true
    });
    results.push({
      playerName: match.p1.name,
      finalPlace: higherPlace.toString(),
      isWinner: false
    });
  }

  return results;
};

const PlacementCompletionModal: React.FC<PlacementCompletionModalProps> = ({
  matches,
  isOpen,
  onClose
}) => {
  const { t } = useTranslation();
  const [completedPlacementMatch, setCompletedPlacementMatch] = useState<MatchWrapper | null>(null);
  const [placementResults, setPlacementResults] = useState<PlacementResult[]>([]);
  const previousMatchStatesRef = useRef<Map<string, MatchState>>(new Map());

  useEffect(() => {
    if (completedPlacementMatch && placementResults.length > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [completedPlacementMatch, placementResults]);

  useEffect(() => {
    matches.forEach(match => {
      const matchId = match.match.id;
      const currentState = match.match.state;
      const previousState = previousMatchStatesRef.current.get(matchId);

      if (currentState === MatchState.FINISHED && previousState && previousState !== MatchState.FINISHED) {
        const { places, isPlacementMatch } = extractPlacementFromMatch(match);

        if (isPlacementMatch && match.match.winner_id) {
          const [lowerPlace, higherPlace] = places.split("-").map(Number);

          if (higherPlace - lowerPlace === 1) {
            const results = determinePlacementResults(match);
            if (results.length > 0) {
              setCompletedPlacementMatch(match);
              setPlacementResults(results);
            }
          }
        }
      }

      previousMatchStatesRef.current.set(matchId, currentState);
    });
  }, [matches]);

  const handleClose = () => {
    setCompletedPlacementMatch(null);
    setPlacementResults([]);
    onClose();
  };

  const getPlaceOrdinal = (place: string) => {
    const num = parseInt(place);
    if (num === 1) return t("admin.tournaments.placement.first");
    if (num === 2) return t("admin.tournaments.placement.second");
    if (num === 3) return t("admin.tournaments.placement.third");
    return `${place}${t("admin.tournaments.placement.th")}`;
  };

  const shouldShow = isOpen && !!completedPlacementMatch && placementResults.length > 0;

  return (
    <Dialog open={shouldShow} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-center justify-center">
            <Trophy className="h-6 w-6 text-yellow-500" />
            {t("admin.tournaments.placement.tournament_complete")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="text-center space-y-3">
            {placementResults.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 ${result.isWinner
                  ? "border-yellow-200 bg-yellow-50"
                  : "border-gray-200 bg-gray-50"
                  }`}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  {result.isWinner ? (
                    <Trophy className="h-5 w-5 text-yellow-500" />
                  ) : (
                    <Medal className="h-5 w-5 text-gray-400" />
                  )}
                  <span className="text-lg font-semibold">
                    {getPlaceOrdinal(result.finalPlace)} {t("admin.tournaments.placement.place")}
                  </span>
                </div>
                <p className="text-xl font-bold text-gray-900">
                  {result.playerName}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center text-sm text-gray-600">
            {completedPlacementMatch && (
              <p>
                {t("admin.tournaments.placement.match_completed")}: {" "}
                {extractPlacementFromMatch(completedPlacementMatch).places} {" "}
                {t("admin.tournaments.placement.places_match")}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-center">
          <Button onClick={handleClose} className="w-full">
            {t("common.close")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlacementCompletionModal;
