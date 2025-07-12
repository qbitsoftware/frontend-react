import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { UseUpdateMatchTime } from '@/queries/match'
import { MatchTimeUpdate, MatchWrapper } from '@/types/matches'
import { RoundTime } from '@/types/tournaments'
import { useTranslation } from 'react-i18next'

interface TimeEditingModalProps {
    tournamentId: number
    tournamentTableId: number
    matches: MatchWrapper[],
    isOpen: boolean
    onClose: () => void
}

const TimeEditingModal: React.FC<TimeEditingModalProps> = ({ tournamentId, isOpen, onClose, matches, tournamentTableId }) => {
    const [rounds, setRounds] = useState<RoundTime[]>([])
    const [loading, setLoading] = useState(false)
    const [modifiedRounds, setModifiedRounds] = useState<Set<string>>(new Set())
    const timeMutation = UseUpdateMatchTime(tournamentId, tournamentTableId)

    const { t } = useTranslation()

    useEffect(() => {
        if (isOpen && matches && matches.length > 0) {
            extractRoundsFromMatches(matches)
            setModifiedRounds(new Set())
        }
    }, [isOpen, matches])

    const extractRoundsFromMatches = (matches: MatchWrapper[]) => {
        try {
            setLoading(true)

            const matchesByRound = new Map<string, MatchWrapper>();

            matches.forEach(match => {
                const round = match.match.round;
                let key = ""
                if (match.match.type === "winner") {
                    key = "W-" + round;
                } else if (match.match.type === "round") {
                    key = "R-" + round;
                }
                if (!matchesByRound.has(key)) {
                    matchesByRound.set(key, match);
                }
            });

            const extractedRounds: RoundTime[] = Array.from(matchesByRound.entries())
                .sort(([roundA], [roundB]) => Number(roundA.split("-")[1]) - Number(roundB.split("-")[1]))
                .map(([roundNumber, match]) => {
                    let dateStr = "";
                    let timeStr = "12:00";

                    if (match.match.start_date) {
                        const date = new Date(match.match.start_date);

                        if (!isNaN(date.getTime())) {
                            const year = date.getFullYear().toString().padStart(4, '0');
                            const month = (date.getMonth() + 1).toString().padStart(2, '0');
                            const day = date.getDate().toString().padStart(2, '0');

                            dateStr = `${year}-${month}-${day}`;

                            const hours = date.getHours().toString().padStart(2, '0');
                            const minutes = date.getMinutes().toString().padStart(2, '0');
                            timeStr = `${hours}:${minutes}`;
                        }
                    }

                    let name = ""
                    if (match.match.type === "winner") {
                        name = t('admin.tournaments.groups.participants.change_time.play_off') + " " + roundNumber.split("-")[1]
                    } else {
                        name = t('admin.tournaments.groups.participants.change_time.round') + " " + roundNumber.split("-")[1]
                    }
                    return {
                        id: roundNumber,
                        name,
                        date: dateStr,
                        time: timeStr,
                        location: match.match.location,
                    };
                });

            setRounds(extractedRounds);
        } catch (error) {
            void error;
            toast.error(t('toasts.participants.round_process_error'));

            setRounds([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDateChange = (id: string, date: string) => {
        setRounds(rounds.map(round =>
            round.id === id ? { ...round, date } : round
        ))
        setModifiedRounds(prev => new Set(prev).add(id))
    }

    const handleTimeChange = (id: string, time: string) => {
        setRounds(rounds.map(round =>
            round.id === id ? { ...round, time } : round
        ))
        setModifiedRounds(prev => new Set(prev).add(id))
    }

    const handleLocationChange = (id: string, location: string) => {
        setRounds(rounds.map(round =>
            round.id === id ? { ...round, location } : round
        ))
        setModifiedRounds(prev => new Set(prev).add(id))
    }

    const handleSubmit = async () => {
        setLoading(true)
        try {
            const updatedRoundData = new Map<string, { date: string, time: string, location: string }>();

            rounds.forEach(round => {
                if (modifiedRounds.has(round.id)) {
                    updatedRoundData.set(round.id, {
                        date: round.date,
                        time: round.time,
                        location: round.location
                    });
                }
            });

            const matchTimeUpdates: MatchTimeUpdate[] = matches
                .filter(match => modifiedRounds.has(match.match.type === "winner" ? "W-" + match.match.round : "R-" + match.match.round))
                .map(match => {
                    const roundData = updatedRoundData.get(match.match.type === "winner" ? "W-" + match.match.round : "R-" + match.match.round);
                    if (!roundData) return null;

                    const date = new Date(`${roundData.date}T${roundData.time}:00`);


                    const m: MatchTimeUpdate = {
                        match_id: match.match.id,
                        start_date: date.toISOString(),
                        location: roundData.location,
                    };

                    return m
                })
                .filter((update): update is MatchTimeUpdate => update !== null);

            await timeMutation.mutateAsync(matchTimeUpdates)
            toast.success(t('toasts.participants.time_change_success'))
        } catch (err) {
            void err;
            toast.error(t('toasts.participants.time_change_error'))
        }
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>
                        {t('admin.tournaments.groups.participants.change_time.title')}
                    </DialogTitle>
                </DialogHeader>

                <div className="py-4 overflow-y-auto flex-grow pr-2">
                    {loading ? (
                        <div className="flex justify-center">{t('protocol.loading')}</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {rounds.map(round => (
                                <div key={round.id} className="border rounded-md p-3">
                                    <Label className="font-medium block mb-2">
                                        {round.name}
                                    </Label>
                                    <div className="grid grid-cols-2 gap-2 mb-2">
                                        <div>
                                            <Label htmlFor={`date-${round.id}`} className="text-xs text-muted-foreground">
                                                {t('admin.tournaments.groups.participants.change_time.date', 'Date')}
                                            </Label>
                                            <Input
                                                id={`date-${round.id}`}
                                                type="date"
                                                value={round.date}
                                                onChange={(e) => handleDateChange(round.id, e.target.value)}
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor={`time-${round.id}`} className="text-xs text-muted-foreground">
                                                {t('admin.tournaments.groups.participants.change_time.time', 'Time')}
                                            </Label>
                                            <Input
                                                id={`time-${round.id}`}
                                                type="time"
                                                value={round.time}
                                                onChange={(e) => handleTimeChange(round.id, e.target.value)}
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor={`location-${round.id}`} className="text-xs text-muted-foreground">
                                            {t('admin.tournaments.groups.participants.change_time.location', 'Location')}
                                        </Label>
                                        <Input
                                            id={`location-${round.id}`}
                                            type="text"
                                            placeholder="Location"
                                            value={round.location}
                                            onChange={(e) => handleLocationChange(round.id, e.target.value)}
                                            className="mt-1"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-4 pt-2 bg-background border-t mt-auto">
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        {t('admin.tournaments.groups.participants.change_time.cancel')}
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {t('admin.tournaments.groups.participants.change_time.save')}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default TimeEditingModal
