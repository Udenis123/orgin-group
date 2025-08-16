import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, RouterModule]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loginFailed: boolean = false;
  redirectTo: string = 'dashboard/projects/submitted/launched';
  projectId: string | null = null;

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private cookieService: CookieService,
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
      this.redirectTo = params['redirectTo'] || 'dashboard/projects/submitted/launched';
      this.projectId = params['projectId'] || null;
    });
  }

  async onSubmit(): Promise<void> {
    const { email, password } = this.loginForm.value;

    this.authService.login({ email, password }).subscribe({
      next: async (response) => {
        const sessionId = 'unique-session-id';
        const expirationTime = new Date().getTime() + response.expiresIn;
        const expirationDate = new Date(expirationTime);

        // Store session data in cookies
        this.cookieService.set('analyzerSessionId', sessionId, expirationDate, '/');
        this.cookieService.set('analyzerToken', response.token, expirationDate, '/');
        this.cookieService.set('analyzerUserId', response.id, expirationDate, '/');
        this.cookieService.set('analyzerExpirationTime', expirationTime.toString(), expirationDate, '/');

        // Check for redirect URL from localStorage
        if (isPlatformBrowser(this.platformId)) {
          const redirectUrl = localStorage.getItem('redirectUrl');
          if (redirectUrl) {
            this.router.navigateByUrl(redirectUrl);
            localStorage.removeItem('redirectUrl');
          } else {
            this.router.navigate(['dashboard/projects/submitted/launched']);
          }
        } else {
          this.router.navigate(['dashboard/projects/submitted/launched']);
        }
      },
      error: (error) => {
        this.loginFailed = true;
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