import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { UserService } from '../../services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CookieService } from 'ngx-cookie-service';

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
    private cookieService: CookieService
  ) {}

  ngOnInit() {
    this.fetchUserProfile();
  }

  fetchUserProfile() {
    // Remove cookie retrieval
    // const storedProfile = this.cookieService.get('userProfile');
    // if (storedProfile) {
    //   this.userProfile = JSON.parse(storedProfile);
    // }

    // Fetch fresh data from API
    this.userService.getProfileDetails().subscribe({
      next: (profile) => {
        this.userProfile = {
          fullname: profile.fullName,
          email: profile.email,
          profilePicture: profile.profilePicture
            ? profile.profilePicture
            : 'assets/images/default-profile.png'
        };
       
        // Remove cookie storage for userProfile
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