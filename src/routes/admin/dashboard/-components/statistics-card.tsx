import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
    Icon: LucideIcon;
    iconColor: string;
    bgColor: string;
    title: number;
    description: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
    Icon,
    iconColor,
    bgColor,
    title,
    description,
}) => {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3 sm:px-6">
                <CardTitle className="text-xs sm:text-base font-medium">{description}</CardTitle>
                <div className={`p-1 sm:p-2 ${bgColor} rounded-full`}>
                    <Icon className={`w-3 h-3 sm:w-4 sm:h-4 ${iconColor}`} />
                </div>
            </CardHeader>
            <CardContent className="px-3 pb-2 sm:px-6 sm:pb-4">
                <div className="text-lg sm:text-4xl font-bold">{title}</div>
            </CardContent>
        </Card>
    );
};

interface TournamentStatusBadgeProps {
    status: string;
}

export const TournamentStatusBadge: React.FC<TournamentStatusBadgeProps> = ({
    status,
}) => {
    return <Badge className="bg-gray-100 text-gray-800 hover:bg-stone-200 text-xs sm:text-sm px-2 py-1">{status}</Badge>;
};
