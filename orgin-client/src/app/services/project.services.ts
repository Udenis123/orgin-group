import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Project } from '../modules/project/project.module';
import { CookieService } from 'ngx-cookie-service';

// Helper to fetch a file from a URL and return a File object
async function urlToFile(
  url: string,
  filename: string,
  mimeType: string
): Promise<File> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }
    const data = await response.blob();
    return new File([data], filename, { type: mimeType });
  } catch (error) {
    console.warn(`Could not fetch file from ${url}, using empty file instead:`, error);
    // Return an empty file with the same name and type
    return new File([], filename, { type: mimeType });
  }
}

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private apiUrl = `${environment.apiUrl}/client/project`;

  constructor(private http: HttpClient, private cookieService: CookieService) {}

  async getUserProjects(): Promise<Project[]> {
    const token = this.cookieService.get('token');
    const userId = this.cookieService.get('userId');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    const projects = await this.http
      .get<Project[]>(`${this.apiUrl}/userId?user_id=${userId}`, { headers })
      .toPromise();
    return projects || [];
  }

  async getProjectById(id: string): Promise<Project> {
    const token = this.cookieService.get('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    const project = await this.http
      .get<Project>(`${this.apiUrl}/${id}`, { headers })
      .toPromise();
    if (!project) {
      throw new Error('Project not found');
    }
    return project;
  }

  async updateProject(
    id: string,
    projectData: any,
    files: { [key: string]: File | null },
    formValues: any
  ): Promise<any> {
    const token = this.cookieService.get('token');
    const formData = new FormData();

    // Add project details as JSON
    formData.append(
      'projectDetails',
      new Blob([JSON.stringify(projectData)], {
        type: 'application/json',
      })
    );

    // Helper to handle file or URL
    const handleFileField = async (
      field: string,
      formKey: string,
      defaultName: string,
      mimeType: string
    ) => {
      if (files[field]) {
        formData.append(formKey, files[field]!);
      } else if (
        typeof formValues[field] === 'string' &&
        formValues[field].startsWith('http')
      ) {
        try {
          // Get filename from URL
          const filename = decodeURIComponent(
            formValues[field].split('/').pop() || defaultName
          );
          const file = await urlToFile(formValues[field], filename, mimeType);
          // Only append if the file has content
          if (file.size > 0) {
            formData.append(formKey, file);
          } else {
            // If file is empty, preserve the URL
            formData.append(`${formKey}Url`, formValues[field]);
          }
        } catch (error) {
          console.warn(`Error handling file field ${field}:`, error);
          // Preserve the URL if file fetch fails
          formData.append(`${formKey}Url`, formValues[field]);
        }
      } else if (field === 'projectThumbnail' && formValues[field]) {
        // Handle case where project thumbnail URL exists but doesn't start with http
        formData.append('projectPhotoUrl', formValues[field]);
      }
    };

    await handleFileField(
      'businessPlan',
      'businessPlan',
      'businessPlan.pdf',
      'application/pdf'
    );
    await handleFileField(
      'businessIdeaDocument',
      'businessIdeaDocument',
      'businessIdeaDocument.pdf',
      'application/pdf'
    );
    await handleFileField(
      'projectThumbnail',
      'projectPhoto',
      'thumbnail.jpg',
      'image/jpeg'
    );
    await handleFileField(
      'incomeStatement',
      'incomeStatement',
      'incomeStatement.pdf',
      'application/pdf'
    );
    await handleFileField(
      'cashFlowStatement',
      'cashFlow',
      'cashFlowStatement.pdf',
      'application/pdf'
    );
    await handleFileField(
      'balanceSheet',
      'balanceSheet',
      'balanceSheet.pdf',
      'application/pdf'
    );
    await handleFileField(
      'pitchingVideo',
      'pitchingVideo',
      'pitchingVideo.mp4',
      'video/mp4'
    );

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    const response = await this.http
      .put(`${this.apiUrl}/update?projectId=${id}`, formData, {
        headers,
        responseType: 'text',
      })
      .toPromise();

    if (!response) {
      throw new Error('Update failed: No response from server');
    }
    return response;
  }

  async uploadFile(
    file: File,
    fieldName: string,
    projectId: string
  ): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('field', fieldName);

    const response = await this.http
      .post<{ url: string }>(`${this.apiUrl}/upload`, formData)
      .toPromise();

    if (!response) {
      throw new Error('Upload failed: No response from server');
    }

    return response.url;
  }

  async launchProject(
    projectData: any,
    files: { [key: string]: File | null }
  ): Promise<any> {
    const token = this.cookieService.get('token');
    const userId = this.cookieService.get('userId');

    const formData = new FormData();

    // Add project details as JSON
    formData.append(
      'projectDetails',
      new Blob([JSON.stringify(projectData)], {
        type: 'application/json',
      })
    );

    // Add userId
    formData.append('userId', userId);

    // Add all files
    if (files['businessPlan'])
      formData.append('businessPlan', files['businessPlan']);
    if (files['businessIdeaDocument'])
      formData.append('businessIdeaDocument', files['businessIdeaDocument']);
    if (files['projectThumbnail'])
      formData.append('projectPhoto', files['projectThumbnail']);
    if (files['incomeStatement'])
      formData.append('incomeStatement', files['incomeStatement']);
    if (files['cashFlowStatement'])
      formData.append('cashFlow', files['cashFlowStatement']);
    if (files['balanceSheet'])
      formData.append('balanceSheet', files['balanceSheet']);
    if (files['pitchingVideo'])
      formData.append('pitchingVideo', files['pitchingVideo']);

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http
      .post(`${this.apiUrl}/upload`, formData, {
        headers,
        responseType: 'text',
      })
      .toPromise();
  }

  async getProjectAnalytics(projectId: string): Promise<any> {
    const token = this.cookieService.get('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http
      .get<any>(`${this.apiUrl}/${projectId}/analytics`, { headers })
      .toPromise();
  }

  // Ordered Project Methods
  async createOrderedProject(
    projectData: any,
    files: { [key: string]: File | null }
  ): Promise<any> {
    const token = this.cookieService.get('token');
    const userId = this.cookieService.get('userId');

    const formData = new FormData();

    // Add userId
    formData.append('userId', userId);

    // Add project details as JSON
    formData.append(
      'dto',
      new Blob([JSON.stringify(projectData)], {
        type: 'application/json',
      })
    );

    // Add files if they exist
    if (files['businessIdeaDocument']) {
      formData.append('businessIdeaDocument', files['businessIdeaDocument']);
    }
    if (files['businessPlanDocument']) {
      formData.append('businessPlanDocument', files['businessPlanDocument']);
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http
      .post(`${environment.apiUrl}/api/ordered-projects`, formData, {
        headers,
      })
      .toPromise();
  }

  async getUserOrderedProjects(): Promise<any[]> {
    const token = this.cookieService.get('token');
    const userId = this.cookieService.get('userId');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    const projects = await this.http
      .get<any[]>(`${environment.apiUrl}/api/ordered-projects/user?userId=${userId}`, { headers })
      .toPromise();
    return projects || [];
  }

  async getOrderedProjectById(projectId: string): Promise<any> {
    const token = this.cookieService.get('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    const project = await this.http
      .get<any>(`${environment.apiUrl}/api/ordered-projects/${projectId}`, { headers })
      .toPromise();
    if (!project) {
      throw new Error('Ordered project not found');
    }
    return project;
  }

  async updateOrderedProject(
    projectId: string,
    projectData: any,
    files: { [key: string]: File | null }
  ): Promise<any> {
    const token = this.cookieService.get('token');
    const formData = new FormData();

    // Add project details as JSON
    formData.append(
      'dto',
      new Blob([JSON.stringify(projectData)], {
        type: 'application/json',
      })
    );

    // Add files if they exist
    if (files['businessIdeaDocument']) {
      formData.append('businessIdeaDocument', files['businessIdeaDocument']);
    }
    if (files['businessPlanDocument']) {
      formData.append('businessPlanDocument', files['businessPlanDocument']);
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http
      .put(`${environment.apiUrl}/api/ordered-projects/${projectId}`, formData, {
        headers,
        responseType: 'text',
      })
      .toPromise();
  }

  async deleteOrderedProject(projectId: string): Promise<any> {
    const token = this.cookieService.get('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http
      .delete(`${environment.apiUrl}/api/ordered-projects/${projectId}`, { headers })
      .toPromise();
  }

  // Joined Project Methods
  async getUserJoinedProjects(): Promise<any[]> {
    const token = this.cookieService.get('token');
    const userId = this.cookieService.get('userId');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    const projects = await this.http
      .get<any[]>(`${environment.apiUrl}/api/joined-projects/user?userId=${userId}`, { headers })
      .toPromise();
    return projects || [];
  }

  async getJoinedProjectById(projectId: string): Promise<any> {
    const token = this.cookieService.get('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    const project = await this.http
      .get<any>(`${environment.apiUrl}/api/joined-projects/${projectId}`, { headers })
      .toPromise();
    if (!project) {
      throw new Error('Joined project not found');
    }
    return project;
  }

  // Community Project Methods
  async createCommunityProject(
    projectData: {
      fullName: string;
      profession: string;
      email: string;
      phone: string;
      linkedIn: string;
      projectName: string;
      category: string;
      location: string;
      description: string;
      team: Array<{ title: string; number: number; wageType: string; wage: string }>;
    },
    projectPhoto: File | null
  ): Promise<any> {
    const token = this.cookieService.get('token');
    const userId = this.cookieService.get('userId');

    const formData = new FormData();

    // Add userId as query parameter
    const url = `${environment.apiUrl}/community/project?userId=${userId}`;

    // Add project data as JSON
    formData.append(
      'project',
      new Blob([JSON.stringify(projectData)], {
        type: 'application/json',
      })
    );

    // Add project photo if provided
    if (projectPhoto) {
      formData.append('projectPhoto', projectPhoto);
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http
      .post(url, formData, {
        headers,
        responseType: 'text',
      })
      .toPromise();
  }

  async getUserCommunityProjects(): Promise<any[]> {
    const token = this.cookieService.get('token');
    const userId = this.cookieService.get('userId');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    const projects = await this.http
      .get<any[]>(`${environment.apiUrl}/community/project/user/${userId}`, { headers })
      .toPromise();
    return projects || [];
  }

  async getCommunityProjectById(projectId: string): Promise<any> {
    const token = this.cookieService.get('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    const project = await this.http
      .get<any>(`${environment.apiUrl}/community/project/${projectId}`, { headers })
      .toPromise();
    if (!project) {
      throw new Error('Community project not found');
    }
    return project;
  }

  async addTeamMemberToCommunityProject(projectId: string, teamMember: { title: string; number: number; wageType: string; wage: string }): Promise<any> {
    const token = this.cookieService.get('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    return this.http
      .post<any>(`${environment.apiUrl}/community/project/${projectId}/team-members`, teamMember, { headers })
      .toPromise();
  }

  async deleteCommunityProject(projectId: string): Promise<any> {
    const token = this.cookieService.get('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http
      .delete<any>(`${environment.apiUrl}/community/project/${projectId}`, { headers })
      .toPromise();
  }

  async deleteTeamMember(projectId: string, index: number): Promise<any> {
    const token = this.cookieService.get('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http
      .delete<any>(`${environment.apiUrl}/community/project/${projectId}/team-members/${index}`, { headers })
      .toPromise();
  }

  async updateTeamMember(projectId: string, index: number, teamMember: { title: string; number: number; wageType: string; wage: string }): Promise<any> {
    const token = this.cookieService.get('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    return this.http
      .put<any>(`${environment.apiUrl}/community/project/${projectId}/team-members/${index}`, teamMember, { headers })
      .toPromise();
  }

  async updateCommunityProject(
    projectId: string,
    projectData: {
      fullName: string;
      profession: string;
      email: string;
      phone: string;
      linkedIn: string;
      projectName: string;
      category: string;
      location: string;
      description: string;
    }
  ): Promise<any> {
    const token = this.cookieService.get('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    return this.http
      .put(`${environment.apiUrl}/community/project/${projectId}`, projectData, {
        headers,
        responseType: 'text',
      })
      .toPromise();
  }

  async deleteLaunchedProject(projectId: string): Promise<any> {
    const token = this.cookieService.get('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http
      .delete<any>(`${this.apiUrl}/${projectId}`, { headers })
      .toPromise();
  }

  // Resubmit methods for QUERY status projects
  async resubmitCommunityProject(projectId: string): Promise<any> {
    const token = this.cookieService.get('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http
      .post<any>(`${environment.apiUrl}/community/project/${projectId}/resubmit`, {}, { headers })
      .toPromise();
  }

  async resubmitLaunchedProject(projectId: string): Promise<any> {
    const token = this.cookieService.get('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http
      .post<any>(`${this.apiUrl}/${projectId}/resubmit`, {}, { headers })
      .toPromise();
  }

  async resubmitOrderedProject(projectId: string): Promise<any> {
    const token = this.cookieService.get('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http
      .post<any>(`${environment.apiUrl}/api/ordered-projects/${projectId}/resubmit`, {}, { headers })
      .toPromise();
  }
}
