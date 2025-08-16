import { useState } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlayerProfileModal } from "../reiting/-components/player-profile-modal";
import { useTranslation } from "react-i18next";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User } from "@/types/users";
import placeholderImg from "@/assets/blue-profile.png";

interface Props {
  users: User[] | null;
  isEmpty: boolean;
}

const RatingWidget = ({ users, isEmpty }: Props) => {
  const { t } = useTranslation();
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
  const selectedPlayer =
    users && users.find((user) => user.id === selectedPlayerId);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("men");

  if (isEmpty) {
    return (
      <div className="border-2 border-dashed rounded-md py-12 px-8">
        <p className="pb-1 text-center font-medium text-stone-700">
          {t("rating.component.missing")}
        </p>
      </div>
    );
  }

  if (users) {
    const filteredUsers = users
      .filter((user) => {
        if (activeTab === "combined") return user.eltl_id != 0 && true;
        if (activeTab === "men") return user.sex === "M";
        if (activeTab === "women") return user.sex === "N";
        return true;
      })
      .sort((a, b) => a.rate_order - b.rate_order);

    return (
      <div className="h-[400px] sm:h-[500px] md:h-[600px] lg:h-[790px] flex flex-col relative space-y-0 border rounded-[8px] sm:rounded-[12px]">
        <div className="w-full border-b border-stone-200 pt-1 mb-0 rounded-t-[8px] sm:rounded-t-[12px] bg-[#EBEFF5]">
          <Tabs
            defaultValue="men"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="w-full rounded-[2px] py-1 sm:py-2 gap-0.5 sm:gap-1 flex flex-row justify-start">
              <TabsTrigger
                value="women"
                className="w-full rounded-[4px] flex-1 text-xs sm:text-sm"
              >
                {t("rating.filtering.buttons.women")}
              </TabsTrigger>
              <TabsTrigger value="men" className="w-full rounded-[4px] flex-1 text-xs sm:text-sm">
                {t("rating.filtering.buttons.men")}
              </TabsTrigger>
              <TabsTrigger
                value="combined"
                className="w-full rounded-[4px] flex-1 text-xs sm:text-sm"
              >
                {t("rating.filtering.buttons.combined")}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="overflow-y-scroll flex-1">
          <Table className="w-full mx-auto border-collapse rounded-t-lg shadow-lg">
            <TableHeader className="rounded-lg bg-white">
              <TableRow className="sticky top-0 z-10">
                <TableHead className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-left font-medium text-xs sm:text-sm">
                  NR
                </TableHead>
                <TableHead className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-left font-medium text-xs sm:text-sm">
                  {t("rating.table.head.player")}
                </TableHead>
                <TableHead className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-left font-medium text-xs sm:text-sm">
                  RP
                </TableHead>
                <TableHead className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-left font-medium text-xs sm:text-sm">
                  PP
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white/80">
              {filteredUsers.map((user) => (
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
              ))}
            </TableBody>
          </Table>
        </div>
        {selectedPlayer && (
          <PlayerProfileModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            user={selectedPlayer}
          />
        )}
      </div>
    );
  }
};

export default RatingWidget;
