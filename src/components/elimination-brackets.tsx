import { Bracket, BracketType } from "@/types/brackets";
import { TournamentTable } from "@/types/groups";
import { MatchWrapper } from "@/types/matches";
import { SingleElimination } from "./single-elimination";
import { DoubleElimination } from "./double-elimination";
import { Separator } from "./ui/separator";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { useRef, useState, useCallback, useEffect } from "react";
import { Button } from "./ui/button";
import {
  Printer,
  QrCode,
  ZoomIn,
  ZoomOut,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { PDFPreviewModal } from "./pdf-preview-modal";
import { printQRCodeToBlankSheet } from "@/lib/qr-print";

interface TournamentTableProps {
  admin?: boolean;
  data: Bracket;
  tournament_table: TournamentTable;
  handleSelectMatch?: (match: MatchWrapper) => void;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  currentMatchIndex?: number;
  onNavigateMatches?: (direction: 'next' | 'prev') => void;
}

const ZoomControls = ({
  scrollContainerRef,
  scale,
  onZoomChange,
}: {
  scrollContainerRef: React.RefObject<HTMLDivElement>;
  scale: number;
  onZoomChange: (newScale: number) => void;
}) => {
  const handleZoomIn = () => {
    const newScale = Math.min(scale + 0.1, 1.5);
    onZoomChange(newScale);
  };

  const handleZoomOut = () => {
    const newScale = Math.max(scale - 0.1, 0.4);
    onZoomChange(newScale);
  };

  const handlePan = useCallback((direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const panAmount = 200;

    switch (direction) {
      case "left":
        container.scrollTo({
          left: Math.max(0, container.scrollLeft - panAmount),
          behavior: "smooth",
        });
        break;
      case "right":
        container.scrollTo({
          left: container.scrollLeft + panAmount,
          behavior: "smooth",
        });
        break;
    }
  }, [scrollContainerRef]);

  return (
    <div className="absolute top-4 right-4 z-40">
      {/* Desktop Layout: 2x2 Grid */}
      <div className="hidden sm:grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePan("left")}
          className="flex-shrink-0 bg-white/90 backdrop-blur-sm shadow-lg w-8 h-8 p-0"
        >
          <ArrowLeft className="h-3 w-3" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePan("right")}
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
  searchTerm = "",
  currentMatchIndex = 0,
  onNavigateMatches,
}: TournamentTableProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const [showPreview, setShowPreview] = useState(false);
  const [hoveredPlayerId, setHoveredPlayerId] = useState<string | null>(null);
  const [allowBracketScroll, setAllowBracketScroll] = useState(false);
  const [scale, setScale] = useState(window.innerWidth < 640 ? 0.8 : 1);
  const pinchState = useRef({
    initialDistance: 0,
    initialScale: 1,
    zoomCenterX: 0,
    zoomCenterY: 0,
    lastUpdateTime: 0,
    lastScale: 1,
    targetScale: 1,
    velocity: 0,
    isAnimating: false,
    animationId: null as number | null
  });




  // Ultra-simple pinch detection with center point
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!admin && !allowBracketScroll) return;

    if (e.touches.length === 2) {
      pinchState.current.initialDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      pinchState.current.initialScale = scale;
      pinchState.current.lastScale = scale;

      // Store zoom center point (middle between fingers)
      const containerRect = scrollContainerRef.current?.getBoundingClientRect();
      if (containerRect) {
        pinchState.current.zoomCenterX = ((e.touches[0].clientX + e.touches[1].clientX) / 2) - containerRect.left;
        pinchState.current.zoomCenterY = ((e.touches[0].clientY + e.touches[1].clientY) / 2) - containerRect.top;
      }
    }
  }, [admin, allowBracketScroll, scale]);

  // Smooth animation loop with easing
  const animateScale = useCallback(() => {
    if (!pinchState.current.isAnimating) return;

    const state = pinchState.current;
    const diff = state.targetScale - state.lastScale;

    // Use easing curve similar to native browser (ease-out)
    const easing = 0.15;
    const newScale = state.lastScale + diff * easing;

    // Stop animation when close enough
    if (Math.abs(diff) < 0.001) {
      state.lastScale = state.targetScale;
      state.isAnimating = false;
      state.animationId = null;
      setScale(state.targetScale);
      return;
    }

    state.lastScale = newScale;

    if (contentRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const content = contentRef.current;

      // Calculate current scroll position
      const currentScrollX = container.scrollLeft;
      const currentScrollY = container.scrollTop;

      // Calculate what point in the content is currently at the zoom center
      const contentPointX = (state.zoomCenterX + currentScrollX) / state.lastScale;
      const contentPointY = (state.zoomCenterY + currentScrollY) / state.lastScale;

      // Apply scale with top-left origin
      content.style.transformOrigin = '0 0';
      content.style.transform = `scale(${newScale})`;

      // Calculate where that content point should be after scaling
      const newPointX = contentPointX * newScale;
      const newPointY = contentPointY * newScale;

      // Calculate scroll position to keep the zoom center point stationary
      const newScrollX = newPointX - state.zoomCenterX;
      const newScrollY = newPointY - state.zoomCenterY;

      // Apply scroll position smoothly (browser will handle boundaries)
      container.scrollLeft = Math.max(0, newScrollX);
      container.scrollTop = Math.max(0, newScrollY);
    }

    // Continue animation
    state.animationId = requestAnimationFrame(animateScale);
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!admin && !allowBracketScroll) return;

    if (e.touches.length === 2) {
      e.preventDefault(); // Prevent browser zoom

      const currentDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );

      if (pinchState.current.initialDistance > 0) {
        const now = performance.now();
        const deltaTime = now - pinchState.current.lastUpdateTime;

        // Only update every 8ms for 120fps max (smoother than 60fps)
        if (deltaTime < 8) return;
        pinchState.current.lastUpdateTime = now;

        // Calculate raw scale with higher precision
        const rawScaleRatio = currentDistance / pinchState.current.initialDistance;
        const dampedRatio = 1 + (rawScaleRatio - 1) * 0.8; // Slightly more responsive
        const targetScale = Math.max(0.5, Math.min(3, pinchState.current.initialScale * dampedRatio));

        // Update target scale directly without velocity for smoother real-time tracking
        pinchState.current.targetScale = targetScale;

        // Start smooth animation if not already running
        if (!pinchState.current.isAnimating) {
          pinchState.current.isAnimating = true;
          pinchState.current.animationId = requestAnimationFrame(animateScale);
        }
      }
    }
  }, [admin, allowBracketScroll, animateScale]);

  const handleTouchEnd = useCallback(() => {
    pinchState.current.initialDistance = 0;
  }, []);

  // Setup touch event listeners
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: false });
    container.addEventListener('touchcancel', handleTouchEnd, { passive: false });

    return () => {
      // Clean up animation - copy ref value to avoid stale closure
      const state = pinchState.current;
      if (state.animationId) {
        cancelAnimationFrame(state.animationId);
        state.animationId = null;
        state.isAnimating = false;
      }

      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      const highlighted = container.querySelectorAll('.search-highlight, .search-highlight-current');
      highlighted.forEach(el => {
        el.classList.remove('search-highlight', 'search-highlight-current');
      });
      
      if (searchTerm.trim() && searchTerm.trim().length >= 3) {
        const playerElements = container.querySelectorAll('[data-player-name]');
        const matchingElements: Element[] = [];
        playerElements.forEach(element => {
          const playerName = element.getAttribute('data-player-name');
          if (playerName && playerName.toLowerCase().includes(searchTerm.toLowerCase())) {
            element.classList.add('search-highlight');
            matchingElements.push(element);
          }
        });
        
        if (matchingElements.length > 0 && onNavigateMatches) {
          const currentElement = matchingElements[currentMatchIndex % matchingElements.length];
          if (currentElement) {
            currentElement.classList.remove('search-highlight');
            currentElement.classList.add('search-highlight-current');

            // Get the element's position within its parent container
            const targetY = (currentElement as HTMLElement).offsetTop - 50;

            // Account for current scale when calculating position
            const scaledTargetY = targetY * scale;

            // Use native scrolling to navigate to the target
            const container = scrollContainerRef.current;
            if (container) {
              container.scrollTo({
                left: 0,
                top: scaledTargetY,
                behavior: 'smooth'
              });
            }
          }
        }
      }
    }
  }, [searchTerm, currentMatchIndex, onNavigateMatches, scale]);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .search-highlight {
        background-color: #dbeafe !important;
        border: 2px solid #3b82f6 !important;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2) !important;
        border-radius: 4px !important;
      }
      .search-highlight-current {
        background-color: #4C97F1 !important;
        color: white !important;
        border: 2px solid #4C97F1 !important;
        box-shadow: 0 0 0 3px rgba(76, 151, 241, 0.3) !important;
        border-radius: 4px !important;
      }
      .pinch-zooming {
        will-change: transform;
        -webkit-backface-visibility: hidden;
        backface-visibility: hidden;
        -webkit-transform: translateZ(0);
        transform: translateZ(0);
        -webkit-perspective: 1000px;
        perspective: 1000px;
      }
    `;
    document.head.appendChild(style);
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const threshold = 80;
      setAllowBracketScroll(scrollY >= threshold);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Remove search navigating since it's not used
  useEffect(() => {
    if ((allowBracketScroll && !admin && window.innerWidth < 768)) {
      const preventDownScroll = (e: WheelEvent) => {
        if (e.deltaY > 0) {
          e.preventDefault();
        }
      };

      const preventDownKeys = (e: KeyboardEvent) => {
        const downKeys = ['ArrowDown', 'PageDown', 'End', 'Space'];
        if (downKeys.includes(e.key)) {
          e.preventDefault();
        }
      };

      document.addEventListener('wheel', preventDownScroll, { passive: false });
      document.addEventListener('keydown', preventDownKeys);

      return () => {
        document.removeEventListener('wheel', preventDownScroll);
        document.removeEventListener('keydown', preventDownKeys);
      };
    }
  }, [allowBracketScroll, admin]);

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
    <div className="border-grey-200 border rounded-t-lg -mx-[2.5vw] sm:-mx-0">
      <div className="z-40 top-0 w-full hide-in-pdf">
        <div className="px-0 w-full bg-[#F8F9FA] rounded-t-lg pdf-background">
          <div className="flex flex-col sm:flex-row sm:items-center px-2 md:px-6 md:py-1 gap-0 sm:gap-4">
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
                          const targetElement = document.getElementById(
                            item.elimination[0].name
                          );

                          if (targetElement) {
                            const targetY = targetElement.offsetTop - 50;
                            const scaledTargetY = targetY * scale;

                            const container = scrollContainerRef.current;
                            if (container) {
                              container.scrollTo({
                                left: 0,
                                top: scaledTargetY,
                                behavior: 'smooth'
                              });
                            }
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
                <>
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
                </>
              )}
            </div>
          </div>
          <Separator className="border-gray-300" />
        </div>
      </div>

      <div className="bg-[#F8F9FA] relative h-[85vh] flex flex-col">
        <div className="relative h-full">
          <ZoomControls
            scrollContainerRef={scrollContainerRef}
            scale={scale}
            onZoomChange={(newScale) => {
              setScale(newScale);
            }}
          />
          <div
            ref={scrollContainerRef}
            className={`h-full ${admin || allowBracketScroll ? "overflow-auto" : "overflow-hidden"}`}
            id="bracket-container"
            style={{
              position: 'relative',
              WebkitOverflowScrolling: 'touch',
              touchAction: admin || allowBracketScroll ? 'manipulation' : 'pan-y',
              scrollBehavior: 'smooth',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              WebkitTouchCallout: 'none',
            }}
          >
            <div
              ref={contentRef}
              className=""
              style={{
                transformOrigin: '0 0',
                cursor: admin || allowBracketScroll ? 'grab' : 'default',
                willChange: 'transform',
                // Scale applied via touch handlers, scroll position manages zoom center
              }}
            >
              <div className="flex flex-col gap-6 sm:gap-8 lg:gap-10 px-1 sm:px-4 lg:px-10 pb-6 sm:pb-8 lg:pb-12 pr-20 sm:pr-24">
                {data.eliminations.map((eliminations, eliminationIndex) => {
                  return eliminations.elimination.map((table, tableIndex) => {
                    const uniqueKey = `elimination-${eliminationIndex}-table-${tableIndex}`;
                    const uniqueId = tableIndex === 0 ? `${eliminations.elimination[0].name}` : `${table.name}-${tableIndex}`;

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
            </div>
          </div>
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
        bracketData={data}
      />
    </div>
  );
};
