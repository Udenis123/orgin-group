import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class SessionGuard implements CanActivate {
  
  constructor(
    private router: Router, 
    private cookieService: CookieService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const sessionId = this.cookieService.get('analyzerSessionId');
    const expirationTime = this.cookieService.get('analyzerExpirationTime');

    if (!sessionId || !expirationTime) {
      // Store the attempted URL for redirection after login
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('redirectUrl', state.url);
      }
      this.clearSession();
      return false;
    }

    const currentTime = new Date().getTime();
    if (currentTime > parseInt(expirationTime, 10)) {
      // Store the attempted URL for redirection after login
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('redirectUrl', state.url);
      }
      this.clearSession();
      return false;
    }

    return true;
  }

  private clearSession(): void {
    this.cookieService.delete('analyzerSessionId');
    this.cookieService.delete('analyzerExpirationTime');
    this.router.navigate(['/login']);
  }
}