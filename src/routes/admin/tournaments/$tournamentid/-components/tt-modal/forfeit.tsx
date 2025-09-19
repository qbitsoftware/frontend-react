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
import { ForFeitType } from '@/components/match-dialog'

const Forfeit = ({ match }: { match: MatchWrapper }) => {
    const {
        tournamentId,
        forfeitMatch,
        setForfeitMatch
    } = useProtocolModal()

    const [winnerId, setWinnerId] = useState<string>(match.match.winner_id || "")
    const [forfeitType, setForfeitType] = useState<ForFeitType>(match.match.forfeit_type || "WO")
    const [error, setError] = useState<string>("")

    const { t } = useTranslation()

    const { mutateAsync: updateMatch } = UsePatchMatch(tournamentId)

    const handleForfeit = async () => {
        try {
            setError("")
            const send_match = match.match
            if (winnerId != "") {
                send_match.winner_id = winnerId
                send_match.forfeit = true
                send_match.forfeit_type = forfeitType
                await updateMatch({ match_id: match.match.id, group_id: match.match.tournament_table_id, match: send_match })
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
            send_match.forfeit_type = ""
            await updateMatch({ match_id: match.match.id, group_id: match.match.tournament_table_id, match: send_match })
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
                    <DialogTitle>{t('protocol.match_outcome.title', 'Match Outcome')}</DialogTitle>
                    <DialogDescription>
                        {t('protocol.match_outcome.description', 'Select the type of match outcome and winner')}
                    </DialogDescription>
                </DialogHeader>

                {/* Forfeit Type Selection */}
                <div className='mt-4'>
                    <Label className="text-sm font-medium mb-3 block">
                        {t('protocol.match_outcome.type', 'Outcome Type')}
                    </Label>
                    <RadioGroup value={forfeitType} onValueChange={(value: ForFeitType) => setForfeitType(value)} className="grid grid-cols-3 gap-4 mb-6">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="WO" id="walkover" />
                            <Label htmlFor="walkover" className="text-sm font-medium">
                                {t("protocol.match_outcome.walkover", "WO")}
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="RET" id="retirement" />
                            <Label htmlFor="retirement" className="text-sm font-medium">
                                {t("protocol.match_outcome.retirement", "RET")}
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="DSQ" id="disqualification" />
                            <Label htmlFor="disqualification" className="text-sm font-medium">
                                {t("protocol.match_outcome.disqualification", "DSQ")}
                            </Label>
                        </div>
                    </RadioGroup>
                </div>

                {/* Winner Selection */}
                <div>
                    <Label className="text-sm font-medium mb-3 block">
                        {forfeitType === "WO" && t("protocol.match_outcome.walkover_description", "Select winner by walkover")}
                        {forfeitType === "RET" && t("protocol.match_outcome.retirement_description", "Select winner by retirement")}
                        {forfeitType === "DSQ" && t("protocol.match_outcome.disqualification_description", "Select winner by disqualification")}
                    </Label>
                    <RadioGroup value={winnerId} onValueChange={(value) => setWinnerId(value)} className="space-y-3">
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
                    <Button variant="destructive" onClick={deleteForfeit}>
                        {t('protocol.forfeit.delete', 'Reset Match')}
                    </Button>
                    <Button variant="outline" onClick={() => setForfeitMatch(null)}>
                        {t('protocol.forfeit.back', 'Cancel')}
                    </Button>
                    <Button onClick={handleForfeit} disabled={winnerId === ""}>
                        {t('protocol.forfeit.delete_confirm', 'Confirm')}
                    </Button>
                </div>

                {error && (
                    <div>
                        <p className='text-red-500 text-sm'>
                            {error}
                        </p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}

export default Forfeit