import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CookieService } from '../../../services/cookie.service';
import { AuthService } from '../../../services/auth.service';

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
  isLoading: boolean = false;
  redirectTo: string = 'dashboard/projects/launched';
  projectId: string | null = null;

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private route: ActivatedRoute,
    private cookieService: CookieService,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, this.validateUsername]], 
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.redirectTo = params['redirectTo'] || 'dashboard/projects/launched';
      this.projectId = params['projectId'] || null;
    });
  }

  validateUsername(control: any) {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const phonePattern = /^2507[0-9]{8}$/;
    
    return emailPattern.test(control.value) || phonePattern.test(control.value) ? null : { invalidUsername: true };
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.loginFailed = false;
      
      const { username, password } = this.loginForm.value;
      
      console.log('Form submitted with:', { username, password }); // Debug log
      
      this.authService.login({ username, password }).subscribe({
        next: (response) => {
          console.log('Login response:', response); // Debug log
          
          // Store authentication data in cookies
          this.cookieService.setCookie('adminToken', response.token, response.expiresIn / 60);
          this.cookieService.setCookie('adminId', response.id, response.expiresIn / 60);
          this.cookieService.setCookie('adminExpirationTime', (new Date().getTime() + response.expiresIn * 1000).toString(), response.expiresIn / 60);

          // Check for redirect URL from analytics page
          const redirectUrl = this.cookieService.getCookie('redirectUrl');
          if (redirectUrl) {
            this.router.navigateByUrl(redirectUrl);
            this.cookieService.deleteCookie('redirectUrl');
          } else {
            this.onLoginSuccess();
          }
        },
        error: (error) => {
          console.error('Login failed:', error);
          this.loginFailed = true;
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    } else {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.loginForm.controls).forEach(key => {
        const control = this.loginForm.get(key);
        control?.markAsTouched();
      });
    }
  }

  onLoginSuccess() {
    if (this.projectId) {
      this.router.navigate([this.redirectTo], { 
        queryParams: { projectId: this.projectId } 
      });
    } else {
      this.router.navigate([this.redirectTo]);
    }
  }
}