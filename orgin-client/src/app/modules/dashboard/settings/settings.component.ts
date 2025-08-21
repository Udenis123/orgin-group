import { Component, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { TranslateModule } from '@ngx-translate/core';
import { NgIf } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';
import { ToastService } from '../../../shared/services/toast.service';
import { ProfileCacheService, ProfileData } from '../../../shared/services/profile-cache.service';



@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslateModule, NgIf],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit, OnChanges {
  userData: any = {
    fullName: '',
    email: '',
    emailVerified: true,
    phoneNumber: '',
    profession: '',
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
  verificationInitiated = false;

  constructor(
    private userService: UserService,
    private toastService: ToastService,
    private cookieService: CookieService,
    private profileCacheService: ProfileCacheService
  ) {}

  ngOnInit() {
    // Try to get cached data immediately for instant loading
    const cachedProfile = this.profileCacheService.getCachedDataImmediately();
    if (cachedProfile) {
      this.updateUserDataFromProfile(cachedProfile);
    }

    // Then get fresh data (will use cache if still valid)
    this.profileCacheService.getProfile().subscribe({
      next: (profile: ProfileData | null) => {
        if (!profile) return;
        this.updateUserDataFromProfile(profile);
      },
      error: (err) => {
        this.showErrorNotification('Failed to load profile data');
      }
    });
  }

  private updateUserDataFromProfile(profile: ProfileData): void {
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
  }

  ngOnChanges() {
    this.checkEmailChange();
  }

  onEmailChange() {
    this.checkEmailChange();
    if (!this.userData.emailVerified) {
      this.showOtpField = true;
    }
  }

  private checkEmailChange() {
    if (this.userData.email !== this.originalEmail) {
      this.userData.emailVerified = false;
    }
  }

  verifyEmail() {
    this.showOtpField = true;
    this.resendDisabled = true;
    this.startCountdown();

    this.userService.sendVerificationEmail(this.userData.email).subscribe({
      next: (response: any) => {
        if (response && (response.status === 200 || response === 'Verification code sent to new email.')) {
          this.showSuccessNotification('OTP sent to your email');
        } else {

          this.showErrorNotification('Failed to send OTP. Please try again.');
        }
      },
      error: (err) => {
        if (err.status === 200) {
          this.showSuccessNotification('OTP sent to your email');
        } else {
          this.showErrorNotification('Failed to send OTP. Please try again.');
        }
      }
    });
  }
  resendOtp() {
    this.resendDisabled = true;
    this.countdown = 60;
    this.startCountdown();

    this.userService.sendVerificationEmail(this.userData.email).subscribe({
      next: (response: any) => {
        if (response && (response.status === 200 || response === 'Verification code sent to new email.')) {
          this.showSuccessNotification('OTP resent to your email');
        } else {

          this.showErrorNotification('Failed to resend OTP. Please try again.');
        }
      },
      error: (err) => {
        if (err.status === 200) {
          this.showSuccessNotification('OTP resent to your email');
        } else {
          this.showErrorNotification('Failed to resend OTP. Please try again.');
        }
      }
    });
  }

  verifyOtp() {
    this.userService.verifyEmail(this.otp).subscribe({
      next: () => {
        this.userData.emailVerified = true;
        this.showOtpField = false;
        this.originalEmail = this.userData.email;
        // Update cache with email verification status
        this.profileCacheService.updateEmailStatus(true);
        this.showSuccessNotification('Email verified successfully');
        this.saveChanges();
      },
      error: (err) => {
        this.showErrorNotification('Invalid OTP. Please try again.');
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
    this.toastService.showError(message, 3000);
  }

  private showSuccessNotification(message: string) {
    this.toastService.showSuccess(message, 3000);
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
        const userId = this.cookieService.get('userId');
        if (!userId) {
            this.showErrorNotification('User not authenticated');
            return;
        }

        this.userService.uploadProfileImage(this.selectedFile, userId).subscribe({
            next: (response) => {
                this.userData.profilePicture = `${response.fileUrl}`;
                // Update cache with new profile picture
                this.profileCacheService.updateProfilePicture(`${response.fileUrl}`);
                this.showSuccessNotification('Profile image updated successfully');
                this.selectedFile = null;
            },
            error: (err) => {
                if (err.status === 200) {
                    // Update cache with new profile picture
                    this.profileCacheService.updateProfilePicture(this.userData.profilePicture);
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
    // Validate required fields
    if (!this.userData.fullName || !this.userData.phoneNumber) {
      this.showErrorNotification('Please fill in all required fields');
      return;
    }

    this.userService.updateProfile(this.userData).subscribe({
      next: (response: any) => {
        if (response && (response.status === 200 || response === 'Profile updated successfully')) {
          // Update cache with new profile data
          this.profileCacheService.updateProfile({
            fullName: this.userData.fullName,
            email: this.userData.email,
            emailStatus: this.userData.emailVerified,
            phone: this.userData.phoneNumber,
            profession: this.userData.profession,
            idNumber: this.userData.idNumber,
            gender: this.userData.gender,
            nationality: this.userData.nationality,
            profilePicture: this.userData.profilePicture
          });
          this.showSuccessNotification('Profile updated successfully');
        } else {
          this.showErrorNotification('Failed to update profile. Please try again.');
        }
      },
      error: (err) => {
        if (err.status === 200) {
          // Update cache with new profile data
          this.profileCacheService.updateProfile({
            fullName: this.userData.fullName,
            email: this.userData.email,
            emailStatus: this.userData.emailVerified,
            phone: this.userData.phoneNumber,
            profession: this.userData.profession,
            idNumber: this.userData.idNumber,
            gender: this.userData.gender,
            nationality: this.userData.nationality,
            profilePicture: this.userData.profilePicture
          });
          this.showSuccessNotification('Profile updated successfully');
        } else {
          this.showErrorNotification('Failed to update profile. Please try again.');
        }
      }
    });
  }

  updatePassword() {
    if (this.newPassword !== this.confirmPassword) {
      this.showErrorNotification('New password and confirmation do not match');
      return;
    }

    this.userService.updatePassword(this.currentPassword, this.newPassword).subscribe({
      next: (response: any) => {
        if (response && (response.status === 200 || response === 'Password updated successfully')) {
          this.showSuccessNotification('Password updated successfully');
          this.currentPassword = '';
          this.newPassword = '';
          this.confirmPassword = '';
        } else {
          this.showErrorNotification('Failed to update password. Please try again.');
        }
      },
      error: (err) => {
        if (err.status === 200) {
          this.showSuccessNotification('Password updated successfully');
          this.currentPassword = '';
          this.newPassword = '';
          this.confirmPassword = '';
        } else {
          this.showErrorNotification('Failed to update password. Please check your current password.');
        }
      }
    });
  }
}