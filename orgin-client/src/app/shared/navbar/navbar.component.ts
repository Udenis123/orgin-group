import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ThemeService } from '../../core/theme.service';
import { UserService } from '../../services/user.service';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../../environments/environment';
import { ProfileCacheService } from '../services/profile-cache.service';

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
  webUrl = environment.webUrl; // Add environment webUrl

  constructor(
    private router: Router, 
    private translate: TranslateService,
    private themeService: ThemeService,
    private userService: UserService,
    private cookieService: CookieService,
    private profileCacheService: ProfileCacheService
  ) {
    // Load saved language from cookies
    const savedLanguage = this.cookieService.get('selectedLanguage') || 'en';
    this.translate.setDefaultLang(savedLanguage);
    this.translate.use(savedLanguage);
    this.selectedLanguage = savedLanguage;
  }

  async ngOnInit() {
    // Try to get cached data immediately for instant loading
    const cachedProfile = this.profileCacheService.getCachedDataImmediately();
    if (cachedProfile) {
      this.username = cachedProfile.fullName || '';
    }

    // Use cached profile data for faster loading
    this.profileCacheService.getProfile().subscribe({
      next: (profile) => {
        if (!profile) return;
        this.username = profile?.fullName || '';
      },
      error: (error) => {
        console.error('Error fetching profile:', error);
      }
    });

    // Apply theme on component initialization
    if (this.themeService.isDarkTheme()) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
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
      this.cookieService.set('selectedLanguage', selectedLang);
      this.selectedLanguage = selectedLang;
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
      // Clear only the cookies that were set during login
      const loginCookies = [
        'sessionId',
        'token',
        'userId',
        'expirationTime'
      ];
  
      loginCookies.forEach(key => {
        this.cookieService.delete(key, '/');
      });

      // Invalidate profile cache on logout
      this.profileCacheService.invalidateCache();
  
      // Redirect to the login page
      this.router.navigate(['/login']);
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