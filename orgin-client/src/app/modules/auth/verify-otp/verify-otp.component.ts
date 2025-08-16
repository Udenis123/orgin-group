import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../services/auth.service';
import { CookieService } from 'ngx-cookie-service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  templateUrl: './verify-otp.component.html',
  styleUrls: ['./verify-otp.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, MatSnackBarModule]
})
export class VerifyOtpComponent {
  otpForm: FormGroup;
  resendDisabled = false;
  countdown = 60;
  email: string = '';
  validationError = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private cookieService: CookieService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });

    this.email = this.cookieService.get('forgotEmail') || '';
  }

  onSubmit() {
    if (this.otpForm.valid) {
      const enteredOTP = this.otpForm.value.otp;

      this.authService.verifyResetCode(enteredOTP).subscribe({
        next: (response) => {
          this.handleSuccessfulVerification();
          this.cookieService.set('resetOtp', enteredOTP);
          this.cookieService.set('forgotEmail', this.email);
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('resetOtp', enteredOTP);
          }
        },
        error: (error) => {
          this.showErrorNotification('Invalid OTP code. Please try again.');
        }
      });
    }
  }

  private handleSuccessfulVerification() {
    this.showSuccessNotification('OTP verified successfully! Redirecting to reset password...');
    setTimeout(() => {
      this.router.navigate(['/auth/reset-password'], {
        state: { email: this.email }
      });
    }, 2000);
  }

  resendOTP() {
    this.resendDisabled = true;
    this.startCountdown();


    this.authService.forgotPassword(this.email).subscribe({
      next: (response) => {
        this.showSuccessNotification('OTP resent successfully!');
      },
      error: (error) => {
        this.showErrorNotification('Failed to resend OTP. Please try again later.');
      }
    });
  }

  private startCountdown() {
    const interval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(interval);
        this.resendDisabled = false;
        this.countdown = 60;
      }
    }, 1000);
  }

  private showErrorNotification(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  private showSuccessNotification(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 2000,
      panelClass: ['success-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }
}
