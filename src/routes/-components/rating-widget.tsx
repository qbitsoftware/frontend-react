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
