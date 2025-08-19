import { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
} from "@/components/ui/table";
import { PlayerProfileModal } from "../reiting/-components/player-profile-modal";
import { useTranslation } from "react-i18next";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UseGetUsersQuery } from "@/queries/users";
import { User } from "@/types/users";
import RatingRow, { RatingRowSkeleton } from "./rating-row";

const RatingWidget = () => {
  const { t } = useTranslation();
  const { data, isLoading } = UseGetUsersQuery("")
  const [users, setUsers] = useState<User[]>([])
  useEffect(() => {
    if (data && data.data) {
      setUsers(data.data);
    }
  }, [data])
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
  const selectedPlayer =
    users && users.find((user) => user.id === selectedPlayerId);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("men");

  if (users) {
    const filteredUsers = users
      .filter((user) => {
        if (activeTab === "combined") return user.eltl_id != 0 && true && user.foreigner == 0;
        if (activeTab === "men") return user.sex === "M" && user.foreigner == 0;
        if (activeTab === "women") return user.sex === "N" && user.foreigner == 0;
        return true;
      })
      .sort((a, b) => a.rate_order - b.rate_order);

    return (
      <div className="h-[400px] sm:h-[500px] md:h-[600px] lg:h-[790px] flex flex-col relative space-y-0 border rounded-[8px] sm:rounded-[12px]">
        <div className="w-full border-b border-stone-200 mb-0 rounded-t-[8px] sm:rounded-t-[12px] bg-gray-50">
          <Tabs
            defaultValue="men"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="w-full rounded-[2px] py-1 sm:py-2 gap-0.5 sm:gap-1 flex flex-row justify-center bg-gray-50">
              <TabsTrigger
                value="women"
                className="flex-1 min-w-0 rounded-[4px] text-xs sm:text-sm px-1 sm:px-2 truncate"
              >
                {t("rating.filtering.buttons.women")}
              </TabsTrigger>
              <TabsTrigger 
                value="men" 
                className="flex-1 min-w-0 rounded-[4px] text-xs sm:text-sm px-1 sm:px-2 truncate"
              >
                {t("rating.filtering.buttons.men")}
              </TabsTrigger>
              <TabsTrigger
                value="combined"
                className="flex-1 min-w-0 rounded-[4px] text-xs sm:text-sm px-1 sm:px-2 truncate"
              >
                {t("rating.filtering.buttons.combined")}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="overflow-y-auto flex-1 scrollbar-hide rounded-b-[8px] sm:rounded-b-[12px]">
          <Table className="w-full mx-auto border-collapse rounded-t-lg shadow-lg table-fixed">
            <colgroup>
              <col className="w-12 sm:w-16" />
              <col className="w-auto min-w-0" />
              <col className="w-12 sm:w-16" />
              <col className="w-12 sm:w-16" />
            </colgroup>
            <TableHeader className="rounded-lg bg-white">
              <TableRow className="sticky top-0 z-10 h-8">
                <TableHead className="h-5 md:h-10 px-1 sm:px-2 md:px-4 lg:px-6 py-0 sm:py-1 text-center font-medium text-xs sm:text-sm w-12 sm:w-16">
                  NR
                </TableHead>
                <TableHead className="h-5 md:h-10 px-1 sm:px-2 md:px-4 lg:px-6 py-0 sm:py-1 text-left font-medium text-xs sm:text-sm min-w-0">
                  {t("rating.table.head.player")}
                </TableHead>
                <TableHead className="h-5 md:h-10 px-1 sm:px-2 md:px-4 lg:px-6 py-0 sm:py-1 text-center font-medium text-xs sm:text-sm w-12 sm:w-16">
                  PP
                </TableHead>
                <TableHead className="h-5 md:h-10 px-1 sm:px-2 md:px-4 lg:px-6 py-0 sm:py-1 text-center font-medium text-xs sm:text-sm w-12 sm:w-16">
                  RP
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white/80">
              {isLoading ?
                ([...Array(14)].map((_, index) => (
                  <RatingRowSkeleton key={index} />
                )))
                : filteredUsers && filteredUsers.map((user) => {
                  return (
                    <RatingRow
                      key={user.id}
                      user={user}
                      setSelectedPlayerId={setSelectedPlayerId}
                      setIsModalOpen={setIsModalOpen}
                    />
                  )
                })}
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
