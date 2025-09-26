import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { useTranslation } from "react-i18next";

import { Bracket } from "@/types/brackets";

interface PDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  containerId: string;
  title: string;
  bracketData?: Bracket;
}

const PDF_STYLES = {
  PRINT_CSS: `
    @media print {
      body { margin: 0; padding: 0 0 0 20px; background: white !important; }
      .debug-header, .debug-info { display: none !important; }
      .debug-content { margin: 0 0 0 20px !important; padding: 0 !important; }
      .debug-highlight { background: transparent !important; border: none !important; }
      .bracket-connector, .bg-blue-200, .bg-blue-400 { 
        background: transparent !important; 
        border: 1px solid #000 !important; 
      }
      .page-break-before { page-break-before: always !important; }
      table { 
        page-break-inside: avoid !important; 
        width: 100% !important;
        table-layout: fixed !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      .round-robin-page, .round-robin-page * {
        margin: 0 !important;
        padding: 0 !important;
      }
      .round-robin-page h3 {
        margin-bottom: 10px !important;
        padding: 5px 0 !important;
      }
      .round-robin-page [class*="w-["] {
        width: 100% !important;
        max-width: none !important;
        min-width: 0 !important;
      }
      .round-robin-page [class*="overflow-x-"] {
        overflow-x: visible !important;
        overflow: visible !important;
      }
      .round-robin-page [class*="min-w-"] {
        min-width: 0 !important;
      }
      .round-robin-page th, .round-robin-page td {
        width: auto !important;
        max-width: none !important;
        min-width: 0 !important;
      }
      th, td { 
        word-wrap: break-word !important; 
        overflow-wrap: break-word !important;
        text-overflow: ellipsis !important;
        padding: 4px !important;
      }
      /* Add left margin to main content containers */
      body > div, .bracket-container, #bracket-container, [id^="bracket-container"] {
        margin-left: 30px !important;
      }
      @page { margin: 0 0 0 40px; size: A4; }
      .round-robin-page { page: round-robin; }
      @page round-robin { size: A4 landscape; margin: 0 0 0 20px; }
      /* Alternative approach for better browser support */
      @page :has(.round-robin-page) { size: A4 landscape; margin: 0 0 0 20px; }
      /* Force landscape for round robin with different  selectors */
      body:has(.round-robin-page) { page: landscape-forced; }
      @page landscape-forced { size: A4 landscape; margin: 0 0 0 20px; }
    }
  `,

  SCREEN_CSS: `
    body { margin: 0; padding: 20px 20px 20px 50px; font-family: system-ui; background: #f3f4f6; }
    .debug-header { 
      position: fixed; top: 0; left: 0; right: 0; background: #1f2937; 
      color: white; padding: 10px 20px; z-index: 9999; 
    }
    .debug-content { 
      margin-top: 60px; background: white; padding: 20px; 
      box-shadow: 0 4px 6px rgba(0,0,0,0.1); 
    }
    .debug-info { 
      background: #fef3c7; border: 1px solid #f59e0b; 
      padding: 10px; margin-bottom: 20px; border-radius: 4px; 
    }
  `
};

