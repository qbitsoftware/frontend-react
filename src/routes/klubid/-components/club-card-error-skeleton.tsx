import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ClubCardSkeletonError() {
    const { t } = useTranslation()
    return (
        <Card className="flex flex-col h-full cursor-pointer border-red-100 bg-red-25">
            <CardHeader className="flex-grow">
                <CardTitle className="text-lg font-semibold flex flex-row items-center justify-between gap-10 text-ellipsis">
                    <Avatar className="h-16 w-16 bg-red-100">
                        <AvatarFallback className="bg-red-100 text-red-400">
                            <AlertCircle className="h-6 w-6" />
                        </AvatarFallback>
                    </Avatar>
                    <span className="text-red-400 text-sm">{t('admin.clubs.players_modal.load_error')}</span>
                </CardTitle>
            </CardHeader>
        </Card>
    );
}