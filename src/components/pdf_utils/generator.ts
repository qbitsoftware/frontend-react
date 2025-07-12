import { jsPDF } from "jspdf";

export function generatePDF(
  canvas: HTMLCanvasElement,
  title: string,
  scale: number = 1.0, // Default to original size
) {
  const usePortrait = canvas.height > canvas.width;

  const pdf = new jsPDF({
    orientation: usePortrait ? "portrait" : "landscape",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // console.log("PDF height", pageHeight);
  const contentWidth = pageWidth;
  const contentHeight = pageHeight;

  const aspectRatio = canvas.width / canvas.height;

  let imgWidth = contentWidth * scale;
  let imgHeight = imgWidth / aspectRatio;
  // console.log("img height", imgHeight);

  if (imgHeight > contentHeight * scale) {
    imgHeight = contentHeight * scale;
    imgWidth = imgHeight * aspectRatio;
  }

  const xPos = (pageWidth - imgWidth) / 2;

  pdf.addImage(
    canvas.toDataURL("image/png", 1.0),
    "PNG",
    xPos,
    0,
    imgWidth,
    imgHeight + 10,
  );

  pdf.save(`${title.replace(/\s+/g, "_")}.pdf`);
}

export function generateMultiPagePDF(
  canvas: HTMLCanvasElement,
  title: string,
) {
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "mm", 
    format: "a4",
    compress: true,
  });

  const pageWidth = pdf.internal.pageSize.getWidth(); // ~297mm for A4 landscape
  const pageHeight = pdf.internal.pageSize.getHeight(); // ~210mm for A4 landscape
  
  const margin = 10;
  const availableWidth = pageWidth - (2 * margin);
  const availableHeight = pageHeight - (2 * margin);
  
  console.log(`Page dimensions: ${pageWidth}x${pageHeight}mm`);
  console.log(`Available area: ${availableWidth}x${availableHeight}mm`);
  console.log(`Canvas: ${canvas.width}x${canvas.height}px`);
  
  // Calculate how many pages we need vertically (stacking pages from top to bottom)
  // Force at least 2 pages for large brackets, use smaller height per page
  const minPixelsPerPage = 600;
  const pagesNeeded = Math.max(2, Math.ceil(canvas.height / minPixelsPerPage));
  
  console.log(`Canvas height: ${canvas.height}px`);
  console.log(`Min pixels per page: ${minPixelsPerPage}px`);
  console.log(`Pages needed based on height: ${pagesNeeded}`);
  
  // Calculate dimensions that will fit properly
  const pixelsPerPage = canvas.height / pagesNeeded;
  
  console.log(`Pixels per page (height): ${pixelsPerPage}`);
  
  for (let page = 0; page < pagesNeeded; page++) {
    if (page > 0) {
      pdf.addPage();
    }
    
    // Calculate source rectangle in pixels (slicing vertically)
    const sourceY = Math.floor(pixelsPerPage * page);
    const sourceHeight = Math.floor(pixelsPerPage);
    
    // Ensure we don't go beyond canvas bounds on last page
    const actualSourceHeight = Math.min(sourceHeight, canvas.height - sourceY);
    
    console.log(`Page ${page + 1}: sourceY=${sourceY}, sourceHeight=${actualSourceHeight}`);
    
    // Create temporary canvas for this vertical slice
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = actualSourceHeight;
    
    const tempCtx = tempCanvas.getContext('2d');
    if (tempCtx) {
      // Clear the canvas with background color
      tempCtx.fillStyle = '#F8F9FA';
      tempCtx.fillRect(0, 0, canvas.width, actualSourceHeight);
      
      // Draw the vertical slice of the original canvas
      tempCtx.drawImage(
        canvas,
        0, sourceY, canvas.width, actualSourceHeight, // source rectangle (full width, slice height)
        0, 0, canvas.width, actualSourceHeight // destination rectangle
      );
      
      const sliceData = tempCanvas.toDataURL("image/png", 1.0);
      
      // Add this slice to the PDF page, filling available space
      pdf.addImage(
        sliceData,
        "PNG",
        margin,
        margin,
        availableWidth,
        availableHeight
      );
    }
  }
  
  pdf.save(`${title.replace(/\s+/g, "_")}_multipage.pdf`);
}
