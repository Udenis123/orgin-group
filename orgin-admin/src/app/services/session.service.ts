import { Injectable, OnDestroy, Inject, PLATFORM_ID } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { CookieService } from './cookie.service';

@Injectable({
  providedIn: 'root'
})
export class SessionService implements OnDestroy {
  sessionTimeoutSeconds = 15 * 60; // 15 minutes
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

    const expirationTime = new Date().getTime() + this.sessionTimeoutSeconds * 1000;
    this.cookieService.setCookie('adminExpirationTime', expirationTime.toString(), this.sessionTimeoutSeconds / 60);

    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      this.clearSession();
    }, this.sessionTimeoutSeconds * 1000);
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