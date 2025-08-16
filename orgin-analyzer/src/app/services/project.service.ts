import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpEventType } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../environments/environment';
import { isPlatformBrowser } from '@angular/common';
import { map } from 'rxjs/operators';

export interface LaunchProjectResponse {
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
  submittedOn: Date;
  projectAmount: number;
  needOrgQ: string;
  pitchingVideoUrl: string;
  sponsorName: string;
  website: string;
  incomeStatementUrl: string;
  prototypeLink: string;
  projectStatus: string;
  updatedOn: Date;
  linkedIn: string;
  monthlyIncome: number;
  specialityOfProject: string;
  phone: string;
  needSponsorQ: string;
  numberOfEmp: number;
  wantOriginToBusinessPlanQ: string;
  intellectualProjectQ: string;
  email: string;
  feedback?: string;
}

export interface AnalyzerInfo {
  analyzerId: string;
  name: string;
  email: string;
  phone: string;
  expertise: string;
}

export interface AnalyticsResponse {
  analyticsId: number;
  feasibility: number;
  monthlyIncome: number;
  feasibilityReason: string;
  annualIncome: number;
  roi: number;
  incomeDescription: string;
  price: number;
  costOfDevelopment: number;
  analyticsDocumentUrl: string;
  projectId: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private apiUrl = environment.apiUrl;
  private pendingProjectsSubject = new BehaviorSubject<LaunchProjectResponse[]>(
    []
  );
  private assignedProjectsSubject = new BehaviorSubject<
    LaunchProjectResponse[]
  >([]);

  constructor(
    private http: HttpClient, 
    private cookieService: CookieService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.cookieService.get('analyzerToken');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  getAllPendingProjects(): Observable<LaunchProjectResponse[]> {
    this.http
      .get<LaunchProjectResponse[]>(`${this.apiUrl}/analyzer/pending/project`, {
        headers: this.getHeaders(),
      })
      .subscribe({
        next: (projects) => this.pendingProjectsSubject.next(projects),
        error: (error) =>
          console.error('Error fetching pending projects:', error),
      });
    return this.pendingProjectsSubject.asObservable();
  }

  getPendingProjectById(projectId: string): LaunchProjectResponse | undefined {
    return this.pendingProjectsSubject.value.find(
      (p) => p.projectId === projectId
    );
  }

  getAssignedProjectById(projectId: string): LaunchProjectResponse | undefined {
    return this.assignedProjectsSubject.value.find(
      (p) => p.projectId === projectId
    );
  }

  getProjectById(projectId: string): LaunchProjectResponse | undefined {
    return (
      this.getPendingProjectById(projectId) ||
      this.getAssignedProjectById(projectId)
    );
  }

  assignProject(projectId: string): Observable<any> {
    const analyzerId = this.cookieService.get('analyzerUserId');
    if (!analyzerId) {
      throw new Error('Analyzer ID not found in cookies');
    }

    const params = new HttpParams()
      .set('projectId', projectId)
      .set('analyzerId', analyzerId);

    return this.http.post(`${this.apiUrl}/analyzer/project/assigment`, null, {
      headers: this.getHeaders(),
      params: params,
    });
  }

  unassignProject(projectId: string): Observable<any> {
    const analyzerId = this.cookieService.get('analyzerUserId');
    if (!analyzerId) {
      throw new Error('Analyzer ID not found in cookies');
    }

    const params = new HttpParams()
      .set('projectId', projectId)
      .set('analyzerId', analyzerId);

    return this.http.delete(`${this.apiUrl}/analyzer/project/assigment`, {
      headers: this.getHeaders(),
      params: params,
    });
  }

  getAllAssignedProjects(): Observable<LaunchProjectResponse[]> {
    const analyzerId = this.cookieService.get('analyzerUserId');
    if (!analyzerId) {
      throw new Error('Analyzer ID not found in cookies');
    }

    this.http
      .get<LaunchProjectResponse[]>(
        `${this.apiUrl}/analyzer/project/assigment`,
        {
          headers: this.getHeaders(),
          params: { analyzerId: analyzerId },
        }
      )
      .subscribe({
        next: (projects) => this.assignedProjectsSubject.next(projects),
        error: (error) =>
          console.error('Error fetching assigned projects:', error),
      });
    return this.assignedProjectsSubject.asObservable();
  }

  getProjectAnalysts(projectId: string): Observable<AnalyzerInfo[]> {
    return this.http.get<AnalyzerInfo[]>(
      `${this.apiUrl}/analyzer/project/analysts`,
      {
        headers: this.getHeaders(),
        params: { projectId: projectId },
      }
    );
  }

  getProjectAnalytics(projectId: string): Observable<AnalyticsResponse> {
    return this.http.get<AnalyticsResponse>(
      `${this.apiUrl}/analyzer/project/get/analytics`,
      {
        headers: this.getHeaders(),
        params: { projectId: projectId },
      }
    );
  }

  addProjectAnalytics(formData: FormData): Observable<any> {
    const token = this.cookieService.get('analyzerToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.post(
      `${this.apiUrl}/analyzer/project/add/analytics`,
      formData,
      { headers }
    );
  }

  updateProjectAnalytics(formData: FormData): Observable<any> {
    const token = this.cookieService.get('analyzerToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.put(
      `${this.apiUrl}/analyzer/project/update/analytics`,
      formData,
      { headers }
    );
  }

  declineProject(projectId: string, feedback: string): Observable<any> {
    const analyzerId = this.cookieService.get('analyzerUserId');
    if (!analyzerId) {
      throw new Error('Analyzer ID not found in cookies');
    }

    const params = new HttpParams()
      .set('projectId', projectId)
      .set('analyzerId', analyzerId)
      .set('feedback', feedback);

    return this.http.post(`${this.apiUrl}/analyzer/project/decline`, null, {
      headers: this.getHeaders(),
      params: params,
    });
  }

  enableAnalyticsOfProject(projectId: string): Observable<any> {
    const params = new HttpParams().set('projectId', projectId);

    return this.http.post(`${this.apiUrl}/analyzer/project/completed`, null, {
      headers: this.getHeaders(),
      params: params,
    });
  }

  refreshProjects() {
    this.getAllPendingProjects();
    this.getAllAssignedProjects();
  }

  downloadFile(url: string, filename: string): Observable<Blob> {
    const token = this.cookieService.get('analyzerToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/octet-stream'
    });

    // Check if the URL is a direct file URL or needs to be processed through the API
    let downloadUrl: string;
    if (url.includes('/api/files/')) {
      // If it's already a direct file URL, use it as is
      downloadUrl = url;
    } else {
      // Extract file ID from the URL or use the full URL as the ID
      const fileId = url.split('/').pop() || url;
      downloadUrl = `${this.apiUrl}/analyzer/project/file/${fileId}`;
    }

    return this.http.get(downloadUrl, {
      headers: headers,
      responseType: 'blob',
      observe: 'response'
    }).pipe(
      map(response => {
        const contentDisposition = response.headers.get('content-disposition');
        const suggestedFilename = contentDisposition
          ? contentDisposition.split('filename=')[1].replace(/"/g, '')
          : filename;
        
        const blob = response.body;
        if (!blob) {
          throw new Error('No file content received');
        }
        
        // Create blob URL and trigger download
        if (isPlatformBrowser(this.platformId)) {
          const blobUrl = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.style.display = 'none';
          link.href = blobUrl;
          link.download = suggestedFilename;
          
          // Append to body, click and remove
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // Clean up blob URL
          window.URL.revokeObjectURL(blobUrl);
        }
        
        return blob;
      })
    );
  }
}
