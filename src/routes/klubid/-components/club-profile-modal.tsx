import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import React, { useEffect } from "react";
import { Club } from "@/types/clubs";
import { UseGetClubPlayers } from "@/queries/clubs";
import { formatDateToNumber } from "@/lib/utils";

interface ClubProfileModal {
  isOpen: boolean;
  onClose: () => void;
  club: Club | null;
}

export const ClubProfileModal: React.FC<ClubProfileModal> = ({
  isOpen,
  onClose,
  club,
}) => {
  const { t } = useTranslation();

  const clubName = club?.name || "";

  const { data: playerData, isLoading, refetch } = UseGetClubPlayers(clubName);

  useEffect(() => {
    if (isOpen && clubName) {
      refetch();
    }
  }, [isOpen, clubName, refetch]);

  if (isOpen && (isLoading || !playerData)) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl p-8 bg-white rounded-2xl shadow-xl">
          <div className="flex justify-center items-center h-40">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p>{t("clubs.loading_club_data")}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!club || !isOpen) return null;

  const players = playerData?.data || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-8 bg-white rounded-2xl shadow-xl max-h-[90vh] overflow-y-scroll">
        <div className="flex flex-col items-center space-y-4 mb-6">
          <DialogTitle className="text-3xl font-bold text-gray-900">
            {club.name}
          </DialogTitle>
        </div>

        {/* Contact Information Section */}
        <div className="mb-6 border-b pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {club.contact_person && (
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-blue-600"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">
                    {t("admin.clubs.table.contact_person")}
                  </p>
                  <p className="font-medium">{club.contact_person}</p>
                </div>
              </div>
            )}

            {club.email && (
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-blue-600"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">
                    {t("admin.clubs.table.email")}
                  </p>
                  <a
                    href={`mailto:${club.email}`}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {club.email}
                  </a>
                </div>
              </div>
            )}

            {club.phone && (
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-blue-600"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">
                    {t("admin.clubs.table.phone")}
                  </p>
                  <p className="font-medium">{club.phone}</p>
                </div>
              </div>
            )}

            {club.address && (
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-blue-600"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">
                    {t("admin.clubs.table.address")}
                  </p>
                  <p className="font-medium">{club.address}</p>
                </div>
              </div>
            )}

            {club.website && (
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-blue-600"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">
                    {t("admin.clubs.table.website")}
                  </p>
                  <a
                    href={club.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {club.website}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col space-y-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {t("clubs.club_players")}
            </h2>
            {players.length > 0 ? (
              <div className="overflow-x-auto rounded-lg shadow">
                <table className="w-full bg-white">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-100 to-gray-200 text-left text-gray-700">
                      <th className="px-4 py-3 font-semibold">#</th>
                      <th className="px-4 py-3 font-semibold">
                        {t("rating.table.head.last_name")}
                      </th>
                      <th className="px-4 py-3 font-semibold">
                        {t("rating.table.head.first_name")}
                      </th>
                      <th className="px-4 py-3 font-semibold">RP</th>
                      <th className="px-4 py-3 font-semibold">
                        {t("rating.table.head.birthyear")}
                      </th>
                      <th className="px-4 py-3 font-semibold">
                        {t("rating.table.head.sex")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {players.map((player, index) => (
                      <tr
                        key={index}
                        className="border-t border-gray-100 hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="px-4 py-3 text-gray-800">{index + 1}</td>
                        <td className="px-4 py-3 font-medium text-gray-800">
                          {player.last_name}
                        </td>
                        <td className="px-4 py-3 text-gray-800">
                          {player.first_name}
                        </td>
                        <td className="px-4 py-3 text-gray-800 font-medium">
                          {player.rate_points}
                        </td>
                        <td className="px-4 py-3 text-gray-800">
                          {formatDateToNumber(player.birth_date)}
                        </td>
                        <td className="px-4 py-3 text-gray-800">
                          {player.sex}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-gray-500">{t("clubs.no_players")}</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
