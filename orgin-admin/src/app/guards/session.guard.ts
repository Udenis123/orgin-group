import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { CookieService } from '../services/cookie.service';

@Injectable({
  providedIn: 'root'
})
export class SessionGuard implements CanActivate {
  
  constructor(
    private router: Router,
    private cookieService: CookieService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // During SSR, allow the route to be activated
    // The actual authentication will be handled on the client side
    if (!this.isBrowser()) {
      return true;
    }

    const adminToken = this.cookieService.getCookie('adminToken');
    const adminId = this.cookieService.getCookie('adminId');
    const adminExpirationTime = this.cookieService.getCookie('adminExpirationTime');

    if (!adminToken || !adminId || !adminExpirationTime) {
      this.cookieService.setCookie('redirectUrl', state.url, 60); // Store redirect URL for 1 hour
      this.clearSession();
      return false;
    }

    const currentTime = new Date().getTime();
    if (currentTime > parseInt(adminExpirationTime, 10)) {
      this.cookieService.setCookie('redirectUrl', state.url, 60); // Store redirect URL for 1 hour
      this.clearSession();
      return false;
    }

    return true;
  }

  private clearSession(): void {
    if (!this.isBrowser()) return;
    
    this.cookieService.deleteCookie('adminToken');
    this.cookieService.deleteCookie('adminId');
    this.cookieService.deleteCookie('adminExpirationTime');
    this.router.navigate(['/login']);
  }
}