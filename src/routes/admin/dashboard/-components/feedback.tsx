import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import { Heart, MessageSquare } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function AdminDashBoardFeedback() {
    const { t } = useTranslation()
    return (
        <Card className="shadow-sm bg-gradient-to-br from-blue-50 to-gray-50 border-blue-200 mt-5">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg text-gray-800">
                    <Heart className="w-5 h-5 text-[#4C97F1]" />
                    {t("admin.dashboard.feedback_welcome")}
                </CardTitle>
                <CardDescription className="text-gray-600 text-sm">
                    {t("admin.dashboard.feedback_subtitle")}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Link href="/admin/feedback">
                    <Button className="w-full bg-[#4C97F1] hover:bg-blue-500">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        {t("admin.dashboard.view_feedback")}
                    </Button>
                </Link>
            </CardContent>
        </Card>
    )
}
