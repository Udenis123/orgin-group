import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-subscription-plan',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './subscription-plan.component.html',
  styleUrl: './subscription-plan.component.scss'
})
export class SubscriptionPlanComponent {
  constructor(private router: Router) {}

  selectPlan(plan: string) {
    if (plan === 'basic') {
      this.router.navigate(['dashboard', 'checkout', 'basic']);
    } else if (plan === 'premium') {
      this.router.navigate(['dashboard', 'checkout', 'premium']);    
    } else if (plan === 'imena') {
      this.router.navigate(['dashboard', 'checkout', 'imena']);    
    }
  }
}
