import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TournamentTable } from "@/types/groups";
import { MatchWrapper } from "@/types/matches";
import { Participant } from "@/types/participants";
import { AvatarFallback } from "@radix-ui/react-avatar";
import { Skeleton } from "@/components/ui/skeleton";
import blueprofile from "@/assets/blue-profile.png";
import { Clock, MapPin } from "lucide-react";
import { extractMatchSets } from "@/components/utils/utils";
import { useTranslation } from "react-i18next";

interface ITTFMatchComponentProps {
  match: MatchWrapper;
  table_data: TournamentTable | null | undefined;
}

const truncateName = (name: string, maxLength: number = 10): string => {
  if (name.length <= maxLength) {
    return name;
  }
  return `${name.substring(0, maxLength)}..`;
};

const truncateNameResponsive = (name: string): string => {
  // Mobile: 12 chars, Tablet: 15 chars, Desktop: 18 chars
  if (window.innerWidth < 640) {
    return truncateName(name, 12);
  } else if (window.innerWidth < 1024) {
    return truncateName(name, 15);
  }
  return truncateName(name, 18);
};

const ITTFMatchComponent = ({ match, table_data }: ITTFMatchComponentProps) => {
  const { t } = useTranslation();

  if (!table_data) {
    return <Skeleton className="h-20 w-full" />;
  }

  const { p1_sets, p2_sets } = extractMatchSets(match);

  const isMatchCompleted = match.match.winner_id !== "";
  const matchDate = match.match.start_date;
  const matchDateObj = matchDate ? new Date(matchDate) : null;

  const isValidDate =
    matchDateObj &&
    !isNaN(matchDateObj.getTime()) &&
    matchDateObj.getTime() > new Date("1970-01-02").getTime();

  return (
    <Card className="pb-0 border-[#EFF0EF] !shadow-scheduleCard hover:shadow-lg transition-shadow duration-200 w-full">
      <div className="flex flex-col p-3 sm:p-4">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-2 sm:mb-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-semibold text-gray-700 truncate">
              {table_data.class}
            </p>
          </div>

          {/* Match Score or Status */}
          <div className="text-right flex-shrink-0 ml-2">
            {isMatchCompleted ? (
              <div>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold">
                  {match.match.forfeit ? "-" : `${p1_sets}:${p2_sets}`}
                </p>
                <p className="text-xs text-gray-500 mt-0.5 sm:mt-1">{t('admin.tournaments.matches.completed')}</p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-xs sm:text-sm font-medium text-gray-600">{t('admin.tournaments.matches.upcoming')}</p>
                {isValidDate && (
                  <p className="text-xs text-gray-500 mt-0.5 sm:mt-1">
                    {matchDate ? new Date(matchDate).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Tallinn' }) : ''}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {isValidDate && (
          <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 text-xs text-gray-600 bg-gray-50 rounded-md px-2 py-1 sm:py-1.5">
            <Clock className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{new Date(matchDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'Europe/Tallinn' })}</span>
            <span className="font-semibold flex-shrink-0">
              {new Date(matchDate).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Tallinn' })}
            </span>
          </div>
        )}

        <div className="flex flex-col gap-2 sm:gap-3 mb-2 sm:mb-3">
          <ITTFMatchUserComponent
            participant={match.p1}
            match={match}
            isWinner={match.match.winner_id === match.p1.id}
            table_data={table_data}
            playerNumber={1}
          />

          {/* VS Divider */}
          <div className="flex items-center gap-1.5 sm:gap-2 px-1 sm:px-2">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-xs text-gray-400 font-medium">VS</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          <ITTFMatchUserComponent
            participant={match.p2}
            match={match}
            isWinner={match.match.winner_id === match.p2.id}
            table_data={table_data}
            playerNumber={2}
          />
        </div>

        {/* Footer Section */}
        <div className="pt-2 sm:pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            {/* Location & Table */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              {match.match.location && (
                <div className="flex items-center gap-1 min-w-0">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{match.match.location}</span>
                </div>
              )}
              {match.match.extra_data.table && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className="font-medium">
                    {t('admin.tournaments.matches.table.table')} {match.match.extra_data.table}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

interface ITTFMatchUserComponentProps {
  participant: Participant;
  isWinner: boolean;
  match: MatchWrapper;
  table_data: TournamentTable;
  playerNumber: 1 | 2;
}

const ITTFMatchUserComponent = ({
  participant,
  isWinner,
  match,
  table_data,
  playerNumber,
}: ITTFMatchUserComponentProps) => {
  if (!participant || participant.id === "") {
    return <SkeletonMatchUserComponent />;
  }

  const { p1_sets, p2_sets } = extractMatchSets(match)

  const totalScore =
    playerNumber === 1 ? p1_sets : p2_sets

  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-lg p-1.5 sm:p-2 transition-colors",
        isWinner && "bg-green-50 border border-green-200",
      )}
    >
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
        <Avatar className="h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 border-2 border-white shadow-sm flex-shrink-0">
          <AvatarImage
            src={
              table_data.solo
                ? participant.players[0]?.extra_data?.image_url
                : participant.extra_data?.image_url
            }
            className="cursor-pointer object-cover"
          />
          <AvatarFallback>
            <img
              src={blueprofile}
              className="rounded-full h-full w-full object-cover"
              alt="Player"
            />
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <p
            className={cn(
              "text-xs sm:text-sm truncate",
              isWinner ? "font-semibold text-gray-900" : "text-gray-700",
            )}
            title={participant.name}
          >
            {truncateNameResponsive(participant.name)}
          </p>
        </div>
      </div>

      {/* Score Section */}
      <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 flex-shrink-0">
        {/* Set Scores */}
        {match.match.extra_data.score &&
          match.match.extra_data.score.length > 0 && !match.match.forfeit && (
            <div className="flex gap-0.5 sm:gap-1 lg:gap-1.5">
              {!match.match.use_sets && match.match.extra_data.score.map((set, index) => {
                const score = playerNumber === 1 ? set.p1_score : set.p2_score;
                const opponentScore =
                  playerNumber === 1 ? set.p2_score : set.p1_score;
                const wonSet = score > opponentScore;

                return (
                  <div
                    key={index}
                    className={cn(
                      "min-w-[16px] sm:min-w-[18px] lg:min-w-[20px] text-center text-xs font-medium px-0.5 sm:px-1 py-0.5 rounded",
                      wonSet
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600",
                    )}
                  >
                    {score}
                  </div>
                );
              })}
            </div>
          )}

        {/* Total Score */}
        <div
          className={cn(
            "text-lg sm:text-xl font-bold min-w-[24px] sm:min-w-[30px] text-right",
            isWinner ? "text-green-700" : "text-gray-700",
          )}
        >
          {match.match.forfeit && match.match.forfeit_type === "WO"
            ? (isWinner ? "w" : "o")
            : (match.match.forfeit && match.match.forfeit_type === "RET") ?
              (isWinner ? "-" : "RET")
              : (match.match.forfeit && match.match.forfeit_type === "DSQ") ?
                (isWinner ? "-" : "DQ")
                : totalScore
          }
        </div>
      </div>
    </div>
  );
};

const SkeletonMatchUserComponent = () => {
  return (
    <div className="flex items-center justify-between w-full p-1.5 sm:p-2">
      <div className="flex items-center gap-2 sm:gap-3 flex-1">
        <Skeleton className="h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-3 sm:h-4 w-16 sm:w-24 mb-1" />
        </div>
      </div>
      <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3">
        <div className="flex gap-0.5 sm:gap-1 lg:gap-1.5">
          {Array(3)
            .fill(0)
            .map((_, index) => (
              <Skeleton key={index} className="h-4 w-4 sm:h-5 sm:w-5" />
            ))}
        </div>
        <Skeleton className="h-5 w-6 sm:h-6 sm:w-8" />
      </div>
    </div>
  );
};

export default ITTFMatchComponent;
