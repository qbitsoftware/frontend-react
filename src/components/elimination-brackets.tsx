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
  const [hoveredPlayerId, setHoveredPlayerId] = useState<string | null>(null);

  const handlePrint = () => {
    setShowPreview(true);
  };

  return (
    <div className='border-grey-200 border rounded-t-lg'>
      <div className="z-40 top-0 w-full hide-in-pdf">
        <div className="px-0 w-full bg-[#F8F9FA] rounded-t-lg pdf-background">
          <div className="flex flex-col sm:flex-row sm:items-center px-2 py-3 gap-3 sm:gap-4">
            <div className="flex-1 min-w-0 order-2 sm:order-1">
              <Tabs
                defaultValue={data?.eliminations[0]?.elimination[0].name}
                className="z-10 w-full"
              >
                <div className="w-full overflow-x-auto">
                  <TabsList className="flex justify-start gap-2 px-0 bg-transparent min-w-max h-auto">
                    {data.eliminations.map((item, index) => (
                      <TabsTrigger
                        key={index}
                        value={item.elimination[0].name}
                        className="flex-shrink-0 px-3 sm:px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 data-[state=active]:bg-[#4C97F1] data-[state=active]:text-white data-[state=active]:shadow-md bg-gray-100 text-gray-700 hover:bg-gray-200 border-0 min-w-[70px] text-center"
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
                        <span className="truncate">
                          {item.elimination[0].name}
                        </span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
              </Tabs>
            </div>

            <Button
              variant="outline"
              className="hidden sm:flex flex-shrink-0 order-1 sm:order-2 self-end sm:self-auto"
              onClick={handlePrint}
            >
              <Printer className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm">
                {t("admin.tournaments.groups.tables.print")}
              </span>
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
        <div className="flex flex-col gap-6 sm:gap-8 lg:gap-10 px-1 sm:px-4 lg:px-10 min-w-max">
          {data.eliminations.map((eliminations, eliminationIndex) => {
            return eliminations.elimination.map((table, tableIndex) => {
              const uniqueKey = `elimination-${eliminationIndex}-table-${tableIndex}`;
              const uniqueId = `${eliminations.elimination[0].name}`;

              return (
                <div key={uniqueKey}>
                  <div className={`font-bold text-lg sm:text-xl lg:text-2xl py-2 sm:py-3 lg:py-4 px-1 sm:px-0 bracket-title bracket-title-${table.name.replace(/\s+/g, '-').toLowerCase()}`}>
                    {table.name}
                  </div>
                  {table.name !== BracketType.MIINUSRING ? (
                    <div className="" id={uniqueId}>
                      <SingleElimination
                        admin={admin}
                        tournament_table={tournament_table}
                        data={table}
                        handleSelectMatch={handleSelectMatch}
                        hoveredPlayerId={hoveredPlayerId}
                        onPlayerHover={setHoveredPlayerId}
                      />
                    </div>
                  ) : (
                    <div className="" id={uniqueId}>
                      <DoubleElimination
                        admin={admin}
                        tournament_table={tournament_table}
                        data={table}
                        handleSelectMatch={handleSelectMatch}
                        hoveredPlayerId={hoveredPlayerId}
                        onPlayerHover={setHoveredPlayerId}
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

