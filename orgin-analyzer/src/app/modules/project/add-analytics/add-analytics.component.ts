import { Component, OnInit, HostBinding, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { CustomButtonComponent } from '../../../shared/components/custom-button/custom-button.component';
import {
  ProjectService,
  AnalyticsResponse,
} from '../../../services/project.service';
import { catchError, of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-add-analytics',
  standalone: true,
  templateUrl: './add-analytics.component.html',
  styleUrls: ['./add-analytics.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    CustomButtonComponent,
  ],
})
export class AddAnalyticsComponent implements OnInit {
  @HostBinding('class.dark-mode') isDarkMode = false;

  projectId!: string;
  analyticsForm: FormGroup;
  loading = false;
  declineForm: FormGroup;
  showDeclineFeedback = false;
  submitted = false;
  selectedFile: File | null = null;
  hasFormChanges = false;
  existingAnalytics = false;
  errorMessage: string = '';
  analyticsDocumentUrl: string | null = null;
  baseApiUrl = environment.apiUrl;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private translate: TranslateService,
    private projectService: ProjectService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.analyticsForm = this.fb.group({
      feasibilityPercentage: [0, [Validators.min(0), Validators.max(100)]],
      feasibilityReason: [''],
      monthlyIncome: [0, [Validators.min(0)]],
      annualIncome: [0, [Validators.min(0)]],
      incomeDescription: [''],
      roi: [0, [Validators.min(0), Validators.max(100)]],
      price: [0, [Validators.min(0)]],
      costOfDevelopment: [0, [Validators.min(0)]],
    });

    this.declineForm = this.fb.group({
      feedback: ['', Validators.required],
    });

    // Add logic to detect dark mode (e.g., from a service or localStorage)
    if (isPlatformBrowser(this.platformId)) {
      this.isDarkMode = document.body.classList.contains('dark-mode');
    }