const applyPrintStyles = (container: HTMLElement, settings: { whiteBackground: boolean; title: string }, bracketData?: Bracket) => {
  const matchElements = container.querySelectorAll(".w-\\[198px\\], .w-\\[240px\\]");
  const hasTable = container.querySelector('table') !== null;
  const hasTableComponents = container.querySelector('[class*="table-fixed"]') !== null ||
    container.querySelector('[role="table"]') !== null ||
    container.querySelector('.table') !== null;
  const isBracketContainer = container.id.startsWith('bracket-container') || container.id === 'all-brackets-container';
  const isRoundRobin = (hasTable || hasTableComponents || isBracketContainer) && matchElements.length === 0;

  const hasLosersBracket = container.textContent?.includes("Miinusring") ||
    container.querySelector('[class*="loser"]') !== null;


  let bracketSize: number;
  if (isRoundRobin) {
    const tableRows = container.querySelectorAll('tbody tr');
    bracketSize = tableRows.length;
  } else if (hasLosersBracket) {
    const doubleElimData = [
      { players: 16, games: 40 },
      { players: 32, games: 97 },
      { players: 64, games: 226 },
      { players: 128, games: 480}
    ];

    bracketSize = doubleElimData.reduce((closest, current) =>
      Math.abs(current.games - matchElements.length) < Math.abs(closest.games - matchElements.length)
        ? current : closest
    ).players;
  } else {
    const estimatedSize = matchElements.length * 0.9;
    const standardSizes = [16, 32, 64, 128];
    bracketSize = standardSizes.reduce((closest, size) =>
      Math.abs(size - estimatedSize) < Math.abs(closest - estimatedSize) ? size : closest
    );
  }
  const shouldDisableColoringAndMoving = bracketSize <= 16;
  container.querySelectorAll("*").forEach((el) => {
    const htmlEl = el as HTMLElement;
    const computed = window.getComputedStyle(htmlEl);
    if (computed.paddingLeft !== "0px" || computed.paddingRight !== "0px") {
      htmlEl.style.paddingLeft = "0";
      htmlEl.style.paddingRight = "0";
    }
  });

  if (settings.whiteBackground) {
    container.querySelectorAll("*").forEach((el) => {
      const htmlEl = el as HTMLElement;
      const computed = window.getComputedStyle(htmlEl);
      if (computed.backgroundColor === "rgb(248, 249, 250)" ||
        htmlEl.classList.contains("bg-[#F8F9FA]")) {
        htmlEl.style.backgroundColor = "#FFFFFF";
      }
    });
  }

  container.querySelectorAll(".text-xs").forEach((el) => {
    const htmlEl = el as HTMLElement;
    const textContent = htmlEl.textContent?.trim() || "";

    if (textContent.includes("(Bye)") || textContent === "(Bye)") {
      htmlEl.style.marginLeft = "25px";
    }

    const isParticipant = htmlEl.classList.contains("cursor-pointer") ||
      (textContent && textContent.length > 2 &&
        !textContent.includes("Table") &&
        !textContent.includes("(Bye)"));

    if (isParticipant) {
      const nameLength = textContent.length;
      if (nameLength > 25) htmlEl.className = htmlEl.className.replace("text-xs", "text-[14px]");
      else if (nameLength <= 20 ) htmlEl.className = htmlEl.className.replace("text-xs", "text-sm");
    }
  });

  container.querySelectorAll('.bracket-title').forEach((el) => {
    const htmlEl = el as HTMLElement;
    htmlEl.style.paddingTop = "0px";
    htmlEl.style.paddingBottom = "14px";
  });

  container.querySelectorAll('.bracket-title-miinusring, .bracket-title-5-6, .bracket-title-7-8, .bracket-title-25-32, .bracket-title-33-48, .bracket-title-49-64, .bracket-title-65-96, .bracket-title-69-72').forEach((el) => {
    const htmlEl = el as HTMLElement;
    const targetElement = htmlEl.parentElement || htmlEl;
    (targetElement as HTMLElement).style.pageBreakBefore = "always";

    if (htmlEl.classList.contains('bracket-title-miinusring')) {
      htmlEl.style.marginTop = "150px";
      htmlEl.style.marginBottom = "40px";
    } else {
      htmlEl.style.marginTop = "0";
    }
  });

  if (!isRoundRobin) {
    container.querySelectorAll('.bg-blue-200, .bg-blue-400, [class*="bg-blue-"]').forEach((el) => {
      const htmlEl = el as HTMLElement;
      htmlEl.style.backgroundColor = "transparent";
      htmlEl.style.border = "1px solid #000";
    });
  }

  container.querySelectorAll('.hide-in-pdf').forEach((el) => {
    const htmlEl = el as HTMLElement;
    htmlEl.style.display = "none";
  });

  container.querySelectorAll('.reasoning-tooltip').forEach((el) => {
    const htmlEl = el as HTMLElement;
    htmlEl.style.display = "none";
  });

  container.querySelectorAll('[data-radix-tooltip-trigger], [data-radix-tooltip-content], [data-radix-popper-content-wrapper]').forEach((el) => {
    const htmlEl = el as HTMLElement;
    htmlEl.style.display = "none";
  });

  container.querySelectorAll('[role="tooltip"]').forEach((el) => {
    const htmlEl = el as HTMLElement;
    htmlEl.style.display = "none";
  });

  if (isRoundRobin) {
    container.classList.add('round-robin-page');

    container.style.margin = '0';
    container.style.padding = '0';
    container.style.width = '100%';
    container.style.maxWidth = 'none';
    container.style.minWidth = '0';
    container.style.overflow = 'visible';
    container.style.overflowX = 'visible';

    container.querySelectorAll('*').forEach((element) => {
      const htmlEl = element as HTMLElement;
      if (htmlEl.className && typeof htmlEl.className === 'string' && (htmlEl.className.includes('w-[') || htmlEl.className.includes('overflow-x-'))) {
        htmlEl.style.width = '100%';
        htmlEl.style.maxWidth = 'none';
        htmlEl.style.minWidth = '0';
        htmlEl.style.overflow = 'visible';
        htmlEl.style.overflowX = 'visible';
      }
    });

    container.querySelectorAll('table').forEach((table, index) => {
      const htmlTable = table as HTMLElement;
      htmlTable.style.pageBreakInside = 'avoid';
      htmlTable.style.width = '100%';
      htmlTable.style.tableLayout = 'fixed';

      const tableContainer = table.closest('[id^="bracket-container"]') as HTMLElement;
      if (tableContainer) {
        tableContainer.classList.add('round-robin-page');

        const className = settings.title?.replace(/ Tournament$/, "").trim();
        if (className && className !== "Tournament Bracket") {
          const existingHeader = tableContainer.querySelector('.class-name-header');
          if (!existingHeader) {
            const header = document.createElement("div");
            header.classList.add('class-name-header');
            Object.assign(header.style, {
              textAlign: "center", fontWeight: "bold", fontSize: "24px",
              marginBottom: "25px", padding: "20px", border: "2px solid #000",
              backgroundColor: "#fff", width: "100%"
            });
            header.textContent = className;
            tableContainer.insertBefore(header, tableContainer.firstChild);
          }
        }

        if (index > 0) {
          tableContainer.style.pageBreakBefore = 'always';
        }
      }

      const headerRow = table.querySelector('thead tr');
      if (headerRow) {
        const columnCount = headerRow.children.length;
        const cellWidth = `${100 / columnCount}%`;

        const allCells = table.querySelectorAll('th, td');
        allCells.forEach((cell) => {
          const htmlCell = cell as HTMLElement;
          htmlCell.className = htmlCell.className.replace(/w-\[[^\]]*\]/g, '');
          htmlCell.style.width = cellWidth;
          htmlCell.style.minWidth = '0';
          htmlCell.style.maxWidth = cellWidth;
          htmlCell.style.fontSize = columnCount > 8 ? '12px' : '14px';
          htmlCell.style.padding = columnCount > 8 ? '4px' : '8px';
          htmlCell.style.boxSizing = 'border-box';
        });
      }
    });

  } else if (shouldDisableColoringAndMoving) {
    // skipping
  } else {
    const containerWidth = 1090;
    let furthestRightPosition = 0;
    const elementsToMove: Array<{ element: HTMLElement; position: number }> = [];
    const allElements: Array<{ element: HTMLElement; position: number }> = [];
    const mainBracketElements: Array<{ element: HTMLElement; position: number }> = [];
    const miinusringElements: Array<{ element: HTMLElement; position: number }> = [];

    const isInLoserBracket = (element: HTMLElement): boolean => {
      let current = element;
      while (current && current !== container) {
        if (current.classList.contains('loser-bracket-match')) {
          return true;
        }
        current = current.parentElement as HTMLElement;
      }
      return false;
    };

    container.querySelectorAll(".w-\\[198px\\], .w-\\[240px\\]").forEach((el) => {
      const htmlEl = el as HTMLElement;
      const elementRight = htmlEl.offsetLeft + htmlEl.offsetWidth;
      const rect = htmlEl.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const visualRight = rect.right - containerRect.left;
      const isPlacementMatch = htmlEl.textContent?.match(/\b\d+-\d+\b/);

      const actualPosition = visualRight > elementRight ? visualRight : elementRight;
      const elementData = { element: htmlEl, position: actualPosition };

      allElements.push(elementData);

      if (isInLoserBracket(htmlEl)) {
        miinusringElements.push(elementData);
      } else {
        mainBracketElements.push(elementData);
      }

      if (actualPosition > furthestRightPosition) {
        furthestRightPosition = actualPosition;
      }

      if (actualPosition > containerWidth || isPlacementMatch) {
        elementsToMove.push(elementData);
      }
    });

    const getMatchBracketFromData = (element: HTMLElement): string | null => {
      if (!bracketData) return null;
      
      const readableIdElement = element.querySelector('.absolute.-top-\\[18px\\].right-0');
      if (!readableIdElement) return null;
      
      const readableId = readableIdElement.textContent?.trim();
      if (!readableId) return null;
      
      // Find matching bracket data
      for (const elimination of bracketData.eliminations) {
        for (const bracket of elimination.elimination) {
          const match = bracket.matches.find(m => m.match.readable_id.toString() === readableId);
          if (match && match.match.bracket) {
            return match.match.bracket;
          }
        }
      }
      return null;
    };

    const hasPlacementBracket = (element: HTMLElement, targetBrackets: string[]) => {
      const bracketFromData = getMatchBracketFromData(element);
      if (bracketFromData) {
        console.log(`Found bracket from data: ${bracketFromData}, checking against:`, targetBrackets);
        return targetBrackets.includes(bracketFromData);
      }
      
      // Fallback to HTML parsing
      const bracketElement = element.querySelector('.absolute.-right-\\[35px\\]');
      if (bracketElement) {
        const bracketText = bracketElement.textContent || "";
        console.log(`Found bracket from HTML element: ${bracketText}, checking against:`, targetBrackets);
        return targetBrackets.includes(bracketText);
      }
      
      const text = element.textContent || "";
      const result = targetBrackets.some(bracket => 
        text.match(new RegExp(`(?:^|[^0-9])${bracket.replace('-', '-')}(?:[^0-9]|$)`))
      );
      console.log(`Fallback text match for ${targetBrackets}: ${result}, text content:`, text);
      return result;
    };

    const getPlacementMatches = (elements: Array<{ element: HTMLElement; position: number }>, isLoserBracket = false) => {
      const placementBrackets = ['1-2', '3-4', '5-6'];
      return elements.filter(({ element }) => {
        if (hasPlacementBracket(element, placementBrackets)) {
          const isMatchInLoserBracket = element.closest('.loser-bracket-match') !== null;
          return isLoserBracket ? isMatchInLoserBracket : !isMatchInLoserBracket;
        }
        return false;
      });
    };

    const mainPlacementMatches = getPlacementMatches(mainBracketElements, false);
    console.log("main placement matches", mainPlacementMatches)


    if (bracketSize === 32) {
      if (hasLosersBracket) {
        const sortedMiinusringElements = miinusringElements
          .filter(({ element }) => {
            // Exclude grand final matches from main bracket and already processed matches
            if (hasPlacementBracket(element, ['1-2'])) return false; // Always exclude 1-2 matches
            if (hasPlacementBracket(element, ['3-4']) && !element.closest('.loser-bracket-match')) return false; // Only exclude 3-4 if NOT in loser bracket
            if (element.classList.contains("repositioned-match")) return false; // Exclude already processed matches
            return true;
          })
          .sort((a, b) => b.position - a.position);

        const columnsToColor = matchElements.length === 99 ? 5 : 3;


        const matchSpacing = 800;

        sortedMiinusringElements.slice(0, columnsToColor).forEach(({ element }) => {
          element.style.backgroundColor = "yellow";
          element.classList.add("loser-bracket-split");

          const currentTransform = element.style.transform || "";
          const newTransform = currentTransform
            ? `${currentTransform} translateY(${matchSpacing}px)`
            : `translateY(${matchSpacing}px)`;
          element.style.transform = newTransform;
          element.style.position = "relative";
          element.style.zIndex = "999";

        });

        const loserBracketConnectors = Array.from(container.querySelectorAll('.loser-bracket-connector')) as HTMLElement[];
        const sortedConnectors = loserBracketConnectors
          .map(connector => ({
            element: connector,
            position: connector.getBoundingClientRect().right
          }))
          .sort((a, b) => b.position - a.position);

        let connectorsToMove;
        if (matchElements.length === 99) {
          connectorsToMove = 8;
        } else if (matchElements.length === 97) {
          connectorsToMove = 6;
        } else {
          connectorsToMove = columnsToColor * 2; // Fallback to 2x multiplier
        }
        connectorsToMove = Math.min(sortedConnectors.length, connectorsToMove);

        sortedConnectors.slice(0, connectorsToMove).forEach(({ element: connectorEl }) => {
          if (!connectorEl.classList.contains('loser-bracket-split')) {
            connectorEl.style.backgroundColor = "orange";
            connectorEl.classList.add("loser-bracket-split");

            const connectorTransform = connectorEl.style.transform || "";
            const newConnectorTransform = connectorTransform
              ? `${connectorTransform} translateY(${matchSpacing}px)`
              : `translateY(${matchSpacing}px)`;
            connectorEl.style.transform = newConnectorTransform;
            connectorEl.style.position = "relative";
            connectorEl.style.zIndex = "998";

          }
        });

        let placementTitle = container.querySelector('.bracket-title-5-6') as HTMLElement;
        let sectionName = '5-6';

        if (!placementTitle) {
          placementTitle = container.querySelector('.bracket-title-7-8') as HTMLElement;
          sectionName = '7-8';
        }

        if (placementTitle) {

          const matchContainer = document.createElement('div');
          matchContainer.style.padding = '0px';
          matchContainer.style.minHeight = '800px'; // Less height for 32-player
          matchContainer.style.width = '100%';
          matchContainer.style.marginBottom = '20px';
          matchContainer.style.position = 'relative';
          matchContainer.style.overflow = 'visible';
          matchContainer.style.pageBreakBefore = 'always';
          matchContainer.classList.add('moved-matches-container');

          const containerTitle = document.createElement('h2');
          containerTitle.textContent = 'Miinusringi jätk';
          containerTitle.style.textAlign = 'start';
          containerTitle.style.fontSize = '32px';
          containerTitle.style.fontWeight = 'bold';
          containerTitle.style.color = '#333';
          matchContainer.appendChild(containerTitle);

          placementTitle.parentNode?.insertBefore(matchContainer, placementTitle);

          let nextPlacementTitle: HTMLElement | null = null;
          if (sectionName === '5-6') {
            nextPlacementTitle = container.querySelector('.bracket-title-7-8') as HTMLElement;
          } else if (sectionName === '7-8') {
            nextPlacementTitle = container.querySelector('.bracket-title-9-12') as HTMLElement;
          }

          if (nextPlacementTitle) {
            const targetElement = nextPlacementTitle.parentElement || nextPlacementTitle;
            (targetElement as HTMLElement).style.pageBreakBefore = "always";
            // Remove top margin from title that starts a new page
            nextPlacementTitle.style.marginTop = "0";
          }

          const matchesWithPositions = sortedMiinusringElements.slice(0, columnsToColor).map(({ element }) => {
            if (element.classList.contains('loser-bracket-split')) {
              const rect = element.getBoundingClientRect();
              const containerRect = container.getBoundingClientRect();
              return {
                element,
                originalLeft: rect.left - containerRect.left,
                originalTop: rect.top - containerRect.top,
                type: 'match'
              };
            }
            return null;
          }).filter(Boolean);

          const connectorsWithPositions = Array.from(container.querySelectorAll('.loser-bracket-connector')).map((connectorEl) => {
            const htmlEl = connectorEl as HTMLElement;
            if (htmlEl.classList.contains('loser-bracket-split')) {
              const rect = htmlEl.getBoundingClientRect();
              const containerRect = container.getBoundingClientRect();
              return {
                element: htmlEl,
                originalLeft: rect.left - containerRect.left,
                originalTop: rect.top - containerRect.top,
                type: 'connector'
              };
            }
            return null;
          }).filter(Boolean);

          const matchToIdMap = new Map<HTMLElement, string>();
          sortedMiinusringElements.slice(0, columnsToColor).forEach(({ element }) => {
            if (element.classList.contains('loser-bracket-split')) {
              const matchContainer = element.closest('[class*="match-"]') as HTMLElement;
              if (matchContainer) {
                const matchClass = Array.from(matchContainer.classList).find(cls => cls.startsWith('match-'));
                if (matchClass) {
                  const readableId = matchClass.replace('match-', '');
                  matchToIdMap.set(element, readableId);
                }
              }
            }
          });

          const matchIdElements = Array.from(container.querySelectorAll('.loser-bracket-match-id')) as HTMLElement[];
          const matchIdsWithPositions = matchIdElements.map((matchIdEl) => {
            const readableId = matchIdEl.textContent?.trim();
            if (!readableId) return null;

            const correspondingMatchElement = Array.from(matchToIdMap.entries()).find(([_, id]) => id === readableId)?.[0];

            if (correspondingMatchElement && correspondingMatchElement.classList.contains('loser-bracket-split')) {
              const rect = matchIdEl.getBoundingClientRect();
              const containerRect = container.getBoundingClientRect();
              return {
                element: matchIdEl,
                originalLeft: rect.left - containerRect.left,
                originalTop: rect.top - containerRect.top,
                type: 'match-id' as const,
                correspondingMatch: correspondingMatchElement
              };
            }
            return null;
          }).filter(Boolean);

          const elementsWithPositions = [...matchesWithPositions, ...connectorsWithPositions, ...matchIdsWithPositions];

          let minLeft = Infinity, minTop = Infinity;
          elementsWithPositions.forEach(item => {
            if (item && (item.type === 'match' || item.type === 'connector')) {
              minLeft = Math.min(minLeft, item.originalLeft);
              minTop = Math.min(minTop, item.originalTop);
            }
          });


          elementsWithPositions.forEach(item => {
            if (item) {
              item.element.style.transform = '';

              if (item.type === 'match-id') {
                const correspondingMatch = (item as any).correspondingMatch;
                if (correspondingMatch) {
                  const correspondingMatchItem = elementsWithPositions.find(matchItem =>
                    matchItem && matchItem.type === 'match' &&
                    matchItem.element === correspondingMatch
                  );

                  if (correspondingMatchItem) {
                    item.element.style.position = 'absolute';
                    // 32-player brackets typically have fewer matches, so no offset needed
                    item.element.style.left = `${correspondingMatchItem.originalLeft - minLeft + 198}px`;
                    item.element.style.top = `${correspondingMatchItem.originalTop - minTop + 95}px`;
                    item.element.style.zIndex = '1000';
                    item.element.style.pointerEvents = 'none';

                    matchContainer.appendChild(item.element);
                    return;
                  }
                }
              }

              item.element.style.position = 'absolute';
              item.element.style.left = `${item.originalLeft - minLeft}px`;
              item.element.style.top = `${item.originalTop - minTop + 80}px`;

              matchContainer.appendChild(item.element);
            }
          });

        }
      } 
    } else if (bracketSize === 64 && !hasLosersBracket) {
      const finalMatch = mainBracketElements.find(({ element }) => {
        return hasPlacementBracket(element, ['1-2']) && !element.closest('.loser-bracket-match');
      });

      if (finalMatch) {
        finalMatch.element.style.backgroundColor = "purple";
        const currentTransform = finalMatch.element.style.transform || "";
        const newTransform = currentTransform
          ? `${currentTransform} translateX(-300px) translateY(-200px)`
          : "translateX(-300px) translateY(-200px)";
        finalMatch.element.style.transform = newTransform;
        finalMatch.element.classList.add("repositioned-match");
      }

      const thirdFourthMatch = mainBracketElements.find(({ element }) => {
        return hasPlacementBracket(element, ['3-4']) && !element.closest('.loser-bracket-match');
      });

      if (thirdFourthMatch) {
        thirdFourthMatch.element.style.backgroundColor = "purple";
        const currentTransform = thirdFourthMatch.element.style.transform || "";
        const newTransform = currentTransform
          ? `${currentTransform} translateX(-300px) translateY(-200px)`
          : "translateX(-300px) translateY(-200px)";
        thirdFourthMatch.element.style.transform = newTransform;
        thirdFourthMatch.element.classList.add("repositioned-match");
      }
    } else if (bracketSize === 64 && hasLosersBracket) {
      let grandFinalMatch = null;

      if (mainBracketElements.length > 0) {
        grandFinalMatch = mainBracketElements.find(({ element }) => {
          return hasPlacementBracket(element, ['1-2']) && !element.closest('.loser-bracket-match');
        });
      }

      if (!grandFinalMatch) {
        const oneTwoMatch = allElements.find(({ element }) => {
          return hasPlacementBracket(element, ['1-2']) && !element.closest('.loser-bracket-match');
        });
        grandFinalMatch = oneTwoMatch || null;
      }

      if (grandFinalMatch) {
        grandFinalMatch.element.style.backgroundColor = "purple";
        const currentTransform = grandFinalMatch.element.style.transform || "";
        const newTransform = currentTransform
          ? `${currentTransform} translateX(-300px) translateY(-200px)`
          : "translateX(-300px) translateY(-200px)";
        grandFinalMatch.element.style.transform = newTransform;
        grandFinalMatch.element.classList.add("repositioned-match");
      }

      let thirdFourthMatch = null;

      if (mainBracketElements.length > 0) {
        thirdFourthMatch = mainBracketElements.find(({ element }) => {
          return hasPlacementBracket(element, ['3-4']) && !element.closest('.loser-bracket-match');
        });
      }

      if (!thirdFourthMatch) {
        const threeFourMatch = allElements.find(({ element }) => {
          return hasPlacementBracket(element, ['3-4']) && !element.closest('.loser-bracket-match');
        });
        thirdFourthMatch = threeFourMatch || null;
      }

      if (thirdFourthMatch) {
        thirdFourthMatch.element.style.backgroundColor = "purple";
        const currentTransform = thirdFourthMatch.element.style.transform || "";
        const newTransform = currentTransform
          ? `${currentTransform} translateX(-300px) translateY(-200px)`
          : "translateX(-300px) translateY(-200px)";
        thirdFourthMatch.element.style.transform = newTransform;
        thirdFourthMatch.element.classList.add("repositioned-match");
      }

      const sortedMiinusringElements = miinusringElements
        .filter(({ element }) => {
          // Exclude grand final matches from main bracket and already processed matches
          if (hasPlacementBracket(element, ['1-2'])) return false; // Always exclude 1-2 matches
          if (hasPlacementBracket(element, ['3-4']) && !element.closest('.loser-bracket-match')) return false; // Only exclude 3-4 if NOT in loser bracket
          if (element.classList.contains("repositioned-match")) return false; // Exclude already processed matches
          return true;
        })
        .sort((a, b) => b.position - a.position);

      const columnsToColor = -219 + matchElements.length;


      const matchSpacing = 1000;

      sortedMiinusringElements.slice(0, columnsToColor).forEach(({ element }) => {
        element.style.backgroundColor = "yellow";
        element.classList.add("loser-bracket-split");

        const currentTransform = element.style.transform || "";
        const newTransform = currentTransform
          ? `${currentTransform} translateY(${matchSpacing}px)`
          : `translateY(${matchSpacing}px)`;
        element.style.transform = newTransform;
        element.style.position = "relative";
        element.style.zIndex = "999";

      });

      const loserBracketConnectors = Array.from(container.querySelectorAll('.loser-bracket-connector')) as HTMLElement[];
      const sortedConnectors = loserBracketConnectors
        .map(connector => ({
          element: connector,
          position: connector.getBoundingClientRect().right
        }))
        .sort((a, b) => b.position - a.position);

      // VALUES FOR MOVING CONNECTORS
      let connectorsToMove;
      if (matchElements.length === 228) {
        connectorsToMove = 20;
      } else if (matchElements.length === 226) {
        connectorsToMove = 18;
      } else {
        connectorsToMove = columnsToColor * 3;
      }
      connectorsToMove = Math.min(sortedConnectors.length, connectorsToMove);

      sortedConnectors.slice(0, connectorsToMove).forEach(({ element: connectorEl }) => {
        if (!connectorEl.classList.contains('loser-bracket-split')) {
          connectorEl.style.backgroundColor = "orange"; // Different color for connectors
          connectorEl.classList.add("loser-bracket-split");

          const connectorTransform = connectorEl.style.transform || "";
          const newConnectorTransform = connectorTransform
            ? `${connectorTransform} translateY(${matchSpacing}px)`
            : `translateY(${matchSpacing}px)`;
          connectorEl.style.transform = newConnectorTransform;
          connectorEl.style.position = "relative";
          connectorEl.style.zIndex = "998";
        }
      });

      let placementTitle = container.querySelector('.bracket-title-5-6') as HTMLElement;
      let sectionName = '5-6';

      if (!placementTitle) {
        placementTitle = container.querySelector('.bracket-title-7-8') as HTMLElement;
        sectionName = '7-8';
      }

      if (placementTitle) {

        const matchContainer = document.createElement('div');
        matchContainer.style.padding = '0px';
        matchContainer.style.minHeight = '1200px';
        matchContainer.style.width = '100%';
        matchContainer.style.marginBottom = '20px';
        matchContainer.style.position = 'relative'; // Enable positioning for children
        matchContainer.style.overflow = 'visible'; // Don't clip positioned elements
        matchContainer.style.pageBreakBefore = 'always'; // Force page break before this container
        matchContainer.classList.add('moved-matches-container');

        const containerTitle = document.createElement('h2');
        containerTitle.textContent = 'Miinusringi jätk';
        containerTitle.style.textAlign = 'start';
        containerTitle.style.fontSize = '24px';
        containerTitle.style.fontWeight = 'bold';
        containerTitle.style.color = '#333';
        matchContainer.appendChild(containerTitle);

        placementTitle.parentNode?.insertBefore(matchContainer, placementTitle);

        let nextPlacementTitle: HTMLElement | null = null;
        if (sectionName === '5-6') {
          nextPlacementTitle = container.querySelector('.bracket-title-7-8') as HTMLElement;
        } else if (sectionName === '7-8') {
          nextPlacementTitle = container.querySelector('.bracket-title-9-12') as HTMLElement;
        }

        if (nextPlacementTitle) {
          const targetElement = nextPlacementTitle.parentElement || nextPlacementTitle;
          (targetElement as HTMLElement).style.pageBreakBefore = "always";
          nextPlacementTitle.style.marginTop = "0";
        }

        const matchesWithPositions = sortedMiinusringElements.slice(0, columnsToColor).map(({ element }) => {
          if (element.classList.contains('loser-bracket-split')) {
            const rect = element.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            return {
              element,
              originalLeft: rect.left - containerRect.left,
              originalTop: rect.top - containerRect.top,
              type: 'match'
            };
          }
          return null;
        }).filter(Boolean);

        const connectorsWithPositions = Array.from(container.querySelectorAll('.loser-bracket-connector')).map((connectorEl) => {
          const htmlEl = connectorEl as HTMLElement;
          if (htmlEl.classList.contains('loser-bracket-split')) {
            const rect = htmlEl.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            return {
              element: htmlEl,
              originalLeft: rect.left - containerRect.left,
              originalTop: rect.top - containerRect.top,
              type: 'connector'
            };
          }
          return null;
        }).filter(Boolean);

        const matchToIdMap = new Map<HTMLElement, string>();
        sortedMiinusringElements.slice(0, columnsToColor).forEach(({ element }) => {
          if (element.classList.contains('loser-bracket-split')) {
            const matchContainer = element.closest('[class*="match-"]') as HTMLElement;
            if (matchContainer) {
              const matchClass = Array.from(matchContainer.classList).find(cls => cls.startsWith('match-'));
              if (matchClass) {
                const readableId = matchClass.replace('match-', '');
                matchToIdMap.set(element, readableId);
              }
            }
          }
        });

        const matchIdElements = Array.from(container.querySelectorAll('.loser-bracket-match-id')) as HTMLElement[];
        const matchIdsWithPositions = matchIdElements.map((matchIdEl) => {
          const readableId = matchIdEl.textContent?.trim();
          if (!readableId) return null;

          const correspondingMatchElement = Array.from(matchToIdMap.entries()).find(([_, id]) => id === readableId)?.[0];

          if (correspondingMatchElement && correspondingMatchElement.classList.contains('loser-bracket-split')) {
            const rect = matchIdEl.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            return {
              element: matchIdEl,
              originalLeft: rect.left - containerRect.left,
              originalTop: rect.top - containerRect.top,
              type: 'match-id' as const,
              correspondingMatch: correspondingMatchElement
            };
          }
          return null;
        }).filter(Boolean);

        const elementsWithPositions = [...matchesWithPositions, ...connectorsWithPositions, ...matchIdsWithPositions];

        let minLeft = Infinity, minTop = Infinity;
        elementsWithPositions.forEach(item => {
          if (item && (item.type === 'match' || item.type === 'connector')) {
            minLeft = Math.min(minLeft, item.originalLeft);
            minTop = Math.min(minTop, item.originalTop);
          }
        });


        elementsWithPositions.forEach(item => {
          if (item) {
            item.element.style.transform = '';

            if (item.type === 'match-id') {
              const correspondingMatch = (item as any).correspondingMatch;
              if (correspondingMatch) {
                const correspondingMatchItem = elementsWithPositions.find(matchItem =>
                  matchItem && matchItem.type === 'match' &&
                  matchItem.element === correspondingMatch
                );

                if (correspondingMatchItem) {
                  item.element.style.position = 'absolute';
                  const leftOffset = 0;
                  item.element.style.left = `${correspondingMatchItem.originalLeft - minLeft - leftOffset + 198 + 0}px`; // 198px (match width) + 8px spacing
                  item.element.style.top = `${correspondingMatchItem.originalTop - minTop + 95}px`; // Start from top with title space 
                  item.element.style.zIndex = '1000';
                  item.element.style.pointerEvents = 'none';

                  matchContainer.appendChild(item.element);
                  return;
                }
              }
            }

            item.element.style.position = 'absolute';
            const leftOffset = 0;
            item.element.style.left = `${item.originalLeft - minLeft - leftOffset}px`;
            item.element.style.top = `${item.originalTop - minTop + 80}px`;

            matchContainer.appendChild(item.element);
          }
        });
      }
    } else if (bracketSize > 64) {
      // Apply same miinusring logic as 64-player bracket
      const sortedMiinusringElements = miinusringElements
        .filter(({ element }) => {
          if (hasPlacementBracket(element, ['1-2'])) return false;
          if (hasPlacementBracket(element, ['3-4']) && !element.closest('.loser-bracket-match')) return false;
          if (element.classList.contains("repositioned-match")) return false;
          return true;
        })
        .sort((a, b) => b.position - a.position);

      const columnsToColor = Math.max(7, Math.floor((matchElements.length - 420) * 1.25));
      console.log(columnsToColor)
      const matchSpacing = 1000;

      sortedMiinusringElements.slice(0, columnsToColor).forEach(({ element }) => {
        element.style.backgroundColor = "yellow";
        element.classList.add("loser-bracket-split");

        const currentTransform = element.style.transform || "";
        const newTransform = currentTransform
          ? `${currentTransform} translateY(${matchSpacing}px)`
          : `translateY(${matchSpacing}px)`;
        element.style.transform = newTransform;
        element.style.position = "relative";
        element.style.zIndex = "999";
      });

      const loserBracketConnectors = Array.from(container.querySelectorAll('.loser-bracket-connector')) as HTMLElement[];
      const sortedConnectors = loserBracketConnectors
        .map(connector => ({
          element: connector,
          position: connector.getBoundingClientRect().right
        }))
        .sort((a, b) => b.position - a.position);

      // const connectorsToMove = Math.max(18, columnsToColor * 3);
      const connectorsToMove = 48;
      console.log(connectorsToMove, "contomove")
      const actualConnectorsToMove = Math.min(sortedConnectors.length, connectorsToMove);

      sortedConnectors.slice(0, actualConnectorsToMove).forEach(({ element: connectorEl }) => {
        if (!connectorEl.classList.contains('loser-bracket-split')) {
          connectorEl.style.backgroundColor = "orange";
          connectorEl.classList.add("loser-bracket-split");

          const connectorTransform = connectorEl.style.transform || "";
          const newConnectorTransform = connectorTransform
            ? `${connectorTransform} translateY(${matchSpacing}px)`
            : `translateY(${matchSpacing}px)`;
          connectorEl.style.transform = newConnectorTransform;
          connectorEl.style.position = "relative";
          connectorEl.style.zIndex = "998";
        }
      });

      // Create continuation page
      let placementTitle = container.querySelector('.bracket-title-5-6') as HTMLElement;
      let sectionName = '5-6';

      if (!placementTitle) {
        placementTitle = container.querySelector('.bracket-title-7-8') as HTMLElement;
        sectionName = '7-8';
      }

      if (placementTitle) {
        const matchContainer = document.createElement('div');
        matchContainer.style.padding = '0px';
        matchContainer.style.minHeight = '2800px';
        matchContainer.style.width = '100%';
        matchContainer.style.marginBottom = '20px';
        matchContainer.style.position = 'relative';
        matchContainer.style.overflow = 'visible';
        matchContainer.style.pageBreakBefore = 'always';
        matchContainer.classList.add('moved-matches-container');

        const containerTitle = document.createElement('h2');
        containerTitle.textContent = 'Miinusringi jätk';
        containerTitle.style.textAlign = 'start';
        containerTitle.style.fontSize = '24px';
        containerTitle.style.fontWeight = 'bold';
        containerTitle.style.color = '#333';
        matchContainer.appendChild(containerTitle);

        placementTitle.parentNode?.insertBefore(matchContainer, placementTitle);

        // Add page break before 5-6 title and remove it from 7-8 title
        let nextPlacementTitle: HTMLElement | null = null;
        if (sectionName === '5-6') {
          nextPlacementTitle = container.querySelector('.bracket-title-7-8') as HTMLElement;
        } else if (sectionName === '7-8') {
          nextPlacementTitle = container.querySelector('.bracket-title-9-12') as HTMLElement;
        }

        if (nextPlacementTitle) {
          const targetElement = nextPlacementTitle.parentElement || nextPlacementTitle;
          (targetElement as HTMLElement).style.pageBreakBefore = "always";
          nextPlacementTitle.style.marginTop = "0";
        }

        // Reposition moved elements
        const elementsWithPositions = [
          ...sortedMiinusringElements.slice(0, columnsToColor).map(({ element }) => {
            if (element.classList.contains('loser-bracket-split')) {
              const rect = element.getBoundingClientRect();
              const containerRect = container.getBoundingClientRect();
              return {
                element,
                originalLeft: rect.left - containerRect.left,
                originalTop: rect.top - containerRect.top,
                type: 'match'
              };
            }
            return null;
          }).filter(Boolean),
          ...Array.from(container.querySelectorAll('.loser-bracket-connector')).map((connectorEl) => {
            const htmlEl = connectorEl as HTMLElement;
            if (htmlEl.classList.contains('loser-bracket-split')) {
              const rect = htmlEl.getBoundingClientRect();
              const containerRect = container.getBoundingClientRect();
              return {
                element: htmlEl,
                originalLeft: rect.left - containerRect.left,
                originalTop: rect.top - containerRect.top,
                type: 'connector'
              };
            }
            return null;
          }).filter(Boolean)
        ];

        let minLeft = Infinity, minTop = Infinity;
        elementsWithPositions.forEach(item => {
          if (item && (item.type === 'match' || item.type === 'connector')) {
            minLeft = Math.min(minLeft, item.originalLeft);
            minTop = Math.min(minTop, item.originalTop);
          }
        });

        elementsWithPositions.forEach(item => {
          if (item) {
            item.element.style.transform = '';
            item.element.style.position = 'absolute';
            item.element.style.left = `${item.originalLeft - minLeft}px`;
            item.element.style.top = `${item.originalTop - minTop + 80}px`;
            matchContainer.appendChild(item.element);
          }
        });
      }

      // Move specific matches to the left
      if (bracketData) {
        const matchesToMove = [
          { id: 352, distanceX: -235, distanceY: 0 },
          { id: 225, distanceX: -235, distanceY: -90 },
          { id: 226, distanceX: -235, distanceY: -90 },
          { id: 227, distanceX: -470, distanceY: -2700 }
        ];

        for (const matchToMove of matchesToMove) {
          for (const elimination of bracketData.eliminations) {
            for (const bracket of elimination.elimination) {
              const targetMatch = bracket.matches.find(m => m.match.readable_id === matchToMove.id);
              if (targetMatch) {
                const readableIdElements = Array.from(container.querySelectorAll('.absolute.-top-\\[18px\\].right-0'));
                const targetElement = readableIdElements.find(el => el.textContent?.trim() === matchToMove.id.toString());
                
                if (targetElement) {
                  const matchContainer = targetElement.closest('.w-\\[198px\\], .w-\\[240px\\]') as HTMLElement;
                  if (matchContainer) {
                    const currentTransform = matchContainer.style.transform || "";
                    const transforms = [];
                    if (matchToMove.distanceX !== 0) transforms.push(`translateX(${matchToMove.distanceX}px)`);
                    if (matchToMove.distanceY !== 0) transforms.push(`translateY(${matchToMove.distanceY}px)`);
                    
                    const newTransform = currentTransform
                      ? `${currentTransform} ${transforms.join(' ')}`
                      : transforms.join(' ');
                    matchContainer.style.transform = newTransform;
                    matchContainer.style.backgroundColor = "lightblue";
                    
                    // Add titles above specific matches
                    if (matchToMove.id === 227) {
                      const finaalTitle = document.createElement('h2');
                      finaalTitle.textContent = 'Finaal';
                      finaalTitle.style.position = 'absolute';
                      finaalTitle.style.fontSize = '24px';
                      finaalTitle.style.fontWeight = 'bold';
                      finaalTitle.style.color = '#333';
                      finaalTitle.style.textAlign = 'center';
                      finaalTitle.style.width = '200px';
                      finaalTitle.style.transform = `translateX(${matchToMove.distanceX}px) translateY(${matchToMove.distanceY - 100}px)`;
                      finaalTitle.classList.add('finaal-title');
                      
                      matchContainer.parentNode?.appendChild(finaalTitle);
                    } else if (matchToMove.id === 225 || matchToMove.id === 226) {
                      const poolfinaalTitle = document.createElement('h2');
                      poolfinaalTitle.textContent = 'Poolfinaal';
                      poolfinaalTitle.style.position = 'absolute';
                      poolfinaalTitle.style.fontSize = '24px';
                      poolfinaalTitle.style.fontWeight = 'bold';
                      poolfinaalTitle.style.color = '#333';
                      poolfinaalTitle.style.textAlign = 'center';
                      poolfinaalTitle.style.width = '200px';
                      poolfinaalTitle.style.transform = `translateX(${matchToMove.distanceX}px) translateY(${matchToMove.distanceY - 100}px)`;
                      poolfinaalTitle.classList.add('poolfinaal-title');
                      
                      matchContainer.parentNode?.appendChild(poolfinaalTitle);
                    }
                    
                    console.log(`Moved match ${matchToMove.id} left by ${Math.abs(matchToMove.distanceX)}px and up by ${Math.abs(matchToMove.distanceY)}px`);
                  }
                }
                break;
              }
            }
          }
        }
      }

    }
  }

  const className = settings.title?.replace(/ Tournament$/, "").trim();
  const isRoundRobinContainer = container.classList.contains('round-robin-page') ||
    container.querySelector('.round-robin-page') !== null;

  if (className && className !== "Tournament Bracket" && !isRoundRobinContainer) {
    const headerMarginBottom = bracketSize < 70 ? "90px" : "84px";
    const header = document.createElement("div");
    Object.assign(header.style, {
      textAlign: "center", fontWeight: "bold", fontSize: "48px",
      marginBottom: headerMarginBottom, padding: "30px", 
      backgroundColor: "#fff", width: "100%"
    });
    header.textContent = className;
    container.insertBefore(header, container.firstChild);
  }
};

