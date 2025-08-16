import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  hasActiveSubscription(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      const subscriptionStatus = localStorage.getItem('subscriptionStatus');
      return subscriptionStatus === 'active';
    }
    return false;
  }

  getSubscriptionPlan(): string {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('subscriptionPlan') || 'basic';
    }
    return 'basic';
  }

  hasPlanAccess(requiredPlan: string): boolean {
    const currentPlan = this.getSubscriptionPlan();
    
    const planHierarchy: Record<string, number> = {
      'basic': 1,
      'premium': 2,
      'imena': 3
    };

    // Ensure both plans exist in the hierarchy
    if (!planHierarchy[currentPlan] || !planHierarchy[requiredPlan]) {
      return false;
    }

    return planHierarchy[currentPlan] >= planHierarchy[requiredPlan];
  }

  hasPremiumAccess(): boolean {
    const plan = this.getSubscriptionPlan();
    return plan === 'premium' || plan === 'imena';
  }

  hasImenaAccess(): boolean {
    return this.getSubscriptionPlan() === 'imena';
  }
}