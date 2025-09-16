import { Progress } from '@/components/ui/progress'
import { MatchState } from '@/types/matches'
import { UseGetTournamentMatchesQuery } from '@/queries/match'
import { useTranslation } from 'react-i18next'
import { useMemo } from 'react'

interface TournamentProgressProps {
  tournamentId: number
}

export const TournamentProgress: React.FC<TournamentProgressProps> = ({ tournamentId }) => {
  const { t } = useTranslation()
  const { data: matchData } = UseGetTournamentMatchesQuery(tournamentId)

  const tournamentProgress = useMemo(() => {
    if (!matchData?.data) return { totalMatches: 0, finishedMatches: 0, remainingMatches: 0, progressPercentage: 0 }

    const totalMatches = matchData.data.matches.length
    const finishedMatches = matchData.data.matches.filter(match => match.match.state === MatchState.FINISHED).length
    const remainingMatches = totalMatches - finishedMatches
    const progressPercentage = totalMatches > 0 ? Math.round((finishedMatches / totalMatches) * 100) : 0

    return { totalMatches, finishedMatches, remainingMatches, progressPercentage }
  }, [matchData?.data])

  return (
    <div className="bg-gray-50 p-3 rounded-lg border mb-0">
      <Progress value={tournamentProgress.progressPercentage} className="h-2 mb-2" />
      <div className="flex justify-between text-xs text-gray-600">
        <span>{t("admin.tournaments.progress.finished")}: {tournamentProgress.finishedMatches} ({tournamentProgress.progressPercentage}%)</span>
        <span>{t("admin.tournaments.progress.remaining")}: {tournamentProgress.remainingMatches}</span>
        <span>{t("admin.tournaments.progress.total")}: {tournamentProgress.totalMatches}</span>
      </div>
    </div>
  )
}
