import { Input } from "@/components/ui/input";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Search,
  Trophy,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/profile/")({
  component: RouteComponent,
  // loader: async ({ context: { queryClient } }) => {
    // const tournaments = await queryClient.ensureQueryData(
    //   UseGetProfileTournaments(),
    // );
  //   return { tournaments };
  // },
});

function RouteComponent() {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate()
  navigate({to: "/profile/settings"})
  // const [expandedTournaments, setExpandedTournaments] = useState<number[]>([]);
  // const { tournaments } = Route.useLoaderData();
  // const tournaments: TournamentWithGroups[] = [];
  // const router = useRouter();
  const { t } = useTranslation();

  // const toggleTournamentExpansion = (tournamentId: number) => {
  //   setExpandedTournaments((prev) =>
  //     prev.includes(tournamentId)
  //       ? prev.filter((id) => id !== tournamentId)
  //       : [...prev, tournamentId],
  //   );
  // };

  // const filteredTournaments = tournaments?.filter(
  //   (tournamentWithGroups) =>
  //     tournamentWithGroups.tournament.name
  //       .toLowerCase()
  //       .includes(searchTerm.toLowerCase()) ||
  //     tournamentWithGroups.tournament.location
  //       .toLowerCase()
  //       .includes(searchTerm.toLowerCase()) ||
  //     tournamentWithGroups.tournament.category
  //       .toLowerCase()
  //       .includes(searchTerm.toLowerCase()),
  // );

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Floating accent elements */}
        <div className="absolute top-6 right-6 w-24 h-24 bg-blue-500 rounded-full opacity-5 blur-3xl" />
        <div className="absolute bottom-6 left-6 w-32 h-32 bg-purple-500 rounded-full opacity-5 blur-3xl" />

        <div className="relative z-10 p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div>
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#4C97F1] flex items-center justify-center text-white">
                  <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                  {t("profile.tournaments.title")}
                </h2>
              </div>
              <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
                {t("profile.tournaments.subtitle")}
              </p>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <Input
                placeholder={t("profile.tournaments.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 sm:pl-12 w-full h-10 sm:h-12 rounded-xl border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          {/* {!tournaments?.data && (
            <div className="grid gap-6">
              {[1, 2, 3].map((index) => (
                <TournamentSkeleton key={`skeleton-${index + 1}`} />
              ))}
            </div>
          )}

          {tournaments?.data && tournaments.data.length === 0 && (
            <div className="text-center py-12 sm:py-16">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 mb-4 sm:mb-6">
                <CalendarX className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                {t("profile.tournaments.empty.title")}
              </h3>
              <p className="text-gray-600 mb-4 sm:mb-6 max-w-md mx-auto px-4">
                {t("profile.tournaments.empty.description")}
              </p>
              <Button className="bg-[#4C97F1] text-white shadow-lg hover:shadow-xl transition-all duration-200">
                <Trophy className="w-4 h-4 mr-2" />
                {t("profile.tournaments.empty.button")}
              </Button>
            </div>
          )} */}

          {/* Empty Search Results */}
          {/* {tournaments?.data &&
            tournaments.data.length > 0 &&
            filteredTournaments?.length === 0 &&
            searchTerm && (
              <div className="text-center py-8 sm:py-12">
                <Search className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                  {t("profile.tournaments.noResults.title")}
                </h3>
                <p className="text-gray-600 mb-3 sm:mb-4 px-4">
                  {t("profile.tournaments.noResults.description")}
                </p>
                <Button
                  variant="outline"
                  onClick={() => setSearchTerm("")}
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  {t("profile.tournaments.noResults.clearButton")}
                </Button>
              </div>
            )}
 */}
          {/* Enhanced Tournament Cards */}
          {/* {tournaments?.data &&
            filteredTournaments &&
            filteredTournaments.length > 0 && (
              <div className="space-y-4 sm:space-y-6">
                {filteredTournaments.map((tournamentWithGroups) => {
                  const tournament = tournamentWithGroups.tournament;
                  const groups = tournamentWithGroups.groups;
                  const isExpanded = expandedTournaments.includes(
                    tournament.id,
                  );
                  const availableGroups =
                    groups?.filter(
                      (g) => !g.size || (g.participants?.length || 0) < g.size,
                    ).length || 0;

                  return (
                    <div
                      key={tournament.id}
                      className="group relative bg-gradient-to-r from-gray-50 via-white to-blue-50/30 rounded-xl sm:rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300 overflow-hidden"
                    >
                      <div className="absolute -top-2 -right-2 w-16 h-16 sm:w-20 sm:h-20 bg-blue-500 rounded-full opacity-5 blur-2xl group-hover:opacity-10 transition-opacity duration-300" />
                      <div className="absolute -bottom-2 -left-2 w-20 h-20 sm:w-24 sm:h-24 bg-purple-500 rounded-full opacity-5 blur-2xl" />

                      <div className="relative z-10 p-4 sm:p-6">
                        <div className="space-y-4">
                          <div className="min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                              <h3 className="font-bold text-lg sm:text-xl text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                                {tournament.name}
                              </h3>
                              <div className="flex flex-wrap gap-2">
                                <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                  {t("profile.tournaments.registrationOpen")}
                                </div>
                                {availableGroups > 0 && (
                                  <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                                    <Zap className="w-3 h-3" />
                                    {t("profile.tournaments.spotsAvailable", {
                                      count: availableGroups,
                                    })}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4">
                              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0" />
                                <span className="truncate">
                                  {new Date(
                                    tournament.start_date,
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                                <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 flex-shrink-0" />
                                <span className="truncate">
                                  {tournament.location}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                                <Target className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500 flex-shrink-0" />
                                <span className="truncate">
                                  {tournament.category}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                                <Users className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                                <span>
                                  {t("profile.tournaments.groupsCount", {
                                    count: groups?.length || 0,
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 h-[70px]">
                            <Button
                              variant="outline"
                              type="button"
                              size="sm"
                              className="flex-1 sm:flex-none h-10 sm:h-8 group/btn text-gray-600 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                              onClick={() =>
                                router.navigate({
                                  to: `/tournaments/${tournament.id}`,
                                })
                              }
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              <span className="hidden sm:inline">
                                {t("profile.tournaments.detailsButton")}
                              </span>
                              <span className="sm:hidden">
                                {t("profile.tournaments.viewButton")}
                              </span>
                              <ExternalLink className="w-3 h-3 ml-2 group-hover/btn:translate-x-0.5 transition-transform" />
                            </Button>

                            {groups && groups.length > 0 && (
                              <Button
                                onClick={() =>
                                  toggleTournamentExpansion(tournament.id)
                                }
                                size="sm"
                                className="flex-1 sm:flex-none group/btn bg-[#4C97F1] text-white shadow-sm hover:shadow-md hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
                              >
                                {isExpanded ? (
                                  <>
                                    <ChevronUp className="w-4 h-4 mr-2" />
                                    {t("profile.tournaments.hideGroups")}
                                  </>
                                ) : (
                                  <>
                                    <Trophy className="w-4 h-4 mr-2" />
                                    <span className="hidden sm:inline">
                                      {t(
                                        "profile.tournaments.chooseGroupLong",
                                        { count: groups.length },
                                      )}
                                    </span>
                                    <span className="sm:hidden">
                                      {t(
                                        "profile.tournaments.chooseGroupShort",
                                        { count: groups.length },
                                      )}
                                    </span>
                                    <ChevronDown className="w-4 h-4 ml-2 group-hover/btn:translate-y-0.5 transition-transform" />
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
 */}
                      {/* {isExpanded && groups && groups.length > 0 && (
                        <div className="border-t-2 border-blue-200 bg-gradient-to-r from-blue-50 via-white to-blue-50 sm:bg-gradient-to-r sm:from-white sm:via-blue-50/30 sm:to-white">
                          <div className="p-3 sm:p-6">
                            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-6">
                              <div className="w-5 h-5 sm:w-8 sm:h-8 rounded-lg bg-[#4C97F1] flex items-center justify-center text-white">
                                <Award className="w-3 h-3 sm:w-4 sm:h-4" />
                              </div>
                              <h4 className="text-sm sm:text-lg font-semibold text-gray-900">
                                {t("profile.tournaments.selectGroup")}
                              </h4>
                              <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
                            </div>

                            <div className="space-y-2 sm:space-y-4">
                              {groups.map((group) => {
                                const isFull =
                                  group.size &&
                                  group.participants &&
                                  group.participants.length >= group.size;
                                const participantCount =
                                  group.participants?.length || 0;

                                return (
                                  <div
                                    key={group.id}
                                    className="group/group relative bg-white rounded-lg border border-blue-200 sm:border-gray-200 p-3 sm:p-4 hover:border-blue-300 hover:shadow-sm transition-all duration-200 overflow-hidden shadow-sm sm:shadow-none"
                                  >
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600" />

                                    <div className="space-y-2 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-1 sm:mb-3">
                                          <h5 className="font-semibold text-gray-900 text-sm sm:text-lg truncate">
                                            {group.class}
                                          </h5>
                                          <div className="flex flex-wrap gap-1 sm:gap-2">
                                            <div className="inline-flex items-center gap-1 px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                              <UserCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                              {participantCount}
                                              {group.size && `/${group.size}`}
                                            </div>
                                            {!isFull && (
                                              <div className="inline-flex items-center gap-1 px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                                {t("profile.tournaments.open")}
                                              </div>
                                            )}
                                          </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-6 text-xs text-gray-600">
                                          <span>
                                            {t("profile.tournaments.status")}:{" "}
                                            {group.state ||
                                              t(
                                                "profile.tournaments.registrationOpenStatus",
                                              )}
                                          </span>
                                          {participantCount > 0 && (
                                            <span className="truncate">
                                              {t(
                                                "profile.tournaments.latestPlayer",
                                              )}
                                              :{" "}
                                              {group.participants?.[
                                                participantCount - 1
                                              ]?.name ||
                                                t(
                                                  "profile.tournaments.anonymous",
                                                )}
                                            </span>
                                          )}
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-2 sm:gap-3 sm:ml-4 mt-2 sm:mt-0">
                                        {isFull ? (
                                          <div className="flex items-center gap-2 px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-red-50 border border-red-200">
                                            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                            <span className="text-xs font-medium text-red-700">
                                              {t(
                                                "profile.tournaments.groupFull",
                                              )}
                                            </span>
                                          </div>
                                        ) : (
                                          <Button
                                            size="sm"
                                            className="w-full sm:w-auto h-9 sm:h-8 group/register bg-gradient-to-r from-green-600 to-green-700 text-white shadow-sm hover:shadow-md hover:from-green-700 hover:to-green-800 transition-all duration-200"
                                          >
                                            <Trophy className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                                            <span className="text-sm">
                                              {t(
                                                "profile.tournaments.registerButton",
                                              )}
                                            </span>
                                            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2 group-hover/register:translate-x-1 transition-transform" />
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div> */}

                            {/* <div className="mt-3 sm:mt-6 pt-2 sm:pt-4 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-gray-600">
                                <span className="flex items-center gap-1 sm:gap-2">
                                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-500" />
                                  {t("profile.tournaments.groupsAvailable", {
                                    count: availableGroups,
                                  })}
                                </span>
                                <span className="flex items-center gap-1 sm:gap-2">
                                  <UserCheck className="w-3 h-3 sm:w-4 sm:h-4" />
                                  {t("profile.tournaments.totalParticipants", {
                                    count: groups.reduce(
                                      (total, g) =>
                                        total + (g.participants?.length || 0),
                                      0,
                                    ),
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )} */}

                      {/* {isExpanded && (!groups || groups.length === 0) && (
                        <div className="border-t-2 border-blue-200 bg-blue-50 sm:border-t sm:border-gray-200 sm:bg-gray-50/50">
                          <div className="p-4 sm:p-6 lg:p-8 text-center">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2 sm:mb-3 lg:mb-4">
                              <Users className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-gray-400" />
                            </div>
                            <h4 className="text-sm sm:text-base lg:text-lg font-medium text-gray-900 mb-1 sm:mb-2">
                              {t("profile.tournaments.noGroups.title")}
                            </h4>
                            <p className="text-xs sm:text-sm lg:text-base text-gray-600">
                              {t("profile.tournaments.noGroups.description")}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )} */}

          {/* {tournaments?.data && tournaments.data.length > 0 && (
            <div className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-gray-500">
              {t("profile.tournaments.showingCount", {
                filtered: filteredTournaments?.length || 0,
                total: tournaments.data.length,
              })}
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
}
