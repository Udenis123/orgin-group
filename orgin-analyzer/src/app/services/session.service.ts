import { Injectable, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class SessionService implements OnDestroy {
  sessionTimeoutSeconds = 15 * 60; // ✅ 15 minutes
  timeout: any;
  isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private cookieService: CookieService
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId); // ✅ Check if running in browser

    if (this.isBrowser) {
      this.resetExpirationTimer(); 
      window.addEventListener('mousemove', this.resetExpirationTimer.bind(this));
      window.addEventListener('keydown', this.resetExpirationTimer.bind(this));
    }
  }

  resetExpirationTimer(): void {
    if (!this.isBrowser) return; // ✅ Prevent running on server

    const sessionId = this.cookieService.get('analyzerSessionId');
    if (!sessionId) return;

    const expirationTime = new Date().getTime() + this.sessionTimeoutSeconds * 1000; 
    this.cookieService.set('analyzerExpirationTime', expirationTime.toString(), new Date(expirationTime), '/');

    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      this.clearSession();
    }, this.sessionTimeoutSeconds * 1000);
  }

  clearSession(): void {
    if (!this.isBrowser) return; // ✅ Prevent running on server

      // Clear all session-related cookies with the correct path
      this.cookieService.delete('analyzerToken', '/');
      this.cookieService.delete('analyzerExpirationTime', '/');
      this.cookieService.delete('analyzerUserId', '/');
      this.cookieService.delete('analyzerSessionId', '/');
    window.location.href = '/login';
  }

  ngOnDestroy(): void {
    if (this.isBrowser) {
      window.removeEventListener('mousemove', this.resetExpirationTimer.bind(this));
      window.removeEventListener('keydown', this.resetExpirationTimer.bind(this));
    }
  }
}