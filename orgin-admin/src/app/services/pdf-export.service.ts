import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { OrderedProject } from './project.services';

@Injectable({
  providedIn: 'root'
})
export class PdfExportService {

  constructor() { }

  async exportProjectToPdf(project: OrderedProject): Promise<void> {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (2 * margin);
    let yPosition = margin;

    // Add watermark to the first page
    this.addWatermark(pdf, pageWidth, pageHeight);

    // Add export date at the top
    yPosition = this.addExportDate(pdf, yPosition, contentWidth, pageHeight, margin);
    yPosition += 15;

    // Add client information first (like a letter)
    yPosition = this.addClientInformation(pdf, project, yPosition, contentWidth, pageHeight, margin);
    yPosition += 15;

    // Add consolidated project information (including requirements)
    yPosition = this.addProjectInformation(pdf, project, yPosition, contentWidth, pageHeight, margin);
    yPosition += 15;

    // Add documents section
    yPosition = this.addDocumentsSection(pdf, project, yPosition, contentWidth, pageHeight, margin);

    // Create ZIP file with PDF and document attachments
    await this.createZipWithAttachments(pdf, project);
  }

  private addWatermark(pdf: jsPDF, pageWidth: number, pageHeight: number): void {
    // Set watermark properties
    pdf.setTextColor(220, 220, 220); // Very light gray
    pdf.setFontSize(80); // Reduced font size for better proportion
    pdf.setFont('helvetica', 'bold');
    
    const text = 'ORIGIN GROUP';
    
    // Calculate center position with offset to move down and right
    const centerX = (pageWidth / 2) + 40; // Move 40mm to the right
    const centerY = (pageHeight / 2) + 70; // Move 70mm down
    
    // Draw the watermark text at adjusted center with 45-degree rotation
    const textWidth = pdf.getTextWidth(text);
    pdf.text(text, centerX - textWidth / 2, centerY, { angle: 45 });
  }

  private addWatermarkToPage(pdf: jsPDF, pageWidth: number, pageHeight: number): void {
    // Set watermark properties
    pdf.setTextColor(220, 220, 220); // Very light gray
    pdf.setFontSize(80); // Reduced font size for better proportion
    pdf.setFont('helvetica', 'bold');
    
    const text = 'ORIGIN GROUP';
    
    // Calculate center position with offset to move down and right
    const centerX = (pageWidth / 2) + 40; // Move 40mm to the right
    const centerY = (pageHeight / 2) + 70; // Move 70mm down
    
    // Draw the watermark text at adjusted center with 45-degree rotation
    const textWidth = pdf.getTextWidth(text);
    pdf.text(text, centerX - textWidth / 2, centerY, { angle: 45 });
  }

