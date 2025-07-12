import { Bracket, BracketType } from "@/types/brackets";
import { TournamentTable } from "@/types/groups";
import { MatchWrapper } from "@/types/matches";
import { SingleElimination } from "./single-elimination";
import { DoubleElimination } from "./double-elimination";
import { Separator } from "./ui/separator";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { useRef, useState } from "react";
import { Button } from "./ui/button";
import { Printer } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PDFPreviewModal } from "./pdf-preview-modal";

interface TournamentTableProps {
  admin?: boolean;
  data: Bracket;
  tournament_table: TournamentTable;
  handleSelectMatch?: (match: MatchWrapper) => void;
}

export const EliminationBrackets = ({
  admin = false,
  data,
  tournament_table,
  handleSelectMatch,
}: TournamentTableProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const [showPreview, setShowPreview] = useState(false);

  const handlePrint = () => {
    setShowPreview(true);
  };

  return (
    <div className='border-grey-200 border-x border-b'>
      <div className="z-40 top-0 w-full">
        <div className="px-4 w-full bg-[#F8F9FA] rounded-t pdf-background">
          <div className="flex justify-between items-center py-3">
            {/* Bracket Jump-to Tabs */}
            <Tabs
              defaultValue={data?.eliminations[0]?.elimination[0].name}
              className="z-10 flex-1"
            >
              <TabsList className="flex justify-start gap-4 px-0 text-black bg-transparent overflow-x-auto scrollbar-hide">
                {data.eliminations.map((item, index) => (
                  <TabsTrigger
                    key={index}
                    value={item.elimination[0].name}
                    className="flex-shrink-0 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 data-[state=active]:bg-[#4C97F1] data-[state=active]:text-white data-[state=active]:shadow-sm bg-[#4C97F1] text-white"
                    onClick={() => {
                      const container = scrollContainerRef.current;
                      const targetElement = document.getElementById(
                        item.elimination[0].name,
                      );

                      if (container && targetElement) {
                        const containerRect = container.getBoundingClientRect();
                        const targetRect = targetElement.getBoundingClientRect();
                        const scrollTop =
                          targetRect.top -
                          containerRect.top +
                          container.scrollTop -
                          50;
                        container.scrollTo({
                          top: scrollTop,
                          behavior: "smooth",
                        });
                      }
                    }}
                  >
                    {item.elimination[0].name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            
            {/* Print Button */}
            <Button
              variant="outline"
              className="ml-4 flex-shrink-0"
              onClick={handlePrint}
            >
              <Printer className="mr-2 h-4 w-4" />
              {t("admin.tournaments.groups.tables.print")}
            </Button>
          </div>
          <Separator className="border-gray-300" />
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="bg-[#F8F9FA] relative h-[85vh] flex flex-col overflow-auto"
        id="bracket-container"
      >
        <div className="flex flex-col gap-10 px-10 min-w-max">
          {data.eliminations.map((eliminations, eliminationIndex) => {
            return eliminations.elimination.map((table, tableIndex) => {
              const uniqueKey = `elimination-${eliminationIndex}-table-${tableIndex}`;
              const uniqueId = `${eliminations.elimination[0].name}`;

              return (
                <div key={uniqueKey}>
                  <div className="font-bold text-xl py-4">{table.name}</div>
                  {table.name !== BracketType.MIINUSRING ? (
                    <div className="" id={uniqueId}>
                      <SingleElimination
                        admin={admin}
                        tournament_table={tournament_table}
                        data={table}
                        handleSelectMatch={handleSelectMatch}
                      />
                    </div>
                  ) : (
                    <div className="" id={uniqueId}>
                      <DoubleElimination
                        admin={admin}
                        tournament_table={tournament_table}
                        data={table}
                        handleSelectMatch={handleSelectMatch}
                      />
                    </div>
                  )}
                </div>
              );
            });
          })}
        </div>
      </div>

      <PDFPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        containerId="bracket-container"
        title={tournament_table ? `${tournament_table.class} Tournament` : "Tournament Bracket"}
      />
    </div>
  );
};

