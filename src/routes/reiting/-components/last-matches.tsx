import { capitalizeWords, formatDateToNumber } from "@/lib/utils"
import { MatchWrapper, TableTennisExtraData } from "@/types/matches"
import { User } from "@/types/users"
import { Skeleton } from "@/components/ui/skeleton"

interface Props {
    last_game: MatchWrapper
    selectedUser: User
}
export const LastMatch = ({ last_game, selectedUser }: Props) => {

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
    // const calculateRatingGain = (winnerRating: number, loserRating: number, winnerWeight: number, loserWeight: number) => {
    //     const Rv = Math.abs(winnerRating - loserRating);
    //     let Hv = 0; // win value for winner
    //     let Hk = 0; // loss value for loser (positive, will be made negative)

    //     if (winnerRating >= loserRating) {
    //         if (Rv <= 10) {
    //             Hv = 2;
    //             Hk = 2;
    //         } else if (Rv >= 11 && Rv <= 30) {
    //             Hv = 1;
    //             Hk = 1;
    //         } else {
    //             Hv = 0;
    //             Hk = 0;
    //         }
    //     } else {
    //         const points = Math.round((Rv + 5) / 3);
    //         Hv = points;
    //         if (Hv > 15) {
    //             Hv = 15
    //         }
    //         Hk = points;
    //     }

    //     const coef = 1;
    //     let winnerKa = Math.min(winnerWeight, 30);
    //     const loserKa = Math.min(loserWeight, 30);
    //     winnerKa = 20

    //     const winnerRatingChange = (((Hv - 0) * 10) + (Hv * coef)) / (winnerKa + (Hv + 0));

    //     const loserRatingChange = (((0 - Hk) * 10) + (0 * coef)) / (loserKa + (0 + Hk));

    //     return {
    //         winnerGain: Math.round(winnerRatingChange),
    //         loserLoss: Math.round(loserRatingChange),
    //         winnerHv: Hv,
    //         loserHk: Hk,
    //         winnerRawChange: Hv,
    //         loserRawChange: -Hk
    //     };
    // };


    // const ratingChange = calculateRatingGain(
    //     last_game.match.winner_id === last_game.p1.id ? last_game.p1.players[0].extra_data.rate_points : last_game.p2.players[0].extra_data.rate_points,
    //     last_game.match.winner_id === last_game.p1.id ? last_game.p2.players[0].extra_data.rate_points : last_game.p1.players[0].extra_data.rate_points,
    //     22,
    //     15
    // );

    const p1Name = last_game.p1.name.toLowerCase()

    const isSelectedUserP1 = p1Name.includes(selectedUser.first_name.toLowerCase()) &&
        p1Name.includes(selectedUser.last_name.toLowerCase())
    const leftPlayer = isSelectedUserP1 ? last_game.p1 : last_game.p2
    const rightPlayer = isSelectedUserP1 ? last_game.p2 : last_game.p1
    const leftScore = isSelectedUserP1 ? p1_score : p2_score
    const rightScore = isSelectedUserP1 ? p2_score : p1_score

    return (
        <div className="border-l-2 border-gray-300 px-1 sm:px-3 py-1 sm:py-2 bg-white rounded-r-lg">
            <div className="flex flex-col space-y-1">
                <span className="text-xs text-gray-500">{formatDateToNumber(last_game.match.start_date)}</span>

                <div className="flex flex-col sm:hidden space-y-0.5">
                    <div className="flex items-center justify-between">
                        <span className="text-xs truncate flex-1">
                            {capitalizeWords(leftPlayer.name)}
                        </span>
                        <span className="font-bold text-xs">{leftScore}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs truncate flex-1">
                            {capitalizeWords(rightPlayer.name)}
                        </span>
                        <span className="font-bold text-xs">{rightScore}</span>
                    </div>
                </div>

                <div className="hidden sm:flex items-center">
                    <span className="text-sm truncate flex-1 text-left min-w-0">
                        {capitalizeWords(leftPlayer.name)}
                    </span>
                    <div className="flex items-center space-x-2 shrink-0 px-3">
                        <span className="font-bold text-sm">{leftScore}</span>
                        <span className="text-xs">:</span>
                        <span className="font-bold text-sm">{rightScore}</span>
                    </div>
                    <span className="text-sm truncate flex-1 text-right min-w-0">
                        {capitalizeWords(rightPlayer.name)}
                    </span>
                </div>
            </div>
        </div>
    )
}

export const LastMatchSkeleton = () => {
    return (
        <div className="border-l-2 border-gray-300 px-1 sm:px-3 py-1 sm:py-2 bg-white rounded-r-lg">
            <div className="flex flex-col space-y-1">
                <Skeleton className="h-3 w-16 mb-1" />

                <div className="flex flex-col sm:hidden space-y-0.5">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-3 w-20 flex-1" />
                        <Skeleton className="h-3 w-4" />
                    </div>
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-3 w-24 flex-1" />
                        <Skeleton className="h-3 w-4" />
                    </div>
                </div>

                <div className="hidden sm:flex items-center">
                    <Skeleton className="h-4 w-24 flex-1" />
                    <div className="flex items-center space-x-2 shrink-0 px-3">
                        <Skeleton className="h-4 w-4" />
                        <span className="text-xs">:</span>
                        <Skeleton className="h-4 w-4" />
                    </div>
                    <Skeleton className="h-4 w-28 flex-1" />
                </div>
            </div>
        </div>
    )
}