  private addExportDate(pdf: jsPDF, yPosition: number, contentWidth: number, pageHeight: number, margin: number): number {
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    pdf.setFontSize(12);
    pdf.setTextColor(100, 100, 100); // Dark gray
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Export Date: ${currentDate}`, margin, yPosition);

    return yPosition + 8;
  }

  private addProjectInformation(pdf: jsPDF, project: OrderedProject, yPosition: number, contentWidth: number, pageHeight: number, margin: number): number {
    // Check if we need a new page
    if (yPosition > pageHeight - 80) {
      pdf.addPage();
      yPosition = margin;
      // Add watermark to new page
      this.addWatermarkToPage(pdf, pdf.internal.pageSize.getWidth(), pageHeight);
    }

    // Section header with colored background using company colors
    pdf.setFillColor(202, 86, 8); // --secondary-color: #ca5608
    pdf.rect(margin, yPosition - 5, contentWidth, 12, 'F');
    
    pdf.setFontSize(14);
    pdf.setTextColor(255, 255, 255); // White text
    pdf.setFont('helvetica', 'bold');
    pdf.text('Project Information', margin + 5, yPosition + 3);

    yPosition += 15;

    // All project details consolidated in one section - filter out empty values
    const details = [
      { label: 'Project Title', value: project.projectTitle },
      { label: 'Project Type', value: project.projectType },
      { label: 'Project Location', value: project.projectLocation },
      { label: 'Speciality', value: project.specialityOfProject },
      { label: 'Project Description', value: project.projectDescription },
      { label: 'Target Audience', value: project.targetAudience },
      { label: 'References', value: project.references },
      { label: 'Business Idea', value: project.businessIdea },
      { label: 'Sponsorship', value: project.doYouHaveSponsorship === 'YES' ? `Yes - ${project.sponsorName}` : 'No' },
      { label: 'Intellectual Property Needed', value: project.doYouNeedIntellectualProject },
      { label: 'Business Plan Needed', value: project.doYouNeedBusinessPlan }
    ].filter(detail => detail.value && detail.value.trim() !== '' && detail.value !== 'undefined' && detail.value !== 'null');

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');

    details.forEach((detail, index) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = margin;
        // Add watermark to new page
        this.addWatermarkToPage(pdf, pdf.internal.pageSize.getWidth(), pageHeight);
      }

      const rowY = yPosition + (index * 10); // Reduced line spacing from 15 to 10
      
      pdf.setTextColor(22, 36, 71); // --primary-color: #162447
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${detail.label}:`, margin + 5, rowY + 2);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(80, 80, 80);
      const labelWidth = pdf.getTextWidth(`${detail.label}: `);
      this.addWrappedText(pdf, detail.value, margin + 5 + labelWidth + 5, rowY + 2, contentWidth - labelWidth - 15);
    });

    return yPosition + (details.length * 10) + 10; // Reduced spacing
  }

  private addClientInformation(pdf: jsPDF, project: OrderedProject, yPosition: number, contentWidth: number, pageHeight: number, margin: number): number {
    // Check if we need a new page
    if (yPosition > pageHeight - 80) {
      pdf.addPage();
      yPosition = margin;
      // Add watermark to new page
      this.addWatermarkToPage(pdf, pdf.internal.pageSize.getWidth(), pageHeight);
    }

    // Section header with colored background using company colors
    pdf.setFillColor(22, 36, 71); // --primary-color: #162447
    pdf.rect(margin, yPosition - 5, contentWidth, 12, 'F');
    
    pdf.setFontSize(14);
    pdf.setTextColor(255, 255, 255); // White text
    pdf.setFont('helvetica', 'bold');
    pdf.text('Client Information', margin + 5, yPosition + 3);

    yPosition += 15;

    // Client details with reduced spacing - filter out empty values
    const details = [
      { label: 'Client Name', value: project.clientName },
      { label: 'Company', value: project.companyName },
      { label: 'Professional Status', value: project.professionalStatus },
      { label: 'Email', value: project.email },
      { label: 'Phone', value: project.phone },
      { label: 'LinkedIn', value: project.linkedIn }
    ].filter(detail => detail.value && detail.value.trim() !== '' && detail.value !== 'undefined' && detail.value !== 'null');

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');

    details.forEach((detail, index) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = margin;
        // Add watermark to new page
        this.addWatermarkToPage(pdf, pdf.internal.pageSize.getWidth(), pageHeight);
      }

      const rowY = yPosition + (index * 10); // Reduced line spacing from 15 to 10
      
      pdf.setTextColor(22, 36, 71); // --primary-color: #162447
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${detail.label}:`, margin + 5, rowY + 2);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(80, 80, 80);
      const labelWidth = pdf.getTextWidth(`${detail.label}: `);
      this.addWrappedText(pdf, detail.value, margin + 5 + labelWidth + 5, rowY + 2, contentWidth - labelWidth - 15);
    });

    return yPosition + (details.length * 10) + 10; // Reduced spacing
  }

  private addDocumentsSection(pdf: jsPDF, project: OrderedProject, yPosition: number, contentWidth: number, pageHeight: number, margin: number): number {
    // Check if we need a new page
    if (yPosition > pageHeight - 80) {
      pdf.addPage();
      yPosition = margin;
      // Add watermark to new page
      this.addWatermarkToPage(pdf, pdf.internal.pageSize.getWidth(), pageHeight);
    }

    // Section header with colored background using company colors
    pdf.setFillColor(22, 36, 71); // --primary-color: #162447
    pdf.rect(margin, yPosition - 5, contentWidth, 12, 'F');
    
    pdf.setFontSize(14);
    pdf.setTextColor(255, 255, 255); // White text
    pdf.setFont('helvetica', 'bold');
    pdf.text('Attached Documents', margin + 5, yPosition + 3);

    yPosition += 15;

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(80, 80, 80);

    const documents = [];
    if (project.businessIdeaDocumentUrl) {
      documents.push('Business Idea Document');
    }
    if (project.businessPlanDocumentUrl) {
      documents.push('Business Plan Document');
    }

    if (documents.length === 0) {
      pdf.text('No documents attached to this project.', margin + 5, yPosition);
      return yPosition + 10;
    }

    documents.forEach((doc, index) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = margin;
        // Add watermark to new page
        this.addWatermarkToPage(pdf, pdf.internal.pageSize.getWidth(), pageHeight);
      }

      const rowY = yPosition + (index * 10); // Reduced line spacing from 15 to 10
      pdf.text(`• ${doc}`, margin + 5, rowY + 2);
    });

    return yPosition + (documents.length * 10) + 10; // Reduced spacing
  }

  private addWrappedText(pdf: jsPDF, text: string, x: number, y: number, maxWidth: number): void {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const testWidth = pdf.getTextWidth(testLine);

      if (testWidth > maxWidth && i > 0) {
        pdf.text(line, x, currentY);
        line = words[i] + ' ';
        currentY += 4; // Reduced line spacing in wrapped text from 5 to 4
      } else {
        line = testLine;
      }
    }
    pdf.text(line, x, currentY);
  }

  private async createZipWithAttachments(pdf: jsPDF, project: OrderedProject): Promise<void> {
    try {
      const zip = new JSZip();
      const documents = [];

      // Add the main PDF to the ZIP with new naming convention
      const pdfBlob = pdf.output('blob');
      const pdfFileName = `${project.clientName.replace(/\s+/g, '_')}_${project.projectTitle.replace(/\s+/g, '_')}.pdf`;
      zip.file(pdfFileName, pdfBlob);

      // Collect document URLs
      if (project.businessIdeaDocumentUrl) {
        documents.push({
          url: project.businessIdeaDocumentUrl,
          name: 'Business_Idea_Document.pdf'
        });
      }

      if (project.businessPlanDocumentUrl) {
        documents.push({
          url: project.businessPlanDocumentUrl,
          name: 'Business_Plan_Document.pdf'
        });
      }

      // Download and add documents to ZIP
      for (const doc of documents) {
        try {
          const response = await fetch(doc.url);
          if (response.ok) {
            const blob = await response.blob();
            zip.file(doc.name, blob);
          }
        } catch (error) {
          console.warn(`Failed to download document: ${doc.name}`, error);
        }
      }

      // Generate and download the ZIP file with new naming convention
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const zipFileName = `${project.clientName.replace(/\s+/g, '_')}_${project.projectTitle.replace(/\s+/g, '_')}_with_documents.zip`;
      saveAs(zipBlob, zipFileName);

      console.log('Project exported successfully with documents attached.');
    } catch (error) {
      console.error('Error creating ZIP with attachments:', error);
      
      // Fallback: just save the PDF if ZIP creation fails
      const fileName = `${project.clientName.replace(/\s+/g, '_')}_${project.projectTitle.replace(/\s+/g, '_')}.pdf`;
      pdf.save(fileName);
    }
  }
}
