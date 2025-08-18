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
    const userId = this.cookieService.getCookie('adminId');
    
    if (!userId) {
      throw new Error('User ID not found');
    }

    return this.http.get<AnalyticsProject[]>(`${this.apiUrl}/admin/all/launch/project`, {
      params: {
        userId: userId
      },
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