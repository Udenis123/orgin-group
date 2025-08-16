import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  imports: [CommonModule, ReactiveFormsModule]
})
export class ForgotPasswordComponent {
  forgotForm: FormGroup;
  emailSent = false;
  femail:string="";

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private authService: AuthService, 
    private cookieService: CookieService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.forgotForm.valid) {
      this.emailSent = true;
      this.femail = this.forgotForm.value.email;

      this.authService.forgotPassword(this.femail).subscribe({
        next: (response) => {
          this.cookieService.set('forgotEmail', this.femail);
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('forgotEmail', this.femail);
          }
          this.router.navigate(['/auth/verify-otp'], {
            state: { email: this.forgotForm.value.email }
          });
        },
        error: (error) => {
          console.log(error);
          alert("Unable to send email OTP. Please check your connection");
          this.emailSent = false;
        },
        
      });
    }
  }
}
