import { Component, EventEmitter, Output, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../../services/user.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule]
})
export class SidenavComponent implements OnInit {
  isOpen = true;
  isUsersOpen = false;
  isSubmittedProjectsOpen = false;
  isAllProjectsOpen = false;
  isAppointmentManagementOpen = false;
  @Output() toggle = new EventEmitter<boolean>();

  // Add user profile data
  userProfile: { fullname: string, email: string, profilePicture: string } | null = null;
  currentIP: string = '';

  constructor(
    private translate: TranslateService, 
    private http: HttpClient,
    private userService: UserService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.fetchUserProfile();
    // Get current IP address
    this.getCurrentIP();
  }

  fetchUserProfile() {
    // Fetch fresh data from API
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