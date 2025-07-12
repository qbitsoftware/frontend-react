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

  useEffect(() => {
    if (isOpen) {
      generatePreview();
    }
  }, [isOpen, settings]);

  const calculatePageCount = (container: HTMLElement): number => {
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 5;
    const contentWidth = pageWidth - (2 * margin);
    const contentHeight = pageHeight - (2 * margin);

    const pixelsPerMM = container.scrollWidth / contentWidth;
    const canvasPixelsPerPage = Math.floor(pixelsPerMM * contentHeight);
    
    return Math.ceil(container.scrollHeight / canvasPixelsPerPage);
  };

  const generatePreview = async () => {
    setIsGenerating(true);
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
      const pages = calculatePageCount(container);
      setPageCount(pages);
      
      const originalStyles = {
        backgroundColor: container.style.backgroundColor,
        filter: container.style.filter,
      };

      if (settings.whiteBackground) {
        container.style.backgroundColor = '#FFFFFF';
        const greyElements = container.querySelectorAll('[style*="background"]');
        greyElements.forEach((el: any) => {
          if (el.style.backgroundColor === 'rgb(248, 249, 250)' || 
              el.style.backgroundColor === '#F8F9FA' ||
              el.classList.contains('bg-[#F8F9FA]')) {
            el.style.backgroundColor = '#FFFFFF';
          }
        });
      }

      await new Promise(resolve => setTimeout(resolve, 200));

      const canvas = await html2canvas(container, {
        logging: false,
        useCORS: true,
        allowTaint: true,
        backgroundColor: settings.whiteBackground ? "#FFFFFF" : "#F8F9FA",
        scale: 0.3,
        width: container.scrollWidth,
        height: Math.min(container.scrollHeight, 1200),
      });

      container.style.backgroundColor = originalStyles.backgroundColor;
      
      
      const greyElements = container.querySelectorAll('[style*="background"]');
      greyElements.forEach((el: any) => {
        if (el.style.backgroundColor === '#FFFFFF' || el.style.backgroundColor === 'rgb(255, 255, 255)') {
          el.style.backgroundColor = '';
        }
      });

      setPreviewImage(canvas.toDataURL('image/png', 0.8));
    } catch (error) {
      console.error('Error generating preview:', error);
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
      if (settings.whiteBackground) {
        container.style.backgroundColor = '#FFFFFF';
        
        
        const greyElements = container.querySelectorAll('*');
        const elementsToRestore: Array<{element: HTMLElement, originalBg: string}> = [];
        
        greyElements.forEach((el: any) => {
          const computedStyle = window.getComputedStyle(el);
          if (computedStyle.backgroundColor === 'rgb(248, 249, 250)' || 
              el.classList.contains('bg-[#F8F9FA]')) {
            elementsToRestore.push({element: el, originalBg: el.style.backgroundColor});
            el.style.backgroundColor = '#FFFFFF';
          }
        });


        
        await SimpleMultiPagePDF(containerId, title);

        elementsToRestore.forEach(({element, originalBg}) => {
          element.style.backgroundColor = originalBg;
        });
      } else {
        await SimpleMultiPagePDF(containerId, title);
      }

      container.style.backgroundColor = originalStyles.backgroundColor;
      container.style.filter = originalStyles.filter;

    } catch (error) {
      container.style.backgroundColor = originalStyles.backgroundColor;
      container.style.filter = originalStyles.filter;
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
            {isGenerating ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p>{t("admin.tournaments.groups.tables.generating_preview")}</p>
                </div>
              </div>
            ) : previewImage ? (
              <div className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm text-gray-600">{t("admin.tournaments.groups.tables.preview_first_section")}:</p>
                  {pageCount > 0 && (
                    <p className="text-sm text-blue-600 font-medium">
                      {t("admin.tournaments.groups.tables.pages_count", { count: pageCount })}
                    </p>
                  )}
                </div>
                <img 
                  src={previewImage} 
                  alt="PDF Preview" 
                  className="max-w-full border border-gray-300 rounded"
                />
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