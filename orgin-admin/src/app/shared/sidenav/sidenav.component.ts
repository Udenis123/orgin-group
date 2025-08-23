import { Component, EventEmitter, Output, OnInit, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../../services/user.service';
import { isPlatformBrowser } from '@angular/common';
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
  isUsersOpen = false;
  isSubmittedProjectsOpen = false;
  isAllProjectsOpen = false;
  isAppointmentManagementOpen = false;
  @Output() toggle = new EventEmitter<boolean>();

  // Add user profile data
  userProfile: { fullname: string, email: string, profilePicture: string } | null = null;
  currentIP: string = '';
  isProfileReady = false;
  isLoading = false;
  private profileSubscription: Subscription | null = null;
  private loadingSubscription: Subscription | null = null;
  private readySubscription: Subscription | null = null;

  constructor(
    private translate: TranslateService, 
    private http: HttpClient,
    private userService: UserService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.initializeProfile();
    // Get current IP address
    this.getCurrentIP();
  }

  ngOnDestroy() {
    if (this.profileSubscription) {
      this.profileSubscription.unsubscribe();
    }
    if (this.loadingSubscription) {
      this.loadingSubscription.unsubscribe();
    }
    if (this.readySubscription) {
      this.readySubscription.unsubscribe();
    }
  }

  private initializeProfile() {
    // Subscribe to profile ready state
    this.readySubscription = this.userService.profileReady$.subscribe(ready => {
      this.isProfileReady = ready;
    });

    // Subscribe to loading state
    this.loadingSubscription = this.userService.loading$.subscribe(loading => {
      this.isLoading = loading;
    });

    // Subscribe to profile updates
    this.profileSubscription = this.userService.profile$.subscribe(profile => {
      if (profile) {
        this.userProfile = {
          fullname: profile.fullName,
          email: profile.email,
          profilePicture: profile.profilePicture
            ? profile.profilePicture
            : 'assets/images/logo.png'
        };
      }
    });

    // Fetch profile data if not already ready
    if (!this.userService.isProfileReady()) {
      this.userService.getProfileDetails().subscribe({
        next: (profile) => {
          this.userProfile = {
            fullname: profile.fullName,
            email: profile.email,
            profilePicture: profile.profilePicture
              ? profile.profilePicture
              : 'assets/images/logo.png'
          };
        },
        error: (err) => {
          console.error('Failed to fetch profile:', err);
          // Fallback to localStorage if API fails
          if (isPlatformBrowser(this.platformId)) {
            const userProfile = localStorage.getItem('userProfile');
            if (userProfile) {
              this.userProfile = JSON.parse(userProfile);
            }
          }
        }
      });
    }
  }

  private getCurrentIP() {
    this.http.get<{ip: string}>('https://api.ipify.org?format=json')
      .subscribe({
        next: (response) => {
          this.currentIP = response.ip;
        },
        error: (error) => {
          console.error('Error fetching IP address:', error);
          this.currentIP = 'localhost'; // fallback
        }
      });
  }

  toggleSidenav() {
    this.isOpen = !this.isOpen;
    this.toggle.emit(this.isOpen);
  }

  toggleSubmittedProjects() {
    this.isSubmittedProjectsOpen = !this.isSubmittedProjectsOpen;
  }

  toggleAllProjects() {
    this.isAllProjectsOpen = !this.isAllProjectsOpen;
  }
  toggleUsers() {
    this.isUsersOpen = !this.isUsersOpen;
  }

  toggleAppointmentManagement() {
    this.isAppointmentManagementOpen = !this.isAppointmentManagementOpen;
  }
}