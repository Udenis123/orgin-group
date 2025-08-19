import { Component, OnInit, HostListener, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ThemeService } from '../../core/theme.service';
import { CookieService } from 'ngx-cookie-service';
import { UserService } from '../../services/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  standalone: true,
  imports: [CommonModule, TranslateModule]
})
export class NavbarComponent implements OnInit, OnDestroy {
  username = ''; // Initialize as empty
  isAccountMenuOpen = false; // Track if account menu is open
  selectedLanguage = 'en'; // Add this line
  private profileSubscription: Subscription | null = null;

  constructor(
    private router: Router, 
    private translate: TranslateService,
    private userService: UserService,
    private themeService: ThemeService,
    private cookieService: CookieService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Load saved language or default to 'en'
    if (isPlatformBrowser(this.platformId)) {
      const savedLanguage = localStorage.getItem('selectedLanguage') || 'en';
      this.translate.setDefaultLang(savedLanguage);
      this.translate.use(savedLanguage);
      this.selectedLanguage = savedLanguage;
    }
  }

  ngOnInit() {
    this.loadUserProfile();

    // Apply theme on component initialization
    if (isPlatformBrowser(this.platformId)) {
      if (this.themeService.isDarkTheme()) {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }
    }
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
        this.username = profile?.fullName || '';
      },
      error: (error) => {
        console.error('Error fetching profile:', error);
      }
    });

    // Subscribe to profile updates
    this.profileSubscription = this.userService.getProfileObservable().subscribe({
      next: (profile) => {
        if (profile) {
          this.username = profile?.fullName || '';
        }
      },
      error: (error) => {
        console.error('Error fetching profile:', error);
      }
    });
  }

  navigateToProfile() {
    this.router.navigate(['/dashboard/account/0/1/profile']);
    this.isAccountMenuOpen = false; // Close the menu after navigation
  }

  navigateToSettings() {
    this.router.navigate(['/dashboard/account/0/0/settings']);
    this.isAccountMenuOpen = false; // Close the menu after navigation
  }

  toggleAccountMenu() {
    this.isAccountMenuOpen = !this.isAccountMenuOpen;
  }

  switchLanguage(event: Event) {
    const target = event.target as HTMLSelectElement;
    if (target) {
      const selectedLang = target.value;
      this.translate.use(selectedLang);
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('selectedLanguage', selectedLang);
      }
      this.selectedLanguage = selectedLang; // Update the selected language
    }
  }

  toggleDarkMode() {
    this.themeService.toggleTheme();
  }

  get isDarkMode(): boolean {
    return this.themeService.isDarkTheme();
  }

  logout(): void {
   // Clear all session-related cookies with the correct path
   this.cookieService.delete('analyzerToken', '/');
   this.cookieService.delete('analyzerExpirationTime', '/');
   this.cookieService.delete('analyzerUserId', '/');
   this.cookieService.delete('analyzerSessionId', '/');

   // Clear profile cache and stop background refresh on logout
   this.userService.clearProfileCache();
   this.userService.stopBackgroundRefresh();

    // Navigate to the login page
    window.location.href = '/login';
  }

  // Add HostListener to handle document clicks
  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.account-menu') && !target.closest('.lang-select')) {
      this.isAccountMenuOpen = false;
    }
  }
}