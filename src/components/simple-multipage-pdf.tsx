import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";


/**
 * Simple page break calculation that doesn't isolate headers
 */
function calculateSimplePageBreaks(totalHeight: number, pageHeight: number): number[] {
  const breaks: number[] = [0];
  
  for (let y = pageHeight; y < totalHeight; y += pageHeight) {
    breaks.push(Math.min(y, totalHeight));
  }
  
  return breaks.filter((breakPoint, index) => index === 0 || breakPoint < totalHeight);
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

    const pageBreaks = calculateSimplePageBreaks(canvas.height, canvasPixelsPerPage);
    console.log(`Simple page breaks:`, pageBreaks);

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