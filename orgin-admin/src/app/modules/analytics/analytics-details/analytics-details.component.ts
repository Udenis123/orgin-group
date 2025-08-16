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
  projectAnalytics: any = null;
  analyticsDocument: string | null = null;
  projectFound: boolean = false;
  pdfLoading: boolean = false;
  pdfError: string | null = null;
  private pdfBlob: Blob | null = null;

  // Dummy data with sample PDF
  dummyProjects: any[] = [
    {
      id: '1',
      name: 'Project Alpha',
      description: 'A groundbreaking project in technology.',
      analytics: {
        feasibilityPercentage: 80,
        feasibilityReason: 'High feasibility due to strong market demand and technological advancement',
        monthlyIncome: 100000000,
        annualIncome: 1200000000,
        incomeDescription: 'Projected profits based on current market trends and competitive analysis',
        roi: 25,
        price: 5000000,
        document: 'assets/docs/test.pdf'
      }
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    public translate: TranslateService,
    private sanitizer: DomSanitizer
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
    const project = this.dummyProjects.find(p => p.id === this.projectId);

    if (project) {
      this.projectFound = true;
      this.projectDetails = project;
      this.projectAnalytics = project.analytics;
      this.loadAnalyticsDocument();
    } else {
      this.projectFound = false;
      this.projectDetails = {
        id: this.projectId,
        name: 'Project Not Found',
        description: 'The requested project could not be found.'
      };
    }
    this.loading = false;
  }

  private loadAnalyticsDocument(): void {
    const project = this.dummyProjects.find(p => p.id === this.projectId);
    if (project && project.analytics.document) {
      this.pdfLoading = true;
      this.pdfError = null;
      
      const documentUrl = project.analytics.document.startsWith('http') ?
        project.analytics.document :
        `/assets/${project.analytics.document.split('assets/')[1]}`;

      // Fetch the document as a Blob
      fetch(documentUrl)
        .then(response => response.blob())
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
      link.download = `${this.projectDetails?.name || 'document'}.pdf`;
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
