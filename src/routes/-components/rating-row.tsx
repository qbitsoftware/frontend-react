import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TableCell, TableRow } from "@/components/ui/table";
import { User } from "@/types/users";
import placeholderImg from "@/assets/blue-profile.png";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
    user: User;
    setSelectedPlayerId: (id: number | null) => void;
    setIsModalOpen: (isOpen: boolean) => void;
}

export function RatingRowSkeleton() {
    return (
        <TableRow className="group">
            <TableCell className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3">
                <Skeleton className="h-4 sm:h-5 lg:h-6 w-6 sm:w-8 lg:w-10" />
            </TableCell>
            <TableCell className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 flex items-center space-x-2 sm:space-x-3">
                <Skeleton className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-full flex-shrink-0" />
                <div className="flex flex-col min-w-0 flex-1 space-y-1">
                    <Skeleton className="h-3 sm:h-4 w-16 sm:w-20" />
                    <Skeleton className="h-3 sm:h-4 w-12 sm:w-16" />
                </div>
            </TableCell>
            <TableCell className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3">
                <Skeleton className="h-3 sm:h-4 w-8 sm:w-12" />
            </TableCell>
            <TableCell className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3">
                <Skeleton className="h-3 sm:h-4 w-8 sm:w-12" />
            </TableCell>
        </TableRow>
    );
}

export default function RatingRow({ user, setSelectedPlayerId, setIsModalOpen }: Props) {
    return (
        <TableRow
            onClick={() => {
                setSelectedPlayerId(user.id);
                setIsModalOpen(true);
            }}
            key={user.id}
            className="group cursor-pointer"
        >
            <TableCell className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-sm sm:text-base lg:text-lg font-bold text-[#4C97F1]">
                {user.rate_order}
            </TableCell>
            <TableCell className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 flex items-center space-x-2 sm:space-x-3">
                <Avatar className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 flex-shrink-0">
                    <AvatarImage src="" alt={`${user.first_name} ${user.last_name}'s profile`} />
                    <AvatarFallback>
                        <img src={placeholderImg} className="rounded-full h-full w-full object-cover" alt="Profile" />
                    </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-xs sm:text-sm font-semibold group-hover:text-blue-600 group-hover:underline truncate">
                        {user.last_name}
                    </span>
                    <span className="text-xs sm:text-sm text-gray-600 truncate">{user.first_name}</span>
                </div>
            </TableCell>
            <TableCell className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-xs sm:text-sm">
                {user.rate_points}
            </TableCell>
            <TableCell className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-xs sm:text-sm">
                {user.rate_pl_points}
            </TableCell>
        </TableRow>
    )
}