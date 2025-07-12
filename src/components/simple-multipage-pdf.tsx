import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

interface BracketHeader {
  title: string;
  y: number; // Y position in pixels from top of container
  height: number;
}

/**
 * Find bracket headers in the DOM to determine section boundaries
 */
function findBracketHeaders(container: HTMLElement): BracketHeader[] {
  const headers: BracketHeader[] = [];
  
  // Look for bracket section headers - these are typically divs with "font-bold text-xl py-4"
  const headerElements = container.querySelectorAll('.font-bold.text-xl, h1, h2, h3');
  
  headerElements.forEach((element) => {
    const rect = element.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    
    // Calculate position relative to container
    const relativeY = rect.top - containerRect.top + container.scrollTop;
    
    headers.push({
      title: element.textContent?.trim() || 'Unknown Section',
      y: relativeY,
      height: rect.height
    });
  });
  
  // Sort by Y position
  return headers.sort((a, b) => a.y - b.y);
}

/**
 * Calculate smart page breaks that don't split bracket sections
 */
function calculateSmartPageBreaks(
  headers: BracketHeader[], 
  idealPageHeight: number, 
  totalHeight: number
): number[] {
  const breaks: number[] = [0]; // Always start at 0
  let currentPageStart = 0;
  
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i];
    const nextHeader = headers[i + 1];
    
    // Calculate section end (next header start or total height)
    const sectionEnd = nextHeader ? nextHeader.y : totalHeight;
    const sectionHeight = sectionEnd - header.y;
    
    // Check if this section fits in the remaining space of current page
    const remainingPageSpace = idealPageHeight - (header.y - currentPageStart);
    
    if (remainingPageSpace < sectionHeight && header.y > currentPageStart) {
      // Section doesn't fit, start new page at this header
      breaks.push(header.y);
      currentPageStart = header.y;
    }
  }
  
  return breaks;
}

/**
 * Find the last row that actually contains content (not just white space)
 */
function findLastContentRow(canvas: HTMLCanvasElement, startY: number): number {
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas.height;
  
  const imageData = ctx.getImageData(0, startY, canvas.width, canvas.height - startY);
  const data = imageData.data;
  
  // Scan from bottom up to find last row with non-white content
  for (let y = imageData.height - 1; y >= 0; y--) {
    for (let x = 0; x < imageData.width; x++) {
      const pixelIndex = (y * imageData.width + x) * 4;
      const r = data[pixelIndex];
      const g = data[pixelIndex + 1];
      const b = data[pixelIndex + 2];
      
      // If pixel is not white (with some tolerance)
      if (r < 250 || g < 250 || b < 250) {
        // Found content, add some padding and return
        return startY + y + 50; // Add 50px padding below last content
      }
    }
  }
  
  // If no content found, return a reasonable minimum
  return startY + 100;
}


/**
 * Simple multi-page PDF generator that splits content vertically
 * @param containerId - ID of the container to print
 * @param title - Title for the PDF file
 */
export const SimpleMultiPagePDF = async (
  containerId: string,
  title: string = "tournament bracket",
) => {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container with ID "${containerId}" not found`);
    return;
  }

  try {
    console.log("Starting PDF generation...");

    // Store original styles
    const originalStyles = {
      height: container.style.height,
      maxHeight: container.style.maxHeight,
      overflow: container.style.overflow,
      backgroundColor: container.style.backgroundColor,
    };

    container.style.height = 'auto';
    container.style.maxHeight = 'none';
    container.style.overflow = 'visible';
    container.style.backgroundColor = '#FFFFFF';

    await new Promise((resolve) => setTimeout(resolve, 300));

    console.log("Capturing full bracket...");

    const canvas = await html2canvas(container, {
      logging: false,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#FFFFFF",
      scale: 1,
      width: container.scrollWidth,
      height: container.scrollHeight,
    });

    container.style.height = originalStyles.height;
    container.style.maxHeight = originalStyles.maxHeight;
    container.style.overflow = originalStyles.overflow;
    container.style.backgroundColor = originalStyles.backgroundColor;

    console.log(`Canvas captured: ${canvas.width}x${canvas.height}px`);

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 5;
    const contentWidth = pageWidth - (2 * margin);
    const contentHeight = pageHeight - (2 * margin);

    console.log(`PDF page: ${pageWidth}x${pageHeight}mm, content: ${contentWidth}x${contentHeight}mm`);

    const pixelsPerMM = canvas.width / contentWidth;
    const canvasPixelsPerPage = Math.floor(pixelsPerMM * contentHeight);
    
    
    console.log(`Canvas: ${canvas.width}x${canvas.height}px`);
    console.log(`Page content area: ${contentWidth}x${contentHeight}mm`);
    console.log(`Canvas pixels per page: ${canvasPixelsPerPage}px`);

    const bracketHeaders = findBracketHeaders(container);
    console.log(`Found ${bracketHeaders.length} bracket sections:`, bracketHeaders.map(h => `${h.title} at ${h.y}px`));

    const pageBreaks = calculateSmartPageBreaks(bracketHeaders, canvasPixelsPerPage, canvas.height);
    console.log(`Smart page breaks:`, pageBreaks);

    for (let pageIndex = 0; pageIndex < pageBreaks.length; pageIndex++) {
      if (pageIndex > 0) {
        pdf.addPage();
      }

      const sliceStart = pageBreaks[pageIndex];
      let sliceEnd = pageIndex < pageBreaks.length - 1 ? pageBreaks[pageIndex + 1] : canvas.height;
      const isLastPage = pageIndex === pageBreaks.length - 1;
      
      if (isLastPage) {
        sliceEnd = findLastContentRow(canvas, sliceStart);
      }
      
      const sliceHeight = sliceEnd - sliceStart;

      console.log(`Page ${pageIndex + 1}: Y=${sliceStart} to ${sliceEnd}, height=${sliceHeight}px ${isLastPage ? '(LAST PAGE - TRIMMED)' : ''}`);

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

      const imgData = pageCanvas.toDataURL('image/png', 1.0);
      
      if (isLastPage) {
        const imgAspectRatio = pageCanvas.width / pageCanvas.height;
        
        const imgWidth = contentWidth;
        const imgHeight = imgWidth / imgAspectRatio;
        
        console.log(`Last page natural size: ${imgWidth}x${imgHeight}mm (aspect ratio: ${imgAspectRatio.toFixed(2)})`);
        
        pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
      } else {
        pdf.addImage(imgData, 'PNG', margin, margin, contentWidth, contentHeight);
      }
    }

    const filename = `${title.replace(/\s+/g, "_")}_multipage.pdf`;
    pdf.save(filename);
    
    console.log(`PDF saved as: ${filename}`);

  } catch (error) {
    console.error("Error generating PDF:", error);
    
    const container = document.getElementById(containerId);
    if (container) {
      container.style.height = '';
      container.style.maxHeight = '';
      container.style.overflow = '';
      container.style.backgroundColor = '';
    }
    
    throw error;
  }
};