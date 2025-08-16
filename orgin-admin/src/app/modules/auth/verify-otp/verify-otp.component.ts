import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../services/auth.service';

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
    private authService: AuthService
  ) {
    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });

    this.email = history.state.email;
  }

  onSubmit() {
    if (this.otpForm.valid) {
      const enteredOTP = this.otpForm.value.otp;

      this.authService.verifyOTP(enteredOTP).subscribe({
        next: (response) => {
          this.handleSuccessfulVerification();
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

    this.authService.resendOTP(this.email).subscribe({
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
