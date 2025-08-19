import { Component, EventEmitter, Output, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { UserService } from '../../services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CookieService } from 'ngx-cookie-service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule]
})
export class SidenavComponent implements OnInit, OnDestroy {
  isOpen = true;
  isInitiatingProjectOpen = false;
  isSubmittedProjectsOpen = false;
  isAssignedProjectsOpen = false;
  @Output() toggle = new EventEmitter<boolean>();

  // Add user profile data
  userProfile: { fullname: string, email: string, profilePicture: string } | null = null;
  private profileSubscription: Subscription | null = null;

  constructor(
    private translate: TranslateService,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private cookieService: CookieService
  ) {}

  ngOnInit() {
    this.loadUserProfile();
  }

  ngOnDestroy() {
    if (this.profileSubscription) {
      this.profileSubscription.unsubscribe();
    }
  }

  loadUserProfile() {
    // Use preload method for faster loading
    this.userService.preloadProfile().subscribe({
      next: (profile) => {
        this.setUserProfile(profile);
      },
      error: (err) => {
        console.error('Failed to fetch profile:', err);
        this.snackBar.open('Failed to load profile data', 'Close', {
          duration: 3000
        });
      }
    });

    // Subscribe to profile updates
    this.profileSubscription = this.userService.getProfileObservable().subscribe({
      next: (profile) => {
        if (profile) {
          this.setUserProfile(profile);
        }
      },
      error: (err) => {
        console.error('Failed to fetch profile:', err);
      }
    });
  }

  private setUserProfile(profile: any) {
    this.userProfile = {
      fullname: profile.fullName,
      email: profile.email,
      profilePicture: profile.profilePicture && profile.profilePicture.trim() !== ''
        ? profile.profilePicture
        : 'assets/images/logo.png'
    };
  }

  toggleSidenav() {
    this.isOpen = !this.isOpen;
    this.toggle.emit(this.isOpen);
  }

  toggleAssignedProjects() {
    this.isAssignedProjectsOpen = !this.isAssignedProjectsOpen;
  }

  toggleSubmittedProjects() {
    this.isSubmittedProjectsOpen = !this.isSubmittedProjectsOpen;
  }
}