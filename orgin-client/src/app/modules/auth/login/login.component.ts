import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { SubscriptionService } from '../../../services/subscription.service';
import { AuthService } from '../../../services/auth.service';
import { CookieService } from 'ngx-cookie-service';
import { isPlatformBrowser } from '@angular/common';
import { ToastService } from '../../../shared/services/toast.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';


@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MatSnackBarModule]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  redirectTo: string = 'dashboard/project/launch';
  projectId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private subscriptionService: SubscriptionService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private cookieService: CookieService,
    private toastService: ToastService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      // Get redirect path and project ID from query params
      this.redirectTo = params['redirectTo'] || 'dashboard/project/launch';
      this.projectId = params['projectId'] || null;
    });
  }

  validateUsername(control: any) {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const phonePattern = /^2507[0-9]{8}$/;

    return emailPattern.test(control.value) || phonePattern.test(control.value) ? null : { invalidUsername: true };
  }

  async onSubmit(): Promise<void> {
    const { email, password } = this.loginForm.value;

    this.authService.login({ email, password }).subscribe({
      next: async (response) => {
        const sessionId = 'unique-session-id';
        const expirationTime = new Date().getTime() + response.expiresIn;
        const expirationDate = new Date(expirationTime);
        // Store session data in cookies
        this.cookieService.set('sessionId', sessionId, expirationDate, '/');
        this.cookieService.set('token', response.token, expirationDate, '/');
        this.cookieService.set('userId', response.id, expirationDate, '/');
        this.cookieService.set('expirationTime', expirationTime.toString(), expirationDate, '/');

        // Fix profile picture URL if it's missing protocol
        let profilePictureUrl = response.profilePicture;
        if (profilePictureUrl && !profilePictureUrl.startsWith('http')) {
          profilePictureUrl = `http://${profilePictureUrl}`;
        }

        // Show success message
        this.toastService.showSuccess('Login successful!');

        // Check for redirect URL from localStorage
        let redirectUrl = null;
        if (isPlatformBrowser(this.platformId)) {
          redirectUrl = localStorage.getItem('redirectUrl');
          if (redirectUrl) {
            localStorage.removeItem('redirectUrl');
          }
        }
        
        if (redirectUrl) {
          this.router.navigateByUrl(redirectUrl);
        } else {
          // Default redirect based on subscription status
          if (await this.subscriptionService.hasActiveSubscription()) {
            this.router.navigate(['dashboard/project/launch']);
          } else {
            this.router.navigate(['dashboard/subscription/plan']);
          }
        }
      },
      error: (error) => {
        // Display error message using toast service
        this.toastService.showError(error.message || 'Login failed. Please try again.');
      }
    });
  }

  onLoginSuccess() {
    // If there's a project ID, pass it along in the navigation
    if (this.projectId) {
      this.router.navigate([this.redirectTo], {
        queryParams: { projectId: this.projectId }
      });
    } else {
      this.router.navigate([this.redirectTo]);
    }
  }
}