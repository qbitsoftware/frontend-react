import { useState } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { PlayerProfileModal } from "../reiting/-components/player-profile-modal";
import { useTranslation } from "react-i18next";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User } from "@/types/users";

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
      <div className="h-[600px] md:h-[790px] flex flex-col relative space-y-0 border rounded-t-[12px]">
        <div className="w-full border-b border-stone-200 pt-1 mb-0 rounded-t-[12px] bg-[#EBEFF5]">
          <Tabs
            defaultValue="men"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full "
          >
            <TabsList className="w-full rounded-[2px] py-2 gap-1 flex flex-col lg:flex-row justify-start">
              <TabsTrigger
                value="women"
                className=" w-full rounded-[4px] flex-1"
              >
                {t("rating.filtering.buttons.women")}
              </TabsTrigger>
              <TabsTrigger value="men" className="w-full rounded-[4px] flex-1">
                {t("rating.filtering.buttons.men")}
              </TabsTrigger>
              <TabsTrigger
                value="combined"
                className="w-full rounded-[4px] flex-1"
              >
                {t("rating.filtering.buttons.combined")}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="overflow-y-scroll max-h-[50vh] md:max-h-[135vh]">
          <Table className="w-full mx-auto border-collapse rounded-t-lg shadow-lg">
            <TableHeader className="rounded-lg bg-white">
              <TableRow className=" sticky top-0 z-10">
                <TableHead className="px-6 py-3 text-left font-medium">
                  NR
                </TableHead>
                <TableHead className="px-6 py-3 text-left font-medium">
                  {t("rating.table.head.player")}
                </TableHead>
                <TableHead className="px-6 py-3 text-left font-medium">
                  RP
                </TableHead>
                <TableHead className="px-6 py-3 text-left font-medium">
                  PP
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white/60">
              {filteredUsers.map((user) => (
                <TableRow
                  onClick={() => {
                    setSelectedPlayerId(user.id);
                    setIsModalOpen(true);
                  }}
                  key={user.id}
                  className="group cursor-pointer"
                >
                  <TableCell className="px-6 py-3 text-sm font-bold">
                    {user.rate_order}
                  </TableCell>
                  <TableCell className="px-6 py-3 text-sm font-semibold group-hover:text-blue-600 group-hover:underline">
                    {`${user.last_name} ${user.first_name}`}
                  </TableCell>
                  <TableCell className="px-6 py-3 text-sm">
                    {user.rate_points}
                  </TableCell>
                  <TableCell className="px-6 py-3 text-sm">
                    {user.rate_pl_points}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <PlayerProfileModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          user={selectedPlayer || null}
        />
      </div>
    );
  }
};

export default RatingWidget;
