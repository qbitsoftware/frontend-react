import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AvatarImage } from "@radix-ui/react-avatar";
import React, { useState } from "react";
import blueprofile from "@/assets/blue-profile.png";
import { useTranslation } from "react-i18next";
import { ImageModal } from "./image-modal";
import { Participant } from "@/types/participants";
import { TournamentTable } from "@/types/groups";
import { GroupType } from "@/types/matches";

interface SoloTableProps {
  participants: Participant[] | null;
  table_data: TournamentTable
}

const SoloTable: React.FC<SoloTableProps> = ({ participants, table_data }) => {
  const { t } = useTranslation();

  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const openModal = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const filteredParticipants = participants && participants.filter((participant) => ((table_data.type === GroupType.ROUND_ROBIN || table_data.type === GroupType.ROUND_ROBIN_FULL_PLACEMENT) ? participant.group_id != "" : participant))

  return (
    <div className="h-full bg-white rounded-md">
      {filteredParticipants && filteredParticipants.length > 0 ? (
        <div className="rounded-md border h-full overflow-y-auto">
          <Table className="bg-white h-full ">
            <TableHeader>
              <TableRow className="bg-[#F9F9FB]">
                <TableHead>
                  {t("competitions.participants.table.image")}
                </TableHead>
                <TableHead>
                  {t("competitions.participants.table.name")}
                </TableHead>
                <TableHead>
                  {t("competitions.participants.table.rating_placement")}
                </TableHead>
                <TableHead>
                  {t("competitions.participants.table.class")}
                </TableHead>
                <TableHead>
                  {t("competitions.participants.table.club")}
                </TableHead>
                <TableHead>
                  {t("competitions.participants.table.sex")}
                </TableHead>
                <TableHead>{t("competitions.participants.table.id")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredParticipants.map((participant) => (
                <TableRow
                  key={participant.id}
                  className="bg-white bg-[#F9F9FB]/40 "
                >
                  <TableCell>
                    <Avatar
                      className="cursor-pointer"
                      onClick={() =>
                        participant.extra_data.image_url
                        && openModal(participant.extra_data.image_url)
                      }
                    >
                      <AvatarImage
                        src={participant.extra_data.image_url}
                      ></AvatarImage>
                      <AvatarFallback>
                        <img
                          src={blueprofile}
                          className="rounded-full"
                        ></img>
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell>{participant.name}</TableCell>
                  <TableCell>{participant.rank}</TableCell>
                  <TableCell>{participant.extra_data.class}</TableCell>
                  <TableCell>
                    {participant.players[0].extra_data.club}
                  </TableCell>
                  <TableCell>{participant.players[0].sex}</TableCell>
                  <TableHead>
                    {participant.players[0].extra_data.eltl_id}
                  </TableHead>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className=" rounded-lg p-8 text-center h-full flex items-center justify-center">
          <p className="text-gray-800 text-lg">
            {t("competitions.participants.no_players")}
          </p>
        </div>
      )}
      {selectedImage && (
        <ImageModal
          isOpen={!!selectedImage}
          imageUrl={selectedImage}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default SoloTable;
