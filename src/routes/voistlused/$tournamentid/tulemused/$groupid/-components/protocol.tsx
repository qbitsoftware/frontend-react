import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { StatisticsCard } from './statistics-card'
import { useTranslation } from 'react-i18next'
import { MatchWrapper } from '@/types/matches'
import { UseGetMatch } from '@/queries/match'
import { useEffect, useState } from 'react'

interface ProtocolProps {
    isModalOpen: boolean,
    handleModalChange: (open: boolean) => void
    selectedMatch: MatchWrapper
    isRoundRobinFull: boolean,
    isMeistrikad: boolean,
    groupId: number,
    tournamentId: number
}

const Protocol = ({
    isModalOpen,
    handleModalChange,
    selectedMatch,
    tournamentId,
    groupId }: ProtocolProps) => {

    const { t } = useTranslation()

    const { data: protocol, isLoading } = UseGetMatch(tournamentId, groupId, selectedMatch.match.id)

    const [isMounted, setIsMounted] = useState<boolean>(false)

    useEffect(() => {
        if (protocol?.data?.match.match.id === selectedMatch.match.id) {
            setIsMounted(true)
        }
    }, [selectedMatch, protocol])

    return (
        <Dialog open={isModalOpen} onOpenChange={handleModalChange}>
            <DialogContent
                aria-describedby={`match-protocol-${selectedMatch?.match.id}`}
                className="max-w-[1200px] h-[90vh] px-1 md:p-4 mx-auto flex flex-col"
            >
                {isMounted && !isLoading && (
                    <>
                        <DialogTitle className="text-lg text-center font-semibold">
                            {t("competitions.timetable.match_details")}
                        </DialogTitle>

                        <div className="flex-1 overflow-auto">
                            {protocol && (
                                <StatisticsCard
                                    key={selectedMatch.match.id}
                                    protocol={protocol?.data ?? undefined}
                                    index={selectedMatch.match.round}
                                />
                            )}
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}

export default Protocol