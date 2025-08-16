import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Injectable({ providedIn: 'root' })
export class NoSessionGuard implements CanActivate {
  constructor(private router: Router, private cookieService: CookieService) {}

  canActivate(): boolean | UrlTree {
    const sessionId = this.cookieService.get('sessionId');
    const expirationTime = this.cookieService.get('expirationTime');
    
    if (sessionId && expirationTime && Date.now() < parseInt(expirationTime)) {
      return this.router.parseUrl('/dashboard/project/launch');
    }
    return true;
  }
}