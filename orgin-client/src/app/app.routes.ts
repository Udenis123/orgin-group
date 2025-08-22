import { Routes } from '@angular/router';
import { LoginComponent } from './modules/auth/login/login.component';
import { SignupComponent } from './modules/auth/signup/signup.component';
import { BuyComponent } from './modules/project/buy/buy.component';
import { InvestComponent } from './modules/project/invest/invest.component';
import { ProjectLaunchComponent } from './modules/project/initiating-project/project-launch/project-launch.component';
import { ProjectOrderComponent } from './modules/project/initiating-project/project-order/project-order.component';
import { SubscriptionPlanComponent } from './modules/subscription/subscription-plan/subscription-plan.component';
import { SessionGuard } from './guards/session.guard';
import { NoSessionGuard } from './guards/no-session.guard';
import { BookmarkedComponent } from './modules/project/bookmarked/bookmarked.component';
import { DashboardComponent } from './modules/dashboard/dashboard/dashboard.component'; // Import dashboard component
import { ProfileComponent } from './modules/dashboard/profile/profile.component';
import { SettingsComponent } from './modules/dashboard/settings/settings.component';
import { SubscriptionGuard } from './guards/subscription.guard';
import { AnalyticsComponent } from './modules/analytics/analytics.component';
import { PageNotFoundComponent } from './shared/page-not-found/page-not-found.component';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PremiumCheckoutComponent } from './shared/plans/premium-checkout/premium-checkout.component';
import { ImenaCheckoutComponent } from './shared/plans/imena-checkout/imena-checkout.component';
import { EmailOtpValidationComponent } from './modules/auth/email-otp-validation/email-otp-validation.component';
import { SchedulingComponent } from './shared/scheduling/scheduling.component';
import { FinishPaymentComponent } from './shared/finish-payment/finish-payment.component';
import { MyProjectsComponent } from './modules/project/my-projects/my-projects.component';
import { AppointmentsComponent } from './modules/appointments/appointments.component';
import { UpdateAppointmentComponent } from './modules/appointments/update-appointment/update-appointment.component';
import { ProjectDetailsComponent } from './modules/project/project-details/project-details.component';
import { LaunchedProjectUpdateComponent } from './modules/project/project-update/launched/launched.component';
import { FromSignupGuard } from './guards/from-signup.guard';
import { BasicCheckoutComponent } from './shared/plans/basic-checkout/basic-checkout.component';
import { ForgotPasswordComponent } from './modules/auth/forgot-password/forgot-password.component';
import { VerifyOtpComponent } from './modules/auth/verify-otp/verify-otp.component';
import { ResetPasswordComponent } from './modules/auth/reset-password/reset-password.component';
import { OrderedProjectUpdateComponent } from './modules/project/project-update/ordered/ordered.component';
import { CommunityProjectUpdateComponent } from './modules/project/project-update/community/community.component';
import { LaunchCommunityProjectComponent } from './modules/project/initiating-project/launch-community-project/launch-community-project.component';
import { JoinProjectComponent } from './modules/project/join-project/join-project.component';
import { BookmarkingComponent } from './modules/bookmarking/bookmarking.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [NoSessionGuard], // Block access if logged in
  },
  {
    path: 'signup',
    component: SignupComponent,
    canActivate: [NoSessionGuard], // Block access if logged in
  },
  {
    path: 'auth/forgot-password',
    component: ForgotPasswordComponent,
    canActivate: [NoSessionGuard],
  },
  {
    path: 'auth/verify-otp',
    component: VerifyOtpComponent,
    canActivate: [NoSessionGuard],
  },
  {
    path: 'auth/reset-password',
    component: ResetPasswordComponent,
    canActivate: [NoSessionGuard],
  },
  {
    path: 'auth/0/1/0/a/e/now/verify-email',
    component: EmailOtpValidationComponent,
    canActivate: [NoSessionGuard, FromSignupGuard],
    data: { fromSignup: true },
    title: 'Verify Email',
  },

  // Protected route for dashboard
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [SessionGuard],
    children: [
      // Basic Plan Routes
      {
        path: 'project/launch',
        component: ProjectLaunchComponent,
        canActivate: [SubscriptionGuard],
        data: { requiredPlan: 'BASIC' },
      },
      {
        path: 'project/buy/:id',
        component: BuyComponent,
        canActivate: [SubscriptionGuard],
        data: { requiredPlan: 'BASIC' },
      },
      {
        path: 'project/join/:id',
        component: JoinProjectComponent,
        canActivate: [SubscriptionGuard],
        data: { requiredPlan: 'BASIC' },
      },

      // Premium Plan Routes
      {
        path: 'analytics/:id',
        component: AnalyticsComponent,
        canActivate: [SubscriptionGuard],
        data: { requiredPlan: 'PREMIUM' },
      },
      {
        path: 'project/invest/:id',
        component: InvestComponent,
        canActivate: [SubscriptionGuard],
        data: { requiredPlan: 'PREMIUM' },
      },
      {
        path: 'project/order',
        component: ProjectOrderComponent,
        canActivate: [SubscriptionGuard],
        data: { requiredPlan: 'PREMIUM' },
      },
      {
        path: 'project/launch-community',
        component: LaunchCommunityProjectComponent,
        canActivate: [SubscriptionGuard],
        data: { requiredPlan: 'PREMIUM' },
      },
      {
        path: 'schedule/:type/:id',
        component: SchedulingComponent,
        canActivate: [SubscriptionGuard],
        data: { requiredPlan: 'PREMIUM' },
      },
      {
        path: 'appointments',
        component: AppointmentsComponent,
        canActivate: [SubscriptionGuard],
        data: { requiredPlan: 'PREMIUM' },
      },
      {
        path: 'appointments/update/:id',
        component: UpdateAppointmentComponent,
        canActivate: [SubscriptionGuard],
        data: { requiredPlan: 'PREMIUM' },
      },
      {
        path: 'project/update/launched/:id',
        component: LaunchedProjectUpdateComponent,
        canActivate: [SubscriptionGuard],
        data: { requiredPlan: 'BASIC' },
      },
      {
        path: 'project/update/ordered/:id',
        component: OrderedProjectUpdateComponent,
        canActivate: [SubscriptionGuard],
        data: { requiredPlan: 'PREMIUM' },
      },
      // Payment Route
      {
        path: 'finish-payment',
        component: FinishPaymentComponent,
      },
      {
        path: 'project/update/community/:id',
        component: CommunityProjectUpdateComponent,
        canActivate: [SubscriptionGuard],
        data: { requiredPlan: 'PREMIUM' },
      },

      // Common Routes (accessible to all plans)
      {
        path: 'account/0/1/profile',
        component: ProfileComponent,
      },
      {
        path: 'account/0/0/settings',
        component: SettingsComponent,
      },
      {
        path: 'project/bookmarked',
        component: BookmarkedComponent,
      },
      {
        path: 'project/bookmarked/:id',
        component: BookmarkedComponent,
      },
      {
        path: 'project/my-projects',
        component: MyProjectsComponent,
      },
      {
        path: 'project/details/:id',
        component: ProjectDetailsComponent,
      },
      {
        path: 'subscription/plan',
        component: SubscriptionPlanComponent,
      },

      // Checkout Routes
      {
        path: 'checkout/basic',
        component: BasicCheckoutComponent,
      },
      {
        path: 'page-not-found',
        component: PageNotFoundComponent,
        canActivate: [SessionGuard],
      },
      {
        path: 'checkout/premium',
        component: PremiumCheckoutComponent,
      },
      {
        path: 'checkout/imena',
        component: ImenaCheckoutComponent,
      },
      {
        path: 'bookmarking/:id',
        component: BookmarkingComponent,
      },

      // Default route
      { path: '', redirectTo: 'project/launch', pathMatch: 'full' },
    ],
  },

  // Default redirect to 'dashboard/project/buy' if logged in
  { path: '', redirectTo: 'dashboard/project/launch', pathMatch: 'full' },

  // Wildcard route to handle unknown paths
  { path: '**', redirectTo: 'dashboard/page-not-found', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
