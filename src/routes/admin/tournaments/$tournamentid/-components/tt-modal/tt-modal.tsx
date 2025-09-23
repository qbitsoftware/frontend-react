import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProtocolDownloadButton } from "../download-protocol";
import { X } from "lucide-react";
import { useProtocolModal } from "@/providers/protocolProvider";
import { Content } from "./content";
import { useTranslation } from "react-i18next";
import { LotterySheetDownload } from "../download-lottery-sheet";


export const TableTennisProtocolModal = () => {
    const { t } = useTranslation()
    const { isOpen, onClose, tournamentId, match } = useProtocolModal()

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[calc(100vh-2rem)] max-w-[90vw] md:max-w-[80vw] overflow-y-scroll flex flex-col p-0">
                <DialogHeader className="bg-background p-3 md:px-4 border-b sticky top-0 z-10">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-base font-medium flex items-center gap-2">
                            <span>{t("protocol.title")}:</span>
                            <span className="font-bold">{match.p1.name}</span>
                            <span>vs</span>
                            <span className="font-bold">{match.p2.name}</span>
                            <ProtocolDownloadButton
                                tournamentId={tournamentId}
                                groupId={match.match.tournament_table_id}
                                matchId={match.match.id}
                            />
                            <LotterySheetDownload
                                tournamentId={tournamentId}
                                groupId={match.match.tournament_table_id}
                                matchId={match.match.id}
                            />
                        </DialogTitle>
                        <div className="flex items-center gap-2">
                            <X className="cursor-pointer h-5 w-5" onClick={onClose} />
                        </div>
                    </div>
                </DialogHeader>
                <Content />
            </DialogContent>
        </Dialog>
    )
}