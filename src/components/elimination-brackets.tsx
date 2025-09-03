import { Bracket, BracketType } from "@/types/brackets";
import { TournamentTable } from "@/types/groups";
import { MatchWrapper } from "@/types/matches";
import { SingleElimination } from "./single-elimination";
import { DoubleElimination } from "./double-elimination";
import { Separator } from "./ui/separator";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { useRef, useState, useCallback } from "react";
import { Button } from "./ui/button";
import { Printer, QrCode, ZoomIn, ZoomOut, ArrowLeft, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PDFPreviewModal } from "./pdf-preview-modal";
import { printQRCodeToBlankSheet } from "@/lib/qr-print";
import { TransformWrapper, TransformComponent, useControls } from "react-zoom-pan-pinch";

interface TournamentTableProps {
  admin?: boolean;
  data: Bracket;
  tournament_table: TournamentTable;
  handleSelectMatch?: (match: MatchWrapper) => void;
}

const ZoomControls = () => {
  const { setTransform, instance } = useControls();

  const handleZoomIn = () => {
    const { scale, positionX, positionY } = instance.transformState;
    const newScale = Math.min(scale + 0.05, 1.5);
    
    setTransform(positionX, positionY, newScale);
  };

  const handleZoomOut = () => {
    const { scale, positionX, positionY } = instance.transformState;
    const newScale = Math.max(scale - 0.05, 0.4);
    
    setTransform(positionX, positionY, newScale);
  };

  const handlePan = useCallback((direction: 'left' | 'right') => {
    const { positionX, positionY, scale } = instance.transformState;
    const panAmount = 200;
    
    let newX = positionX;
    
    switch (direction) {
      case 'left':
        newX = Math.min(positionX + panAmount, 0);
        break;
      case 'right':
        newX = positionX - panAmount;
        break;
    }
    
    setTransform(newX, positionY, scale);
  }, [instance, setTransform]);

  return (
    <div className="absolute top-4 right-4 z-40">
      {/* Desktop Layout: 2x2 Grid */}
      <div className="hidden sm:grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePan('left')}
          className="flex-shrink-0 bg-white/90 backdrop-blur-sm shadow-lg w-8 h-8 p-0"
        >
          <ArrowLeft className="h-3 w-3" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePan('right')}
          className="flex-shrink-0 bg-white/90 backdrop-blur-sm shadow-lg w-8 h-8 p-0"
        >
          <ArrowRight className="h-3 w-3" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleZoomIn}
          className="flex-shrink-0 bg-white/90 backdrop-blur-sm shadow-lg w-8 h-8 p-0"
        >
          <ZoomIn className="h-3 w-3" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleZoomOut}
          className="flex-shrink-0 bg-white/90 backdrop-blur-sm shadow-lg w-8 h-8 p-0"
        >
          <ZoomOut className="h-3 w-3" />
        </Button>
      </div>
      
      {/* Mobile Layout: Single Column */}
      <div className="sm:hidden flex flex-col gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleZoomIn}
          className="flex-shrink-0 bg-white/90 backdrop-blur-sm shadow-lg w-8 h-8 p-0"
        >
          <ZoomIn className="h-3 w-3" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleZoomOut}
          className="flex-shrink-0 bg-white/90 backdrop-blur-sm shadow-lg w-8 h-8 p-0"
        >
          <ZoomOut className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

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

  const handlePrintQR = async () => {
    const currentUrl = window.location.href;
    const groupName = tournament_table.class || "Tournament Bracket";

    const url = new URL(currentUrl);
    const pathSegments = url.pathname.split("/");

    if (pathSegments[1] === "admin" && pathSegments[2] === "tournaments") {
      const tournamentId = pathSegments[3];
      const groupId = pathSegments[5];

      if (tournamentId && groupId) {
        const publicUrl = `${url.origin}/voistlused/${tournamentId}/tulemused/${groupId}`;

        try {
          await printQRCodeToBlankSheet(publicUrl, groupName);
          return;
        } catch (error) {
          console.error("Failed to print QR code:", error);
        }
      }
    }

    try {
      await printQRCodeToBlankSheet(currentUrl, groupName);
    } catch (error) {
      console.error("Failed to print QR code:", error);
    }
  };

  return (
    <div className="border-grey-200 border rounded-t-lg">
      <div className="z-40 top-0 w-full hide-in-pdf">
        <div className="px-0 w-full bg-[#F8F9FA] rounded-t-lg pdf-background">
          <div className="flex flex-col sm:flex-row sm:items-center px-2 py-3 gap-3 sm:gap-4">
            <div className="flex-1 min-w-0 order-2 sm:order-1">
              <Tabs
                defaultValue={data?.eliminations[0]?.elimination[0].name}
                className="z-10 w-full"
              >
                <div className="w-full overflow-auto">
                  <TabsList className="flex justify-start gap-2 px-0 bg-transparent min-w-max h-auto">
                    {data.eliminations.map((item, index) => (
                      <TabsTrigger
                        key={index}
                        value={item.elimination[0].name}
                        className="flex-shrink-0 px-3 sm:px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 data-[state=active]:bg-[#4C97F1] data-[state=active]:text-white data-[state=active]:shadow-md bg-gray-100 text-gray-700 hover:bg-gray-200 border-0 min-w-[70px] text-center"
                        onClick={() => {
                          const container = scrollContainerRef.current;
                          const targetElement = document.getElementById(
                            item.elimination[0].name
                          );

                          if (container && targetElement) {
                            const containerRect =
                              container.getBoundingClientRect();
                            const targetRect =
                              targetElement.getBoundingClientRect();
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

            <div className="flex gap-2 order-1 sm:order-2">
              <Button
                variant="outline"
                className="hidden sm:flex flex-shrink-0 self-end sm:self-auto"
                onClick={handlePrintQR}
              >
                <QrCode className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">
                  {t("competitions.print_qr_code")}
                </span>
              </Button>
              {admin && (
                <Button
                  variant="outline"
                  className="hidden sm:flex flex-shrink-0 self-end sm:self-auto"
                  onClick={handlePrint}
                >
                  <Printer className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="text-xs sm:text-sm">
                    {t("admin.tournaments.groups.tables.print")}
                  </span>
                </Button>
              )}
            </div>
          </div>
          <Separator className="border-gray-300" />
        </div>
      </div>

      <div className="bg-[#F8F9FA] relative h-[85vh] flex flex-col">
        <div className="relative h-full">
          <TransformWrapper
            initialScale={window.innerWidth < 640 ? 0.8 : 0.9}
            minScale={0.4}
            maxScale={1.5}
            wheel={{ disabled: true }}
            pinch={{ disabled: false, step: 5 }}
            panning={{
              disabled: false,
              allowLeftClickPan: false,
              allowRightClickPan: false,
              allowMiddleClickPan: false,
              touchPadDisabled: false
            }}
            limitToBounds={false}
            minPositionX={window.innerWidth >= 640 ? 0 : -100}
            maxPositionX={window.innerWidth >= 640 ? 0 : undefined}
            minPositionY={window.innerWidth >= 640 ? 0 : -50}
            maxPositionY={undefined}
            doubleClick={{ disabled: true }}
          >
            <ZoomControls />
            <div
              ref={scrollContainerRef}
              className="h-full overflow-y-auto overflow-x-hidden"
              id="bracket-container"
            >
              <TransformComponent>
                <div className="flex flex-col gap-6 sm:gap-8 lg:gap-10 px-1 sm:px-4 lg:px-10 min-w-max">
                  {data.eliminations.map((eliminations, eliminationIndex) => {
                    return eliminations.elimination.map((table, tableIndex) => {
                      const uniqueKey = `elimination-${eliminationIndex}-table-${tableIndex}`;
                      const uniqueId = `${eliminations.elimination[0].name}`;

                      return (
                        <div key={uniqueKey}>
                          {table.name !== "Plussring" && (
                            <div
                              className={`font-bold text-lg sm:text-xl lg:text-2xl py-2 sm:py-3 lg:py-4 px-1 sm:px-0 bracket-title bracket-title-${table.name.replace(/\s+/g, "-").toLowerCase()}`}
                            >
                              {table.name}
                            </div>
                          )}
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
              </TransformComponent>
            </div>
          </TransformWrapper>
        </div>
      </div>

      <PDFPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        containerId="bracket-container"
        title={
          tournament_table
            ? `${tournament_table.class} Tournament`
            : "Tournament Bracket"
        }
      />
    </div>
  );
};
