import { capitalizeWords, formatDateToNumber } from "@/lib/utils"
import { MatchWrapper, TableTennisExtraData } from "@/types/matches"

interface Props {
    last_game: MatchWrapper
}
export const LastMatch = ({ last_game }: Props) => {

    const calcScore = (extra_data: TableTennisExtraData) => {
        let p1_score = 0
        let p2_score = 0
        if (extra_data.score) {
            extra_data.score.map((score) => {
                if (score.p1_score >= 11 && score.p1_score - score.p2_score >= 2) {
                    p1_score++
                }
                if (score.p2_score >= 11 && score.p2_score - score.p1_score >= 2) {
                    p2_score++
                }
            })
        }
        return { p1_score, p2_score }
    }

    const { p1_score, p2_score } = calcScore(last_game.match.extra_data)
    return (
        <div className="flex items-center justify-between border-l-2 border-gray-300 px-3 py-2 bg-white">
            <div className="flex items-center space-x-4">
                <span className="text-xs text-gray-500">{formatDateToNumber(last_game.match.start_date)}</span>
                <span className="text-sm">
                    {capitalizeWords(last_game.p1.name)}
                </span>
                <span className="font-bold text-sm">{p1_score}</span>
                <span className="text-xs">:</span>
                <span className="font-bold text-sm">{p2_score}</span>
                <span className="text-sm">{capitalizeWords(last_game.p2.name)}</span>
            </div>
        </div>
    )
}
