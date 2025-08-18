import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CookieService } from './cookie.service';

export interface Project {
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
  feedback: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private apiUrl = `${environment.apiUrl}/projects`;

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

  async getProjectById(id: string): Promise<Project> {
    const project = await this.http.get<Project>(`${this.apiUrl}/${id}`).toPromise();
    if (!project) {
        throw new Error('Project not found');
    }
    return project;
  }

  async updateProject(id: string, project: Project): Promise<Project> {
    const updatedProject = await this.http.put<Project>(`${this.apiUrl}/${id}`, project).toPromise();
    if (!updatedProject) {
        throw new Error('Update failed: No response from server');
    }
    return updatedProject;
  }

  async uploadFile(file: File, fieldName: string, projectId: string): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('field', fieldName);
    
    const response = await this.http.post<{ url: string }>(
      `${this.apiUrl}/${projectId}/upload`,
      formData
    ).toPromise();
    
    if (!response) {
      throw new Error('Upload failed: No response from server');
    }
    
    return response.url;
  }

  getAllLaunchedProjects(): Observable<Project[]> {
    const userId = this.cookieService.getCookie('adminId');
    
    if (!userId) {
      throw new Error('User ID not found');
    }

    return this.http.get<Project[]>(`${environment.apiUrl}/admin/all/launch/project`, {
      params: {
        userId: userId
      },
      headers: this.getHeaders()
    });
  }
}