import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useState } from 'react'
import { UsePatchMatch } from '@/queries/match'
import { useProtocolModal } from '@/providers/protocolProvider';
import { toast } from 'sonner';
import { MatchWrapper } from '@/types/matches'
import { useTranslation } from 'react-i18next'

const Forfeit = ({ match }: { match: MatchWrapper }) => {
    const {
        tournamentId,
        forfeitMatch,
        setForfeitMatch
    } = useProtocolModal()

    const [winnerId, setWinnerId] = useState<string>("")
    const [error, setError] = useState<string>("")

    const { t } = useTranslation()

    const { mutateAsync: updateMatch } = UsePatchMatch(
        tournamentId,
        match.match.tournament_table_id,
        match.match.id)

    const handleForfeit = async () => {
        try {
            setError("")
            const send_match = match.match
            if (winnerId != "") {
                send_match.winner_id = winnerId
                send_match.forfeit = true
                await updateMatch(send_match)
                setForfeitMatch(null)
            } else {
                setError(t('protocol.forfeit.select_winner_error'))
            }
        } catch (error) {
            void error;
            toast.error(t('toasts.protocol_modals.forfeit_error'))
        }
    }


    const deleteForfeit = async () => {
        try {
            setError("")
            const send_match = match.match
            send_match.winner_id = ""
            send_match.forfeit = false
            await updateMatch(send_match)
            setForfeitMatch(null)
        } catch (error) {
            void error;
            toast.error(t('toasts.protocol_modals.forfeit_delete_error'))
        }
    }

    return (
        <Dialog open={forfeitMatch !== null} onOpenChange={() => setForfeitMatch(null)} >
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{t('protocol.forfeit.title')}</DialogTitle>
                    <DialogDescription>
                        {t('protocol.forfeit.description')}
                    </DialogDescription>
                </DialogHeader>
                <div className='mt-4'>
                    <RadioGroup value={winnerId} onValueChange={(value) => setWinnerId(value)}>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value={match.p1.id} id="player1" />
                            <Label htmlFor="player1">{match.p1.name == "" ? t('protocol.forfeit.no_player_chosen') : match.p1.name}</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value={match.p2.id} id="player2" />
                            <Label htmlFor="player2">{match.p2.name == "" ? t('protocol.forfeit.no_player_chosen') : match.p2.name}</Label>
                        </div>
                    </RadioGroup>
                </div>
                <div className="flex justify-end flex-col md:flex-row gap-2 mt-6">
                    <Button variant="destructive" onClick={deleteForfeit}>{t('protocol.forfeit.delete')}</Button>
                    <Button variant="outline" onClick={() => setForfeitMatch(null)}>{t('protocol.forfeit.back')}</Button>
                    <Button onClick={handleForfeit} disabled={winnerId === null}>{t('protocol.forfeit.delete_confirm')}</Button>
                </div>
                <div>
                    <p className='text-red-500'>
                        {error != '' && error}
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default Forfeit