    // Track form changes
    this.analyticsForm.valueChanges.subscribe(() => {
      this.hasFormChanges = true;
    });
  }

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('id')!;
    this.checkExistingAnalytics();
  }

  checkExistingAnalytics(): void {
    this.loading = true;
    this.projectService
      .getProjectAnalytics(this.projectId)
      .pipe(
        catchError((error) => {
          this.loading = false;
          this.existingAnalytics = false;
          return of(null);
        })
      )
      .subscribe((analytics) => {
        this.loading = false;
        if (analytics) {
          this.existingAnalytics = true;
          this.analyticsDocumentUrl = analytics.analyticsDocumentUrl;
          this.populateFormWithAnalytics(analytics);
        }
      });
  }

  populateFormWithAnalytics(analytics: AnalyticsResponse): void {
    this.analyticsForm.patchValue({
      feasibilityPercentage: analytics.feasibility,
      feasibilityReason: analytics.feasibilityReason,
      monthlyIncome: analytics.monthlyIncome,
      annualIncome: analytics.annualIncome,
      incomeDescription: analytics.incomeDescription,
      roi: analytics.roi,
      price: analytics.price,
      costOfDevelopment: analytics.costOfDevelopment,
    });
    // Reset form changes tracking after populating
    this.hasFormChanges = false;
  }

  onFileChange(event: any): void {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
      this.hasFormChanges = true;
    }
  }

  // Method to check if form is valid for approval
  isFormValidForApproval(): boolean {
    return (
      this.analyticsForm.get('feasibilityPercentage')?.valid &&
      this.analyticsForm.get('feasibilityReason')?.value &&
      this.analyticsForm.get('monthlyIncome')?.valid &&
      this.analyticsForm.get('annualIncome')?.valid &&
      this.analyticsForm.get('incomeDescription')?.value &&
      this.analyticsForm.get('roi')?.valid &&
      this.analyticsForm.get('price')?.valid &&
      this.analyticsForm.get('costOfDevelopment')?.valid
    );
  }

  // Handler for backend error responses
  handleErrorResponse(error: any): void {
    this.loading = false;
    this.errorMessage = '';

    // Status 200 is considered success even if it's in an error callback
    if (error instanceof HttpErrorResponse) {
      if (error.status === 200) {
        // This is actually a success despite being in the error callback
        this.router.navigate([
          '/dashboard/projects/assigned/details',
          this.projectId,
        ]);
        return;
      }

      console.error('Error from backend:', error);

      if (error.error) {
        // Try to extract meaningful error message
        if (typeof error.error === 'string') {
          this.errorMessage = error.error;
        } else if (error.error.message) {
          this.errorMessage = error.error.message;
        } else if (error.message) {
          this.errorMessage = error.message;
        } else {
          this.errorMessage = 'An unknown error occurred';
        }
      } else {
        this.errorMessage = error.message || 'An unknown error occurred';
      }
    } else {
      this.errorMessage = 'An unknown error occurred';
    }

    alert(this.errorMessage);
  }

  onApproveProject(): void {
    this.submitted = true;
    if (!this.isFormValidForApproval()) {
      return;
    }

    this.loading = true;
    this.projectService.enableAnalyticsOfProject(this.projectId).subscribe({
      next: (response: any) => {
        this.loading = false;
        alert(this.translate.instant('analytics.approveSuccess'));
        this.router.navigate(['/dashboard/projects/assigned/launched']);
      },
      error: (error: any) => {
        this.handleErrorResponse(error);
      },
    });
  }

  // Create an empty file when no file is selected
  createEmptyFile(): File {
    const emptyBlob = new Blob([''], { type: 'application/octet-stream' });
    return new File([emptyBlob], 'empty.txt', {
      type: 'application/octet-stream',
    });
  }

  // Open document in new tab
  previewDocument(): void {
    if (this.analyticsDocumentUrl) {
      window.open(this.getFullDocumentUrl(), '_blank');
    }
  }

  // Download document
  downloadDocument(): void {
    if (this.analyticsDocumentUrl && isPlatformBrowser(this.platformId)) {
      const link = document.createElement('a');
      link.href = this.getFullDocumentUrl();
      link.download = this.getDocumentFileName();
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  // Get full URL for document
  getFullDocumentUrl(): string {
    if (!this.analyticsDocumentUrl) return '';

    // Check if URL already has http/https
    if (this.analyticsDocumentUrl.startsWith('http')) {
      return this.analyticsDocumentUrl;
    }

    // Otherwise, prepend the base API URL
    return `${this.baseApiUrl}/${this.analyticsDocumentUrl}`;
  }

  // Extract filename from URL
  getDocumentFileName(): string {
    if (!this.analyticsDocumentUrl) return '';

    // Extract filename from URL
    const parts = this.analyticsDocumentUrl.split('/');
    return parts[parts.length - 1];
  }

  // Check if document exists
  hasDocument(): boolean {
    return !!this.analyticsDocumentUrl && this.analyticsDocumentUrl.length > 0;
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';

    if (this.analyticsForm.invalid) {
      return;
    }

    this.loading = true;

    const formData = new FormData();
    const analyticsData = {
      projectId: this.projectId,
      feasibility: this.analyticsForm.get('feasibilityPercentage')?.value,
      feasibilityReason: this.analyticsForm.get('feasibilityReason')?.value,
      monthlyIncome: this.analyticsForm.get('monthlyIncome')?.value,
      annualIncome: this.analyticsForm.get('annualIncome')?.value,
      roi: this.analyticsForm.get('roi')?.value,
      incomeDescription: this.analyticsForm.get('incomeDescription')?.value,
      price: this.analyticsForm.get('price')?.value,
      costOfDevelopment: this.analyticsForm.get('costOfDevelopment')?.value,
    };

    // Create a Blob for the JSON data
    const analyticsBlob = new Blob([JSON.stringify(analyticsData)], {
      type: 'application/json',
    });

    if (this.existingAnalytics) {
      // Update existing analytics
      formData.append('analytics', analyticsBlob);

      // Always append a file parameter, use empty file if none is selected
      formData.append(
        'analyticsDoc',
        this.selectedFile || this.createEmptyFile()
      );

      this.projectService.updateProjectAnalytics(formData).subscribe({
        next: (response) => {
          this.loading = false;
          alert(this.translate.instant('analytics.updateSuccess'));
          this.router.navigate([
            '/dashboard/projects/assigned/details',
            this.projectId,
          ]);
        },
        error: (error) => {
          this.handleErrorResponse(error);
        },
      });
    } else {
      // Add new analytics
      formData.append('analyticsDetails', analyticsBlob);

      // Always append a file parameter, use empty file if none is selected
      formData.append(
        'analyticDocument',
        this.selectedFile || this.createEmptyFile()
      );

      this.projectService.addProjectAnalytics(formData).subscribe({
        next: (response) => {
          this.loading = false;
          alert(this.translate.instant('analytics.submitSuccess'));
          this.router.navigate([
            '/dashboard/projects/assigned/details',
            this.projectId,
          ]);
        },
        error: (error) => {
          this.handleErrorResponse(error);
        },
      });
    }
  }

  onCancel(): void {
    this.submitted = false;
    this.router.navigate([
      '/dashboard/projects/assigned/details',
      this.projectId,
    ]);
  }

  onDecline(): void {
    this.showDeclineFeedback = true;
  }

  confirmDecline(): void {
    this.submitted = true;
    if (this.declineForm.invalid) {
      return;
    }

    this.loading = true;
    const feedback = this.declineForm.value.feedback;

    this.projectService.declineProject(this.projectId, feedback).subscribe({
      next: (response) => {
        this.loading = false;
        alert(this.translate.instant('analytics.declineSuccess'));
        this.router.navigate(['/dashboard/projects/assigned/launched']);
      },
      error: (error) => {
        this.handleErrorResponse(error);
      },
    });
  }

  cancelDecline(): void {
    this.submitted = false;
    this.showDeclineFeedback = false;
    this.declineForm.reset();
  }
}
