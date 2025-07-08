import { Button } from "@/components/ui/button";
import { downloadExcelFile, UseGetDownloadProtocol } from "@/queries/download";
import { useTranslation } from "react-i18next";

export function ProtocolDownloadButton({ tournamentId, groupId, matchId }: { tournamentId: number, groupId: number, matchId: string }) {
    const { data, isLoading } = UseGetDownloadProtocol(tournamentId, groupId, matchId);

    const handleDownload = () => {
        if (data) {
            downloadExcelFile(data, `protocol_${matchId}.xlsx`);
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
            {isLoading ? t('protocol.loading') : t('protocol.download')}
        </Button>
    );
}
