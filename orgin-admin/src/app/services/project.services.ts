import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Project } from '../modules/project/project.module';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private apiUrl = `${environment.apiUrl}/projects`;

  constructor(private http: HttpClient) {}

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
}