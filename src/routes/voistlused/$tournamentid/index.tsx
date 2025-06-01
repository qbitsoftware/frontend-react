import { createFileRoute } from "@tanstack/react-router";
import ErrorPage from "../../../components/error";
import { formatDateString } from "@/lib/utils";
import { useTournament } from "./-components/tournament-provider";
import Editor from "@/routes/admin/-components/yooptaeditor";
import { useState, useMemo } from "react";
import { YooptaContentValue } from "@yoopta/editor";
import { useTranslation } from "react-i18next";

interface YooptaEditorNode {
  id?: string;
  type?: string;
  text?: string;
  children?: YooptaEditorNode[];
  value?: YooptaEditorNode[];
  [key: string]: any;
}

export const Route = createFileRoute("/voistlused/$tournamentid/")({
  errorComponent: () => {
    return <ErrorPage />;
  },
  component: RouteComponent,
});

function RouteComponent() {
  const tournament = useTournament();
  const { t } = useTranslation();
  const [value, setValue] = useState<YooptaContentValue | undefined>(
    tournament.information ? JSON.parse(tournament.information) : undefined
  );

  const hasContent = useMemo(() => {
    if (!value) return false;

    const hasNonEmptyText = (obj: unknown): boolean => {
      if (!obj) return false;

      if (Array.isArray(obj)) {
        return obj.some((item) => hasNonEmptyText(item));
      }

      if (typeof obj === "object" && obj !== null) {
        const node = obj as YooptaEditorNode;

        if (
          node.text &&
          typeof node.text === "string" &&
          node.text.trim() !== ""
        ) {
          return true;
        }

        if (node.children) {
          return hasNonEmptyText(node.children);
        }

        if (node.value) {
          return hasNonEmptyText(node.value);
        }

        return Object.values(node).some((val) => hasNonEmptyText(val));
      }

      return false;
    };

    return hasNonEmptyText(value);
  }, [value]);

  return (
    <div className="">
      <div
        className={`pb-8 overflow-y-auto flex flex-col items-start ${hasContent ? "justify-center" : "justify-start"}' md:flex-row md:space-x-12`}
      >
        {tournament ? (
          <>
            {tournament.information && hasContent && (
              <div className="w-full md:w-2/3 bg-white rounded-lg">
                <Editor value={value} setValue={setValue} readOnly />
              </div>
            )}
            <div className="w-full md:w-1/3 flex flex-col  border border-[#EBEEF4] rounded-md p-3 md:p-6 space-y-4 ">
              <div className="pl-4 space-y-2">
                <div className=" flex justify-between mr-4">
                  <p>{t("competitions.start")}: </p>
                  <span className="font-medium ">
                    {formatDateString(tournament.start_date)}
                  </span>
                </div>

                <div className="flex justify-between mr-4">
                  <p>{t("competitions.end")}: </p>
                  <span className="font-medium ">
                    {formatDateString(tournament.end_date)}
                  </span>
                </div>

                <div className="flex justify-between mr-4">
                  <p>{t("competitions.location")}: </p>
                  <span className="font-medium">{tournament.location}</span>
                </div>

                <div className="flex justify-between mr-4">
                  <p>{t("competitions.tables")}: </p>
                  <span className="font-medium ">{tournament.total_tables}</span>
                </div>
              </div>

              <div className="pl-4 space-y-2">
                <div className="flex justify-between mr-4">
                  <p>{t("competitions.organizer")}: </p>
                  <span className="font-medium">ELTL</span>
                </div>

                <div className="flex justify-between mr-4">
                  <p>{t("competitions.category")}: </p>
                  <span className="font-medium">{tournament.category}</span>
                </div>

              </div>
            </div>
          </>
        ) : (
          <div>{t("competitions.errors.info_missing")}</div>
        )}
      </div>
    </div>
  );
}
