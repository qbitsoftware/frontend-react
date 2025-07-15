import type React from "react"
import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import placeholderImg from "@/assets/blue-profile.png"
import clubPlaceholder from "@/assets/clubPlaceholder.svg"
import { useTranslation } from "react-i18next"
import { ImageModal } from "./image-modal"
import { Participant } from "@/types/participants"
import { TournamentTable } from "@/types/groups"
import { GroupType } from "@/types/matches"

interface TeamTableProps {
  participants: Participant[] | null
  table_data: TournamentTable
}

const TeamTable: React.FC<TeamTableProps> = ({ participants, table_data }) => {
  const [selectedTeam, setSelectedTeam] = useState<Participant | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { t } = useTranslation()

  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)

  const openModal = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setIsImageModalOpen(true);
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false)
    setSelectedImage(null)
  }

  const handleCardClick = (participant: Participant) => {
    setSelectedTeam(participant)
    setIsDialogOpen(true)
  }

  return (
    <div className=" w-full md:w-[320px] h-full rounded-md">
      {participants && participants.length > 0 ? (
        <div className=" flex flex-col gap-2">
          {participants.map((participant) => (
            <div
              key={participant.id}
              onClick={() => handleCardClick(participant)}
              className=" border bg-white rounded-lg px-3 py-1 cursor-pointer hover:shadow-md transition-shadow duration-200 hover:bg-gray-50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={participant.extra_data.image_url}
                      className="object-cover"
                    />
                    <AvatarFallback>
                      <img src={clubPlaceholder} className='rounded-full' alt="Club" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h6 className="font-medium text-gray-900 ">
                      {participant.name}
                    </h6>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm text-gray-600">
                    {participant.players ? participant.players.length : 0}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white shadow-lg rounded-lg p-8 text-center h-full flex items-center justify-center">
          <p className="text-gray-500 text-lg">{t('competitions.participants.no_players')}</p>
        </div>
      )}

      {selectedImage && (
        <ImageModal
          imageUrl={selectedImage}
          onClose={closeImageModal}
          isOpen={isImageModalOpen}
        />
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-scroll">
          <DialogHeader>
            <DialogTitle>{selectedTeam?.name} - {t('competitions.participants.team_players')}</DialogTitle>
          </DialogHeader>
          {selectedTeam?.players && selectedTeam.players.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('competitions.participants.table.nationality')}</TableHead>
                  <TableHead>{t('competitions.participants.table.image')}</TableHead>
                  <TableHead>{t('competitions.participants.table.name')}</TableHead>
                  <TableHead>{t('competitions.participants.table.rating_placement')}</TableHead>
                  <TableHead>{t('competitions.participants.table.class')}</TableHead>
                  <TableHead>{t('competitions.participants.table.club')}</TableHead>
                  <TableHead>{t('competitions.participants.table.foreign_player')}</TableHead>
                  <TableHead>{t('competitions.participants.table.sex')}</TableHead>
                  <TableHead>{t('competitions.participants.table.id')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedTeam.players
                  .slice()
                  .filter(player =>
                    table_data.type == GroupType.CHAMPIONS_LEAGUE ?
                      player.extra_data.image_url :
                      true)
                  .sort((a, b) => {
                    const aIsForeign = a.extra_data.club.toLowerCase().trim() === "välismängija";
                    const bIsForeign = b.extra_data.club.toLowerCase().trim() === "välismängija";

                    if (aIsForeign !== bIsForeign) {
                      return aIsForeign ? 1 : -1;
                    }

                    const aRating = a.extra_data.rate_order === 0 ? Number.MAX_SAFE_INTEGER : a.extra_data.rate_order;
                    const bRating = b.extra_data.rate_order === 0 ? Number.MAX_SAFE_INTEGER : b.extra_data.rate_order;

                    return aRating - bRating;
                  })
                  .map((player) => (
                    <TableRow key={player.id}>
                      <TableCell>
                        {player.nationality == "" ? "-" : player.nationality}
                      </TableCell>
                      <TableCell>
                        <Avatar onClick={(e) => {
                          e.stopPropagation();
                          player.extra_data.image_url &&
                            openModal(player.extra_data.image_url)
                        }}>
                          <AvatarImage
                            src={player.extra_data.image_url}
                            className="cursor-pointer object-cover"
                          />
                          <AvatarFallback><img src={placeholderImg} className='rounded-full' alt="Player" /></AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell>{`${player.first_name} ${player.last_name}`}</TableCell>
                      <TableCell>{player.extra_data.rate_order == 0 ? "-" : player.extra_data.rate_order}</TableCell>
                      <TableCell>{player.extra_data.class}</TableCell>
                      <TableCell>{player.extra_data.club}</TableCell>
                      <TableCell>{player.extra_data.foreign_player ? t('errors.general.value_yes') : t('errors.general.value_no')}</TableCell>
                      <TableCell>{player.sex}</TableCell>
                      <TableCell>{player.extra_data.eltl_id == 0 ? "?" : player.extra_data.eltl_id}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-8 text-center w-full">
              <p className="text-gray-500 text-lg">{t('competitions.participants.no_players')}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default TeamTable
