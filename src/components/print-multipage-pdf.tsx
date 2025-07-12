import html2canvas from "html2canvas";
import { setupCloneStyles } from "./pdf_utils/styles";
import { processElementsForPDF } from "./pdf_utils/element-processor";
import { generateMultiPagePDF } from "./pdf_utils/generator";

/**
 * Prints the entire bracket across multiple landscape pages
 * @param containerId - ID of the container to print
 * @param title - Title for the PDF file
 */
export const PrintMultiPagePDF = async (
  containerId: string,
  title: string = "tournament bracket",
) => {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container with ID "${containerId}" not found`);
    return;
  }

  try {
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Store original styles
    const originalStyles = {
      height: container.style.height,
      maxHeight: container.style.maxHeight,
      overflow: container.style.overflow,
    };

    // Temporarily modify container to show full content
    container.style.height = 'auto';
    container.style.maxHeight = 'none';
    container.style.overflow = 'visible';

    // Wait for layout to update
    await new Promise((resolve) => setTimeout(resolve, 200));

    const clone = container.cloneNode(true) as HTMLElement;
    const rect = container.getBoundingClientRect();

    // Setup clone styles for full content
    setupCloneStyles(clone, rect, false);
    
    // Override clone styles to ensure full content is visible
    clone.style.height = 'auto';
    clone.style.maxHeight = 'none';
    clone.style.overflow = 'visible';
    clone.style.position = 'relative';
    clone.style.width = 'max-content';
    clone.style.minWidth = 'max-content';

    processElementsForPDF(clone);

    // Temporarily add clone to DOM for rendering
    clone.style.position = 'absolute';
    clone.style.top = '-9999px';
    clone.style.left = '-9999px';
    clone.style.zIndex = '-1';
    
    document.body.appendChild(clone);

    // Capture the entire bracket
    const canvas = await html2canvas(clone, {
      logging: false,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#F8F9FA",
      imageTimeout: 15000,
      foreignObjectRendering: false,
      removeContainer: false,
      width: clone.scrollWidth,
      height: clone.scrollHeight,
      scale: 1, // Use scale 1 for better quality
    });

    // Clean up
    document.body.removeChild(clone);

    // Restore original container styles
    container.style.height = originalStyles.height;
    container.style.maxHeight = originalStyles.maxHeight;
    container.style.overflow = originalStyles.overflow;

    // Generate multi-page PDF
    generateMultiPagePDF(canvas, title);

  } catch (error) {
    console.error("Error generating multi-page PDF:", error);
    alert("Failed to generate PDF: " + (error as Error).message);
    
    // Restore original styles in case of error
    const container = document.getElementById(containerId);
    if (container) {
      container.style.height = '';
      container.style.maxHeight = '';
      container.style.overflow = '';
    }
  }
};