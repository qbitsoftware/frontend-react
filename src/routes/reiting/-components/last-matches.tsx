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
        <div className="border-l-2 border-gray-300 px-1 sm:px-3 py-1 sm:py-2 bg-white rounded-r-lg">
            <div className="flex flex-col space-y-1">
                <span className="text-xs text-gray-500">{formatDateToNumber(last_game.match.start_date)}</span>

                {/* Mobile layout: stacked players */}
                <div className="flex flex-col sm:hidden space-y-0.5">
                    <div className="flex items-center justify-between">
                        <span className="text-xs truncate flex-1">
                            {capitalizeWords(last_game.p1.name)}
                        </span>
                        <span className="font-bold text-xs">{p1_score}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs truncate flex-1">
                            {capitalizeWords(last_game.p2.name)}
                        </span>
                        <span className="font-bold text-xs">{p2_score}</span>
                    </div>
                </div>

                {/* Desktop layout: horizontal */}
                <div className="hidden sm:flex items-center">
                    <span className="text-sm truncate flex-1 text-left min-w-0">
                        {capitalizeWords(last_game.p1.name)}
                    </span>
                    <div className="flex items-center space-x-2 shrink-0 px-3">
                        <span className="font-bold text-sm">{p1_score}</span>
                        <span className="text-xs">:</span>
                        <span className="font-bold text-sm">{p2_score}</span>
                    </div>
                    <span className="text-sm truncate flex-1 text-right min-w-0">
                        {capitalizeWords(last_game.p2.name)}
                    </span>
                </div>
            </div>
        </div>
    )
}
