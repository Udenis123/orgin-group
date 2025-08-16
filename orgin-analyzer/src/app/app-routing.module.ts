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
import { SubmittedLaunchedProjectsComponent } from './modules/project/submitted-projects/launched-projects/launched-projects.component';
import { AssignedLaunchedProjectsComponent } from './modules/project/assigned-projects/launched-projects/launched-projects.component';
import { ProjectDetailsComponent } from './modules/project/submitted-project-details/project-details.component';
import { AssignedProjectDetailsComponent } from './modules/project/assigned-project-details/assigned-project-details.component';
import { AddAnalyticsComponent } from './modules/project/add-analytics/add-analytics.component';

export const routes: Routes = [
  { 
    path: 'login', 
    component: LoginComponent,
    canActivate: [NoSessionGuard]  // Block access if logged in
  },
  {
    path: 'auth/forgot-password',
    component: ForgotPasswordComponent,
    canActivate: [NoSessionGuard]
  },
  {
    path: 'auth/verify-otp',
    component: VerifyOtpComponent,
    canActivate: [NoSessionGuard]
  },
  {
    path: 'auth/reset-password',
    component: ResetPasswordComponent,
    canActivate: [NoSessionGuard]
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
        component: ProfileComponent
      },
      {
        path: 'projects/submitted/details/:id',
        component: ProjectDetailsComponent
      },
      {
        path: 'projects/assigned/details/:id',
        component: AssignedProjectDetailsComponent
      },
      { 
        path: 'account/0/0/settings', 
        component: SettingsComponent
      },
      {
        path: 'page-not-found',
        component: PageNotFoundComponent,
        canActivate: [SessionGuard]
      },
    
     
      {
        path: 'projects/submitted/launched',
        component: SubmittedLaunchedProjectsComponent
      },
    
      {
        path: 'projects/assigned/launched',
        component: AssignedLaunchedProjectsComponent
      },
      
      
      // Default route
      { path: '', redirectTo: 'projects/submitted/launched', pathMatch: 'full' },
      {
        path: 'projects/add-analytics/:id',
        component: AddAnalyticsComponent
      },
    ]
  },

  // Default redirect to 'dashboard/project/buy' if logged in
  { path: '', redirectTo: 'dashboard/projects/submitted/launched', pathMatch: 'full' },

   // Wildcard route to handle unknown paths
  //{ path: '**', redirectTo: 'dashboard/page-not-found', pathMatch: 'full' },

 

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }