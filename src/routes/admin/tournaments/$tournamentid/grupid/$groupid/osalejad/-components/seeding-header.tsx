import { Button } from "@/components/ui/button";
import { CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MatchesResponse, UseGetMatchesQuery } from "@/queries/match";
import { UsePostOrder, UsePostSeeding } from "@/queries/participants";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import seeds3 from "@/assets/seeds3.png";
import { TournamentTable } from "@/types/groups";
import { toast } from 'sonner';
import { GroupType } from "@/types/matches";
import { Participant } from "@/types/participants";

interface SeedingHeaderProps {
  tournament_id: number;
  table_data: TournamentTable;
  participants: Participant[]
}

const SeedingHeader = ({
  tournament_id,
  table_data,
  participants,
}: SeedingHeaderProps) => {
  const { data: matches_data } = UseGetMatchesQuery(
    tournament_id,
    table_data.id
  );

  const updateSeeding = UsePostSeeding(tournament_id, table_data.id);
  const updateOrder = UsePostOrder(tournament_id, table_data.id);

  const [disabled, setDisabled] = useState(false);
  const isDisabled = (data: MatchesResponse | undefined): boolean => {
    if (!data || !data.data) {
      return false;
    }
    const winners = data.data.find((match) => {
      return match.match.winner_id != "";
    });

    if (!winners) {
      return false;
    } else {
      return true;
    }
  };

  useEffect(() => {
    setDisabled(isDisabled(matches_data));
  }, [matches_data]);

  const { t } = useTranslation();
  const [selectedOrderValue, setSelectedOrderValue] = useState<
    string | undefined
  >();

  const handleSeeding = async (order: string | undefined) => {
    if (!order) {
      return;
    }
    try {
      await updateSeeding.mutateAsync({ order });
      toast.message(t('toasts.participants.seeding_success'))
    } catch (error) {
      void error;
      toast.error(t("toasts.participants.seeding_error"))
    }
  };

  const handleOrder = async () => {
    try {
      await updateOrder.mutateAsync();
      toast.message(t('toasts.participants.order_success'))
    } catch (error) {
      void error;
      toast.error(t("toasts.participants.order_error"))
    }
  }

  return (
    <CardHeader className="flex flex-col md:flex-row items-start gap-4 md:items-center justify-between  space-y-0 ">
      <div className="flex gap-2 items-center">
        <h5 className="font-medium">{(table_data.type == GroupType.ROUND_ROBIN || table_data.type == GroupType.ROUND_ROBIN_FULL_PLACEMENT) ? t("admin.tournaments.groups.participants.subgroups") : t("admin.tournaments.info.participants")}</h5>
        <p className="bg-[#FBFBFB] font-medium px-3 py-1 rounded-full border border-[#EAEAEA] ">
          {((table_data.type == GroupType.ROUND_ROBIN || table_data.type == GroupType.ROUND_ROBIN_FULL_PLACEMENT) && participants.filter((participant) => participant.type === "round_robin").length) || (participants && participants.length)} / {table_data.size}{" "}
        </p>
      </div>


      <div className="flex flex-col gap-4 space-y-0">
        <div className="flex gap-2 md:gap-10 items-center">
          <div className="flex flex-col gap-2 text-center w-[150px] md:w-auto">
            <p className="flex items-center justify-center text-sm h-[40px]">
              {t("admin.tournaments.groups.order.title_order")}
            </p>
            <Button onClick={handleOrder} disabled={disabled}>
              {t("admin.tournaments.groups.order.order_by_rating")}
            </Button>
          </div>


          <div className="flex flex-col gap-2">
            <Select
              onValueChange={setSelectedOrderValue}
              defaultValue={selectedOrderValue}
              disabled={disabled}
            >
              <SelectTrigger className="border-2 border-[#4C97F1]/20">
                <SelectValue
                  placeholder={t("admin.tournaments.groups.order.placeholder")}
                />
              </SelectTrigger>
              <SelectContent>
                {/* <SelectItem value="random">
                {t("admin.tournaments.groups.order.random")}
              </SelectItem> */}
                <SelectItem value="rating">
                  {t("admin.tournaments.groups.order.by_rating")}
                </SelectItem>
                <SelectItem value="regular">
                  {t("admin.tournaments.groups.order.by_order")}
                </SelectItem>
              </SelectContent>
            </Select>
            <Button
              disabled={!selectedOrderValue}
              onClick={() => handleSeeding(selectedOrderValue)}
              className="flex p-0 justify-between items-center px-4 bg-midnightTable"
            >
              <div className="flex flex-row pr-6 gap-2">
                {t("admin.tournaments.groups.order.title")}{" "}
                <img src={seeds3} className="h-5 w-5 object-contain" />
              </div>
            </Button>
          </div>

        </div>

      </div>
    </CardHeader>
  );
};

export default SeedingHeader;
