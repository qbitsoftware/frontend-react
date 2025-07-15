import { createFileRoute, Link } from "@tanstack/react-router";
import ErrorPage from "@/components/error";
import {
  UseGetTournamentsPublic,
  type TournamentsResponse,
} from "@/queries/tournaments";
import CalendarView from "@/components/CalendarView";
import { motion } from "framer-motion";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CalendarX2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/kalender/")({
  errorComponent: () => {
    return <ErrorPage />;
  },
  component: RouteComponent,
  loader: async ({ context: { queryClient } }) => {
    let tournaments: TournamentsResponse = {
      data: [],
      message: "Default empty state",
      error: null,
    };

    try {
      tournaments = await queryClient.ensureQueryData(UseGetTournamentsPublic());
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        console.warn("Tournaments API returned 404");
      } else {
        throw error;
      }
    }

    const dataStatus = {
      tournamentsEmpty: !tournaments?.data?.length,
    };

    return { tournaments, dataStatus };
  },
});

function RouteComponent() {
  const { tournaments, dataStatus } = Route.useLoaderData();
  const {t} = useTranslation()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 max-w-[1440px]">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2, delay: 0 }}
          className=""
        >
          {dataStatus.tournamentsEmpty ? (
            <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-center">
              <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 sm:p-12 max-w-md mx-auto">
                <div className="relative inline-block mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center">
                    <CalendarX2 className="h-10 w-10 text-blue-500"/>
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                    <span className="text-xs font-bold">!</span>
                  </div>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">{t("calendar.no_tournaments")}</h2>
                <p className="text-gray-600 mb-8 text-sm sm:text-base leading-relaxed">
                  {t("calendar.no_tournaments_subtitle")}
                </p>
                <Button asChild className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all">
                  <Link to="/">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {t("errors.general.home") || "Mine kodulehele"}
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <CalendarView tournaments={tournaments.data || []} />
          )}
        </motion.div>
      </div>
    </div>
  );
}