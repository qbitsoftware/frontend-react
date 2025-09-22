import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TableCell, TableRow } from "@/components/ui/table";
import { User } from "@/types/users";
import placeholderImg from "@/assets/blue-profile.png";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
    user: User;
    setSelectedPlayerId: (id: number | null) => void;
    setIsModalOpen: (isOpen: boolean) => void;
    displayIndex?: number;
    isGenderCombined?: boolean;
}

export function RatingRowSkeleton() {
    return (
        <TableRow className="group">
            <TableCell className="px-1 sm:px-2 md:px-4 lg:px-6 py-2 sm:py-3 w-12 sm:w-16">
                <Skeleton className="h-4 sm:h-5 lg:h-6 w-6 sm:w-8 lg:w-10" />
            </TableCell>
            <TableCell className="px-1 sm:px-2 md:px-4 lg:px-6 py-2 sm:py-3 flex items-center space-x-1 sm:space-x-2 md:space-x-3 min-w-0">
                <Skeleton className="w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 rounded-full flex-shrink-0" />
                <div className="flex flex-col min-w-0 flex-1 space-y-1">
                    <Skeleton className="h-3 sm:h-4 w-12 sm:w-16 md:w-20" />
                    <Skeleton className="h-3 sm:h-4 w-8 sm:w-12 md:w-16" />
                </div>
            </TableCell>
            <TableCell className="px-1 sm:px-2 md:px-4 lg:px-6 py-2 sm:py-3 w-12 sm:w-16">
                <Skeleton className="h-3 sm:h-4 w-6 sm:w-8 md:w-12" />
            </TableCell>
            <TableCell className="px-1 sm:px-2 md:px-4 lg:px-6 py-2 sm:py-3 w-12 sm:w-16">
                <Skeleton className="h-3 sm:h-4 w-6 sm:w-8 md:w-12" />
            </TableCell>
        </TableRow>
    );
}

export default function RatingRow({ user, setSelectedPlayerId, setIsModalOpen, displayIndex, isGenderCombined }: Props) {
    return (
        <TableRow
            onClick={() => {
                setSelectedPlayerId(user.id);
                setIsModalOpen(true);
            }}
            key={user.id}
            className="group cursor-pointer"
        >
            <TableCell className={`px-2 sm:px-2 md:px-4 lg:px-6 py-2 sm:py-3 text-sm sm:text-sm md:text-base lg:text-lg font-bold w-12 sm:w-16 text-left whitespace-nowrap ${
                isGenderCombined && user.sex === "N" ? "text-pink-300" : "text-[#4C97F1]"
            }`}>
                {displayIndex || user.rate_order}
                {user.rating_last_change != null && user.rating_last_change !== 0 && !(user.rate_order === -(user.rating_last_change) && user.rate_order > 100) && (
                    <>
                        <svg
                            className={`w-3 h-3 sm:w-4 sm:h-4 ml-0.5 sm:ml-1 inline flex-shrink-0 ${user.rating_last_change > 0 ? "text-green-600" : "text-red-500"}`}
                            viewBox="0 0 16 16"
                        >
                            <path
                                d={user.rating_last_change > 0
                                    ? "M4 12 Q3 12 3.5 11 L7.5 4 Q8 3 8.5 4 L12.5 11 Q13 12 12 12 Z"
                                    : "M4 4 Q3 4 3.5 5 L7.5 12 Q8 13 8.5 12 L12.5 5 Q13 4 12 4 Z"
                                }
                                fill="currentColor"
                            />
                        </svg>
                        <span className={`ml-0.5 text-[10px] sm:text-xs font-medium flex-shrink-0 ${user.rating_last_change > 0
                            ? "text-green-600"
                            : "text-red-500"
                        }`}>
                            {Math.abs(user.rating_last_change)}
                        </span>
                    </>
                )}
            </TableCell>
            <TableCell className="px-6 sm:px-6 md:px-8 lg:px-10 py-2 sm:py-3 flex items-center space-x-2 sm:space-x-3 md:space-x-4 min-w-0">
                <Avatar className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 flex-shrink-0">
                    <AvatarImage src="" alt={`${user.first_name} ${user.last_name}'s profile`} />
                    <AvatarFallback className="p-0">
                        <img src={placeholderImg} className="rounded-full h-full w-full object-cover" alt="Profile" />
                    </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-xs sm:text-sm font-semibold group-hover:text-blue-600 group-hover:underline truncate">
                        {user.last_name}
                    </span>
                    <span className="text-xs md:text-sm text-gray-600 truncate">{user.first_name}</span>
                </div>
            </TableCell>
            <TableCell className="px-2 sm:px-2 md:px-4 lg:px-6 py-2 sm:py-3 text-xs sm:text-sm w-12 sm:w-16 text-center">
                {user.rate_pl_points}
            </TableCell>
            <TableCell className="px-2 sm:px-2 md:px-4 lg:px-6 py-2 sm:py-3 text-xs sm:text-sm w-12 sm:w-16 text-center">
                {user.rate_points}
            </TableCell>
        </TableRow>
    )
}
