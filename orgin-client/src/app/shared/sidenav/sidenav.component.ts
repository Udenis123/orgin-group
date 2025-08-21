import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { UserService } from '../../services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CookieService } from 'ngx-cookie-service';
import { ProfileCacheService } from '../services/profile-cache.service';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule]
})
export class SidenavComponent implements OnInit {
  isOpen = true;
  isInitiatingProjectOpen = false;
  @Output() toggle = new EventEmitter<boolean>();

  // Add user profile data
  userProfile: { fullname: string, email: string, profilePicture: string } | null = null;

  currentIP: string = '';

  constructor(
    private translate: TranslateService,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private cookieService: CookieService,
    private profileCacheService: ProfileCacheService
  ) {}

  ngOnInit() {
    this.fetchUserProfile();
  }

  fetchUserProfile() {
    // Try to get cached data immediately for instant loading
    const cachedProfile = this.profileCacheService.getCachedDataImmediately();
    if (cachedProfile) {
      this.userProfile = {
        fullname: cachedProfile.fullName,
        email: cachedProfile.email,
        profilePicture: cachedProfile.profilePicture
          ? cachedProfile.profilePicture
          : 'assets/images/default-profile.png'
      };
    }

    // Use cached profile data for faster loading
    this.profileCacheService.getProfile().subscribe({
      next: (profile) => {
        if (!profile) return;
        this.userProfile = {
          fullname: profile.fullName,
          email: profile.email,
          profilePicture: profile.profilePicture
            ? profile.profilePicture
            : 'assets/images/default-profile.png'
        };
      },
      error: (err) => {
        console.error('Failed to fetch profile:', err);
        this.snackBar.open('Failed to load profile data', 'Close', {
          duration: 3000
        });
      }
    });
  }

  toggleSidenav() {
    this.isOpen = !this.isOpen;
    this.toggle.emit(this.isOpen);
  }

  toggleInitiatingProject() {
    this.isInitiatingProjectOpen = !this.isInitiatingProjectOpen;
  }
}