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
        <div className="border-l-2 border-gray-300 px-2 sm:px-3 py-2 bg-white rounded-r-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0">
                <span className="text-xs text-gray-500 order-first sm:order-none">{formatDateToNumber(last_game.match.start_date)}</span>
                <div className="flex items-center justify-between sm:justify-start sm:space-x-4 flex-1">
                    <span className="text-sm truncate max-w-[120px] sm:max-w-none">
                        {capitalizeWords(last_game.p1.name)}
                    </span>
                    <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm">{p1_score}</span>
                        <span className="text-xs">:</span>
                        <span className="font-bold text-sm">{p2_score}</span>
                    </div>
                    <span className="text-sm truncate max-w-[120px] sm:max-w-none">
                        {capitalizeWords(last_game.p2.name)}
                    </span>
                </div>
            </div>
        </div>
    )
}
