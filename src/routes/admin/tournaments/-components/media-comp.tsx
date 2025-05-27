import { Button } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import { UsePatchTournamentMedia } from '@/queries/tournaments';
import { Tournament } from '@/types/tournaments'
import { YooptaContentValue } from '@yoopta/editor';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from "sonner"
import Editor from '../../-components/yooptaeditor';

interface Props {
    tournament: Tournament
}

export default function MediaComponent({ tournament }: Props) {
    const { t } = useTranslation();
    const [value, setValue] = useState<YooptaContentValue | undefined>(
        JSON.parse(tournament.media || "{}")
    );
    const mediaMutation = UsePatchTournamentMedia(
        Number(tournament.id)
    );

    const handleSave = async () => {
        try {
            await mediaMutation.mutateAsync({ media: JSON.stringify(value) });
            toast.message(t("toasts.media.save_success"))
        } catch (error) {
            void error;
            toast.error(t("toasts.media.save_error"));
        }
    };

    return (
        <Card className="w-full border-none shadow-none bg-transparent">
            <CardHeader className="px-0 flex-col md:flex-row gap-4 justify-between items-start md:items-center space-y-0">
                <h5 className="font-medium">{t('admin.media.title')}</h5>
                <Button
                    onClick={handleSave}
                    disabled={mediaMutation.isPending}
                >
                    {mediaMutation.isPending ? t("admin.media.save_progress") : t("admin.media.save_button")}
                </Button>
            </CardHeader>
            <div className="">
                <Editor value={value} setValue={setValue} readOnly={false} />
            </div>
        </Card>
    );

}
