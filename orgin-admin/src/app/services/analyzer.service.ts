import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CookieService } from './cookie.service';

export interface Analyzer {
  id: string;
  name: string;
  email: string;
  phone: string;
  expertise: string;
  profileUrl: string;
  nationality: string;
  gender: string;
  nationalId: string;
  enabled: boolean;
}

// New interface for project analysts based on the API response
export interface ProjectAnalyzer {
  id: string;
  name: string;
  email: string;
  phone: string;
  expertise: string;
  profileUrl: string;
  nationality: string;
  gender: string;
  nationalId: string;
  enabled: boolean;
  assignedProjects: any; // This can be null or contain project data
}

export interface AnalyzerDetails {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone: string;
  expertise: string;
  profileUrl: string;
  nationality: string;
  gender: string;
  nationalId: string;
  enabled: boolean;
  verificationCode?: string;
  codeExpiryAt?: string;
  roles?: string[];
  assignedProjects: AssignedProject[];
  username?: string;
  authorities?: Authority[];
  accountNonExpired?: boolean;
  accountNonLocked?: boolean;
  credentialsNonExpired?: boolean;
}

export interface AssignedProject {
  projectId: string;
  projectName: string;
  description: string;
  status: string;
  projectPhotoUrl: string;
}

export interface Assignment {
  id: number;
  project: Project;
  analyzer: string;
}

export interface Project {
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
  user: User;
  bookmarks: Bookmark[];
  assignments: string[];
  analyticProject: AnalyticProject;
}

export interface User {
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
  subscriptions: Subscription[];
  launchProjects: string[];
  bookmarks: Bookmark[];
  payments: Payment[];
  userRatting: UserRating;
  username: string;
  authorities: Authority[];
  accountNonExpired: boolean;
  accountNonLocked: boolean;
  credentialsNonExpired: boolean;
}

export interface Bookmark {
  id: string;
  user: string;
  project: string;
  bookmarkedAt: string;
}

export interface Subscription {
  id: number;
  user: string;
  plan: string;
  startDate: string;
  endDate: string;
  status: string;
  payments: Payment;
}

export interface Payment {
  id: number;
  user: string;
  subscription: string;
  amount: number;
  paymentMethod: string;
  transactionId: string;
  status: string;
  paymentDate: string;
}

export interface UserRating {
  id: number;
  message: string;
  starNumber: number;
  status: string;
  users: string;
  rated: boolean;
}

export interface AnalyticProject {
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
  launchProject: string;
}

export interface Authority {
  authority: string;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyzerService {
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

  getAnalyzers(): Observable<Analyzer[]> {
    return this.http.get<Analyzer[]>(`${this.apiUrl}/admin/analyzers`, {
      headers: this.getHeaders()
    });
  }

  // New method to get analyzers assigned to a specific project
  getProjectAnalyzers(projectId: string): Observable<ProjectAnalyzer[]> {
    return this.http.get<ProjectAnalyzer[]>(`${this.apiUrl}/analyzer/project/analysts`, {
      params: {
        projectId: projectId
      },
      headers: this.getHeaders()
    });
  }

  getAnalyzerDetails(analyzerId: string): Observable<AnalyzerDetails> {
    return this.http.get<AnalyzerDetails>(`${this.apiUrl}/admin/analyzer/${analyzerId}`, {
      headers: this.getHeaders()
    });
  }

  registerAnalyzer(analyzerData: any): Observable<any> {
    // Transform the data to match backend expectations
    const transformedData = {
      name: analyzerData.name,
      email: analyzerData.email,
      phone: analyzerData.phoneNumber.replace(/\+/g, ''), // Remove + from country code
      expertise: analyzerData.expertise,
      nationality: analyzerData.nationality,
      gender: analyzerData.gender,
      nationalId: analyzerData.nationalId,
      password: analyzerData.password
    };

    return this.http.post(`${this.apiUrl}/admin/register/analyzer`, transformedData, {
      headers: this.getHeaders()
    });
  }

  toggleAnalyzerStatus(analyzerId: string): Observable<any> {
    // Use URL parameters instead of request body
    return this.http.post(`${this.apiUrl}/admin/enable/analyzer?analyzerId=${analyzerId}`, {}, {
      headers: this.getHeaders(),
      responseType: 'text'
    });
  }

  updateAnalyzer(analyzerId: string, analyzerData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/update/analyzer/${analyzerId}`, analyzerData, {
      headers: this.getHeaders(),
      responseType: 'text'
    });
  }
} 