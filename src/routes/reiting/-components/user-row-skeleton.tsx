import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TableCell, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
    index: number;
}

export default function UserRowSkeleton({ index }: Props) {
    return (
        <TableRow
            className={`${index % 2 === 0
                ? "bg-white"
                : "bg-blue-50/30"
                }`}
        >
            <TableCell className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-sm sm:text-lg font-bold w-16 sm:w-20">
                <Skeleton className="h-4 w-8" />
            </TableCell>
            <TableCell className="px-1 sm:px-2 lg:px-6 py-2 sm:py-3 w-32 sm:w-40 lg:w-48">
                <div className="flex items-center space-x-2 sm:space-x-3">
                    <Avatar className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
                        <AvatarFallback>
                            <Skeleton className="rounded-full h-full w-full" />
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                        <Skeleton className="h-3 w-20 mb-1" />
                        <Skeleton className="h-3 w-16" />
                    </div>
                </div>
            </TableCell>
            <TableCell className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-xs sm:text-sm w-12 sm:w-16">
                <Skeleton className="h-4 w-12" />
            </TableCell>
            <TableCell className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-xs sm:text-sm w-12 sm:w-16">
                <Skeleton className="h-4 w-12" />
            </TableCell>
            <TableCell className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-xs sm:text-sm w-12 sm:w-16">
                <Skeleton className="h-4 w-12" />
            </TableCell>
            <TableCell className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-xs sm:text-sm w-16 sm:w-20">
                <Skeleton className="h-4 w-16" />
            </TableCell>
            <TableCell className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-xs sm:text-sm w-16 sm:w-20 hidden sm:table-cell">
                <Skeleton className="h-4 w-12" />
            </TableCell>
            <TableCell className="px-1 sm:px-2 lg:px-6 py-2 sm:py-3 w-24 sm:w-32 lg:w-40">
                <div className="flex items-center space-x-1 sm:space-x-2">
                    <Avatar className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0">
                        <AvatarFallback>
                            <Skeleton className="rounded-full h-full w-full" />
                        </AvatarFallback>
                    </Avatar>
                    <Skeleton className="h-3 w-16" />
                </div>
            </TableCell>
            <TableCell className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-xs sm:text-sm w-20 sm:w-24 hidden lg:table-cell">
                <Skeleton className="h-6 w-20 rounded-full" />
            </TableCell>
        </TableRow>
    );
}
