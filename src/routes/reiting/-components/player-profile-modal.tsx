import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlayerProfileData } from "./player-profile-data";
import placeholderImg from "@/assets/blue-profile.png";
import { UseGetUserProfile } from "@/queries/players";
import { User } from "@/types/users";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PlayerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export const PlayerProfileModal = ({ isOpen, onClose, user }: PlayerProfileModalProps) => {
  const { t } = useTranslation();
  const { data: profileResponse, isLoading, error } = UseGetUserProfile(user?.id || 0);
  
  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[100vw] h-[100vh] sm:w-[90vw] sm:h-[90vh] md:max-w-6xl md:h-[700px] overflow-y-auto py-0 px-0 bg-white sm:rounded-2xl shadow-2xl border-0 sm:max-h-[90vh]">
        <DialogClose className="absolute right-4 top-4 sm:right-6 sm:top-6 p-2 sm:p-3 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#4C97F1]/20 transition-all duration-300 z-10">
          <X className="h-5 w-5 text-gray-600 hover:text-gray-800" />
          <span className="sr-only">Close</span>
        </DialogClose>
        <div className="flex flex-col h-full">
          <div className="flex flex-col items-center space-y-4 sm:space-y-6 w-full p-4 sm:p-6 md:p-8 bg-gradient-to-br from-[#4C97F1]/5 to-blue-50/50 border-b border-gray-200/50 md:border-b-0">
            <Avatar className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-48 lg:h-48 shadow-xl ring-2 sm:ring-4 ring-white">
              <AvatarImage src="" alt={`${user.first_name} ${user.last_name}'s profile`} />
              <AvatarFallback>
                <img src={placeholderImg} className="rounded-full h-full w-full object-cover" alt="Profile" />
              </AvatarFallback>
            </Avatar>

            <div className="text-center space-y-1 sm:space-y-2">
              <h2 className="font-bold text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-900">
                {user.first_name} {user.last_name}
              </h2>
              <div className="h-0.5 sm:h-1 w-12 sm:w-16 bg-[#4C97F1] rounded-full mx-auto"></div>
            </div>

            <div className="flex flex-col items-center gap-2 sm:gap-3">
              <div className="bg-white/80 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-md">
                <p className="text-[#4C97F1] font-semibold text-xs sm:text-sm">{user.club.name || ""}</p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#4C97F1] rounded-full"></div>
                  <span>{t("rating.player_modal.fields.rank")}{user.rate_order}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>{user.rate_points} {t("rating.player_modal.fields.rating_points")}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full flex-1 flex p-4 sm:p-6 md:p-8">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-pulse flex space-x-4">
                  <div className="flex-1 space-y-4 py-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </div>
                </div>
              </div>
            ) : error ? (
              <div className="text-red-500 p-4 bg-red-50 rounded-lg">{t("rating.player_modal.errors.loading_profile")}</div>
            ) : profileResponse?.data ? (
              <PlayerProfileData profile={profileResponse.data} />
            ) : (
              <div className="text-gray-500 p-4 bg-gray-50 rounded-lg">{t("rating.player_modal.errors.no_profile_data")}</div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
