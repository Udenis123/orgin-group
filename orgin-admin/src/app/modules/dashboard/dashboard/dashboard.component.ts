import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { SidenavComponent } from '../../../shared/sidenav/sidenav.component';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from '../../../core/theme.service';
import { UserService } from '../../../services/user.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule, NavbarComponent, SidenavComponent, RouterOutlet, LoadingComponent]
})
export class DashboardComponent implements OnInit, OnDestroy {
  isSidenavOpen = true;
  isDarkMode = false;
  isProfileReady = false;
  isLoading = false;
  private profileSubscription: Subscription | null = null;
  private loadingSubscription: Subscription | null = null;
  private readySubscription: Subscription | null = null;

  constructor(
    private themeService: ThemeService,
    private userService: UserService
  ) {
    this.isDarkMode = this.themeService.isDarkTheme();
  }

  ngOnInit() {
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
        // Profile data is available
      }
    });

    // Fetch profile data if not already ready
    if (!this.userService.isProfileReady()) {
      this.userService.getProfileDetails().subscribe({
        next: (profile) => {
          // Profile data fetched successfully
        },
        error: (err) => {
          console.error('Failed to fetch profile:', err);
        }
      });
    }
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

  // Add this method to handle sidenav state changes
  onSidenavToggle(isOpen: boolean) {
    this.isSidenavOpen = isOpen;
  }
}