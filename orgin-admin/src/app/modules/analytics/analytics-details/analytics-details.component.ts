import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { SafeUrlPipe } from '../../../shared/pipes/safe-url.pipe';
import { AnalyticsService, AnalyticsDetails } from '../../../services/analytics.service';

@Component({
  selector: 'app-analytics-details',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatSnackBarModule,
    MatButtonModule,
    TranslateModule,
    SafeUrlPipe
  ],
  templateUrl: './analytics-details.component.html',
  styleUrls: ['./analytics-details.component.scss']
})
export class AnalyticsDetailsComponent implements OnInit {
  loading: boolean = true;
  projectId: string | null = null;
  projectDetails: any = null;
  projectAnalytics: AnalyticsDetails | null = null;
  analyticsDocument: string | null = null;
  projectFound: boolean = false;
  pdfLoading: boolean = false;
  pdfError: string | null = null;
  private pdfBlob: Blob | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    public translate: TranslateService,
    private sanitizer: DomSanitizer,
    private analyticsService: AnalyticsService
  ) {}

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('id');

    if (this.projectId) {
      this.loadProjectDetails();
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  private loadProjectDetails(): void {
    if (!this.projectId) {
      this.projectFound = false;
      this.projectDetails = {
        id: this.projectId,
        name: 'Project Not Found',
        description: 'The requested project could not be found.'
      };
      this.loading = false;
      return;
    }

    this.analyticsService.getAnalyticsDetails(this.projectId).subscribe({
      next: (analytics) => {
        this.projectFound = true;
        this.projectAnalytics = analytics;
        this.projectDetails = {
          id: this.projectId,
          name: `Project ${this.projectId}`,
          description: 'Project analytics details'
        };
        this.loadAnalyticsDocument();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading analytics details:', error);
        this.projectFound = false;
        this.projectDetails = {
          id: this.projectId,
          name: 'Project Not Found',
          description: 'The requested project could not be found or analytics are not available.'
        };
        this.loading = false;
      }
    });
  }

  private loadAnalyticsDocument(): void {
    if (this.projectAnalytics && this.projectAnalytics.analyticsDocumentUrl) {
      this.pdfLoading = true;
      this.pdfError = null;
      
      const documentUrl = this.projectAnalytics.analyticsDocumentUrl;

      // Fetch the document as a Blob
      fetch(documentUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.blob();
        })
        .then(blob => {
          this.pdfBlob = blob; // Store the blob for download
          // Create a Blob URL with scrolling enabled
          const blobUrl = URL.createObjectURL(blob) + `#toolbar=0&navpanes=0&scrollbar=1&background=transparent`;
          this.analyticsDocument = blobUrl;
          this.pdfLoading = false;

          // Add a custom download handler
          const iframe = document.createElement('iframe');
          iframe.src = blobUrl;
          iframe.style.display = 'none';
          document.body.appendChild(iframe);

          // Prevent right-click and context menu
          iframe.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.snackBar.open('Right-click is disabled to prevent downloading.', 'Close', {
              duration: 3000
            });
          });

          // Prevent drag-and-drop
          iframe.addEventListener('dragstart', (e) => {
            e.preventDefault();
          });

          // Prevent keyboard shortcuts for saving
          iframe.addEventListener('keydown', (e) => {
            if (e.ctrlKey && (e.key === 's' || e.key === 'S')) {
              e.preventDefault();
              this.snackBar.open('Saving is disabled.', 'Close', {
                duration: 3000
              });
            }
          });
        })
        .catch(error => {
          console.error('Error fetching the document:', error);
          this.pdfError = 'Unable to access the PDF document';
          this.pdfLoading = false;
          this.analyticsDocument = null;
          this.showError('analytics.documentLoadError');
        });
    } else {
      this.analyticsDocument = null;
    }
  }

  openPdfExternally(): void {
    if (this.analyticsDocument) {
      window.open(this.analyticsDocument, '_blank');
    } else {
      this.showError('analytics.documentNotAvailable');
    }
  }

  downloadPdf(): void {
    if (this.pdfBlob) {
      const url = window.URL.createObjectURL(this.pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics-${this.projectId || 'document'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } else {
      this.showError('analytics.documentNotAvailable');
    }
  }

  private showError(messageKey: string): void {
    this.snackBar.open(
      this.translate.instant(messageKey),
      this.translate.instant('common.close'),
      { duration: 5000 }
    );
  }
}
