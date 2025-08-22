import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CookieService } from './cookie.service';

export interface AnalyticsProject {
  balanceSheetUrl: string;
  projectId: string;
  businessIdea: string;
  businessPlanUrl: string;
  businessIdeaDocumentUrl: string;
  clientName: string;
  category: string;
  description: string;
  cashFlowUrl: string;
  status: string;
  professionalStatus: string;
  projectName: string;
  haveSponsorQ: string;
  projectPurpose: string;
  projectLocation: string;
  projectPhotoUrl: string;
  doSellProjectQ: string;
  submittedOn: string;
  projectAmount: number;
  needOrgQ: string;
  pitchingVideoUrl: string;
  sponsorName: string;
  website: string;
  incomeStatementUrl: string;
  prototypeLink: string;
  projectStatus: string;
  updatedOn: string;
  linkedIn: string;
  monthlyIncome: number;
  specialityOfProject: string;
  phone: string;
  needSponsorQ: string;
  numberOfEmp: number;
  wantOriginToBusinessPlanQ: string;
  intellectualProjectQ: string;
  email: string;
  analyticProject: {
    analyticId: number;
    feasibility: number;
    monthlyIncome: number;
    feasibilityReason: string;
    annualIncome: number;
    roi: number;
    incomeDescription: string;
    totalView: number;
    bookmarks: number;
    interested: number;
    analyticsDocumentUrl: string;
    analyticsEnabled: boolean;
    price: number;
    costOfDevelopment: number;
    launchProject?: {
      user?: {
        id: string;
        name: string;
        nationalId: string;
        gender: string;
        nationality: string;
        professional: string;
        email: string;
        phone: string;
        password: string;
        enabled: boolean;
        verificationCode: string;
        codeExpiryAt: string;
        roles: string[];
        subscribed: boolean;
        photoUrl: string;
        tempEmail: string;
        subscriptions: any[];
        launchProjects: string[];
        bookmarks: any[];
        payments: any[];
        userRatting: any;
        active: boolean;
        authorities: any[];
        username: string;
        accountNonExpired: boolean;
        accountNonLocked: boolean;
        credentialsNonExpired: boolean;
      };
      bookmarks: any[];
      assignments: any[];
      analyticProject: string;
      projectId: string;
      clientName: string;
      professionalStatus: string;
      email: string;
      phone: string;
      linkedIn: string;
      projectName: string;
      category: string;
      description: string;
      projectLocation: string;
      projectStatus: string;
      projectPurpose: string;
      prototypeLink: string;
      numberOfEmp: number;
      monthlyIncome: number;
      website: string;
      incomeStatementUrl: string;
      cashFlowUrl: string;
      balanceSheetUrl: string;
      specialityOfProject: string;
      haveSponsorQ: string;
      sponsorName: string;
      needSponsorQ: string;
      needOrgQ: string;
      doSellProjectQ: string;
      projectAmount: number;
      intellectualProjectQ: string;
      wantOriginToBusinessPlanQ: string;
      businessIdea: string;
      submittedOn: string;
      updatedOn: string;
      projectType: string;
      projectPhotoUrl: string;
      pitchingVideoUrl: string;
      businessPlanUrl: string;
      businessIdeaDocumentUrl: string;
      status: string;
      countBookmark: number;
      countAssignment: number;
    };
  };
}

export interface AnalyticsDetails {
  analyticsId: number;
  feasibility: number;
  monthlyIncome: number;
  feasibilityReason: string;
  annualIncome: number;
  roi: number;
  incomeDescription: string;
  analyticsDocumentUrl: string;
  price: number;
  costOfDevelopment: number;
  projectId: string;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private cookieService: CookieService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.cookieService.getCookie('adminToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getAnalytics(): Observable<AnalyticsProject[]> {
    return this.http.get<AnalyticsProject[]>(`${this.apiUrl}/admin/project/pending/analytics`, {
      headers: this.getHeaders()
    });
  }

  getAnalyticsDetails(projectId: string): Observable<AnalyticsDetails> {
    return this.http.get<AnalyticsDetails>(`${this.apiUrl}/admin/project/see/analytics`, {
      params: {
        projectId: projectId
      },
      headers: this.getHeaders()
    });
  }
}