import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TableCell, TableRow } from "@/components/ui/table";
import { User } from "@/types/users";
import placeholderImg from "@/assets/blue-profile.png";
import { getYear } from "@/lib/rating-utils";
import { Club } from "@/types/clubs";
import { useTranslation } from "react-i18next";

interface Props {
    user: User
    clubs: Club[];
    index: number
    handleModalOpen: (user: User) => void;
    displayIndex?: number;
}

export default function UserRow({ user, clubs, index, handleModalOpen, displayIndex }: Props) {
    const { t } = useTranslation()
    const getClubName = (user: User) => {
        return user.club?.name || "KLUBITU";
    };
    const getClubImage = (user: User) => {
        if (user.club?.image_url) {
            return user.club.image_url;
        }

        const club = clubs.find((club) => club.name === user.club?.name);
        return club?.image_url || "";
    };

    const getLicenseInfo = (
        license: string | null,
        expirationDate: string | null
    ) => {
        if (license && license !== null && license !== "") {
            if (expirationDate) {
                const expDate = new Date(expirationDate);
                const now = new Date();
                if (expDate < now) {
                    return {
                        text: t("rating.license_status.missing"),
                        isActive: false,
                    };
                }
                const formattedDate = expDate.toLocaleDateString("et-EE", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                });
                return {
                    text: formattedDate,
                    isActive: true,
                };
            }
            return {
                text: t("rating.license_status.active"),
                isActive: true,
            };
        }
        return {
            text: t("rating.license_status.missing"),
            isActive: false,
        };
    };
    return (
        <TableRow
            onClick={() => handleModalOpen(user)}
            key={user.id}
            className={`group cursor-pointer transition-colors ${index % 2 === 0
                ? "bg-white hover:bg-blue-50"
                : "bg-blue-50/30 hover:bg-blue-50/50"
                }`}
        >
            <TableCell className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-sm sm:text-lg font-bold text-[#4C97F1]">
                {user.rate_order > 0 ? user.rate_order : (displayIndex ? displayIndex : "-")}
            </TableCell>
            <TableCell className="px-1 sm:px-2 lg:px-6 py-2 sm:py-3 flex items-center space-x-2 sm:space-x-3">
                <Avatar className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
                    <AvatarImage
                        src=""
                        alt={`${user.first_name} ${user.last_name}'s profile`}
                    />
                    <AvatarFallback>
                        <img
                            src={placeholderImg}
                            className="rounded-full h-full w-full object-cover"
                            alt="Profile"
                        />
                    </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                    <span className="text-xs sm:text-sm font-semibold group-hover:text-blue-600 group-hover:underline truncate">
                        {user.last_name}
                    </span>
                    <span className="text-xs sm:text-sm text-gray-600 truncate">
                        {user.first_name}
                    </span>
                </div>
            </TableCell>

            <TableCell className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-xs sm:text-sm">
                {user.rate_pl_points}
            </TableCell>
            <TableCell className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-xs sm:text-sm">
                {user.rate_points}
            </TableCell>
            <TableCell className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-xs sm:text-sm">
                {Math.round(user.rate_weigth)}
            </TableCell>
            <TableCell className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-xs sm:text-sm">
                {user.eltl_id}
            </TableCell>
            <TableCell className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-xs sm:text-sm hidden sm:table-cell">
                {getYear(user.birth_date)}
            </TableCell>
            <TableCell className="px-1 sm:px-2 lg:px-6 py-2 sm:py-3">
                <div className="flex items-center space-x-1 sm:space-x-2">
                    <Avatar className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0">
                        <AvatarImage
                            src={getClubImage(user)}
                            alt={`${getClubName(user)} logo`}
                        />
                        <AvatarFallback className="text-[10px] sm:text-xs font-semibold bg-gray-100 p-0 flex items-center justify-center">
                            {getClubName(user).substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <span className="text-xs sm:text-sm truncate min-w-0">
                        {getClubName(user)}
                    </span>
                </div>
            </TableCell>
            <TableCell className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-xs sm:text-sm hidden lg:table-cell">
                {(() => {
                    const licenseInfo = getLicenseInfo(
                        user.license,
                        user.expiration_date
                    );
                    return (
                        <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${licenseInfo.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                                }`}
                        >
                            {licenseInfo.text}
                        </span>
                    );
                })()}
            </TableCell>
        </TableRow>

    )
}