import { Input } from '@/components/ui/input'
import { TableCell } from '@/components/ui/table'
import { UsePatchMatch } from '@/queries/match'
import { MatchWrapper, Score } from '@/types/matches'
import { useParams } from '@tanstack/react-router'
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner';

interface MatchSetProps {
    match: MatchWrapper
}

export const MatchSets: React.FC<MatchSetProps> = ({ match }) => {
    const [setScores, setSetScores] = useState<Score[]>([])
    const { tournamentid } = useParams({ strict: false })
    const updateMatchMutation = UsePatchMatch(Number(tournamentid))

    const { t } = useTranslation()

    useEffect(() => {
        const backendScores = match.match.extra_data.score
            ? match.match.extra_data.score.sort((a: Score, b: Score) => a.number - b.number)
            : [];
        const fixedScores: Score[] = [];
        for (let i = 1; i <= 5; i++) {
            const score = backendScores.find((s: Score) => s.number === i);
            fixedScores.push(score || { number: i, p1_score: 0, p2_score: 0 });
        }
        setSetScores(fixedScores);
    }, [match, match.match.extra_data.score]);

    const handleScoreChange = async (
        number: number,
        participant: 'p1_score' | 'p2_score',
        value: string
    ) => {
        const score = value === '' ? null : Number(value)
        const newScores = setScores.map((set) =>
            set.number === number ? { ...set, [participant]: score } : set
        )

        setSetScores(newScores)

        if (score !== null) {
            const updatedMatch = {
                ...match.match,
                extra_data: {
                    ...match.match.extra_data,
                    score: newScores,
                },
            }
            try {
                await updateMatchMutation.mutateAsync({ group_id: match.match.tournament_table_id, match_id: match.match.id, match: updatedMatch })
            } catch (error) {
                void error
                toast.error(t('toasts.protocol_modals.updated_match_score_error'))
            }
        }
    }

    //test
    return (
        <>
            {setScores.map((set: Score) => (
                <TableCell key={match.match.id + set.number}>
                    <div className='flex items-center gap-1'>
                        <Input
                            type="text"
                            value={set.p1_score === null ? '' : match.match.forfeit ? 0 : set.p1_score}
                            // onChange={(e) => handleScoreChange(set.number, 'p1_score', e.target.value)}
                            onChange={(e) => {
                                const value = e.target.value;

                                if (value === "") {
                                    handleScoreChange(set.number, 'p1_score', "0")
                                    return;
                                }

                                if (!/^\d*$/.test(value)) {
                                    return;
                                }

                                const cleanedValue = value.replace(/^0+(\d)/, '$1');
                                const numberValue = cleanedValue === '' ? 0 : Number.parseInt(cleanedValue);

                                handleScoreChange(set.number, 'p1_score', numberValue.toString())
                            }}
                            className="min-w-[60px] text-center"
                            min="0"
                            disabled={match.match.forfeit}
                        />
                        <span>:</span>
                        <Input
                            type="text"
                            value={set.p2_score === null ? '' : match.match.forfeit ? 0 : set.p2_score}
                            // onChange={(e) => handleScoreChange(set.number, 'p2_score', e.target.value)}
                            onChange={(e) => {
                                const value = e.target.value;

                                if (value === "") {
                                    handleScoreChange(set.number, 'p2_score', "0")
                                    return;
                                }

                                if (!/^\d*$/.test(value)) {
                                    return;
                                }

                                const cleanedValue = value.replace(/^0+(\d)/, '$1');
                                const numberValue = cleanedValue === '' ? 0 : Number.parseInt(cleanedValue);

                                handleScoreChange(set.number, 'p2_score', numberValue.toString())
                            }}
                            className="min-w-[60px] text-center"
                            min="0"
                            disabled={match.match.forfeit}
                        />
                    </div>
                </TableCell>
            ))}
        </>
    )
}