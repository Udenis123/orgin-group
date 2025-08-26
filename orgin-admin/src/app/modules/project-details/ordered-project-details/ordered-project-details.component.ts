import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ProjectService, OrderedProject } from '../../../services/project.services';
import { SafeUrlPipe } from '../../../shared/pipes/safe-url.pipe';
import { PdfExportService } from '../../../services/pdf-export.service';

export type ProjectStatus = 'PENDING' | 'PENDING_QUERY' | 'QUERY' | 'APPROVED' | 'DECLINED' | 'PRODUCTION' | 'COMPLETED';

@Component({
  selector: 'app-ordered-project-details',
  templateUrl: './ordered-project-details.component.html',
  styleUrls: ['./ordered-project-details.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, SafeUrlPipe]
})
export class OrderedProjectDetailsComponent implements OnInit {
  projectId!: string;
  projectDetails: OrderedProject | null = null;
  loading = false;
  error = '';
  showFullText = false;
  expandedField = '';
  showDocumentPreview = false;
  previewDocumentUrl = '';
  previewDocumentTitle = '';
  showStatusChangeModal = false;
  selectedNewStatus: ProjectStatus | '' = '';
  statusChangeReason = '';
  exportingPdf = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private pdfExportService: PdfExportService
  ) {}

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('id')!;
    this.loadProjectDetails();
  }

  async loadProjectDetails(): Promise<void> {
    this.loading = true;
    this.error = '';
    
    try {
      const result = await this.projectService.getOrderedProjectById(this.projectId).toPromise();
      this.projectDetails = result || null;
    } catch (error) {
      console.error('Error loading project details:', error);
      this.error = 'Failed to load project details. Please try again.';
    } finally {
      this.loading = false;
    }
  }

  getStatusClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'APPROVED':
        return 'status-approved';
      case 'DECLINED':
        return 'status-declined';
      case 'PRODUCTION':
        return 'status-production';
      case 'COMPLETED':
        return 'status-completed';
      case 'PENDING_QUERY':
        return 'status-pending-query';
      case 'QUERY':
        return 'status-query';
      case 'PENDING':
      default:
        return 'status-pending';
    }
  }

  isUrl(value: string): boolean {
    return Boolean(value && (value.startsWith('http://') || value.startsWith('https://')));
  }

  openUrl(url: string): void {
    window.open(url, '_blank');
  }

  goBack(): void {
    this.router.navigate(['dashboard/projects/ordered']);
  }

  getStatusIcon(status: string): string {
    switch (status?.toUpperCase()) {
      case 'APPROVED':
        return 'check_circle';
      case 'DECLINED':
        return 'cancel';
      case 'PRODUCTION':
        return 'build';
      case 'COMPLETED':
        return 'done_all';
      case 'PENDING_QUERY':
        return 'help';
      case 'QUERY':
        return 'question_answer';
      case 'PENDING':
      default:
        return 'pending';
    }
  }

  // Text truncation functionality
  shouldTruncate(text: string): boolean {
    return Boolean(text && text.length > 25);
  }

  getTruncatedText(text: string): string {
    if (!text) return '';
    return text.length > 25 ? text.substring(0, 25) + '...' : text;
  }

  showFullTextPopup(text: string, fieldName: string): void {
    this.expandedField = fieldName;
    this.showFullText = true;
  }

  closeFullTextPopup(): void {
    this.showFullText = false;
    this.expandedField = '';
  }

  getFullText(): string {
    if (!this.projectDetails) return '';
    
    switch (this.expandedField) {
      case 'description':
        return this.projectDetails.projectDescription || '';
      case 'businessIdea':
        return this.projectDetails.businessIdea || '';
      case 'targetAudience':
        return this.projectDetails.targetAudience || '';
      case 'speciality':
        return this.projectDetails.specialityOfProject || '';
      case 'references':
        return this.projectDetails.references || '';
      case 'reasons':
        return this.projectDetails.reasons || '';
      default:
        return '';
    }
  }

  // Document functionality
  previewDocument(url: string, title: string): void {
    this.previewDocumentUrl = url;
    this.previewDocumentTitle = title;
    this.showDocumentPreview = true;
  }

  closeDocumentPreview(): void {
    this.showDocumentPreview = false;
    this.previewDocumentUrl = '';
    this.previewDocumentTitle = '';
  }

  downloadDocument(url: string, filename: string): void {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  getDocumentFilename(url: string, defaultName: string): string {
    if (!url) return defaultName;
    try {
      const urlParts = url.split('/');
      const filename = urlParts[urlParts.length - 1];
      return filename || defaultName;
    } catch {
      return defaultName;
    }
  }

  // Progress section functionality
  getAvailableStatuses(): ProjectStatus[] {
    if (!this.projectDetails) return [];
    
    const currentStatus = this.projectDetails.status as ProjectStatus;
    
    switch (currentStatus) {
      case 'PENDING':
        return ['APPROVED', 'DECLINED', 'QUERY'];
      case 'PENDING_QUERY':
        return ['APPROVED', 'DECLINED'];
      case 'QUERY':
        return ['APPROVED', 'DECLINED', 'PENDING_QUERY'];
      case 'APPROVED':
        return ['PRODUCTION'];
      case 'PRODUCTION':
        return ['DECLINED', 'COMPLETED'];
      case 'DECLINED':
      case 'COMPLETED':
        return [];
      default:
        return [];
    }
  }

  openStatusChangeModal(): void {
    this.showStatusChangeModal = true;
    this.selectedNewStatus = '';
    this.statusChangeReason = '';
  }

  closeStatusChangeModal(): void {
    this.showStatusChangeModal = false;
    this.selectedNewStatus = '';
    this.statusChangeReason = '';
  }

  async changeProjectStatus(): Promise<void> {
    if (!this.selectedNewStatus || !this.projectDetails) {
      return;
    }

    try {
      // Call the API to update the project status
      await this.projectService.updateOrderedProjectStatus(
        this.projectDetails.projectId,
        this.selectedNewStatus,
        this.statusChangeReason
      ).toPromise();
      
      // Update the local state after successful API call
      this.projectDetails.status = this.selectedNewStatus as any;
      this.projectDetails.reasons = this.statusChangeReason;
      
      this.closeStatusChangeModal();
      
      // Show success message
      console.log('Status changed successfully');
      // TODO: Add a toast notification or success message to the UI
    } catch (error) {
      console.error('Error changing project status:', error);
      // TODO: Show error message to the user
      // You might want to add error handling UI here
    }
  }

  canChangeStatus(): boolean {
    return this.getAvailableStatuses().length > 0;
  }

  getStatusDescription(status: ProjectStatus): string {
    switch (status) {
      case 'PENDING':
        return 'projectDetails.statusDescriptions.pending';
      case 'PENDING_QUERY':
        return 'projectDetails.statusDescriptions.pending_query';
      case 'QUERY':
        return 'projectDetails.statusDescriptions.query';
      case 'APPROVED':
        return 'projectDetails.statusDescriptions.approved';
      case 'DECLINED':
        return 'projectDetails.statusDescriptions.declined';
      case 'PRODUCTION':
        return 'projectDetails.statusDescriptions.production';
      case 'COMPLETED':
        return 'projectDetails.statusDescriptions.completed';
      default:
        return '';
    }
  }

  async exportProjectToPdf(): Promise<void> {
    if (!this.projectDetails) {
      console.error('No project details available for export');
      return;
    }

    this.exportingPdf = true;

    try {
      await this.pdfExportService.exportProjectToPdf(this.projectDetails);
    } catch (error) {
      console.error('Error exporting project to PDF:', error);
      // TODO: Show error message to user
    } finally {
      this.exportingPdf = false;
    }
  }

  getDisplayStatus(status: string): string {
    switch (status) {
      case 'PENDING_QUERY':
        return 'Pending Query';
      case 'QUERY':
        return 'Query';
      case 'PENDING':
        return 'Pending';
      case 'APPROVED':
        return 'Approved';
      case 'DECLINED':
        return 'Declined';
      case 'PRODUCTION':
        return 'Production';
      case 'COMPLETED':
        return 'Completed';
      default:
        return status;
    }
  }
}
