import { Injectable } from '@angular/core';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  constructor(private userService: UserService) {}

  async hasActiveSubscription(): Promise<boolean> {
    const profile = await this.userService.getProfileDetails().toPromise();
    return profile?.status === 'ACTIVE';
  }

  async getSubscriptionPlan(): Promise<string> {
    const profile = await this.userService.getProfileDetails().toPromise();
    return profile?.plan || 'BASIC';
  }

  async hasPlanAccess(requiredPlan: string): Promise<boolean> {
    const currentPlan = await this.getSubscriptionPlan();
    
    const planHierarchy: Record<string, number> = {
      'BASIC': 1,
      'PREMIUM': 2,
      'IMENA': 3
    };

    // Ensure both plans exist in the hierarchy
    if (!planHierarchy[currentPlan] || !planHierarchy[requiredPlan]) {
      return false;
    }

    return planHierarchy[currentPlan] >= planHierarchy[requiredPlan];
  }

  async hasPremiumAccess(): Promise<boolean> {
    const plan = await this.getSubscriptionPlan();
    return plan === 'PREMIUM' || plan === 'IMENA';
  }

  async hasImenaAccess(): Promise<boolean> {
    const plan = await this.getSubscriptionPlan();
    return plan === 'IMENA';
  }
}