import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { TournamentForm } from "../-components/tournament-form";
import ErrorPage from "@/components/error";
import MediaComponent from "../-components/media-comp";
import { useTranslation } from "react-i18next";

import ImageComp from "../-components/images-comp";
import { UseGetTournamentAdmin } from "@/queries/tournaments";

export const Route = createFileRoute("/admin/tournaments/$tournamentid/")({
  loader: async ({ context: { queryClient }, params }) => {
    const tournamentId = Number(params.tournamentid);
    let tournament = queryClient.getQueryData(
      UseGetTournamentAdmin(tournamentId).queryKey,
    );
    if (!tournament) {
      tournament = await queryClient.fetchQuery(UseGetTournamentAdmin(tournamentId));
    }
    return { tournament };
  },
  errorComponent: () => <ErrorPage />,
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation();

  const { tournament } = Route.useLoaderData();
  const [activeTab, setActiveTab] = useState<"info" | "media" | "images">(
    "info",
  );

  const tabs = [
    {
      id: "info" as const,
      label: "info",
      icon: "/icons/settings.svg",
      type: "svg" as const,
    },
    {
      id: "images" as const,
      label: "images",
      icon: "/icons/videos.svg",
      type: "svg" as const,
    },
  ];

  return (
    <div className="min-h-screen">
      <div className="bg-white/60 backdrop-blur-sm border-b border-gray-100">
        <div className="px-2">
          <nav className="flex gap-1" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  relative flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 whitespace-nowrap
                  ${activeTab === tab.id
                    ? "bg-blue-50 text-blue-700 shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }
                `}
              >
                <img
                  src={tab.icon}
                  alt={`${tab.label} icon`}
                  className={`w-4 h-4 transition-opacity ${
                    activeTab === tab.id ? "opacity-100" : "opacity-60"
                  }`}
                />
                {t(`admin.layout.${tab.label}`)}
                {activeTab === tab.id && (
                  <div className="absolute -bottom-[1px] left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-blue-500 rounded-full" />
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>
      
      <div className="p-2">
        {activeTab === "info" && (
          <div className="animate-in fade-in-50 duration-200">
            <TournamentForm initial_data={tournament.data} />
          </div>
        )}
        {activeTab === "media" && tournament.data && (
          <div className="animate-in fade-in-50 duration-200">
            <MediaComponent tournament={tournament.data} />
          </div>
        )}
        {activeTab === "images" && tournament.data && (
          <div className="animate-in fade-in-50 duration-200">
            <ImageComp tournament_id={tournament.data.id} />
          </div>
        )}
      </div>
    </div>
  );
}

