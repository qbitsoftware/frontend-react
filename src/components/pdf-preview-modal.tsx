import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";

interface PDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  containerId: string;
  title: string;
}

const PDF_STYLES = {
  PRINT_CSS: `
    @media print {
      body { margin: 0; padding: 0; background: white !important; }
      .debug-header, .debug-info { display: none !important; }
      .debug-content { margin: 0 !important; padding: 0 !important; }
      .debug-highlight { background: transparent !important; border: none !important; }
      .bracket-connector, .bg-blue-200, .bg-blue-400 { 
        background: transparent !important; 
        border: 1px solid #000 !important; 
      }
      .page-break-before { page-break-before: always !important; }
      @page { margin: 0; size: A4; }
    }
  `,
  
  SCREEN_CSS: `
    body { margin: 0; padding: 20px; font-family: system-ui; background: #f3f4f6; }
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

const applyPrintStyles = (container: HTMLElement, settings: { whiteBackground: boolean; title: string }) => {
  const matchElements = container.querySelectorAll(".w-\\[198px\\], .w-\\[240px\\]");
  
  const hasLosersBracket = container.textContent?.includes("Miinusring") ||
                          container.querySelector('[class*="loser"]') !== null;
  
  console.log("hasloserbracket", hasLosersBracket)

  let bracketSize: number;
  if (hasLosersBracket) {
    const doubleElimData = [
      { players: 16, games: 40 },
      { players: 32, games: 97 },
      { players: 64, games: 226 }
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
  console.log("Bracket size should be", bracketSize)
  
  const shouldDisableColoringAndMoving = bracketSize <= 16;
  
  console.log("Bracket analysis:", {
    matchElements: matchElements.length,
    estimatedBracketSize: bracketSize,
    shouldDisableColoringAndMoving
  });
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
    const isParticipant = htmlEl.classList.contains("cursor-pointer") ||
      (htmlEl.textContent?.trim() && htmlEl.textContent.trim().length > 2 && 
       !htmlEl.textContent?.includes("Table") && 
       !htmlEl.textContent?.includes("(Bye)"));
    
    if (isParticipant) {
      const nameLength = htmlEl.textContent?.trim()?.length || 0;
      if (nameLength > 25) htmlEl.className = htmlEl.className.replace("text-xs", "text-[10px]");
      else if (nameLength <= 12) htmlEl.className = htmlEl.className.replace("text-xs", "text-sm");
    }
  });

  // Apply half padding to ALL bracket titles
  container.querySelectorAll('.bracket-title').forEach((el) => {
    const htmlEl = el as HTMLElement;
    htmlEl.style.paddingTop = "4px";    // Half of py-2 (8px)
    htmlEl.style.paddingBottom = "4px"; // Half of py-2 (8px)
  });

  // Apply page breaks to specific bracket titles
  container.querySelectorAll('.bracket-title-miinusring, .bracket-title-5-6, .bracket-title-7-8, .bracket-title-25-32, .bracket-title-33-48, .bracket-title-49-64, .bracket-title-65-96').forEach((el) => {
    const htmlEl = el as HTMLElement;
    // Apply page break to the title element itself or its parent container
    const targetElement = htmlEl.parentElement || htmlEl;
    (targetElement as HTMLElement).style.pageBreakBefore = "always";
    
    // Remove top margin for titles that start a new page
    htmlEl.style.marginTop = "0";
  });

  container.querySelectorAll('.bg-blue-200, .bg-blue-400, [class*="bg-blue-"]').forEach((el) => {
    const htmlEl = el as HTMLElement;
    htmlEl.style.backgroundColor = "transparent";
    htmlEl.style.border = "1px solid #000";
  });

  container.querySelectorAll('.hide-in-pdf').forEach((el) => {
    const htmlEl = el as HTMLElement;
    htmlEl.style.display = "none";
    console.log("Hidden PDF element:", htmlEl.className);
  });

  if (shouldDisableColoringAndMoving) {
    console.log("Skipping coloring and moving logic for small bracket (≤16 participants)");
  } else {
    const containerWidth = 1090;
    let furthestRightElement: HTMLElement | null = null;
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
    const isPlacementMatch = htmlEl.textContent?.trim().match(/^\d+-\d+$/);
    
    const actualPosition = visualRight > elementRight ? visualRight : elementRight;
    const elementData = { element: htmlEl, position: actualPosition };
    
    allElements.push(elementData);
    
    // Separate elements by bracket type
    if (isInLoserBracket(htmlEl)) {
      miinusringElements.push(elementData);
    } else {
      mainBracketElements.push(elementData);
    }
    
    if (actualPosition > furthestRightPosition) {
      furthestRightPosition = actualPosition;
      furthestRightElement = htmlEl;
    }
    
    if (actualPosition > containerWidth || isPlacementMatch) {
      elementsToMove.push(elementData);
    }
  });
  
  const sortedElements = allElements.sort((a, b) => b.position - a.position);
  console.log("Main bracket elements:", mainBracketElements.length);
  console.log("Miinusring elements:", miinusringElements.length);
  
  // Separate placement matches by bracket type
  const mainPlacementMatches = mainBracketElements.filter(({ element }) => {
    const text = element.textContent?.trim();
    return text === "1-2" || text === "3-4" || text === "5-6";
  });
  
  const miinusringPlacementMatches = miinusringElements.filter(({ element }) => {
    const text = element.textContent?.trim();
    return text === "1-2" || text === "3-4" || text === "5-6";
  });
  
  if (bracketSize === 32) {
    if (hasLosersBracket) {
      const sortedMiinusringElements = miinusringElements
        .filter(({ element }) => {
          const text = element.textContent?.trim();
          // Exclude grand final matches from main bracket and already processed matches
          if (text === "1-2") return false; // Always exclude 1-2 matches
          if (text === "3-4" && !element.closest('.loser-bracket-match')) return false; // Only exclude 3-4 if NOT in loser bracket
          if (element.classList.contains("repositioned-match")) return false; // Exclude already processed matches
          return true;
        })
        .sort((a, b) => b.position - a.position);
      
      // const columnsToColor = Math.max(1, Math.min(3, sortedMiinusringElements.length)); // Fewer columns for 32-player
      const columnsToColor = 5
      
      console.log(`32-player double elimination: coloring ${columnsToColor} rightmost loser bracket matches out of ${sortedMiinusringElements.length} total`);
      
      // Calculate spacing needed for the moved matches
      const matchSpacing = 800; // Less spacing needed for 32-player
      
      sortedMiinusringElements.slice(0, columnsToColor).forEach(({ element }) => {
        element.style.backgroundColor = "yellow";
        element.classList.add("loser-bracket-split");
        
        // Move down under current miinusring, keeping horizontal position
        const currentTransform = element.style.transform || "";
        const newTransform = currentTransform 
          ? `${currentTransform} translateY(${matchSpacing}px)`
          : `translateY(${matchSpacing}px)`;
        element.style.transform = newTransform;
        element.style.position = "relative";
        element.style.zIndex = "999";
        
        console.log("Colored and moved rightmost loser bracket match down:", element.textContent?.slice(0, 20));
      });
      
      // Also move the rightmost loser bracket connectors
      const loserBracketConnectors = Array.from(container.querySelectorAll('.loser-bracket-connector')) as HTMLElement[];
      const sortedConnectors = loserBracketConnectors
        .map(connector => ({
          element: connector,
          position: connector.getBoundingClientRect().right
        }))
        .sort((a, b) => b.position - a.position);
      
      // Move fewer connectors for 32-player
      const connectorsToMove = Math.min(sortedConnectors.length, columnsToColor * 2);
      
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
          
          console.log("Moved loser bracket connector");
        }
      });
      
      // Create miinusringi jätk section
      let placementTitle = container.querySelector('.bracket-title-5-6') as HTMLElement;
      let sectionName = '5-6';
      
      if (!placementTitle) {
        placementTitle = container.querySelector('.bracket-title-7-8') as HTMLElement;
        sectionName = '7-8';
      }
      
      if (placementTitle) {
        console.log(`Found ${sectionName} title, repositioning matches before it`);
        
        // Create a container div for the moved matches
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
        
        // Apply page break to the next placement section since Miinusringi jätk is inserted inside current one
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
          console.log(`Applied page break to ${nextPlacementTitle.textContent?.trim()} section`);
        }
        
        // Move the selected matches and connectors to the new section
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
        
        // Create match ID mapping and process match IDs
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
        
        // Calculate the bounding box of matches and connectors only
        let minLeft = Infinity, minTop = Infinity;
        elementsWithPositions.forEach(item => {
          if (item && (item.type === 'match' || item.type === 'connector')) {
            minLeft = Math.min(minLeft, item.originalLeft);
            minTop = Math.min(minTop, item.originalTop);
          }
        });
        
        console.log("32-player bounding box (matches/connectors only):", { minLeft, minTop });
        
        // Move elements and preserve relative positioning
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
                  console.log(`Moved match ID ${item.element.textContent?.trim()} to right side of match`);
                  return;
                }
              }
            }
            
            item.element.style.position = 'absolute';
            item.element.style.left = `${item.originalLeft - minLeft}px`;
            item.element.style.top = `${item.originalTop - minTop + 80}px`;
            
            matchContainer.appendChild(item.element);
            console.log(`Moved ${item.type} with preserved position:`, item.element.textContent?.slice(0, 20) || 'connector');
          }
        });
        
        console.log(`Created matches container between miinusring and ${sectionName} sections`);
      }
    } else {
      console.log("32-player single elimination: no movement applied");
    }
  } else if (bracketSize === 64 && !hasLosersBracket) {
    // For 64-player single elimination: move the "1-2" match left and up by 80px
    const finalMatch = mainBracketElements.find(({ element }) => {
      const text = element.textContent?.trim();
      return text === "1-2" && !element.closest('.loser-bracket-match');
    });
    
    if (finalMatch) {
      finalMatch.element.style.backgroundColor = "purple";
      const currentTransform = finalMatch.element.style.transform || "";
      const newTransform = currentTransform 
        ? `${currentTransform} translateX(-300px) translateY(-200px)`
        : "translateX(-300px) translateY(-200px)";
      finalMatch.element.style.transform = newTransform;
      finalMatch.element.classList.add("repositioned-match");
      console.log("Moved 1-2 match in 64-player single elimination:", finalMatch.element.textContent?.slice(0, 20));
    }
    
    // Also move the 3-4 match if it exists
    const thirdFourthMatch = mainBracketElements.find(({ element }) => {
      const text = element.textContent?.trim();
      return text === "3-4" && !element.closest('.loser-bracket-match');
    });
    
    if (thirdFourthMatch) {
      thirdFourthMatch.element.style.backgroundColor = "purple";
      const currentTransform = thirdFourthMatch.element.style.transform || "";
      const newTransform = currentTransform 
        ? `${currentTransform} translateX(-300px) translateY(-200px)`
        : "translateX(-300px) translateY(-200px)";
      thirdFourthMatch.element.style.transform = newTransform;
      thirdFourthMatch.element.classList.add("repositioned-match");
      console.log("Moved 3-4 match in 64-player single elimination:", thirdFourthMatch.element.textContent?.slice(0, 20));
    }
  } else if (bracketSize === 64 && hasLosersBracket) {
    // For 64-player double elimination: move the "1-2" match left and up by 80px (same as single elimination)
    let grandFinalMatch = null;
    
    // First try to find the "1-2" match in main bracket elements
    if (mainBracketElements.length > 0) {
      grandFinalMatch = mainBracketElements.find(({ element }) => {
        const text = element.textContent?.trim();
        return text === "1-2" && !element.closest('.loser-bracket-match');
      });
    }
    
    // If not found in main bracket, search in all elements
    if (!grandFinalMatch) {
      const oneTwoMatch = allElements.find(({ element }) => {
        const text = element.textContent?.trim();
        return text === "1-2" && !element.closest('.loser-bracket-match');
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
      console.log("Moved 1-2 match in 64-player double elimination:", grandFinalMatch.element.textContent?.slice(0, 20));
    }
    
    // Also move the 3-4 match if it exists
    let thirdFourthMatch = null;
    
    // First try to find the "3-4" match in main bracket elements
    if (mainBracketElements.length > 0) {
      thirdFourthMatch = mainBracketElements.find(({ element }) => {
        const text = element.textContent?.trim();
        return text === "3-4" && !element.closest('.loser-bracket-match');
      });
    }
    
    // If not found in main bracket, search in all elements
    if (!thirdFourthMatch) {
      const threeFourMatch = allElements.find(({ element }) => {
        const text = element.textContent?.trim();
        return text === "3-4" && !element.closest('.loser-bracket-match');
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
      console.log("Moved 3-4 match in 64-player double elimination:", thirdFourthMatch.element.textContent?.slice(0, 20));
    }
    
    const sortedMiinusringElements = miinusringElements
      .filter(({ element }) => {
        const text = element.textContent?.trim();
        // Exclude grand final matches from main bracket and already processed matches
        if (text === "1-2") return false; // Always exclude 1-2 matches
        if (text === "3-4" && !element.closest('.loser-bracket-match')) return false; // Only exclude 3-4 if NOT in loser bracket
        if (element.classList.contains("repositioned-match")) return false; // Exclude already processed matches
        return true;
      })
      .sort((a, b) => b.position - a.position);
    
    console.log(matchElements.length)
    const columnsToColor = -219 + matchElements.length; 
    console.log(columnsToColor)
    
    console.log(`64-player double elimination: coloring ${columnsToColor} rightmost loser bracket matches out of ${sortedMiinusringElements.length} total`);
    
    // Calculate spacing needed for the moved matches
    const matchSpacing = 1000; // Space needed for the moved matches section
    
    sortedMiinusringElements.slice(0, columnsToColor).forEach(({ element }) => {
      element.style.backgroundColor = "yellow";
      element.classList.add("loser-bracket-split");
      
      // Move down under current miinusring, keeping horizontal position
      const currentTransform = element.style.transform || "";
      const newTransform = currentTransform 
        ? `${currentTransform} translateY(${matchSpacing}px)`
        : `translateY(${matchSpacing}px)`;
      element.style.transform = newTransform;
      element.style.position = "relative";
      element.style.zIndex = "999";
      
      console.log("Colored and moved rightmost loser bracket match down:", element.textContent?.slice(0, 20));
    });
    
    // Also move the rightmost loser bracket connectors
    const loserBracketConnectors = Array.from(container.querySelectorAll('.loser-bracket-connector')) as HTMLElement[];
    const sortedConnectors = loserBracketConnectors
      .map(connector => ({
        element: connector,
        position: connector.getBoundingClientRect().right
      }))
      .sort((a, b) => b.position - a.position);
    
    // Move the same number of rightmost connectors as matches (or a bit more to ensure coverage)
    const connectorsToMove = Math.min(sortedConnectors.length, columnsToColor * 3); // 3x multiplier for connector coverage
    
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
        
        console.log("Moved loser bracket connector");
      }
    });
    
    // Look for placement section title, fallback from 5-6 to 7-8 if needed
    let placementTitle = container.querySelector('.bracket-title-5-6') as HTMLElement;
    let sectionName = '5-6';
    
    if (!placementTitle) {
      placementTitle = container.querySelector('.bracket-title-7-8') as HTMLElement;
      sectionName = '7-8';
    }
    
    if (placementTitle) {
      console.log(`Found ${sectionName} title, repositioning matches before it`);
      
      // Create a container div for the moved matches
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
      containerTitle.style.fontSize = '32px';
      containerTitle.style.fontWeight = 'bold';
      containerTitle.style.color = '#333';
      matchContainer.appendChild(containerTitle);
      
      placementTitle.parentNode?.insertBefore(matchContainer, placementTitle);
      
      // Apply page break to the next placement section since Miinusringi jätk is inserted inside current one
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
        console.log(`Applied page break to ${nextPlacementTitle.textContent?.trim()} section`);
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
      
      // Combine matches, connectors, and match IDs
      const elementsWithPositions = [...matchesWithPositions, ...connectorsWithPositions, ...matchIdsWithPositions];
      
      // Calculate the bounding box of matches and connectors only (not match IDs)
      let minLeft = Infinity, minTop = Infinity;
      elementsWithPositions.forEach(item => {
        if (item && (item.type === 'match' || item.type === 'connector')) {
          minLeft = Math.min(minLeft, item.originalLeft);
          minTop = Math.min(minTop, item.originalTop);
        }
      });
      
      console.log("Bounding box (matches/connectors only):", { minLeft, minTop });
      
      // Move elements and preserve relative positioning
      elementsWithPositions.forEach(item => {
        if (item) {
          // Remove the translateY transform
          item.element.style.transform = '';
          
          if (item.type === 'match-id') {
            // For match IDs, find the corresponding match and position absolutely relative to its position
            const correspondingMatch = (item as any).correspondingMatch;
            if (correspondingMatch) {
              // Find the corresponding match in the moved elements
              const correspondingMatchItem = elementsWithPositions.find(matchItem => 
                matchItem && matchItem.type === 'match' && 
                matchItem.element === correspondingMatch
              );
              
              if (correspondingMatchItem) {
                item.element.style.position = 'absolute';
                // Use 230 offset for 228-match brackets, 0 for others
                const leftOffset = matchElements.length === 228 ? 230 : 0;
                item.element.style.left = `${correspondingMatchItem.originalLeft - minLeft - leftOffset + 198 + 0}px`; // 198px (match width) + 8px spacing
                item.element.style.top = `${correspondingMatchItem.originalTop - minTop + 95}px`; // Start from top with title space 
                item.element.style.zIndex = '1000';
                item.element.style.pointerEvents = 'none'; // Don't interfere with interactions
                
                // Append to the main container, not the match container
                matchContainer.appendChild(item.element);
                console.log(`Moved match ID ${item.element.textContent?.trim()} to right side of match`);
                return;
              }
            }
          }
          
          // For matches and connectors, use absolute positioning in the container
          item.element.style.position = 'absolute';
          // Use 230 offset for 228-match brackets, 0 for others
          const leftOffset = matchElements.length === 228 ? 230 : 0;
          item.element.style.left = `${item.originalLeft - minLeft - leftOffset}px`;
          item.element.style.top = `${item.originalTop - minTop + 80}px`; // 80px to account for title
          
          // Move the DOM element to the new container
          matchContainer.appendChild(item.element);
          console.log(`Moved ${item.type} with preserved position:`, item.element.textContent?.slice(0, 20) || 'connector');
        }
      });
      
      console.log(`Created matches container between miinusring and ${sectionName} sections`);
    }
  } else {
    const consolationMatches = sortedElements
      .filter(({ element }) => {
        const text = element.textContent?.trim();
        return !text?.match(/^\d+-\d+$/);
      })
      .slice(0, 5); 
    
    mainPlacementMatches.forEach(({ element }) => {
      if (!element.classList.contains("repositioned-match")) {
        element.style.backgroundColor = "pink";
        
        const currentTransform = element.style.transform || "";
        const newTransform = currentTransform 
          ? `${currentTransform} translateX(-235px) translateY(-45px)`
          : "translateX(-235px) translateY(-45px)";
        element.style.transform = newTransform;
        element.classList.add("repositioned-match");
        
        console.log("Moved main bracket placement match:", element.textContent?.slice(0, 20));
      }
    });
    
    miinusringPlacementMatches.forEach(({ element }) => {
      if (!element.classList.contains("repositioned-match")) {
        element.style.backgroundColor = "red";
        
        const currentTransform = element.style.transform || "";
        const newTransform = currentTransform 
          ? `${currentTransform} translateX(-235px) translateY(-45px)`
          : "translateX(-235px) translateY(-45px)";
        element.style.transform = newTransform;
        element.classList.add("repositioned-match");
        
        console.log("Moved miinusring placement match:", element.textContent?.slice(0, 20));
      }
    });
    
    consolationMatches.forEach(({ element }) => {
      element.style.backgroundColor = "lightblue";
      console.log("Colored consolation match:", element.textContent?.slice(0, 20));
    });
  }
  
  if (furthestRightElement) {
    console.log("Furthest right element:", furthestRightElement, "at position:", furthestRightPosition);
  }
  } 

  const className = settings.title?.replace(/ Tournament$/, "").trim();
  if (className && className !== "Tournament Bracket") {
    const header = document.createElement("div");
    Object.assign(header.style, {
      textAlign: "center", fontWeight: "bold", fontSize: "24px",
      marginBottom: "125px", padding: "15px", border: "2px solid #000",
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
}) => {
  const [settings, setSettings] = useState({ whiteBackground: true });

  const generateDebugHTML = () => {
    const container = document.getElementById(containerId);
    if (!container) {
      console.log("Container not found with ID:", containerId);
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

      applyPrintStyles(clone, { whiteBackground: settings.whiteBackground, title });

      const styledHTML = clone.outerHTML;

      document.body.removeChild(clone);

      const debugWindow = window.open("", "_blank", "width=" + screen.width + ",height=" + screen.height + ",fullscreen=yes");
      if (!debugWindow) return;

      const debugHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>PDF Debug - ${title}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>${PDF_STYLES.SCREEN_CSS}${PDF_STYLES.PRINT_CSS}</style>
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
          <DialogTitle>PDF Print Setup - {title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 p-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="white-bg"
              checked={settings.whiteBackground}
              onCheckedChange={(checked) =>
                setSettings(prev => ({ ...prev, whiteBackground: !!checked }))
              }
            />
            <Label htmlFor="white-bg">Convert gray backgrounds to white</Label>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <h3 className="font-semibold mb-2">How to create PDF:</h3>
            <ol className="text-sm space-y-1">
              <li>1. Click "Open Print Preview" below</li>
              <li>2. In the new window, click "Save PDF"</li>
              <li>3. Use your browser's print dialog to save as PDF</li>
            </ol>
          </div>

          <Button onClick={generateDebugHTML} className="w-full">
            Open Print Preview
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
