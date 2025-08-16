import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { CookieService } from '../services/cookie.service';

@Injectable({ providedIn: 'root' })
export class NoSessionGuard implements CanActivate {
  constructor(
    private router: Router,
    private cookieService: CookieService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  canActivate(): boolean | UrlTree {
    // During SSR, allow the route to be activated
    // The actual authentication will be handled on the client side
    if (!this.isBrowser()) {
      return true;
    }

    const adminToken = this.cookieService.getCookie('adminToken');
    const adminId = this.cookieService.getCookie('adminId');
    const adminExpirationTime = this.cookieService.getCookie('adminExpirationTime');
    
    if (adminToken && adminId && adminExpirationTime && Date.now() < parseInt(adminExpirationTime)) {
      return this.router.parseUrl('/dashboard/projects/launched');
    }
    return true;
  }
}