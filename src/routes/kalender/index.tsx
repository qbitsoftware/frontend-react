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
    <div className="w-full mx-auto lg:px-4 max-w-[1440px]">
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2, delay: 0 }}
        className=""
      >
        {dataStatus.tournamentsEmpty ? (
          <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed rounded-md m-8 space-y-2">
            <CalendarX2 className="h-12 w-12 text-stone-600"/>
            <h2 className="font-semibold">{t("calendar.no_tournaments")}</h2>
            <p className="text-stone-500 pb-2">
              {t("calendar.no_tournaments_subtitle")}
            </p>
            <Button asChild variant="outline">
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t("errors.general.home") || "Mine kodulehele"}
              </Link>
            </Button>
          </div>
        ) : (
          <CalendarView tournaments={tournaments.data || []} />
        )}
      </motion.div>
    </div>
  );
}