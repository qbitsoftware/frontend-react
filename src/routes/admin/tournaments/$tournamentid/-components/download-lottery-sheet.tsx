import { Button } from "@/components/ui/button";
import { useDownloadProtocol } from "@/queries/download";
import { useTranslation } from "react-i18next";

export function LotterySheetDownload({ tournamentId, groupId, matchId }: { tournamentId: number, groupId: number, matchId: string }) {
    const downloadMutation = useDownloadProtocol();

    const handleDownload = () => {
        downloadMutation.mutate({
            tournamentId,
            groupId,
            matchId,
            type: "lottery_sheet"
        });
    };

    const { t } = useTranslation();

    return (
        <Button
            onClick={handleDownload}
            disabled={downloadMutation.isPending}
            variant="outline"
            className="ml-4 bg-slate-100 hover:bg-slate-200"
        >
            {downloadMutation.isPending ? t('protocol.loading') : t('protocol.download_lottery_sheet')}
        </Button>
    );
}
