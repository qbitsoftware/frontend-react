import { Button } from "@/components/ui/button";
import { downloadExcelFile, UseGetDownloadProtocol } from "@/queries/download";
import { useTranslation } from "react-i18next";

export function LotterySheetDownload({ tournamentId, groupId, matchId }: { tournamentId: number, groupId: number, matchId: string }) {
    const { data, isLoading } = UseGetDownloadProtocol(tournamentId, groupId, matchId, "lottery_sheet");

    const handleDownload = () => {
        if (data) {
            downloadExcelFile(data, `loosileht_${matchId}.xlsx`);
        }
    };

    const { t } = useTranslation();

    return (
        <Button
            onClick={handleDownload}
            disabled={isLoading || !data}
            variant="outline"
            className="ml-4"
        >
            {isLoading ? t('protocol.loading') : t('protocol.download_lottery_sheet')}
        </Button>
    );
}
