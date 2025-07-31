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
                       ["7-8", "25-32", "33-48", "49-64", "65-96"].some(t => text.includes(t));
    
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

  const containerWidth = 1090;
  let furthestRightElement = null;
  let furthestRightPosition = 0;
  const elementsToMove: Array<{ element: HTMLElement; position: number }> = [];
  const allElements: Array<{ element: HTMLElement; position: number }> = [];
  
  container.querySelectorAll(".w-\\[198px\\], .w-\\[240px\\]").forEach((el) => {
    const htmlEl = el as HTMLElement;
    const elementRight = htmlEl.offsetLeft + htmlEl.offsetWidth;
    const rect = htmlEl.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const visualRight = rect.right - containerRect.left;
    const isPlacementMatch = htmlEl.textContent?.trim().match(/^\d+-\d+$/);
    
    console.log("element:", htmlEl.textContent?.slice(0, 20), 
                "DOM right:", elementRight, 
                "visual right:", Math.round(visualRight),
                "placement match:", !!isPlacementMatch,
                "transform:", htmlEl.style.transform || "none",
                "offsetLeft:", htmlEl.offsetLeft,
                "offsetWidth:", htmlEl.offsetWidth,
                "rect.left:", Math.round(rect.left),
                "rect.right:", Math.round(rect.right));
    
    const actualPosition = visualRight > elementRight ? visualRight : elementRight;
    allElements.push({ element: htmlEl, position: actualPosition });
    
    if (actualPosition > furthestRightPosition) {
      furthestRightPosition = actualPosition;
      furthestRightElement = htmlEl;
    }
    
    if (actualPosition > containerWidth || isPlacementMatch) {
      elementsToMove.push({ element: htmlEl, position: actualPosition });
    }
  });
  
  console.log("Total elements found:", allElements.length);
  const sortedElements = allElements.sort((a, b) => b.position - a.position);
  console.log("All elements sorted by position:", sortedElements.map((el, index) => ({ 
    index: index + 1,
    position: el.position, 
    text: el.element.textContent?.slice(0, 30),
    isPlacementMatch: !!el.element.textContent?.trim().match(/^\d+-\d+$/)
  })));
  
  const placementMatches = allElements.filter(({ element }) => {
    const text = element.textContent?.trim();
    return text === "1-2" || text === "3-4" || text === "5-6";
  });
  
  const consolationMatches = sortedElements
    .filter(({ element }) => {
      const text = element.textContent?.trim();
      return !text?.match(/^\d+-\d+$/);
    })
    .slice(0, 5); 
  
  console.log("Placement matches (main bracket):", placementMatches.map(el => ({ 
    position: el.position, 
    text: el.element.textContent?.slice(0, 20) 
  })));
  
  console.log("Consolation bracket matches:", consolationMatches.map(el => ({ 
    position: el.position, 
    text: el.element.textContent?.slice(0, 20) 
  })));
  
  placementMatches.forEach(({ element }) => {
    element.style.backgroundColor = "pink";
    
    const currentTransform = element.style.transform || "";
    const newTransform = currentTransform 
      ? `${currentTransform} translateX(-235px) translateY(-45px)`
      : "translateX(-235px) translateY(-45px)";
    element.style.transform = newTransform;
    element.classList.add("repositioned-match");
    
    console.log("Moved placement match:", element.textContent?.slice(0, 20), "with transform:", newTransform);
  });
  
  consolationMatches.forEach(({ element }) => {
    element.style.backgroundColor = "lightblue";
    console.log("Colored consolation match:", element.textContent?.slice(0, 20));
  });
  
  if (furthestRightElement) {
    console.log("Furthest right element:", furthestRightElement, "at position:", furthestRightPosition);
  }

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
    
    console.log("Original container content length:", container.innerHTML.length);
    console.log("Original container children count:", container.children.length);

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

      console.log("Clone content length:", clone.innerHTML.length);
      console.log("Clone children count:", clone.children.length);

      const styledHTML = clone.outerHTML;
      console.log("Styled HTML length:", styledHTML.length);

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
      // Always restore original styles
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
