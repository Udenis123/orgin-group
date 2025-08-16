import { Routes } from '@angular/router';
import { BusinessProjectsComponent } from "./business-projects/business-projects/business-projects.component"
import { AboutComponent } from './about/about/about.component';
import { ContactComponent } from './contact/contact/contact.component';
import { PageNotFoundComponent } from './shared/page-not-found/page-not-found.component';
import { ArticleDetailsComponent } from './articles/article-details.component';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./business-projects/business-projects/business-projects.component').then(m => m.BusinessProjectsComponent) },
  { path: 'community-projects', loadComponent: () => import('./business-projects/community-projects/community-projects.component').then(m => m.CommunityProjectsComponent) },
  { path: 'about', component: AboutComponent },
  { path: 'contact', component: ContactComponent },
  { 
    path: 'legal/privacy-policy',
    loadComponent: () => import('./legal/privacy-policy/privacy-policy.component')
      .then(m => m.PrivacyPolicyComponent)
  },
  { 
    path: 'legal/terms-and-conditions',
    loadComponent: () => import('./legal/terms-and-conditions/terms-and-conditions.component')
      .then(m => m.TermsAndConditionsComponent)
  },
  { path: 'articles/:id', component: ArticleDetailsComponent },
  { path: 'i2v-program', loadComponent: () => import('./i2v-program/i2v-program/i2v-program.component').then(m => m.I2vProgramComponent) },
  { path: '**', component: PageNotFoundComponent } // Handles unknown routes
];
