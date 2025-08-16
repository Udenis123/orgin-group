import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SubscriptionService } from '../../services/subscription.service';
import { AnalyticsService } from '../../services/analytics.service';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SafeUrlPipe } from '../../pipes/safe-url.pipe';

declare global {
  interface Navigator {
    keyboard?: {
      getLayoutMap: () => Promise<Map<string, string>>;
    };
  }
}

@Component({
  selector: 'app-analytics',
  standalone: true,
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss'],
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatSnackBarModule,
    MatButtonModule,
    TranslateModule
    ],
  encapsulation: ViewEncapsulation.None, // Disable encapsulation
})
export class AnalyticsComponent implements OnInit, OnDestroy {
  loading: boolean = true;
  projectId: string | null = null;
  projectDetails: any = null;
  projectAnalytics: any = null;
  projectSummary: string = '';
  analyticsDocument: string | null = null;
  isBlurred: boolean = false;
  private focusCheckInterval: any;
  private keyUpTimeout: any = null;
  private isKeyDown: boolean = false;

  constructor(
    private subscriptionService: SubscriptionService,
    private analyticsService: AnalyticsService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    public translate: TranslateService
  ) {}

  ngOnInit(): void {
    // Subscribe to route parameter changes
    this.route.paramMap.subscribe(params => {
      const newProjectId = params.get('id');
      console.log('Route parameter changed - new project ID:', newProjectId);
      
      if (newProjectId !== this.projectId) {
        this.projectId = newProjectId;
        
        if (this.projectId) {
          this.loadProjectAnalytics();
          this.setupBlurProtection();
          this.startFocusCheck();
        } else {
          console.log('No project ID found, redirecting to dashboard');
          this.router.navigate(['/dashboard']);
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (this.focusCheckInterval) {
      clearInterval(this.focusCheckInterval);
    }
  }

  private startFocusCheck(): void {
    this.focusCheckInterval = setInterval(() => {
      if (!document.hasFocus()) {
        this.isBlurred = true;
        document.body.classList.add('blurred');
      } else {
        if (!this.isKeyDown) { // Only remove blur if no key is being held down
          this.isBlurred = false;
          document.body.classList.remove('blurred');
        }
      }
    }, 500); // Check every 500ms
  }

  private setupBlurProtection(): void {
    // Immediately blur on any suspicious activity
    const applyBlur = () => {
      this.isBlurred = true;
      document.body.classList.add('blurred');
    };

    // Prevent right-click and context menu
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      applyBlur();

      // Show a warning if needed
      this.snackBar.open(this.translate.instant('ANALYTICS.SCREENSHOT_WARNING'),
        this.translate.instant('COMMON.CLOSE'),
        { duration: 5000 }
      );

      return false;
    }, false);

    // Add screen sharing detection
    if (navigator.mediaDevices) {
      navigator.mediaDevices.addEventListener('devicechange', () => {
        applyBlur();

        // Keep blurred for 30 seconds after potential screen recording
        setTimeout(() => {
          if (!this.isKeyDown) {
            this.isBlurred = false;
            document.body.classList.remove('blurred');
          }
        }, 30000);
      });
    }

    // Blur on window blur
    window.addEventListener('blur', applyBlur);

    // Remove blur on focus (only if no key is being held)
    window.addEventListener('focus', () => {
      if (!this.isKeyDown) {
        this.isBlurred = false;
        document.body.classList.remove('blurred');
      }
    });

    // Detect when page visibility changes (e.g., snipping tool)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        applyBlur();
      } else if (!this.isKeyDown) {
        this.isBlurred = false;
        document.body.classList.remove('blurred');
      }
    });
    // Enhanced keydown handler that specifically watches for common screenshot keys
document.addEventListener('keydown', (e) => {
  this.isKeyDown = true;

  // List of common screen capture keys
  const screenshotKeys = [
    'PrintScreen', // Standard print screen
    'F13',         // Some keyboards map PrintScreen to F13
    'Insert',      // Sometimes used with Shift for screenshots
    'KeyS'         // For Ctrl+Shift+S on some systems
  ];



  // Apply extra duration for known screenshot keys
  if (screenshotKeys.includes(e.code)) {
    applyBlur();

    // Keep blurred for longer (20 seconds) if it's a screenshot key
    if (this.keyUpTimeout) {
      clearTimeout(this.keyUpTimeout);
    }

    this.keyUpTimeout = setTimeout(() => {
      this.isBlurred = false;
      document.body.classList.remove('blurred');
    }, 20000); // 20 seconds for screenshot keys
  } else {
    applyBlur();
  }
});
// Modify the keyup event handler to handle single keys better
document.addEventListener('keyup', (e) => {
  // Small delay to ensure we process the event correctly
  setTimeout(() => {
    // Check if ANY keys are still pressed using the keyboard API if available
    if (navigator.keyboard && navigator.keyboard.getLayoutMap) {
      navigator.keyboard.getLayoutMap().then(keyboardLayoutMap => {
        // If no keys are pressed, start the timer to remove blur
        this.isKeyDown = false;

        // Clear any existing timeout
        if (this.keyUpTimeout) {
          clearTimeout(this.keyUpTimeout);
        }

        // Set new timeout for 15 seconds
        this.keyUpTimeout = setTimeout(() => {
          this.isBlurred = false;
          document.body.classList.remove('blurred');
        }, 15000); // 15 seconds delay
      });
    } else {
      // Fallback for browsers that don't support Keyboard API
      // Check if any modifier keys are still pressed
      if (!e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey) {
        this.isKeyDown = false;

        // Clear any existing timeout
        if (this.keyUpTimeout) {
          clearTimeout(this.keyUpTimeout);
        }

        // Set new timeout for 15 seconds
        this.keyUpTimeout = setTimeout(() => {
          this.isBlurred = false;
          document.body.classList.remove('blurred');
        }, 15000); // 15 seconds delay
      }
    }
  }, 50);
});

