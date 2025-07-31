import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { SimpleMultiPagePDF } from './simple-multipage-pdf';
import { useTranslation } from 'react-i18next';
import html2canvas from "html2canvas";

interface PDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  containerId: string;
  title: string;
}

export const PDFPreviewModal: React.FC<PDFPreviewModalProps> = ({
  isOpen,
  onClose,
  containerId,
  title,
}) => {
  const { t } = useTranslation();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pageCount, setPageCount] = useState<number>(0);
  const [settings, setSettings] = useState({
    whiteBackground: true,
    highQuality: true,
  });
  const [debugMode, setDebugMode] = useState(false);

  useEffect(() => {
    if (isOpen) {
      generatePreview();
    }
  }, [isOpen, settings]);

  const calculateSimplePageBreaks = (totalHeight: number, pageHeight: number): number[] => {
    const breaks: number[] = [0];
    
    for (let y = pageHeight; y < totalHeight; y += pageHeight) {
      breaks.push(Math.min(y, totalHeight));
    }
    
    return breaks.filter((breakPoint, index) => index === 0 || breakPoint < totalHeight);
  };

  const addBracketPageBreaks = (container: HTMLElement) => {
    // Handle page breaks before Miinusring sections and placement matches
    const allSections = container.querySelectorAll('*');
    allSections.forEach((el) => {
      if (el.textContent) {
        const text = el.textContent.trim();
        
        // Check for Miinusring sections
        const isMiinusring = text.includes('MIINUSRING') || 
                            text.includes('Miinusring') ||
                            text.includes('miinusring');
        
        const isPlacementMatch = text.includes('3rd place') ||
                               text.includes('7-8') ||
                               text.includes('25-32') ||
                               text.includes('33-48') || 
                               text.includes('49-64'); 
        
        if (isMiinusring || isPlacementMatch) {
          let parentSection = el.closest('div') as HTMLDivElement | null;
          while (parentSection && !parentSection.classList.contains('font-bold')) {
            parentSection = parentSection.parentElement as HTMLDivElement | null;
          }
          if (parentSection && parentSection.parentElement) {
            parentSection.parentElement.style.pageBreakBefore = 'always';
            parentSection.parentElement.classList.add('page-break-before');
          }
        }
      }
    });
  };

  const addClassNameHeader = (container: HTMLElement, titleProp: string) => {
    // Extract class name from title (e.g., "U12 Tournament" -> "U12")
    const className = titleProp.replace(/ Tournament$/, '').trim();
    
    if (className && className !== 'Tournament Bracket') {
      // Create a header element
      const headerElement = document.createElement('div');
      headerElement.classList.add('class-name-header');
      headerElement.style.textAlign = 'center';
      headerElement.style.fontWeight = 'bold';
      headerElement.style.fontSize = '24px';
      headerElement.style.color = '#000';
      headerElement.style.marginBottom = '80px';
      headerElement.style.padding = '15px';
      headerElement.style.border = '2px solid #000';
      headerElement.style.backgroundColor = '#fff';
      headerElement.style.width = '100%';
      headerElement.style.display = 'block';
      headerElement.textContent = className;
      
      if (container.firstChild) {
        container.insertBefore(headerElement, container.firstChild);
      } else {
        container.appendChild(headerElement);
      }
    }
  };

  const removeClassNameHeader = (container: HTMLElement) => {
    const classHeaders = container.querySelectorAll('.class-name-header');
    classHeaders.forEach(header => {
      header.remove();
    });
  };

  const repositionOverflowingMatches = (container: HTMLElement) => {
    // Find all match cells that might be overflowing horizontally
    const matchCells = container.querySelectorAll('.w-\\[198px\\]'); // Match cells with fixed width
    const containerWidth = container.scrollWidth;
    const pageWidth = 210; // A4 width in mm
    const margin = 10; // 5mm margin on each side
    const maxPrintWidth = pageWidth - margin; // Maximum usable width in mm
    
    // Calculate pixels per mm based on container
    const pixelsPerMM = containerWidth / maxPrintWidth;
    const maxPixelWidth = maxPrintWidth * pixelsPerMM;
    
    console.log(`Container width: ${containerWidth}px, Max print width: ${maxPixelWidth}px`);
    
    const repositionedElements: Array<{element: HTMLElement, originalTransform: string, originalLeft: string, originalRight: string}> = [];
    
    matchCells.forEach((cell) => {
      const htmlCell = cell as HTMLElement;
      const rect = htmlCell.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const relativeRight = rect.right - containerRect.left;
      
      // Check if the cell extends beyond the printable area
      if (relativeRight > maxPixelWidth) {
        console.log(`Match cell overflowing: right edge at ${relativeRight}px, max allowed: ${maxPixelWidth}px`);
        
        // Store original positioning
        repositionedElements.push({
          element: htmlCell,
          originalTransform: htmlCell.style.transform || '',
          originalLeft: htmlCell.style.left || '',
          originalRight: htmlCell.style.right || ''
        });
        
        // Calculate how much to move it left
        const overflow = relativeRight - maxPixelWidth + 20; // 20px safety margin
        
        // Apply repositioning
        const currentTransform = htmlCell.style.transform || '';
        const newTransform = currentTransform + ` translateX(-${overflow}px)`;
        htmlCell.style.transform = newTransform;
        htmlCell.classList.add('repositioned-for-print');
        
        console.log(`Repositioned match cell by -${overflow}px`);
      }
    });
    
    return repositionedElements;
  };
  
  const restoreMatchPositions = (repositionedElements: Array<{element: HTMLElement, originalTransform: string, originalLeft: string, originalRight: string}>) => {
    repositionedElements.forEach(({element, originalTransform, originalLeft, originalRight}) => {
      element.style.transform = originalTransform;
      element.style.left = originalLeft;
      element.style.right = originalRight;
      element.classList.remove('repositioned-for-print');
    });
  };

  const generateDebugHTML = () => {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Create a new window for fullscreen debug view
    const debugWindow = window.open('', '_blank', 'width=' + screen.width + ',height=' + screen.height + ',fullscreen=yes');
    if (!debugWindow) return;

    // Clone the container
    const clone = container.cloneNode(true) as HTMLElement;

    // Apply PDF generation styles to the clone
    clone.style.height = 'auto';
    clone.style.maxHeight = 'none';
    clone.style.overflow = 'visible';
    clone.style.backgroundColor = '#FFFFFF';
    clone.style.padding = '0';
    clone.style.margin = '0';
    clone.style.width = '100%';
    clone.style.transform = 'none';

    if (settings.whiteBackground) {
      const greyElements = clone.querySelectorAll('*');
      greyElements.forEach((el) => {
        const computedStyle = window.getComputedStyle(el);
        if (computedStyle.backgroundColor === 'rgb(248, 249, 250)' || 
            (el as HTMLElement).classList.contains('bg-[#F8F9FA]')) {
          (el as HTMLElement).style.backgroundColor = '#FFFFFF';
        }
      });
    }

    // Auto-size participant names based on length to prevent overflow
    const participantElements = clone.querySelectorAll('.text-xs');
    participantElements.forEach((el) => {
      const isParticipantName = (el as HTMLElement).classList.contains('cursor-pointer') || 
                               ((el as HTMLElement).textContent?.trim().length! > 2 && 
                                !(el as HTMLElement).textContent?.includes('Table') && 
                                !(el as HTMLElement).textContent?.includes('(Bye)') &&
                                !el.closest('[class*="text-[8px]"]'));
      if (isParticipantName) {
        const nameLength = (el as HTMLElement).textContent?.trim().length || 0;
        // Auto-size based on name length to prevent overflow
        if (nameLength > 25) {
          // Very long names - use smallest size
          (el as HTMLElement).className = (el as HTMLElement).className.replace('text-xs', 'text-[10px]');
        } else if (nameLength > 18) {
          // Long names - keep small size
          // Keep text-xs (no change needed)
        } else if (nameLength > 12) {
          // Medium names - slightly larger
          (el as HTMLElement).className = (el as HTMLElement).className.replace('text-xs', 'text-sm');
        } else {
          // Short names - can use larger size
          (el as HTMLElement).className = (el as HTMLElement).className.replace('text-xs', 'text-sm');
        }
      }
    });

    // Remove ALL horizontal padding from main containers and parent elements
    const containers = clone.querySelectorAll('*');
    containers.forEach((el) => {
      const computedStyle = window.getComputedStyle(el);
      
      // Check if element has horizontal padding
      if (computedStyle.paddingLeft !== '0px' || computedStyle.paddingRight !== '0px' || 
          (el as HTMLElement).classList.contains('px-2') || (el as HTMLElement).classList.contains('px-4') || 
          (el as HTMLElement).classList.contains('px-10') || (el as HTMLElement).classList.contains('p-2') || 
          (el as HTMLElement).classList.contains('p-4') || (el as HTMLElement).classList.contains('p-10')) {
        
        // Remove horizontal padding completely
        (el as HTMLElement).style.paddingLeft = '0';
        (el as HTMLElement).style.paddingRight = '0';
        
        // If it's a general padding class, preserve vertical padding but remove horizontal
        if ((el as HTMLElement).classList.contains('p-2')) {
          (el as HTMLElement).style.paddingTop = '0.5rem';
          (el as HTMLElement).style.paddingBottom = '0.5rem';
        } else if ((el as HTMLElement).classList.contains('p-4')) {
          (el as HTMLElement).style.paddingTop = '1rem';
          (el as HTMLElement).style.paddingBottom = '1rem';
        } else if ((el as HTMLElement).classList.contains('p-10')) {
          (el as HTMLElement).style.paddingTop = '2.5rem';
          (el as HTMLElement).style.paddingBottom = '2.5rem';
        }
      }
    });

    // Make connector lines between matches black and printable (using borders instead of backgrounds)
    const connectorElements = clone.querySelectorAll('.bg-blue-200, .bg-blue-400, [class*="bg-blue-2"], [class*="bg-blue-4"]');
    connectorElements.forEach((el: any) => {
      el.classList.add('bracket-connector');
      // Remove background color and use border instead for better printing
      el.style.backgroundColor = 'transparent';
      el.style.border = '2px solid #000000';
      // For very thin connector lines, use border-top or border-left as appropriate
      const computedStyle = window.getComputedStyle(el);
      if (computedStyle.height && parseInt(computedStyle.height) <= 4) {
        el.style.border = 'none';
        el.style.borderTop = '2px solid #000000';
        el.style.height = '2px';
      } else if (computedStyle.width && parseInt(computedStyle.width) <= 4) {
        el.style.border = 'none';
        el.style.borderLeft = '2px solid #000000';
        el.style.width = '2px';
      }
      // Ensure the element is visible
      el.style.display = 'block';
      el.style.visibility = 'visible';
      el.style.opacity = '1';
    });

    // Add strategic page breaks for large brackets
    addBracketPageBreaks(clone);
    
    // Add class name header at the top
    addClassNameHeader(clone, title);
    
    // Reposition any overflowing match cells for debug view
    repositionOverflowingMatches(clone);

    // Create the debug HTML content
    const debugHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>PDF Debug View - ${title}</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        body {
          margin: 0;
          padding: 20px;
          font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
          background: #f3f4f6;
        }
        .debug-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: #1f2937;
          color: white;
          padding: 10px 20px;
          z-index: 9999;
          font-size: 14px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .debug-content {
          margin-top: 60px;
          background: white;
          padding: 20px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          min-height: calc(100vh - 100px);
        }
        .debug-info {
          background: #fef3c7;
          border: 1px solid #f59e0b;
          padding: 10px;
          margin-bottom: 20px;
          border-radius: 4px;
          font-size: 12px;
        }
        .repositioned-for-print {
          border: 2px solid #ef4444 !important;
          background-color: rgba(239, 68, 68, 0.1) !important;
        }
        
        /* Print styles - hide debug elements and reset backgrounds */
        @media print {
          .debug-header {
            display: none !important;
          }
          .debug-info {
            display: none !important;
          }
          .debug-content {
            margin-top: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            background: white !important;
          }
          body {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .repositioned-for-print {
            border: none !important;
            background-color: transparent !important;
          }
          
          .bracket-connector { 
            background-color: transparent !important; 
            border: 1px solid #000000 !important;
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
          }
          .bg-blue-200, [class*="bg-blue-200"] { 
            background-color: transparent !important; 
            border: 1px solid #000000 !important;
          }
          .bg-blue-400, [class*="bg-blue-400"] { 
            background-color: transparent !important; 
            border: 1px solid #000000 !important;
          }
          .bg-white { background-color: white !important; }
          .bg-gray-50 { background-color: #f9fafb !important; }
          .bg-gray-100 { background-color: #f3f4f6 !important; }
          .bg-gray-200 { background-color: #e5e7eb !important; }
          .bg-blue-50 { background-color: #eff6ff !important; }
          .bg-green-200\\/50 { background-color: rgba(187, 247, 208, 0.5) !important; }
          .bg-\\[\\#F8F9FA\\] { background-color: #F8F9FA !important; }
          .bg-\\[\\#F3F9FC\\] { background-color: #F3F9FC !important; }
          
          /* Restore border styles */
          .border { border-width: 1px !important; }
          .border-gray-200 { border-color: #e5e7eb !important; }
          .border-b { border-bottom-width: 1px !important; }
          
          /* Ensure text colors are preserved */
          .text-gray-500 { color: #6b7280 !important; }
          .text-gray-600 { color: #4b5563 !important; }
          .text-blue-600 { color: #2563eb !important; }
          .text-xs { font-size: 0.75rem !important; }
          .text-sm { font-size: 0.875rem !important; }
          .text-\\[10px\\] { font-size: 10px !important; }
          /* Page break controls */
          .page-break-before {
            page-break-before: always !important;
            break-before: page !important;
          }
          
          /* Ensure proper page breaks */
          @page {
            margin: 0.5in;
            size: A4;
          }
        }
      </style>
    </head>
    <body>
      <div class="debug-header">
        <strong>PDF Debug View:</strong> ${title} | 
        <span style="color: #fbbf24;">Repositioned match cells are highlighted in red</span> |
        <button onclick="window.print()" style="background: #059669; color: white; border: none; padding: 4px 8px; border-radius: 4px; margin-left: 10px; cursor: pointer;">Save as PDF</button>
        <button onclick="window.close()" style="background: #dc2626; color: white; border: none; padding: 4px 8px; border-radius: 4px; margin-left: 10px; cursor: pointer;">Close</button>
      </div>
      <div class="debug-content">
        <div class="debug-info">
          <strong>Debug Information:</strong><br>
          • This view shows exactly how the HTML will be styled before conversion to PDF<br>
          • Match cells that would overflow are repositioned and highlighted in red<br>
          • Connector lines are BLACK borders (printable without background graphics - found ${connectorElements.length} connector elements)<br>
          • Cell borders remain in original grey colors<br>
          • Text positioning adjustments (translateY(-1px)) are applied<br>
          • Use browser dev tools to inspect specific elements and their positioning
        </div>
        ${clone.outerHTML}
      </div>
    </body>
    </html>
    `;

    debugWindow.document.write(debugHTML);
    debugWindow.document.close();
    debugWindow.focus();
  };

  const generatePreview = async () => {
    if (debugMode) {
      generateDebugHTML();
      return;
    }

    setIsGenerating(true);
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
      // Store original styles
      const originalStyles = {
        height: container.style.height,
        maxHeight: container.style.maxHeight,
        overflow: container.style.overflow,
        backgroundColor: container.style.backgroundColor,
      };

      // Apply PDF generation styles
      container.style.height = 'auto';
      container.style.maxHeight = 'none';
      container.style.overflow = 'visible';
      container.style.backgroundColor = '#FFFFFF';
      container.style.padding = '0';
      container.style.margin = '0';

      // Store elements to restore later
      const elementsToRestore: Array<{element: HTMLElement, originalBg?: string, originalClass?: string, originalPadding?: string, originalPaddingLeft?: string, originalPaddingRight?: string, originalTransform?: string}> = [];
      let repositionedMatches: Array<{element: HTMLElement, originalTransform: string, originalLeft: string, originalRight: string}> = [];

      if (settings.whiteBackground) {
        const greyElements = container.querySelectorAll('*');
        
        greyElements.forEach((el) => {
          const computedStyle = window.getComputedStyle(el);
          if (computedStyle.backgroundColor === 'rgb(248, 249, 250)' || 
              (el as HTMLElement).classList.contains('bg-[#F8F9FA]')) {
            elementsToRestore.push({element: el as HTMLElement, originalBg: (el as HTMLElement).style.backgroundColor});
            (el as HTMLElement).style.backgroundColor = '#FFFFFF';
          }
        });
      }

      // Auto-size participant names based on length to prevent overflow
      const participantElements = container.querySelectorAll('.text-xs');
      participantElements.forEach((el) => {
        // Check if this is likely a participant name
        const isParticipantName = (el as HTMLElement).classList.contains('cursor-pointer') || 
                                 ((el as HTMLElement).textContent?.trim().length! > 2 && 
                                  !(el as HTMLElement).textContent?.includes('Table') && 
                                  !(el as HTMLElement).textContent?.includes('(Bye)') &&
                                  !el.closest('[class*="text-[8px]"]'));
        if (isParticipantName) {
          elementsToRestore.push({element: el as HTMLElement, originalClass: (el as HTMLElement).className});
          
          const nameLength = (el as HTMLElement).textContent?.trim().length || 0;
          // Auto-size based on name length to prevent overflow
          if (nameLength > 25) {
            // Very long names - use smallest size
            (el as HTMLElement).className = (el as HTMLElement).className.replace('text-xs', 'text-[10px]');
          } else if (nameLength > 18) {
            // Long names - keep small size
            // Keep text-xs (no change needed)
          } else if (nameLength > 12) {
            // Medium names - slightly larger
            (el as HTMLElement).className = (el as HTMLElement).className.replace('text-xs', 'text-sm');
          } else {
            // Short names - can use larger size
            (el as HTMLElement).className = (el as HTMLElement).className.replace('text-xs', 'text-sm');
          }
        }
      });

      // Remove ALL horizontal padding from main containers and parent elements
      const containers = container.querySelectorAll('*');
      containers.forEach((el) => {
        const computedStyle = window.getComputedStyle(el);
        
        // Check if element has horizontal padding
        if (computedStyle.paddingLeft !== '0px' || computedStyle.paddingRight !== '0px' || 
            (el as HTMLElement).classList.contains('px-2') || (el as HTMLElement).classList.contains('px-4') || 
            (el as HTMLElement).classList.contains('px-10') || (el as HTMLElement).classList.contains('p-2') || 
            (el as HTMLElement).classList.contains('p-4') || (el as HTMLElement).classList.contains('p-10')) {
          
          elementsToRestore.push({
            element: el as HTMLElement, 
            originalPadding: (el as HTMLElement).style.padding || '',
            originalPaddingLeft: (el as HTMLElement).style.paddingLeft || '',
            originalPaddingRight: (el as HTMLElement).style.paddingRight || ''
          });
          
          // Remove horizontal padding completely
          (el as HTMLElement).style.paddingLeft = '0';
          (el as HTMLElement).style.paddingRight = '0';
          
          // If it's a general padding class, preserve vertical padding but remove horizontal
          if ((el as HTMLElement).classList.contains('p-2')) {
            (el as HTMLElement).style.paddingTop = '0.5rem';
            (el as HTMLElement).style.paddingBottom = '0.5rem';
          } else if ((el as HTMLElement).classList.contains('p-4')) {
            (el as HTMLElement).style.paddingTop = '1rem';
            (el as HTMLElement).style.paddingBottom = '1rem';
          } else if ((el as HTMLElement).classList.contains('p-10')) {
            (el as HTMLElement).style.paddingTop = '2.5rem';
            (el as HTMLElement).style.paddingBottom = '2.5rem';
          }
        }
      });

      // Add strategic page breaks for large brackets
      addBracketPageBreaks(container);
      
      // Add class name header at the top
      addClassNameHeader(container, title);
      
      // Reposition any overflowing match cells
      repositionedMatches = repositionOverflowingMatches(container);

      // Fix text positioning to compensate for html2canvas shift
      const textElements = container.querySelectorAll('*');
      textElements.forEach((el) => {
        const htmlEl = el as HTMLElement;
        if (htmlEl.textContent && htmlEl.textContent.trim().length > 0 && htmlEl.children.length === 0) {
          elementsToRestore.push({element: htmlEl, originalTransform: htmlEl.style.transform});
          htmlEl.style.transform = 'translateY(-1px)';
        }
      });

      await new Promise(resolve => setTimeout(resolve, 300));

      // Generate full-size canvas like in actual PDF generation
      const canvas = await html2canvas(container, {
        logging: false,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#FFFFFF",
        scale: 1,
        width: container.scrollWidth,
        height: container.scrollHeight,
      });

      // Calculate smart page breaks using the same logic as PDF generation
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 5;
      const contentWidth = pageWidth - (2 * margin);
      const contentHeight = pageHeight - (2 * margin);
      const pixelsPerMM = canvas.width / contentWidth;
      const canvasPixelsPerPage = Math.floor(pixelsPerMM * contentHeight);

      const pageBreaks = calculateSimplePageBreaks(canvas.height, canvasPixelsPerPage);
      setPageCount(pageBreaks.length);

      // Create preview showing all pages stacked vertically
      const previewCanvas = document.createElement('canvas');
      const totalPreviewHeight = pageBreaks.length * 400 + (pageBreaks.length - 1) * 20; // 400px per page + 20px gap
      previewCanvas.width = 600; // Fixed width for preview
      previewCanvas.height = totalPreviewHeight;
      
      const previewCtx = previewCanvas.getContext('2d');
      if (!previewCtx) return;

      previewCtx.fillStyle = '#f3f4f6'; // Light gray background
      previewCtx.fillRect(0, 0, previewCanvas.width, previewCanvas.height);

      // Draw each page in the preview
      for (let pageIndex = 0; pageIndex < pageBreaks.length; pageIndex++) {
        const sliceStart = pageBreaks[pageIndex];
        const sliceEnd = pageIndex < pageBreaks.length - 1 ? pageBreaks[pageIndex + 1] : canvas.height;
        const sliceHeight = sliceEnd - sliceStart;

        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = sliceHeight;

        const pageCtx = pageCanvas.getContext('2d');
        if (!pageCtx) continue;

        pageCtx.fillStyle = '#FFFFFF';
        pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);

        pageCtx.drawImage(
          canvas,
          0, sliceStart, canvas.width, sliceHeight,
          0, 0, canvas.width, sliceHeight
        );

        // Calculate position in preview
        const previewY = pageIndex * 420; // 400px + 20px gap
        const aspectRatio = pageCanvas.width / pageCanvas.height;
        const previewPageHeight = Math.min(400, 580 / aspectRatio); // Max 400px height
        const previewPageWidth = previewPageHeight * aspectRatio;

        // Center the page horizontally
        const previewX = (previewCanvas.width - previewPageWidth) / 2;

        // Draw white background for the page
        previewCtx.fillStyle = '#FFFFFF';
        previewCtx.fillRect(previewX - 5, previewY - 5, previewPageWidth + 10, previewPageHeight + 10);
        
        // Draw shadow
        previewCtx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        previewCtx.fillRect(previewX + 3, previewY + 3, previewPageWidth + 10, previewPageHeight + 10);

        // Draw page content
        previewCtx.drawImage(pageCanvas, previewX, previewY, previewPageWidth, previewPageHeight);

        // Draw page number
        previewCtx.fillStyle = '#374151';
        previewCtx.font = '14px sans-serif';
        previewCtx.textAlign = 'center';
        previewCtx.fillText(`Page ${pageIndex + 1}`, previewCanvas.width / 2, previewY + previewPageHeight + 15);
      }

      // Restore original styles
      container.style.height = originalStyles.height;
      container.style.maxHeight = originalStyles.maxHeight;
      container.style.overflow = originalStyles.overflow;
      container.style.backgroundColor = originalStyles.backgroundColor;
      container.style.padding = '';
      container.style.margin = '';

      // Remove class name header after preview generation
      removeClassNameHeader(container);
      
      // Restore match positions
      restoreMatchPositions(repositionedMatches);

      // Restore all modified elements
      elementsToRestore.forEach(({element, originalBg, originalClass, originalPadding, originalPaddingLeft, originalPaddingRight, originalTransform}) => {
        if (originalBg !== undefined) {
          element.style.backgroundColor = originalBg;
        }
        if (originalClass !== undefined) {
          element.className = originalClass;
        }
        if (originalPadding !== undefined) {
          element.style.padding = originalPadding;
        }
        if (originalPaddingLeft !== undefined) {
          element.style.paddingLeft = originalPaddingLeft;
        }
        if (originalPaddingRight !== undefined) {
          element.style.paddingRight = originalPaddingRight;
        }
        if (originalTransform !== undefined) {
          element.style.transform = originalTransform;
        }
      });

      setPreviewImage(previewCanvas.toDataURL('image/png', 0.8));
    } catch (error) {
      console.error('Error generating preview:', error);
      // Remove class name header in case of error
      removeClassNameHeader(container);
    }
    setIsGenerating(false);
  };

  const handleDownload = async () => {
    try {
      setIsGenerating(true);
      
      await generatePDFWithSettings();
      
      setIsGenerating(false);
      onClose();
    } catch (error) {
      console.error('Error generating PDF:', error);
      setIsGenerating(false);
    }
  };

  const generatePDFWithSettings = async () => {
    const container = document.getElementById(containerId);
    if (!container) return;

    const originalStyles = {
      backgroundColor: container.style.backgroundColor,
      filter: container.style.filter,
    };

    try {
      // Apply PDF optimizations
      container.style.padding = '0';
      container.style.margin = '0';

      const elementsToRestore: Array<{element: HTMLElement, originalBg?: string, originalClass?: string, originalPadding?: string, originalPaddingLeft?: string, originalPaddingRight?: string, originalTransform?: string}> = [];
      let repositionedMatches: Array<{element: HTMLElement, originalTransform: string, originalLeft: string, originalRight: string}> = [];

      if (settings.whiteBackground) {
        container.style.backgroundColor = '#FFFFFF';
        
        const greyElements = container.querySelectorAll('*');
        
        greyElements.forEach((el) => {
          const computedStyle = window.getComputedStyle(el);
          if (computedStyle.backgroundColor === 'rgb(248, 249, 250)' || 
              (el as HTMLElement).classList.contains('bg-[#F8F9FA]')) {
            elementsToRestore.push({element: el as HTMLElement, originalBg: (el as HTMLElement).style.backgroundColor});
            (el as HTMLElement).style.backgroundColor = '#FFFFFF';
          }
        });
      }

      // Auto-size participant names based on length to prevent overflow
      const participantElements = container.querySelectorAll('.text-xs');
      participantElements.forEach((el) => {
        // Check if this is likely a participant name
        const isParticipantName = (el as HTMLElement).classList.contains('cursor-pointer') || 
                                 ((el as HTMLElement).textContent?.trim().length! > 2 && 
                                  !(el as HTMLElement).textContent?.includes('Table') && 
                                  !(el as HTMLElement).textContent?.includes('(Bye)') &&
                                  !el.closest('[class*="text-[8px]"]'));
        if (isParticipantName) {
          elementsToRestore.push({element: el as HTMLElement, originalClass: (el as HTMLElement).className});
          
          const nameLength = (el as HTMLElement).textContent?.trim().length || 0;
          // Auto-size based on name length to prevent overflow
          if (nameLength > 25) {
            // Very long names - use smallest size
            (el as HTMLElement).className = (el as HTMLElement).className.replace('text-xs', 'text-[10px]');
          } else if (nameLength > 18) {
            // Long names - keep small size
            // Keep text-xs (no change needed)
          } else if (nameLength > 12) {
            // Medium names - slightly larger
            (el as HTMLElement).className = (el as HTMLElement).className.replace('text-xs', 'text-sm');
          } else {
            // Short names - can use larger size
            (el as HTMLElement).className = (el as HTMLElement).className.replace('text-xs', 'text-sm');
          }
        }
      });

      // Remove ALL horizontal padding from main containers and parent elements
      const containers = container.querySelectorAll('*');
      containers.forEach((el) => {
        const computedStyle = window.getComputedStyle(el);
        
        // Check if element has horizontal padding
        if (computedStyle.paddingLeft !== '0px' || computedStyle.paddingRight !== '0px' || 
            (el as HTMLElement).classList.contains('px-2') || (el as HTMLElement).classList.contains('px-4') || 
            (el as HTMLElement).classList.contains('px-10') || (el as HTMLElement).classList.contains('p-2') || 
            (el as HTMLElement).classList.contains('p-4') || (el as HTMLElement).classList.contains('p-10')) {
          
          elementsToRestore.push({
            element: el as HTMLElement, 
            originalPadding: (el as HTMLElement).style.padding || '',
            originalPaddingLeft: (el as HTMLElement).style.paddingLeft || '',
            originalPaddingRight: (el as HTMLElement).style.paddingRight || ''
          });
          
          // Remove horizontal padding completely
          (el as HTMLElement).style.paddingLeft = '0';
          (el as HTMLElement).style.paddingRight = '0';
          
          // If it's a general padding class, preserve vertical padding but remove horizontal
          if ((el as HTMLElement).classList.contains('p-2')) {
            (el as HTMLElement).style.paddingTop = '0.5rem';
            (el as HTMLElement).style.paddingBottom = '0.5rem';
          } else if ((el as HTMLElement).classList.contains('p-4')) {
            (el as HTMLElement).style.paddingTop = '1rem';
            (el as HTMLElement).style.paddingBottom = '1rem';
          } else if ((el as HTMLElement).classList.contains('p-10')) {
            (el as HTMLElement).style.paddingTop = '2.5rem';
            (el as HTMLElement).style.paddingBottom = '2.5rem';
          }
        }
      });

      // Add strategic page breaks for large brackets
      addBracketPageBreaks(container);
      
      // Add class name header at the top
      addClassNameHeader(container, title);
      
      // Reposition any overflowing match cells
      repositionedMatches = repositionOverflowingMatches(container);

      // Fix text positioning to compensate for html2canvas shift
      const textElements = container.querySelectorAll('*');
      textElements.forEach((el) => {
        const htmlEl = el as HTMLElement;
        if (htmlEl.textContent && htmlEl.textContent.trim().length > 0 && htmlEl.children.length === 0) {
          elementsToRestore.push({element: htmlEl, originalTransform: htmlEl.style.transform});
          htmlEl.style.transform = 'translateY(-1px)';
        }
      });

      await SimpleMultiPagePDF(containerId, title);

      // Remove class name header after PDF generation
      removeClassNameHeader(container);
      
      // Restore match positions
      restoreMatchPositions(repositionedMatches);

      // Restore all modified elements
      elementsToRestore.forEach(({element, originalBg, originalClass, originalPadding, originalPaddingLeft, originalPaddingRight, originalTransform}) => {
        if (originalBg !== undefined) {
          element.style.backgroundColor = originalBg;
        }
        if (originalClass !== undefined) {
          element.className = originalClass;
        }
        if (originalPadding !== undefined) {
          element.style.padding = originalPadding;
        }
        if (originalPaddingLeft !== undefined) {
          element.style.paddingLeft = originalPaddingLeft;
        }
        if (originalPaddingRight !== undefined) {
          element.style.paddingRight = originalPaddingRight;
        }
        if (originalTransform !== undefined) {
          element.style.transform = originalTransform;
        }
      });

      container.style.backgroundColor = originalStyles.backgroundColor;
      container.style.filter = originalStyles.filter;
      container.style.padding = '';
      container.style.margin = '';

    } catch (error) {
      container.style.backgroundColor = originalStyles.backgroundColor;
      container.style.filter = originalStyles.filter;
      container.style.padding = '';
      container.style.margin = '';
      // Remove class name header in case of error
      removeClassNameHeader(container);
      throw error;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>{t("admin.tournaments.groups.tables.pdf_preview")} - {title}</DialogTitle>
        </DialogHeader>
        
        <div className="flex gap-4 h-[70vh]">
          {/* Settings Panel */}
          <div className="w-64 space-y-4 p-4 border-r">
            <h3 className="font-semibold">{t("admin.tournaments.groups.tables.print_settings")}</h3>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="white-bg"
                checked={settings.whiteBackground}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({...prev, whiteBackground: !!checked}))
                }
              />
              <Label htmlFor="white-bg">{t("admin.tournaments.groups.tables.white_background")}</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="high-quality"
                checked={settings.highQuality}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({...prev, highQuality: !!checked}))
                }
              />
              <Label htmlFor="high-quality">{t("admin.tournaments.groups.tables.high_quality")}</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="debug-mode"
                checked={debugMode}
                onCheckedChange={(checked) => 
                  setDebugMode(!!checked)
                }
              />
              <Label htmlFor="debug-mode">Debug HTML View</Label>
            </div>

            <Button 
              onClick={generatePreview} 
              disabled={isGenerating}
              size="sm"
              variant="outline"
            >
              {isGenerating ? t("admin.tournaments.groups.tables.updating") : t("admin.tournaments.groups.tables.update_preview")}
            </Button>
          </div>

          {/* Preview Panel */}
          <div className="flex-1 overflow-auto">
            {debugMode ? (
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-sm text-gray-600">Debug Mode - HTML Analysis View:</p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-4">
                  <h3 className="font-semibold text-yellow-800 mb-2">Debug HTML View</h3>
                  <p className="text-sm text-yellow-700 mb-3">
                    Click "Update Preview" to open the PDF content as fullscreen HTML in a new window. 
                    This allows you to inspect the exact styling and positioning applied before PDF generation.
                  </p>
                  <ul className="text-xs text-yellow-600 space-y-1">
                    <li>• Red highlighted match cells show repositioned elements to prevent overflow</li>
                    <li>• Text positioning adjustments are applied</li>
                    <li>• Use browser dev tools to inspect specific elements</li>
                  </ul>
                </div>
                <Button 
                  onClick={generatePreview} 
                  disabled={isGenerating}
                  className="w-full"
                >
                  Open Fullscreen HTML Debug View
                </Button>
              </div>
            ) : isGenerating ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p>{t("admin.tournaments.groups.tables.generating_preview")}</p>
                </div>
              </div>
            ) : previewImage ? (
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-sm text-gray-600">PDF Preview - All pages that will be printed:</p>
                  {pageCount > 0 && (
                    <p className="text-sm text-blue-600 font-medium">
                      {pageCount} {pageCount === 1 ? 'page' : 'pages'}
                    </p>
                  )}
                </div>
                <div className="max-h-[60vh] overflow-y-auto border border-gray-300 rounded bg-gray-100 p-4">
                  <img 
                    src={previewImage} 
                    alt="PDF Preview - All Pages" 
                    className="max-w-full mx-auto block"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Scroll to see all pages. This preview shows exactly what will be in your PDF with repositioned match cells to prevent overflow.
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                {t("admin.tournaments.groups.tables.no_preview_available")}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("admin.tournaments.groups.tables.cancel")}
          </Button>
          <Button onClick={handleDownload} disabled={isGenerating}>
            {isGenerating ? t("admin.tournaments.groups.tables.generating_pdf") : t("admin.tournaments.groups.tables.download_pdf")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};