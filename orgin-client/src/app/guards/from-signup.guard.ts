import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

interface NavigationState {
  fromSignup?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class FromSignupGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const navigationState = state.root.firstChild?.data as NavigationState;
    console.log('Navigation state:', navigationState);
    
    if (!navigationState?.fromSignup) {
      console.log('Redirecting to signup');
      this.router.navigate(['/signup']);
      return false;
    }
    return true;
  }
}