import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDarkMode = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      // Only access localStorage in browser environment
      const savedTheme = localStorage.getItem('theme');
      this.isDarkMode = savedTheme === 'dark';
      this.applyTheme();
    }
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    this.applyTheme();
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
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
