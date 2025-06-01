import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { cn, formatDateGetDayMonthYear, formatDateGetHours } from "@/lib/utils";
import { TournamentTable } from "@/types/groups";
import { GroupType, MatchWrapper } from "@/types/matches";
import { Participant } from "@/types/participants";
import { AvatarFallback } from "@radix-ui/react-avatar";
import { Skeleton } from "@/components/ui/skeleton";
import blueprofile from "@/assets/blue-profile.png"

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

  return (
    <Card className="  pb-0 border-[#EFF0EF] !shadow-scheduleCard">
      <div className="flex flex-col gap-1 p-4">
        {/* header */}
        <div className="flex justify-between mb-4">
          <div>
            <p className="text-lg font-medium">{table_data.class}</p>
            
          </div>
          
          <div className="text-2xl">
            {match.match.winner_id !== "" ? (
              `${match.match.extra_data.team_1_total}:${match.match.extra_data.team_2_total}`
            ) : (
              <Skeleton className="h-8 w-12" />
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 pb-2">
          <ITTFMatchUserComponent
            participant={match.p1}
            match={match}
            isWinner={match.match.winner_id == match.p1.id}
            table_data={table_data}
          />
          <ITTFMatchUserComponent
            participant={match.p2}
            match={match}
            isWinner={match.match.winner_id == match.p2.id}
            table_data={table_data}
          />
        </div>
        <div className="py-4 pb-0 border-t text-center">
            {table_data.type == GroupType.CHAMPIONS_LEAGUE && (
              <p className="text-xs">
                {formatDateGetDayMonthYear(match.match.start_date)} -{" "}
                <span className="font-bold">
                  {formatDateGetHours(match.match.start_date)}
                </span>
                {match.match.extra_data.table
                  ? ` | Laud ${match.match.extra_data.table}`
                  : ""}
              </p>
            )}
            <p className="text-xs">{match.match.location}</p>
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
}

const ITTFMatchUserComponent = ({
  participant,
  isWinner,
  match,
  table_data,
}: ITTFMatchUserComponentProps) => {
  if (!participant || participant.id == "") {
    return <SkeletonMatchUserComponent />;
  }
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage
            src={
              table_data.solo
                ? participant.players[0].extra_data.image_url
                : participant.extra_data.image_url
            }
            className="cursor-pointer object-cover"
          />
          <AvatarFallback>
            <img
              src={blueprofile}
              className="rounded-full h-8 w-8"
              alt="Club"
            />
          </AvatarFallback>
        </Avatar>
        <p className={cn(isWinner ? "font-bold" : "", "md:w-24")}>
          {truncateName(participant.name)}
        </p>
              </div>
              {match.p1.id == participant.id ? (
          <span className={cn(isWinner ? "font-bold" : "")}>
            {match.match.extra_data.team_1_total}
          </span>
        ) : (
          <span className={cn(isWinner ? "font-bold" : "")}>
            {match.match.extra_data.team_2_total}
          </span>
        )}
      <div className="flex">
        <div className="flex gap-2 justify-end">
          {match.match.extra_data.score &&
            match.match.extra_data.score.map((set, index) => {
              return (
                <div key={index} className="w-2 text-center mx-1 text-gray-600">
                  {match.p1.id == participant.id ? (
                    <p>{set.p1_score}</p>
                  ) : (
                    <p>{set.p2_score}</p>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

const SkeletonMatchUserComponent = () => {
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-6" />
      </div>
      <div className="flex gap-3">
        <div className="flex gap-2">
          {Array(5)
            .fill(0)
            .map((_, index) => (
              <div key={index} className="flex gap-2">
                <Skeleton className="h-4 w-4" />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ITTFMatchComponent;

