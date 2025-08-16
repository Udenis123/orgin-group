import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDarkMode = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private cookieService: CookieService
  ) {
    if (isPlatformBrowser(this.platformId)) {
      const savedTheme = this.cookieService.get('theme');
      this.isDarkMode = savedTheme === 'dark';
      this.applyTheme();
    }
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    this.applyTheme();
    if (isPlatformBrowser(this.platformId)) {
      const themeValue = this.isDarkMode ? 'dark' : 'light';
      this.cookieService.set('theme', themeValue, 365); // Store for 1 year
    }
  }

  isDarkTheme(): boolean {
    return this.isDarkMode;
  }

  applyTheme(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Check if we're on an auth page
      const isAuthPage = ['/login', '/signup', '/auth/0/1/0/a/e/now/verify-email']
        .some(path => window.location.pathname.includes(path));
      
      if (!isAuthPage) {
        if (this.isDarkMode) {
          document.body.classList.add('dark-mode');
        } else {
          document.body.classList.remove('dark-mode');
        }
      }
    }
  }
}
