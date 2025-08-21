import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import React from "react";
import {
  distributeMatchesByTable,
  getFormattedDate,
} from "./schedule-utils";
import { useTranslation } from 'react-i18next';
import { MatchWrapper } from '@/types/matches';

export interface ScheduleProps {
  matches: MatchWrapper[];
  activeDay: number;
  timeSlots: {
    key: string;
    displayTime: string;
    timestamp: number;
  }[],
  tables: string[],
  uniqueGamedays: string[],
  safeDayIndex: number,
}

export const TournamentSchedule = ({
  matches,
  timeSlots,
  tables,
  uniqueGamedays,
  safeDayIndex,
}: ScheduleProps) => {
  const { t } = useTranslation()

  const matchesByTableAndTime = distributeMatchesByTable(matches);

  const formattedDate = getFormattedDate(uniqueGamedays[safeDayIndex] || '');

  const calculateGridColumns = () => {
    // Fixed width for the Laud column
    const labelColumn = "10rem";

    if (timeSlots.length === 1) {
      // For single timeslot, set a maximum width to prevent excessive stretching
      return `${labelColumn} minmax(16rem, 24rem)`;
    } else if (timeSlots.length === 2) {
      return `${labelColumn} repeat(${timeSlots.length}, minmax(14rem, 18rem))`;
    } else if (timeSlots.length <= 4) {
      // For 3-4 timeslots, balance width
      return `${labelColumn} repeat(${timeSlots.length}, minmax(12rem, 1fr))`;
    } else {
      // For many timeslots, make them narrower
      return `${labelColumn} repeat(${timeSlots.length}, minmax(12rem, 1fr))`;
    }
  };

  return (
    <>
      {tables.length > 0 && timeSlots.length > 0 ? (
        <div className="w-full pr-4 overflow-auto my-8">
          <div
            className="grid max-w-fit"
            style={{
              gridTemplateColumns: calculateGridColumns(),
              gap: "12px"
            }}
          >
            <div className="p-3 text-[#212121] text-center font-medium whitespace-nowrap">{matches[0].match.table_type == "champions_league" ? formattedDate : ""}</div>
            {timeSlots.map((timeSlot) => (
              <div
                key={timeSlot.displayTime}
                className="p-3"
              >
                {matches[0].match.table_type == "champions_league" ? timeSlot.displayTime : ""}
              </div>
            ))}

            {tables.map(tableId => (
              <React.Fragment key={tableId}>
                <div className="bg-[#3E6156] font-medium text-[#ececec] rounded-[2px] flex items-center justify-center p-3">
                  {t('competitions.timetable.table')} {tableId}
                </div>

                {/* Match cells for each timeslot */}
                {timeSlots.map((timeSlot) => (
                  <div
                    key={`${tableId}-${timeSlot.displayTime}`}
                    className="p-2 flex items-center justify-center"
                  >
                    <MatchList
                      matches={matchesByTableAndTime[tableId]?.[timeSlot.key] || []}
                    />
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center p-8 mt-2 border rounded-md bg-slate-50">
          <p className="text-gray-500">{t('competitions.errors.no_games')}</p>
        </div>
      )}
    </>
  );
};

interface MatchListProps {
  matches: MatchWrapper[];
}

// Helper function to truncate text with ellipsis
const truncateText = (text: string, maxLength: number) => {
  if (!text) return '';
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

const MatchList = ({ matches }: MatchListProps) => {
  if (!matches || !matches.length) {
    return null;
  }

  return (
    <div className="space-y-3 w-full" style={{}}>
      {matches.map((match) => (
        <MatchCard key={match.match.id} match={match} />
      ))}
    </div>
  );
};

interface MatchCardProps {
  match: MatchWrapper;
}

const MatchCard = ({ match }: MatchCardProps) => {
  const cardHeight = "7rem";
  const maxNameLength = 20;

  const p1NameTruncated = truncateText(match.p1?.name || 'TBD', maxNameLength);
  const p2NameTruncated = truncateText(match.p2?.name || 'TBD', maxNameLength);
  const { t } = useTranslation()


  return (
    <Dialog>
      <DialogTrigger asChild>
        <div
          className={`relative mx-auto px-4 py-6 border-y border-gray-300 hover:bg-slate-100 transition-colors cursor-pointer ${match.match.winner_id ? "bg-gray-100" : "bg-transparent"} w-full`}
          style={{ height: cardHeight }}
        >
          <div className='absolute right-1 top-0'>
            {match.class &&
              <span className="text-xs bg-[#EEEFF2] px-1 rounded">{match.class}</span>
            }

          </div>

          <div className={`flex flex-col h-full justify-around`}>
            <div className="flex justify-start space-x-4 items-center">
              <span className={`text-sm text-stone-700 ${match.match.winner_id === match.p1?.id ? "font-bold" : "font-medium"}`}>
                {p1NameTruncated}
              </span>
            </div>



            <div className="flex justify-between items-center">
              <span className={`text-sm text-stone-700 ${match.match.winner_id === match.p2?.id ? "font-bold" : "font-medium"}`}>
                {p2NameTruncated}
              </span>
            </div>
          </div>
        </div>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('competitions.timetable.match_details')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Player 1 Information */}
          <div className="border-b pb-3">
            <p className="font-medium text-sm text-gray-500 mb-1">{t('competitions.timetable.player_1')}:</p>
            <p className={`text-lg ${match.match.winner_id === match.p1?.id ? "font-bold" : ""}`}>
              {match.p1?.name || 'TBD'}
            </p>
          </div>

          {/* Player 2 Information */}
          <div className="border-b pb-3">
            <p className="font-medium text-sm text-gray-500 mb-1">{t('competitions.timetable.player_2')}:</p>
            <p className={`text-lg ${match.match.winner_id === match.p2?.id ? "font-bold" : ""}`}>
              {match.p2?.name || 'TBD'}
            </p>
          </div>

          {/* Match Details */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="font-medium text-sm text-gray-500 mb-1">{t('competitions.timetable.group')}:</p>
              <p>{match.class || 'N/A'}</p>
            </div>
            <div>
              <p className="font-medium text-sm text-gray-500 mb-1">{t('competitions.timetable.round')}:</p>
              <p>{match.match.round || '?'}</p>
            </div>
            <div>
              <p className="font-medium text-sm text-gray-500 mb-1">{t('competitions.timetable.type')}:</p>
              <p>{match.match.type === "winner" ? t('competitions.timetable.play_off') : t('competitions.timetable.group_match')}</p>
            </div>
            <div>
              <p className="font-medium text-sm text-gray-500 mb-1">{t('competitions.timetable.status')}:</p>
              <p>{match.match.winner_id ? t('competitions.timetable.status_completed') : t('competitions.timetable.status_pending')}</p>
            </div>
            {match.match.bracket && (
              <div>
                <p className="font-medium text-sm text-gray-500 mb-1">{t("competitions.timetable.bracket")}:</p>
                <p>{match.match.bracket === "1-2" ? t('competitions.timetable.final') : match.match.bracket}</p>
              </div>
            )}
          </div>

          {match.match.winner_id && (
            <div className="mt-3 pt-3 border-t">
              <p className="font-medium text-sm text-gray-500 mb-1">{t('competitions.timetable.winner')}:</p>
              <p className="font-bold">
                {match.match.winner_id === match.p1?.id ? match.p1?.name :
                  match.match.winner_id === match.p2?.id ? match.p2?.name : t('competitions.errors.winner_unknown')}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TournamentSchedule;