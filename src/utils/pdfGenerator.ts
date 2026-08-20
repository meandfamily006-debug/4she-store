import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Generates and downloads a clean, high-resolution PDF invoice for an order.
 * @param element HTMLElement to convert into PDF
 * @param filename Name of the downloaded PDF file (e.g. "Invoice-4SHE-1048.pdf")
 */
export async function downloadInvoicePDF(
  element: HTMLElement,
  filename: string = 'Invoice.pdf'
): Promise<boolean> {
  try {
    // Render the element as high-resolution canvas
    const canvas = await html2canvas(element, {
      scale: 2, // High resolution (2x retina)
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 800
    });

    const imgData = canvas.toDataURL('image/png');
    
    // Create A4 PDF (210mm x 297mm)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 10; // 10mm margins
    const printableWidth = pageWidth - margin * 2;
    
    // Calculate aspect ratio
    const imgWidth = printableWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    if (imgHeight <= pageHeight - margin * 2) {
      // Fits on a single page
      pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
    } else {
      // Multi-page handling if invoice is unusually tall
      let heightLeft = imgHeight;
      let position = margin;

      pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
      heightLeft -= (pageHeight - margin * 2);

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + margin;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
        heightLeft -= (pageHeight - margin * 2);
      }
    }

    pdf.save(filename);
    return true;
  } catch (error) {
    console.error('Failed to generate PDF invoice:', error);
    return false;
  }
}
