import { Injectable, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { CookieService } from './cookie.service';

@Injectable({
  providedIn: 'root'
})
export class SessionService implements OnDestroy {
  timeout: any;
  isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private cookieService: CookieService
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      this.resetExpirationTimer();
      window.addEventListener('mousemove', this.resetExpirationTimer.bind(this));
      window.addEventListener('keydown', this.resetExpirationTimer.bind(this));
    }
  }

  resetExpirationTimer(): void {
    if (!this.isBrowser) return;

    const adminToken = this.cookieService.getCookie('adminToken');
    if (!adminToken) return;

    const adminExpirationTime = this.cookieService.getCookie('adminExpirationTime');
    if (!adminExpirationTime) return;

    const expirationTime = parseInt(adminExpirationTime, 10);
    const currentTime = new Date().getTime();
    const timeUntilExpiration = expirationTime - currentTime;

    // If already expired, clear session
    if (timeUntilExpiration <= 0) {
      this.clearSession();
      return;
    }

    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      this.clearSession();
    }, timeUntilExpiration);
  }

  clearSession(): void {
    if (!this.isBrowser) return;

    this.cookieService.deleteCookie('adminToken');
    this.cookieService.deleteCookie('adminId');
    this.cookieService.deleteCookie('adminExpirationTime');
    window.location.href = '/login';
  }

  ngOnDestroy(): void {
    if (this.isBrowser) {
      window.removeEventListener('mousemove', this.resetExpirationTimer.bind(this));
      window.removeEventListener('keydown', this.resetExpirationTimer.bind(this));
    }
  }
}