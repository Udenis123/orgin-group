# PDF Export Feature for Ordered Project Details

## Overview
This feature adds the ability to export ordered project details to a PDF document with all project and client information, excluding the project progress section. If the project has attached documents, they will be included in a ZIP file along with the main PDF.

## Features

### PDF Export Button
- Located in the header of the ordered project details page
- Only visible when project details are loaded successfully
- Shows loading state during export process
- Disabled during export to prevent multiple simultaneous exports

### PDF Content
The exported PDF includes:
1. **Project Header**
   - Project title
   - Project type
   - Location
   - Current status
   - Generation date

2. **Project Information**
   - Description
   - Business idea
   - Target audience
   - Speciality
   - References

3. **Client Information**
   - Client name
   - Company name
   - Professional status
   - Email
   - Phone
   - LinkedIn profile

4. **Project Requirements**
   - Sponsorship status
   - Sponsor name (if applicable)
   - Intellectual project requirement
   - Business plan requirement

5. **Documents Section**
   - List of attached documents
   - Document names and descriptions

### Document Attachments
- If the project has attached documents (Business Idea Document, Business Plan Document), they are included in a ZIP file
- The ZIP file contains:
  - Main PDF with project details
  - All attached documents as separate files
- If no documents are attached, only the PDF is downloaded

## Technical Implementation

### Dependencies Added
- `jspdf`: PDF generation library
- `html2canvas`: HTML to canvas conversion (used by jsPDF)
- `file-saver`: File download utility
- `jszip`: ZIP file creation for document attachments

### Files Modified/Created

#### New Files
- `src/app/services/pdf-export.service.ts`: Main PDF export service

#### Modified Files
- `src/app/modules/project-details/ordered-project-details/ordered-project-details.component.ts`: Added export functionality
- `src/app/modules/project-details/ordered-project-details/ordered-project-details.component.html`: Added export button
- `src/app/modules/project-details/ordered-project-details/ordered-project-details.component.scss`: Added export button styles
- Translation files: Added export-related translation keys

### Key Features
1. **Responsive Design**: Export button adapts to mobile screens
2. **Dark Mode Support**: Export button styled for dark theme
3. **Loading States**: Visual feedback during export process
4. **Error Handling**: Graceful fallback if ZIP creation fails
5. **Multi-language Support**: Export button text in English, French, and Kinyarwanda

## Usage

1. Navigate to an ordered project details page
2. Click the "Export PDF" button in the header
3. Wait for the export process to complete
4. The browser will download either:
   - A ZIP file (if documents are attached)
   - A PDF file (if no documents are attached)

## File Naming Convention
- PDF: `project_{projectId}_{clientName}.pdf`
- ZIP: `project_{projectId}_{clientName}_with_documents.zip`

## Browser Compatibility
This feature works in all modern browsers that support:
- ES6 modules
- Fetch API
- Blob API
- File download capabilities

## Notes
- The export excludes the project progress section as requested
- Document attachments are downloaded and included in the ZIP file
- If document download fails, the export continues with just the PDF
- The feature gracefully handles projects with no attached documents