const restorePrintStyles = (container: HTMLElement, originalStyles: Record<string, string>) => {
  container.querySelectorAll(".class-name-header").forEach(el => el.remove());

  container.querySelectorAll(".repositioned-match").forEach((el) => {
    const htmlEl = el as HTMLElement;
    htmlEl.style.transform = "";
    htmlEl.classList.remove("repositioned-match");
  });

  Object.assign(container.style, originalStyles);
};

export const PDFPreviewModal: React.FC<PDFPreviewModalProps> = ({
  isOpen,
  onClose,
  containerId,
  title,
  bracketData,
}) => {
  const { t } = useTranslation();

  const generateDebugHTML = () => {
    const container = document.getElementById(containerId);
    if (!container) {
      return;
    }

    const originalStyles = {
      backgroundColor: container.style.backgroundColor,
      padding: container.style.padding,
      margin: container.style.margin,
    };

    try {
      const clone = container.cloneNode(true) as HTMLElement;
      Object.assign(clone.style, {
        height: "auto", maxHeight: "none", overflow: "visible",
        backgroundColor: "#FFFFFF", padding: "0", margin: "0", width: "100%",
        position: "absolute", top: "-0px", left: "-0px"
      });

      document.body.appendChild(clone);

      applyPrintStyles(clone, { whiteBackground: true, title }, bracketData);

      const styledHTML = clone.outerHTML;

      document.body.removeChild(clone);

      const debugWindow = window.open("", "_blank", "width=" + screen.width + ",height=" + screen.height + ",fullscreen=yes");
      if (!debugWindow) return;

      const debugHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${title}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            ${PDF_STYLES.SCREEN_CSS}
            ${PDF_STYLES.PRINT_CSS}
            @media print {
              body::before {
                content: Tulemused on kinnitatud võistluse peakohtuniku poolt.;
                position: fixed;
                top: 0;
                left: 0;
                background: yellow;
                padding: 5px;
                font-size: 10px;
                z-index: 9999;
              }
            }
          </style>
        </head>
        <body>
          <div class="debug-header">
            <strong>PDF Debug:</strong> ${title} | 
            <button onclick="window.print()" style="background:#059669;color:white;border:none;padding:4px 8px;border-radius:4px;margin-left:10px;cursor:pointer">Save PDF</button>
            <button onclick="window.close()" style="background:#dc2626;color:white;border:none;padding:4px 8px;border-radius:4px;margin-left:10px;cursor:pointer">Close</button>
          </div>
          <div class="debug-content">
            <div class="debug-info">
              <strong>Ready for PDF:</strong> Click "Save PDF" to print/save as PDF using your browser's print dialog.
            </div>
            ${styledHTML}
          </div>
        </body>
        </html>
      `;

      debugWindow.document.open();
      debugWindow.document.write(debugHTML);
      debugWindow.document.close();
      debugWindow.focus();

    } finally {
      restorePrintStyles(container, originalStyles);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("homepage.pdf.preview.title")} - {title}</DialogTitle>
            <p className="font-light">NB: Soovitame pabertabelite asemel kasutada QR-kood printimist</p>
        </DialogHeader>

        <div className="space-y-4 p-4">
          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <h3 className="font-semibold mb-2">{t("homepage.pdf.preview.howToCreate.title")}</h3>
            <ol className="text-sm space-y-1">
              <li>1. {t("homepage.pdf.preview.howToCreate.step1")}</li>
              <li>2. {t("homepage.pdf.preview.howToCreate.step2")}</li>
              <li>3. {t("homepage.pdf.preview.howToCreate.step3")}</li>
            </ol>
          </div>

          <Button onClick={generateDebugHTML} className="w-full">
            {t("homepage.pdf.preview.openPreview")}
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t("common.close")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
