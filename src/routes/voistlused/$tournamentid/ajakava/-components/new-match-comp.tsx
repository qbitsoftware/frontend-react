import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { cn, formatDateGetDayMonthYear, formatDateGetHours } from "@/lib/utils";
import { TournamentTable } from "@/types/groups";
import { MatchWrapper } from "@/types/matches";
import { Participant } from "@/types/participants";
import { AvatarFallback } from "@radix-ui/react-avatar";
import { Skeleton } from "@/components/ui/skeleton";
import blueprofile from "@/assets/blue-profile.png";
import { Clock, MapPin } from "lucide-react";

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

const ITTFMatchComponent = ({ match, table_data }: ITTFMatchComponentProps) => {
  if (!table_data) {
    return <Skeleton className="h-20 w-full" />;
  }

  const isMatchCompleted = match.match.winner_id !== "";
  const matchDate = match.match.start_date;

  return (
    <Card className="pb-0 border-[#EFF0EF] !shadow-scheduleCard hover:shadow-lg transition-shadow duration-200">
      <div className="flex flex-col p-4">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-700">
              {table_data.class}
            </p>
          </div>

          {/* Match Score or Status */}
          <div className="text-right">
            {isMatchCompleted ? (
              <div>
                <p className="text-2xl font-bold">
                  {match.match.extra_data.team_1_total}:
                  {match.match.extra_data.team_2_total}
                </p>
                <p className="text-xs text-gray-500 mt-1">Completed</p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">Upcoming</p>
                {matchDate && (
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDateGetHours(matchDate)}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {matchDate && (
          <div className="flex items-center gap-2 mb-3 text-xs text-gray-600 bg-gray-50 rounded-md px-2 py-1.5">
            <Clock className="h-3 w-3" />
            <span>{formatDateGetDayMonthYear(matchDate)}</span>
            <span className="font-semibold">
              {formatDateGetHours(matchDate)}
            </span>
          </div>
        )}

        <div className="flex flex-col gap-3 mb-3">
          <ITTFMatchUserComponent
            participant={match.p1}
            match={match}
            isWinner={match.match.winner_id === match.p1.id}
            table_data={table_data}
            playerNumber={1}
          />

          {/* VS Divider */}
          <div className="flex items-center gap-2 px-2">
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
        <div className="pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            {/* Location & Table */}
            <div className="flex items-center gap-3">
              {match.match.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{match.match.location}</span>
                </div>
              )}
              {match.match.extra_data.table && (
                <div className="flex items-center gap-1">
                  <span className="font-medium">
                    Table {match.match.extra_data.table}
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

  const totalScore =
    playerNumber === 1
      ? match.match.extra_data.team_1_total
      : match.match.extra_data.team_2_total;

  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-lg p-2 transition-colors",
        isWinner && "bg-green-50 border border-green-200",
      )}
    >
      <div className="flex items-center gap-3 flex-1">
        <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
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
              className="rounded-full h-10 w-10"
              alt="Player"
            />
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <p
            className={cn(
              "text-sm",
              isWinner ? "font-semibold text-gray-900" : "text-gray-700",
            )}
          >
            {truncateName(participant.name, 15)}
          </p>
        </div>
      </div>

      {/* Score Section */}
      <div className="flex items-center gap-3">
        {/* Set Scores */}
        {match.match.extra_data.score &&
          match.match.extra_data.score.length > 0 && (
            <div className="flex gap-1.5">
              {match.match.extra_data.score.map((set, index) => {
                const score = playerNumber === 1 ? set.p1_score : set.p2_score;
                const opponentScore =
                  playerNumber === 1 ? set.p2_score : set.p1_score;
                const wonSet = score > opponentScore;

                return (
                  <div
                    key={index}
                    className={cn(
                      "min-w-[20px] text-center text-xs font-medium px-1 py-0.5 rounded",
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
            "text-xl font-bold min-w-[30px] text-right",
            isWinner ? "text-green-700" : "text-gray-700",
          )}
        >
          {totalScore}
        </div>
      </div>
    </div>
  );
};

const SkeletonMatchUserComponent = () => {
  return (
    <div className="flex items-center justify-between w-full p-2">
      <div className="flex items-center gap-3 flex-1">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-4 w-24 mb-1" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex gap-1.5">
          {Array(3)
            .fill(0)
            .map((_, index) => (
              <Skeleton key={index} className="h-5 w-5" />
            ))}
        </div>
        <Skeleton className="h-6 w-8" />
      </div>
    </div>
  );
};

export default ITTFMatchComponent;
