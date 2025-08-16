import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlayerRankingChangeGraph } from "./rating-chart";
import { useTranslation } from "react-i18next";
import { LastMatch } from "./last-matches";
import { formatDateToNumber } from "@/lib/utils";
import { Profile } from "@/types/users";

interface PlayerProfileDataProps {
  profile: Profile;
}

export const PlayerProfileData = ({ profile }: PlayerProfileDataProps) => {
  const { t } = useTranslation();

  return (
    <Tabs defaultValue="latest-matches" className="w-full h-full">
      <TabsList className="w-full grid grid-cols-1 md:grid-cols-3 bg-gray-100/50 p-1 rounded-xl border border-gray-200/50 mb-4">
        <TabsTrigger
          value="latest-matches"
          className="transition-all duration-300 data-[state=active]:bg-[#4C97F1] data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg"
        >
          {t("rating.player_modal.menus.latest_matches.title")}
        </TabsTrigger>
        <TabsTrigger
          value="temp-placeholder"
          className="transition-all duration-300 data-[state=active]:bg-[#4C97F1] data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg"
        >
          {t("rating.player_modal.menus.player_profile.title")}
        </TabsTrigger>
        <TabsTrigger
          value="rating-change"
          className="transition-all duration-300 data-[state=active]:bg-[#4C97F1] data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg"
        >
          {t("rating.player_modal.menus.rating_change_graph.title")}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="latest-matches" className="flex-1 overflow-y-auto">
        <div className="bg-white/50 backdrop-blur-sm p-4 md:p-6 rounded-xl shadow-lg border border-gray-200/50">
          <h3 className="font-semibold text-lg md:text-xl text-gray-900 mb-4 md:mb-6 flex items-center gap-3">
            <div className="w-1 h-6 bg-[#4C97F1] rounded-full"></div>
            {t("rating.player_modal.sections.recent_match_history")}
          </h3>

          <div className="space-y-1 sm:space-y-2 max-h-60 overflow-y-auto pr-1">
            {profile.matches && profile.matches.map((game, index) => (
              <LastMatch key={index} last_game={game} />
            ))}
          </div>
        </div>
      </TabsContent>

      <TabsContent value="temp-placeholder" className="flex-1 overflow-y-auto">
        <div className="bg-white/50 backdrop-blur-sm p-3 sm:p-4 md:p-6 rounded-xl shadow-lg border border-gray-200/50">
          <h3 className="font-semibold text-base sm:text-lg md:text-xl text-gray-900 mb-3 sm:mb-4 md:mb-6 flex items-center gap-2 sm:gap-3">
            <div className="w-1 h-4 sm:h-6 bg-[#4C97F1] rounded-full"></div>
            {t("rating.player_modal.sections.player_information")}
          </h3>

          <div className="grid grid-cols-2 lg:grid-cols-2 gap-2 sm:gap-3 md:gap-6">
            <div className="bg-gray-50/50 p-2 sm:p-3 md:p-4 rounded-lg border border-gray-200/30">
              <p className="text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2">{t("rating.player_modal.fields.nationality")}</p>
              <p className="font-semibold flex items-center text-gray-900 text-sm sm:text-base">
                {profile.user.foreigner === 0 ? (
                  <span className="text-base sm:text-lg">🇪🇪</span>
                ) : (
                  t("rating.player_modal.values.foreigner")
                )}
              </p>
            </div>

            <div className="bg-gray-50/50 p-2 sm:p-3 md:p-4 rounded-lg border border-gray-200/30">
              <p className="text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2">{t("rating.player_modal.fields.eltl_id")}</p>
              <p className="font-semibold text-gray-900 text-sm sm:text-base">{profile.user.eltl_id}</p>
            </div>

            <div className="bg-gray-50/50 p-2 sm:p-3 md:p-4 rounded-lg border border-gray-200/30">
              <p className="text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2">{t("rating.player_modal.fields.year_of_birth")}</p>
              <p className="font-semibold text-gray-900 text-sm sm:text-base">
                {profile.user.birth_date ? formatDateToNumber(profile.user.birth_date) : "----"}
              </p>
            </div>

            <div className="bg-gray-50/50 p-2 sm:p-3 md:p-4 rounded-lg border border-gray-200/30">
              <p className="text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2">{t("rating.player_modal.fields.rating")}</p>
              <p className="font-semibold text-[#4C97F1] text-sm sm:text-base">
                {t("rating.player_modal.fields.rank")}{profile.user.rate_order || "N/A"}
              </p>
            </div>

            <div className="bg-gray-50/50 p-2 sm:p-3 md:p-4 rounded-lg border border-gray-200/30 col-span-2 lg:col-span-1">
              <p className="text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2">{t("rating.player_modal.fields.sex")}</p>
              <p className="font-semibold text-gray-900 text-sm sm:text-base">
                {profile.user.sex === "M" ? t("rating.player_modal.values.male") : t("rating.player_modal.values.female")}
              </p>
            </div>
          </div>
        </div>

      </TabsContent>

      <TabsContent value="rating-change" className="flex-1 overflow-y-auto">
        <div className="bg-white/50 backdrop-blur-sm p-4 md:p-6 rounded-xl shadow-lg border border-gray-200/50">
          <h3 className="font-semibold text-lg md:text-xl text-gray-900 mb-4 md:mb-6 flex items-center gap-3">
            <div className="w-1 h-6 bg-[#4C97F1] rounded-full"></div>
            {t("rating.player_modal.sections.rating_progress")}
          </h3>
          <div className="w-full h-full">
            <PlayerRankingChangeGraph stats={profile.rating_events} user={profile.user} />
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};