import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import { Heart, MessageSquare } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function AdminDashBoardFeedback() {
    const { t } = useTranslation()
    return (
        <Card className="shadow-sm bg-gradient-to-br from-pink-50 to-purple-50 border-pink-200">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg text-red-700">
                    <Heart className="w-5 h-5 text-red-500" />
                    {t("admin.dashboard.feedback_welcome")}
                </CardTitle>
                <CardDescription className="text-red-700 text-sm">
                    {t("admin.dashboard.feedback_subtitle")}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Link href="/admin/feedback">
                    <Button className="w-full bg-red-400 hover:bg-red-500">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        {t("admin.dashboard.view_feedback")}
                    </Button>
                </Link>
            </CardContent>
        </Card>
    )
}