    // Detect when the window is resized (e.g., snipping tool)
    window.addEventListener('resize', () => {
      applyBlur();
      // Keep blurred for 10 seconds after resize
      setTimeout(() => {
        if (!this.isKeyDown) {
          this.isBlurred = false;
          document.body.classList.remove('blurred');
        }
      }, 10000);
    });

    // Detect when the user tries to print or capture the screen
    window.addEventListener('beforeprint', applyBlur);

    // Detect any key press (including modifier keys)
    document.addEventListener('keydown', (e) => {
      this.isKeyDown = true;
      applyBlur();
    });

    // Remove blur 10 seconds after keys are released
    document.addEventListener('keyup', (e) => {
      // Only consider key released when ALL keys are up
      // Check if any other keys are still pressed
      setTimeout(() => {
        // This small delay helps ensure we catch multiple keys
        if (!e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey) {
          this.isKeyDown = false;

          // Clear any existing timeout
          if (this.keyUpTimeout) {
            clearTimeout(this.keyUpTimeout);
          }

          // Set new timeout for 10 seconds
          this.keyUpTimeout = setTimeout(() => {
            this.isBlurred = false;
            document.body.classList.remove('blurred');
          }, 10000); // 10 seconds delay
        }
      }, 50);
    });

    // Initial blur to ensure the page is blurred by default
    applyBlur();
  }

  private loadProjectAnalytics(): void {
    if (!this.projectId) {
      this.loading = false;
      return;
    }

    this.analyticsService.getProjectAnalytics(this.projectId).subscribe({
      next: (response) => {
        // Extract the actual data from response.body
        const data = response.body || response;
        
        // Transform the API response to match our component's expected format
        this.projectAnalytics = {
          views: data.totalView,
          interactions: data.interested,
          interestedInvestors: data.interested,
          bookmarks: data.bookmarks,
          lastUpdated: new Date().toLocaleDateString(),
          feasibility: {
            percentage: data.feasibility,
            location: 'Project Location', // This might need to come from project details
            reason: data.feasibilityReason || 'No feasibility reason provided'
          },
          income: {
            monthly: data.monthlyIncome,
            annual: data.annualIncome,
            description: data.incomeDescription || 'No income description provided',
            roi: data.roi
          },
          price: data.price,
          costOfDevelopment: data.costOfDevelopment
        };

        // Set project details (you might need to get this from another API call)
        this.projectDetails = {
          id: data.projectId,
          name: 'Project Analytics', // This might need to come from project details
          description: 'Project analytics and feasibility analysis',
          status: 'approved', // Assuming if we get analytics, the project is approved
          purpose: 'invest' // This might need to come from project details
        };

        // Load analytics document if available
        if (data.analyticsDocumentUrl) {
          this.loadAnalyticsDocument(data.analyticsDocumentUrl);
        }

        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading project analytics:', error);
        
        // Check if it's a "Project not found" error (500)
        if (error.status === 500 && error.error?.message?.includes('Project not found')) {
          this.snackBar.open('Project not found', 'Close', {
            duration: 5000
          });
          
          // Set project details for non-existing projects
          this.projectDetails = {
            id: this.projectId,
            name: 'Project Not Found',
            description: 'The requested project does not exist or has been removed.',
            status: 'not_found',
            purpose: ''
          };
        }
        // Check if it's "Analytics not found for project" error (404)
        else if (error.status === 404 && error.error?.message?.includes('Analytics not found for project')) {
          this.snackBar.open('Analytics not available for this project yet', 'Close', {
            duration: 5000
          });
          
          // Set project details for projects without analytics
          this.projectDetails = {
            id: this.projectId,
            name: 'Project Analytics',
            description: 'Analytics not available for this project',
            status: 'pending', // Mark as pending to show the pending message
            purpose: 'invest'
          };
        }
        // Other errors
        else {
          this.snackBar.open('Failed to load project analytics', 'Close', {
            duration: 3000
          });
          
          // Set default project details for other error cases
          this.projectDetails = {
            id: this.projectId,
            name: 'Project Not Found',
            description: 'Unable to load project analytics.',
            status: 'unknown',
            purpose: ''
          };
        }
        
        this.loading = false;
      }
    });
  }

  private loadAnalyticsDocument(documentUrl: string): void {
    if (!documentUrl) {
      this.analyticsDocument = null;
      return;
    }

    console.log('Loading analytics document:', documentUrl);

    // If it's already a full URL, use it directly
    if (documentUrl.startsWith('http')) {
      // For external URLs, we might need to handle CORS
      this.analyticsDocument = documentUrl + `#toolbar=0&navpanes=0&scrollbar=0&background=transparent`;
      console.log('Set analytics document URL:', this.analyticsDocument);
    } else {
      // If it's a relative path, construct the full URL
      const fullUrl = documentUrl.startsWith('/') ? documentUrl : `/${documentUrl}`;
      this.analyticsDocument = fullUrl + `#toolbar=0&navpanes=0&scrollbar=0&background=transparent`;
      console.log('Set analytics document URL (relative):', this.analyticsDocument);
    }
  }

  bookmarkProject() {
    if (this.projectId) {
      this.router.navigate(['/dashboard/project/bookmarked', this.projectId]);
    } else {
      console.error('No project ID found for bookmarking');
      this.snackBar.open('Unable to bookmark project', 'Close', {
        duration: 3000
      });
    }
  }

  navigateToInvest() {
    if (this.projectId) {
      this.router.navigate(['/dashboard/project/invest', this.projectId]);
    }
  }

  navigateToBuy() {
    if (this.projectId) {
      this.router.navigate(['/dashboard/project/buy', this.projectId]);
    }
  }

  navigateToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  openAnalyticsDocument() {
    if (this.analyticsDocument) {
      // Remove the PDF parameters for the new tab
      const cleanUrl = this.analyticsDocument.split('#')[0];
      window.open(cleanUrl, '_blank');
    }
  }
}