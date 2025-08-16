import { Component, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CookieService } from 'ngx-cookie-service';


@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslateModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  userData: any = {
    fullName: '',
    email: '',
    emailVerified: true,
    phoneNumber: '',
    idNumber: '',
    gender: '',
    nationality: '',
    profilePicture: 'assets/images/logo.png'
  };

  emailVerificationPending = false;
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  otp = '';
  showOtpField = false;
  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;
  resendDisabled = false;
  countdown = 60;
  originalEmail: string = '';

  constructor(
    private userService: UserService,
    private snackBar: MatSnackBar,
    private cookieService: CookieService
  ) {}

  ngOnInit() {
    // Fetch and log profile data
    this.userService.getProfileDetails().subscribe({
      next: (profile) => {
        // Update userData with the fetched profile
        this.userData = {
          fullName: profile.fullName,
          email: profile.email,
          emailVerified: profile.emailStatus,
          phoneNumber: profile.phone,
          profession: profile.profession,
          idNumber: profile.idNumber,
          gender: profile.gender,
          nationality: profile.nationality,
          profilePicture: profile.profilePicture
            ? `${profile.profilePicture}`
            : 'assets/images/defaultPP.jpg'
        };



        this.originalEmail = profile.email; // Store original email
      },
      error: (err) => {

        this.showErrorNotification('Failed to load profile data');
      }
    });
  }

  verifyEmail() {
    this.showOtpField = true;
    this.resendDisabled = true;
    this.startCountdown();
    // Call API to send OTP
    this.userService.sendVerificationEmail(this.userData.email).subscribe({
      next: () => {
        this.showSuccessNotification('OTP sent to your email');
      },
      error: (err) => {
        this.showErrorNotification('Failed to send OTP. Please try again.');
      }
    });
  }

  verifyOtp() {
    if (this.otp === '777777') {
      this.userData.emailVerified = true;
      this.showOtpField = false;
      this.originalEmail = this.userData.email; // Update original email after verification
      this.showSuccessNotification('Email verified successfully');
      this.saveChanges(); // Automatically save changes after successful verification
    } else {
      this.showErrorNotification('Invalid OTP. Please try again.');
    }
  }

  resendOtp() {
    this.resendDisabled = true;
    this.countdown = 60;
    this.startCountdown();
    // Call API to resend OTP
    this.userService.sendVerificationEmail(this.userData.email).subscribe({
      next: () => {
        this.showSuccessNotification('OTP resent to your email');
      },
      error: (err) => {
        this.showErrorNotification('Failed to resend OTP. Please try again.');
      }
    });
  }

  private startCountdown() {
    const interval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(interval);
        this.resendDisabled = false;
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

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result;
        this.userData.profilePicture = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  uploadImage() {
    if (this.selectedFile) {
        const userId = this.cookieService.get('analyzerUserId');
        if (!userId) {
            this.showErrorNotification('User not authenticated');
            return;
        }

        this.userService.uploadProfileImage(this.selectedFile, userId).subscribe({
            next: (response) => {
                this.userData.profilePicture = `${response.fileUrl}`;
                this.showSuccessNotification('Profile image updated successfully');
                this.selectedFile = null;
            },
            error: (err) => {
                if (err.status === 200) {
                    this.showSuccessNotification('Profile image updated successfully');
                    window.location.reload();
                }
                  else if (err.status === 401) {
                    this.showErrorNotification('Unauthorized: Please log in again');
                } else if (err.status === 400) {
                    this.showErrorNotification('Bad Request: Invalid file or user ID');
                } else if (err.status === 500) {
                    this.showErrorNotification('Server Error: Please try again later');
                } else {
                    this.showErrorNotification('Failed to upload profile image');
                }
            }
        });
    } else {
        this.showErrorNotification('No file selected');
    }
}

  saveChanges() {
    // Validate all fields
    if (!this.userData.fullName || !this.userData.email || !this.userData.phoneNumber) {
      this.showErrorNotification('Please fill in all required fields');
      return;
    }

    // Check if email has changed
    if (this.userData.email !== this.originalEmail) {
      this.userData.emailVerified = false;  // Reset verification status
      this.verifyEmail(); // Trigger email verification
      this.showErrorNotification('Please verify your new email before saving changes');
      return;
    }

    // Show success message and redirect
    this.showSuccessNotification('Changes saved successfully');
    setTimeout(() => {
    }, 2000); // Redirect after 2 seconds
  }
  updatePassword() {
    if (this.newPassword !== this.confirmPassword) {
      this.showErrorNotification('New password and confirmation do not match');
      return;
    }

    this.userService.updatePassword(this.currentPassword, this.newPassword).subscribe({
      
      error: (err) => {
        if (err.status === 200) {
          this.showSuccessNotification('Password updated successfully');
          this.currentPassword = '';
          this.newPassword = '';
          this.confirmPassword = '';
        } else {
          this.showErrorNotification(err.error);
        }
      }
    });
  }
}