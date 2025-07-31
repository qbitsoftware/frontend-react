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
      @page { margin: 0.5in; size: A4; }
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

  container.querySelectorAll("*").forEach((el) => {
    const htmlEl = el as HTMLElement;
    const text = htmlEl.textContent?.trim() || "";
    const shouldBreak = text.includes("MIINUSRING") || 
                       text.includes("Miinusring") ||
                       text.includes("3rd place") ||
                       ["5-6", "7-8", "25-32", "33-48", "49-64", "65-96"].some(t => text.includes(t));
    
    if (shouldBreak) {
      let parent = htmlEl.closest("div");
      while (parent && !parent.classList.contains("font-bold")) {
        parent = parent.parentElement as HTMLDivElement | null;
      }
      if (parent?.parentElement) {
        (parent.parentElement as HTMLElement).style.pageBreakBefore = "always";
      }
    }
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
  
  // Helper function to check if element is in loser bracket
  const isInLoserBracket = (element: HTMLElement): boolean => {
    // Check if element or any parent has the loser-bracket-match class
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
  
  // Handle special bracket size cases
  if (bracketSize === 32) {
    if (hasLosersBracket) {
      // For 32-player double elimination: only move furthest element
      if (furthestRightElement) {
        (furthestRightElement as HTMLElement).style.backgroundColor = "orange";
        const currentTransform = (furthestRightElement as HTMLElement).style.transform || "";
        const newTransform = currentTransform 
          ? `${currentTransform} translateX(-235px) translateY(-45px)`
          : "translateX(-235px) translateY(-45px)";
        (furthestRightElement as HTMLElement).style.transform = newTransform;
        (furthestRightElement as HTMLElement).classList.add("repositioned-match");
        console.log("Moved furthest element in 32-player double elimination:", (furthestRightElement as HTMLElement).textContent?.slice(0, 20));
      }
    } else {
      console.log("32-player single elimination: no movement applied");
    }
  } else if (bracketSize === 64 && !hasLosersBracket) {
    // For 64-player single elimination: move the "1-2" match left and up by 80px
    const finalMatch = mainBracketElements.find(({ element }) => {
      const text = element.textContent?.trim();
      return text === "1-2";
    });
    
    if (finalMatch) {
      finalMatch.element.style.backgroundColor = "purple";
      const currentTransform = finalMatch.element.style.transform || "";
      const newTransform = currentTransform 
        ? `${currentTransform} translateX(-235px) translateY(-80px)`
        : "translateX(-235px) translateY(-80px)";
      finalMatch.element.style.transform = newTransform;
      finalMatch.element.classList.add("repositioned-match");
      console.log("Moved 1-2 match in 64-player single elimination:", finalMatch.element.textContent?.slice(0, 20));
    }
  } else if (bracketSize === 64 && hasLosersBracket) {
    // For 64-player double elimination: 
    // 1. First handle the rightmost match (likely the grand final)
    // If no main bracket elements, find the rightmost overall match with "1-2" text
    let grandFinalMatch = null;
    
    if (mainBracketElements.length > 0) {
      grandFinalMatch = mainBracketElements.reduce((rightmost, current) => 
        current.position > rightmost.position ? current : rightmost
      );
    } else {
      // If all matches are in miinusring, find the "1-2" match
      const oneTwoMatch = allElements.find(({ element }) => {
        const text = element.textContent?.trim();
        return text === "1-2";
      });
      grandFinalMatch = oneTwoMatch || null;
    }
    
    if (grandFinalMatch) {
      grandFinalMatch.element.style.backgroundColor = "purple";
      const currentTransform = grandFinalMatch.element.style.transform || "";
      const newTransform = currentTransform 
        ? `${currentTransform} translateX(-235px) translateY(-80px)`
        : "translateX(-235px) translateY(-80px)";
      grandFinalMatch.element.style.transform = newTransform;
      grandFinalMatch.element.classList.add("repositioned-match");
      console.log("Moved grand final match in 64-player double elimination:", grandFinalMatch.element.textContent?.slice(0, 20));
    }
    
    // 2. Then color the rightmost loser bracket matches (excluding grand final and any already processed matches)
    const sortedMiinusringElements = miinusringElements
      .filter(({ element }) => {
        const text = element.textContent?.trim();
        // Exclude grand final matches and already processed matches
        return text !== "1-2" && !element.classList.contains("repositioned-match");
      })
      .sort((a, b) => b.position - a.position);
    
    const columnsToColor = 9; // Hardcoded for 64-player double elimination
    
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
    
    const fiveSixTitle = container.querySelector('.bracket-title-5-6') as HTMLElement;
    if (fiveSixTitle) {
      console.log("Found 5-6 title, repositioning matches before it");
      
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
      
      // Insert the container before the 5-6 title
      fiveSixTitle.parentNode?.insertBefore(matchContainer, fiveSixTitle);
      
      // Store original positions before moving (matches + connectors)
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
      
      // Also get connector positions
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
      
      // Combine matches and connectors only
      const elementsWithPositions = [...matchesWithPositions, ...connectorsWithPositions];
      
      // Calculate the bounding box of all selected elements
      let minLeft = Infinity, minTop = Infinity;
      elementsWithPositions.forEach(item => {
        if (item) {
          minLeft = Math.min(minLeft, item.originalLeft);
          minTop = Math.min(minTop, item.originalTop);
        }
      });
      
      // Move elements and preserve relative positioning
      elementsWithPositions.forEach(item => {
        if (item) {
          // Remove the translateY transform
          item.element.style.transform = '';
          
          item.element.style.position = 'absolute';
          item.element.style.left = `${item.originalLeft - minLeft - 230}px`;
          item.element.style.top = `${item.originalTop - minTop + 80}px`; // 80px to account for title
          
          // Move the DOM element to the new container
          matchContainer.appendChild(item.element);
          console.log(`Moved ${item.type} with preserved position:`, item.element.textContent?.slice(0, 20) || 'connector');
        }
      });
      
      console.log("Created matches container between miinusring and 5-6 sections");
    }
  } else {
    // Original logic for other bracket sizes
    const consolationMatches = sortedElements
      .filter(({ element }) => {
        const text = element.textContent?.trim();
        return !text?.match(/^\d+-\d+$/);
      })
      .slice(0, 5); 
    
    // Color main bracket placement matches pink (exclude already processed elements)
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
    
    // Color miinusring placement matches red (exclude already processed elements)
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
    
    // Color consolation matches lightblue
    consolationMatches.forEach(({ element }) => {
      element.style.backgroundColor = "lightblue";
      console.log("Colored consolation match:", element.textContent?.slice(0, 20));
    });
  }
  
  if (furthestRightElement) {
    console.log("Furthest right element:", furthestRightElement, "at position:", furthestRightPosition);
  }
  } // End of coloring and moving logic

  const className = settings.title?.replace(/ Tournament$/, "").trim();
  if (className && className !== "Tournament Bracket") {
    const header = document.createElement("div");
    Object.assign(header.style, {
      textAlign: "center", fontWeight: "bold", fontSize: "24px",
      marginBottom: "80px", padding: "15px", border: "2px solid #000",
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
