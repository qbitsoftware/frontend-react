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

  const filteredParticipants = participants && participants.filter((participant) => ((table_data.type === GroupType.ROUND_ROBIN || table_data.type === GroupType.ROUND_ROBIN_FULL_PLACEMENT || table_data.type === GroupType.DYNAMIC) ? participant.group_id != "" : participant))

  return (
    <div className="h-full bg-white rounded-md">
      {filteredParticipants && filteredParticipants.length > 0 ? (
        <div className="rounded-lg border border-gray-200 h-full max-h-80 overflow-y-auto bg-white">
          <Table className="bg-white h-full text-sm">
            <TableHeader className="sticky top-0 bg-white z-10 border-b">
              <TableRow className="bg-gray-50/80">
                <TableHead className="w-12 font-medium text-gray-700">
                  {t("competitions.participants.table.image")}
                </TableHead>
                <TableHead className="min-w-0 font-medium text-gray-700">
                  {t("competitions.participants.table.name")}
                </TableHead>
                <TableHead className="w-16 font-medium text-gray-700">
                  {t("competitions.participants.table.rating_placement")}
                </TableHead>
                <TableHead className="w-16 font-medium text-gray-700">
                  {t("competitions.participants.table.class")}
                </TableHead>
                <TableHead className="min-w-0 font-medium text-gray-700">
                  {t("competitions.participants.table.club")}
                </TableHead>
                <TableHead className="w-12 font-medium text-gray-700">
                  {t("competitions.participants.table.sex")}
                </TableHead>
                <TableHead className="w-16 font-medium text-gray-700">{t("competitions.participants.table.id")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredParticipants.map((participant, index) => (
                <TableRow
                  key={participant.id}
                  className={`transition-colors hover:bg-gray-50/80 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                >
                  <TableCell className="p-3">
                    <Avatar
                      className="cursor-pointer h-7 w-7 border border-gray-200 shadow-sm"
                      onClick={() =>
                        participant.extra_data.image_url
                        && openModal(participant.extra_data.image_url)
                      }
                    >
                      <AvatarImage
                        src={participant.extra_data.image_url}
                      ></AvatarImage>
                      <AvatarFallback className="bg-gray-100">
                        <img
                          src={blueprofile}
                          className="rounded-full"
                        ></img>
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="p-3 truncate max-w-0 font-medium text-gray-900">{participant.name}</TableCell>
                  <TableCell className="p-3 text-gray-700">{participant.rank}</TableCell>
                  <TableCell className="p-3 text-gray-700">{participant.extra_data.class}</TableCell>
                  <TableCell className="p-3 truncate max-w-0 text-gray-700">
                    {participant.players[0].extra_data.club}
                  </TableCell>
                  <TableCell className="p-3 text-gray-700">{participant.players[0].sex}</TableCell>
                  <TableCell className="p-3 text-gray-700">
                    {participant.players[0].extra_data.eltl_id}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-500">
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
