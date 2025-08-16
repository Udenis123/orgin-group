import { Component, Renderer2, OnDestroy, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { ThemeService } from './core/theme.service';
import { isPlatformBrowser, AsyncPipe, CommonModule } from '@angular/common';
import { FeedbackService } from './shared/services/feedback.service';
import { FeedbackPopupComponent } from './shared/components/feedback-popup/feedback-popup.component';
import { Feedback } from './shared/models/feedback.interface';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true, // ✅ Standalone component
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [RouterOutlet, FeedbackPopupComponent, AsyncPipe, CommonModule], // ✅ Ensure RouterOutlet, FeedbackPopupComponent, AsyncPipe, and CommonModule are imported
})
export class AppComponent implements OnInit, OnDestroy {
  private routerSubscription: Subscription;
  private isBrowser: boolean;

  constructor(
    private router: Router,
    private renderer: Renderer2,
    private themeService: ThemeService,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object,
    public feedbackService: FeedbackService
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const authPages = ['/login', '/signup', '/auth/0/1/0/a/e/now/verify-email', 'auth/verify-otp', 'auth/reset-password', 'auth/forgot-password'];
        const currentRoute = event.url.split('?')[0]; // ✅ Ignore query params

        if (authPages.includes(currentRoute)) {
          this.renderer.setAttribute(document.body, 'class', 'auth-background'); // ✅ Immediate effect
          this.feedbackService.hideFeedbackPopup(); // Hide feedback popup on auth pages
        } else {
          this.renderer.removeAttribute(document.body, 'class'); // ✅ Removes background when navigating away
          // Check for feedback popup on non-auth pages
          if (this.isBrowser && this.authService.isAuthenticated()) {
            this.feedbackService.checkAndShowPopup();
          }
        }
        // Reapply theme on route change
        this.themeService.applyTheme();
      });
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.themeService.applyTheme();
      // Initial check for feedback popup
      if (this.authService.isAuthenticated()) {
        this.feedbackService.checkAndShowPopup();
      }
    }
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
  }

  onFeedbackSubmit(feedback: {rating: number, feedback: string}) {
    if (!this.authService.isAuthenticated()) {
      console.warn('Attempted to submit feedback while not authenticated');
      return;
    }

    this.feedbackService.submitFeedback(feedback.rating, feedback.feedback)
      .pipe(take(1)) // Ensure we only take one emission
      .subscribe({
        next: (submittedFeedback: Feedback) => {
          console.log('Feedback submitted successfully:', submittedFeedback);
        },
        error: (error) => {
          console.error('Error submitting feedback:', error);
        }
      });
  }
}
