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
      id: "media" as const,
      label: "media",
      icon: "/icons/write.svg",
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
    <div className="">
      <div className="bg-transparent shadow-sm border-b mb-6">
        <nav className="flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }
              `}
            >
              <img
                src={tab.icon}
                alt={`${tab.label} icon`}
                className={`w-4 h-4 
                `}
              />
              {t(`admin.layout.${tab.label}`)}
            </button>
          ))}
        </nav>
      </div>
      <div className="bg-transparent">
        {activeTab === "info" && (
          <div>
            <TournamentForm initial_data={tournament.data} />
          </div>
        )}
        {activeTab === "media" && tournament.data && (
          <MediaComponent tournament={tournament.data} />
        )}
        {activeTab === "images" && tournament.data && (
          <ImageComp tournament_id={tournament.data.id} />
        )}
      </div>
    </div>
  );
}

