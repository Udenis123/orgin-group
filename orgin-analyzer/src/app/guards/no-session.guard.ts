import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Injectable({ providedIn: 'root' })
export class NoSessionGuard implements CanActivate {
  constructor(private router: Router, private cookieService: CookieService) {}

  canActivate(): boolean | UrlTree {
    // Check for both sessionId and expirationTime in cookies
    const sessionId = this.cookieService.get('analyzerSessionId');
    const expirationTime = this.cookieService.get('analyzerExpirationTime');
    
    if (sessionId && expirationTime && Date.now() < parseInt(expirationTime)) {
      return this.router.parseUrl('/dashboard/account/0/1/profile');
    }
    return true;
  }
}