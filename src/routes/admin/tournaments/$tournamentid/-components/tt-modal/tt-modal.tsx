import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProtocolDownloadButton } from "../download-protocol";
import { X } from "lucide-react";
import { useProtocolModal } from "@/providers/protocolProvider";
import { Content } from "./content";
import { useTranslation } from "react-i18next";
import { LotterySheetDownload } from "../download-lottery-sheet";
import { TableNumberForm } from "../table-number-form";


export const TableTennisProtocolModal = () => {
    const { t } = useTranslation()
    const { isOpen, onClose, tournamentId, match } = useProtocolModal()

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[calc(100vh-2rem)] max-w-[90vw] md:max-w-[80vw] overflow-y-scroll flex flex-col p-0">
                <DialogHeader className="bg-background p-3 md:px-4 border-b sticky top-0 z-10">
                    <div className="md:hidden">
                        <DialogTitle className="text-base font-medium">
                            <div className="relative flex items-center justify-center w-full mb-2">
                                <div className="flex flex-col">
                                    <span className="text-center">{t("protocol.title")}: </span>
                                    <div>{match.p1.name} vs {match.p2.name}</div>
                                    <TableNumberForm
                                        match={match.match}
                                        initialTableNumber={match.match.extra_data?.table}
                                        brackets={false}
                                    />
                                </div>
                                <X className="cursor-pointer h-5 w-5 absolute right-0" onClick={onClose} />
                            </div>
                            <div className="flex justify-center">
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
                            </div>
                        </DialogTitle>
                    </div>

                    <div className="hidden md:flex items-center justify-between w-full">
                        <DialogTitle className="text-base font-medium">
                            {t("protocol.title")}: <span className="font-bold">{match.p1.name}</span> vs <span className="font-bold">{match.p2.name}</span>
                        </DialogTitle>
                        <div className="flex items-center gap-2">
                            <TableNumberForm
                                match={match.match}
                                initialTableNumber={match.match.extra_data?.table}
                                brackets={false}
                            />

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

                            <X className="cursor-pointer h-5 w-5" onClick={onClose} />
                        </div>
                    </div>
                </DialogHeader>
                <Content />
            </DialogContent>
        </Dialog>
    )
}