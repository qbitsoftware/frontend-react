import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import { Calendar } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Props {
    quickActions: QuickAction[];
}

type QuickAction = {
    title: string;
    description: string;
    color: string;
    iconSrc: string;
    href: string;
}

export default function AdminDashBoardQuickActions({ quickActions }: Props) {
    const { t } = useTranslation()
    return (
        <Card className="shadow-sm">
            <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Calendar className="w-5 h-5" />
                    {t("admin.dashboard.quick_actions.title")}
                </CardTitle>
                <CardDescription className="text-sm">
                    {t("admin.dashboard.quick_actions.description")}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
                    {quickActions.map((action, index) => (
                        <Link key={index} href={action.href}>
                            <Card className={`cursor-pointer transition-all duration-200 ${action.color} h-full`}>
                                <CardContent className="p-2 sm:p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 rounded-lg flex-shrink-0">
                                            <img src={action.iconSrc} alt="" className="w-6 h-6 sm:w-8 sm:h-8" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-xs sm:text-sm mb-1 truncate">
                                                {action.title}
                                            </h4>
                                            <p className="text-xs text-gray-600 line-clamp-2">
                                                {action.description}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </CardContent>
        </Card>

    )
}
