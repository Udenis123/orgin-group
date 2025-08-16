import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CookieService } from '../../../services/cookie.service';
import { isPlatformBrowser } from '@angular/common';

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

  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;

  constructor(
    private userService: UserService,
    private snackBar: MatSnackBar,
    private router: Router,
    private cookieService: CookieService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    // Fetch fresh data from API
    this.userService.getProfileDetails().subscribe({
      next: (profile) => {
        // Update userData with the fetched profile
        this.userData = {
          fullName: profile.fullName,
          email: profile.email,
          emailVerified: profile.emailStatus,
          phoneNumber: profile.phone,
          idNumber: profile.idNumber,
          gender: profile.gender,
          nationality: profile.nationality,
          profilePicture: profile.profilePicture
            ? `${profile.profilePicture}`
            : 'assets/images/logo.png'
        };
      },
      error: (err) => {
        console.error('Failed to load profile data:', err);
        this.showErrorNotification('Failed to load profile data');
        // Fallback to localStorage if API fails
        if (isPlatformBrowser(this.platformId)) {
          const storedProfile = localStorage.getItem('userProfile');
          if (storedProfile) {
            const profileData = JSON.parse(storedProfile);
            this.userData = {
              fullName: profileData.fullname,
              email: profileData.email,
              emailVerified: profileData.emailVerified,
              phoneNumber: profileData.phoneNumber,
              idNumber: profileData.idNumber,
              gender: profileData.gender,
              nationality: profileData.nationality,
              profilePicture: profileData.profilePicture || 'assets/images/logo.png'
            };
          }
        }
      }
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
        const userId = this.cookieService.getCookie('adminId');
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
                } else if (err.status === 401) {
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