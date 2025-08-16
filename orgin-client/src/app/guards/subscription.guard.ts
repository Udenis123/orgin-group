import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { SubscriptionService } from '../services/subscription.service';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionGuard implements CanActivate {
  constructor(private subscriptionService: SubscriptionService, private router: Router) {}

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    const requiredPlan = route.data['requiredPlan'] || 'FREE';
    
    if (await this.subscriptionService.hasActiveSubscription()) {
      if (await this.subscriptionService.hasPlanAccess(requiredPlan)) {
        return true;
      }
      // Redirect to subscription plan page if user doesn't have access
      this.router.navigate(['/dashboard/subscription/plan']);
      return false;
    }
    
    // Redirect to subscription plan page if user is not subscribed
    this.router.navigate(['/dashboard/subscription/plan']);
    return false;
  }
}