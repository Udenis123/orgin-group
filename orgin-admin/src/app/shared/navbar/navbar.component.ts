import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ThemeService } from '../../core/theme.service';
import { CookieService } from '../../services/cookie.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  standalone: true,
  imports: [CommonModule, TranslateModule]
})
export class NavbarComponent implements OnInit {
  username = ''; // Initialize as empty
  isAccountMenuOpen = false; // Track if account menu is open
  selectedLanguage = 'en'; // Add this line

  constructor(
    private router: Router, 
    private translate: TranslateService,
    private themeService: ThemeService,
    private cookieService: CookieService,
    private userService: UserService
  ) {
    // Load saved language or default to 'en'
    const savedLanguage = this.cookieService.getCookie('selectedLanguage') || 'en';
    this.translate.setDefaultLang(savedLanguage);
    this.translate.use(savedLanguage);
    this.selectedLanguage = savedLanguage;
  }

  ngOnInit() {
    this.fetchUserProfile();

    // Apply theme on component initialization
    if (this.themeService.isDarkTheme()) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }

  fetchUserProfile() {
    // Fetch fresh data from API
    this.userService.getProfileDetails().subscribe({
      next: (profile) => {
        this.username = profile.fullName;
      },
      error: (err) => {
        console.error('Failed to fetch profile:', err);
        // Fallback to cookie if API fails
        const userProfile = this.cookieService.getCookie('userProfile');
        if (userProfile) {
          const profile = JSON.parse(userProfile);
          this.username = profile.fullname;
        }
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
      this.cookieService.setCookie('selectedLanguage', selectedLang, 60 * 24 * 30); // Store for 30 days
      this.selectedLanguage = selectedLang; // Update the selected language
    }
  }

  toggleDarkMode() {
    this.themeService.toggleTheme();
  }

  get isDarkMode(): boolean {
    return this.themeService.isDarkTheme();
  }

  logout() {
    try {
      // Clear all admin-related cookies
      const cookiesToRemove = [
        'adminToken',
        'adminId',
        'adminExpirationTime',
        'redirectUrl'
      ];
  
      cookiesToRemove.forEach(cookieName => {
        this.cookieService.deleteCookie(cookieName);
      });
  
      // Redirect to the login page
      this.router.navigate(['/login']).then(() => {
        console.log('Logged out successfully');
      }).catch((error) => {
        console.error('Error navigating to login:', error);
      });
    } catch (error) {
      console.error('Error during logout:', error);
    }
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