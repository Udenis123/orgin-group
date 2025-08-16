import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Location } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-email-otp-validation',
  templateUrl: './email-otp-validation.component.html',
  styleUrls: ['./email-otp-validation.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatSnackBarModule],
  providers: [DatePipe]
})
export class EmailOtpValidationComponent {
  otpForm: FormGroup;
  resendDisabled = false;
  countdown = 60;
  email: string = '';
  validationError = false;
  private resendExpiration: string | null = null;
  private resendCount = 0;
  private baseResendTime = 60; // Base time in seconds
  private maxResendTime = 300; // Maximum time in seconds

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private datePipe: DatePipe,
    private snackBar: MatSnackBar,
    private location: Location,
    private authService: AuthService,
    private cookieService: CookieService
  ) {
    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });

    const navigationState = this.location.getState() as { fromSignup?: boolean };
    if (!navigationState?.fromSignup) {
      this.router.navigate(['/signup']);
      return;
    }

    console.log('EmailOtpValidationComponent initialized');
    
    this.email = this.cookieService.get('otpEmail') || '';
    console.log('Email from cookies:', this.email);

    this.checkResendTimer();
  }

  private checkResendTimer() {
    const expiration = this.cookieService.get('otpResendExpiration');
    const resendCount = this.cookieService.get('otpResendCount');
    
    if (resendCount) {
      this.resendCount = parseInt(resendCount, 10);
    }

    if (expiration) {
      const now = new Date();
      const expirationDate = new Date(expiration);
      
      if (expirationDate > now) {
        this.resendDisabled = true;
        const diff = Math.floor((expirationDate.getTime() - now.getTime()) / 1000);
        this.countdown = diff;
        this.startCountdown(expirationDate);
      }
    }
  }

  private startCountdown(expirationDate: Date) {
    const interval = setInterval(() => {
      const now = new Date();
      const diff = Math.floor((expirationDate.getTime() - now.getTime()) / 1000);
      
      if (diff <= 0) {
        clearInterval(interval);
        this.resendDisabled = false;
        this.cookieService.delete('otpResendExpiration');
        this.countdown = 60;
      } else {
        this.countdown = diff;
      }
    }, 1000);
  }

  onSubmit() {
    if (this.otpForm.valid) {
      const enteredOTP = this.otpForm.value.otp;

      this.authService.verifyEmail(enteredOTP).subscribe({
        next: (response) => {
          console.log('OTP verification successful:', response);
          this.handleSuccessfulVerification();
        },
        error: (error) => {
          if (error.status === 200) {
            // Handle successful verification despite error callback
            console.log('Detected successful verification with status 200');
            this.handleSuccessfulVerification();
          } else {
            console.error('OTP verification error:', error);
            this.showErrorNotification('Invalid OTP code. Please try again.');
          }
        }
      });
    }
  }

  private handleSuccessfulVerification() {
    this.showSuccessNotification('Email verified successfully! Redirecting to login...');
    // Clear otpEmail and related data from cookies
    this.cookieService.delete('otpEmail');
    this.cookieService.delete('otpResendExpiration');
    this.cookieService.delete('otpResendCount');
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 2000);
  }

  private showErrorNotification(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 5000, // 5 seconds
      panelClass: ['error-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  private showSuccessNotification(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 2000, // 2 seconds
      panelClass: ['success-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  resendOTP() {
    // Store expiration and resend count in cookies
    const resendTime = Math.min(this.baseResendTime * (this.resendCount + 1), this.maxResendTime);
    const expirationDate = new Date(Date.now() + resendTime * 1000);
    
    this.resendExpiration = this.datePipe.transform(expirationDate, 'yyyy-MM-ddTHH:mm:ss')!;
    this.cookieService.set('otpResendExpiration', this.resendExpiration);
    this.cookieService.set('otpResendCount', this.resendCount.toString());
    
    // Start countdown
    this.resendDisabled = true;
    this.startCountdown(expirationDate);
    
    // Increment resend count
    this.resendCount++;
    
    // Call the authService to resend the OTP
    this.authService.resendVerificationCode(this.email).subscribe({
      next: (response) => {
        console.log('OTP resent successfully:', response);
        this.showSuccessNotification('OTP resent successfully!');
      },
      error: (error) => {
        if (error.status === 200) {
          // Handle successful resend despite error callback
          console.log('Detected successful resend with status 200');
          this.showSuccessNotification('OTP resent successfully!');
        } else {
          console.error('Failed to resend OTP:', error);
          this.showErrorNotification('Failed to resend OTP. Please try again later.');
        }
      }
    });
  }
}