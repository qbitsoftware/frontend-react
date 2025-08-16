import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ClubCardSkeleton() {
    return (
        <Card className="flex flex-col h-full">
            <CardHeader className="flex-grow">
                <CardTitle className="text-lg font-semibold flex flex-row items-center justify-between gap-10">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <Skeleton className="h-5 flex-1" />
                    <Skeleton className="h-6 w-6" />
                </CardTitle>
            </CardHeader>
        </Card>
    )
}