import { createFileRoute } from "@tanstack/react-router";
import { YooptaContentValue } from "@yoopta/editor";
import Editor from "@/routes/admin/-components/yooptaeditor";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  UseGetTournamentAdmin,
  UsePatchTournamentMedia,
} from "@/queries/tournaments";
import ErrorPage from "@/components/error";
import { Card, CardHeader } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export const Route = createFileRoute(
  "/admin/tournaments/$tournamentid/meedia/"
)({
  component: RouteComponent,
  errorComponent: () => <ErrorPage />,
  loader: async ({ context: { queryClient }, params }) => {
    const tournamentId = Number(params.tournamentid);
    let tournament = queryClient.getQueryData(
      UseGetTournamentAdmin(tournamentId).queryKey
    );

    if (!tournament) {
      tournament = await queryClient.fetchQuery(UseGetTournamentAdmin(tournamentId));
    }

    return { tournament };
  },
});

function RouteComponent() {
  const { t } = useTranslation();
  const { tournament } = Route.useLoaderData();
  const [value, setValue] = useState<YooptaContentValue | undefined>(
    JSON.parse((tournament && tournament.data && tournament.data.media) || "{}")
  );
  const mediaMutation = UsePatchTournamentMedia(
    Number(Route.useParams().tournamentid)
  );

  const handleSave = async () => {
    try {
      await mediaMutation.mutateAsync({ media: JSON.stringify(value) });
      toast.message(t("toasts.media.save_success"))
    } catch (error) {
      void error;
      toast.error(t("toasts.media.save_error"));
    }
  };

  return (
    <Card className="w-full border-none shadow-none bg-transparent">
      <CardHeader className="px-0 flex-col md:flex-row gap-4 justify-between items-start md:items-center space-y-0">
        <h5 className="font-medium">{t('admin.media.title')}</h5>
        <Button
          onClick={handleSave}
          disabled={mediaMutation.isPending}
        >
          {mediaMutation.isPending ? t("admin.media.save_progress") : t("admin.media.save_button")}
        </Button>
      </CardHeader>
      <div className="">
        <Editor value={value} setValue={setValue} readOnly={false} />
      </div>
    </Card>
  );
}
