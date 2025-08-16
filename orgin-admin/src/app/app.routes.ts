import { Routes } from '@angular/router';
import { LoginComponent } from './modules/auth/login/login.component';
import { SessionGuard } from './guards/session.guard';
import { NoSessionGuard } from './guards/no-session.guard';
import { ProfileComponent } from './modules/dashboard/profile/profile.component';
import { SettingsComponent } from './modules/dashboard/settings/settings.component';
import { PageNotFoundComponent } from './shared/page-not-found/page-not-found.component';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ForgotPasswordComponent } from './modules/auth/forgot-password/forgot-password.component';
import { VerifyOtpComponent } from './modules/auth/verify-otp/verify-otp.component';
import { ResetPasswordComponent } from './modules/auth/reset-password/reset-password.component';
import { DashboardComponent } from './modules/dashboard/dashboard/dashboard.component';
import { SubmittedOrderedProjectsComponent } from './modules/project/submitted-projects/ordered-projects/ordered-projects.component';
import { SubmittedCommunityProjectsComponent } from './modules/project/submitted-projects/community-projects/community-projects.component';
import { ProjectsLaunchedComponent } from './modules/project/all/launched-projects/launched-projects.component';
import { ProjectsOrderedComponent } from './modules/project/all/ordered-projects/ordered-projects.component';
import { ProjectsCommunityComponent } from './modules/project/all/community-projects/community-projects.component';
import { AnalyzerComponent } from './modules/users/analyzer/analyzer.component';
import { ClientsComponent } from './modules/users/clients/clients.component';
import { NewAnalyzerComponent } from './modules/users/new-analyzer/new-analyzer.component';
import { UpdateAnalyzerComponent } from './modules/update-users/update-analyzer/update-analyzer.component';
import { UpdateClientComponent } from './modules/update-users/update-client/update-client.component';
import { AnalyzerDetailsComponent } from './modules/user-details/analyzer-details/analyzer-details.component';
import { ClientDetailsComponent } from './modules/user-details/client-details/client-details.component';
import { LaunchedProjectDetailsComponent } from './modules/project-details/launched-project-details/launched-project-details.component';
import { ClientFeedbackApprovalComponent } from './modules/client-feedback-approval/client-feedback-approval.component';
import { FeedbackDetailsComponent } from './modules/feedback-details/feedback-details.component';
import { IncomingAppointmentsComponent } from './modules/appointment-management/incoming-appointments/incoming-appointments.component';
import { ScheduledAppointmentsComponent } from './modules/appointment-management/scheduled-appointments/scheduled-appointments.component';
import { AppointmentDetailsComponent } from './modules/appointment-management/appointment-details/appointment-details.component';
import { AnalyticsComponent } from './modules/analytics/analytics/analytics.component';
import { AnalyticsDetailsComponent } from './modules/analytics/analytics-details/analytics-details.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
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

  // Protected route for dashboard
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [SessionGuard],
    children: [
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
        path: 'page-not-found',
        component: PageNotFoundComponent,
        canActivate: [SessionGuard],
      },

      {
        path: 'projects/submitted/ordered',
        component: SubmittedOrderedProjectsComponent,
      },
      {
        path: 'projects/submitted/community',
        component: SubmittedCommunityProjectsComponent,
      },
      {
        path: 'projects/launched',
        component: ProjectsLaunchedComponent,
      },
      {
        path: 'projects/ordered',
        component: ProjectsOrderedComponent,
      },
      {
        path: 'projects/community',
        component: ProjectsCommunityComponent,
      },
      {
        path: 'users/all/analyzers',
        component: AnalyzerComponent,
      },
      {
        path: 'feedback-approval',
        component: ClientFeedbackApprovalComponent,
      },
      {
        path: 'feedback-details/:id',
        component: FeedbackDetailsComponent,
      },

      {
        path: 'users/all/clients',
        component: ClientsComponent,
      },
      {
        path: 'users/new/analyzer',
        component: NewAnalyzerComponent,
      },
      {
        path: 'update/users/analyzer/:id',
        component: UpdateAnalyzerComponent,
      },
      {
        path: 'update/users/client/:id',
        component: UpdateClientComponent,
      },
      {
        path: 'details/users/analyzer/:id',
        component: AnalyzerDetailsComponent,
      },
      {
        path: 'details/users/client/:id',
        component: ClientDetailsComponent,
      },
      {
        path: 'project/details/:id',
        component: LaunchedProjectDetailsComponent,
      },

      {
        path: 'appointments/incoming',
        component: IncomingAppointmentsComponent,
      },
      {
        path: 'appointments/scheduled',
        component: ScheduledAppointmentsComponent,
      },
      {
        path: 'appointments/details/:id',
        component: AppointmentDetailsComponent,
      },

      {
        path: 'analytics',
        component: AnalyticsComponent,
      },
      {
        path: 'analytics/details/:id',
        component: AnalyticsDetailsComponent,
      },

      // Default route
      { path: '', redirectTo: 'projects/launched', pathMatch: 'full' },
    ],
  },

  // Default redirect to 'dashboard/project/buy' if logged in
  { path: '', redirectTo: 'dashboard/projects/launched', pathMatch: 'full' },

  // Wildcard route to handle unknown paths
  { path: '**', redirectTo: 'login', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
