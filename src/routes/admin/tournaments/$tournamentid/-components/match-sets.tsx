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

    const p1SetsWon = setScores.filter(s => s.p1_score >= 11 && s.p1_score > s.p2_score).length;
    const p2SetsWon = setScores.filter(s => s.p2_score >= 11 && s.p2_score > s.p1_score).length;
    const matchOver = p1SetsWon >= 3 || p2SetsWon >= 3;

    return (
        <>
            {setScores.map((set: Score, idx: number) => (
                <TableCell key={match.match.id + set.number}>
                    <div className='flex items-center gap-1'>
                        <Input
                            disabled={(idx >= Math.max(p1SetsWon, p2SetsWon) && matchOver && set.p1_score === 0 && set.p2_score === 0) || match.match.forfeit}
                            type="text"
                            value={set.p1_score === null ? '' : match.match.forfeit ? 0 : set.p1_score}
                            data-set={set.number}
                            data-participant="p1_score"
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
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const currentInput = e.target as HTMLInputElement;
                                    const currentRow = currentInput.closest('tr');
                                    if (!currentRow) return;
                                    const allInputs = Array.from(document.querySelectorAll('input[data-set][data-participant]:not(:disabled)')) as HTMLInputElement[];
                                    const currentIndex = allInputs.indexOf(currentInput);
                                    for (let i = currentIndex + 1; i < allInputs.length; i++) {
                                        const nextInput = allInputs[i];
                                        if (!nextInput.disabled) {
                                            nextInput.focus();
                                            nextInput.select();
                                            return;
                                        }
                                    }
                                    // If not found, do nothing (or optionally loop to first input)
                                }
                            }}
                            className="min-w-[44px] max-w-[56px] text-center text-base py-2 px-2 h-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
                            min="0"
                        />
                        <span className="text-base font-semibold">:</span>
                        <Input
                            type="text"
                            value={set.p2_score === null ? '' : match.match.forfeit ? 0 : set.p2_score}
                            data-set={set.number}
                            data-participant="p2_score"
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
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const currentInput = e.target as HTMLInputElement;
                                    const currentRow = currentInput.closest('tr');
                                    if (!currentRow) return;
                                    const allInputs = Array.from(document.querySelectorAll('input[data-set][data-participant]:not(:disabled)')) as HTMLInputElement[];
                                    const currentIndex = allInputs.indexOf(currentInput);
                                    for (let i = currentIndex + 1; i < allInputs.length; i++) {
                                        const nextInput = allInputs[i];
                                        if (!nextInput.disabled) {
                                            nextInput.focus();
                                            nextInput.select();
                                            return;
                                        }
                                    }
                                    // If not found, do nothing (or optionally loop to first input)
                                }
                            }}
                            className="min-w-[44px] max-w-[56px] text-center text-base py-2 px-2 h-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
                            min="0"
                            disabled={(idx >= Math.max(p1SetsWon, p2SetsWon) && matchOver && set.p2_score === 0 && set.p1_score === 0) || match.match.forfeit}
                        />
                    </div>
                </TableCell>
            ))}
        </>
    )
}