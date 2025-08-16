import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface HomeProjectResponse {
  projectId: string;
  projectName: string;
  projectDescription: string;
  linkedInUrl: string;
  projectUrl: string;
  analyticStatus: string;
  clientName: string;
  category: string;
  projectPurpose: string;
  projectFinancialCategory: string;
  projectType?: string; // Add this field if backend supports it
}

export interface Project {
  id: string;
  name: string;
  owner: string;
  projectType: 'launched' | 'community';
  requiredMembers?: string[]; // For community projects
  description: string;
  image: string;
  category?: string;
  businessField?: string;
  location?: string;
  purpose?: 'invest' | 'buy with ownership' | 'buy without ownership';
  financialCategory?: string;
  status?: string;
  feasibilityLocation?: string;
  linkedin?: string;
}

export interface UserRating {
  id: string;
  userId: string;
  userName: string;
  userPhoto: string;
  message: string;
  starNumber: number;
  isApproved: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class HomeService {
  private apiUrl = environment.apiUrl + '/auth/launch/project';
  private ratingsUrl = environment.apiUrl + '/auth/ratings';

  constructor(private http: HttpClient) {}

  getHomeProjects(): Observable<Project[]> {
    return this.http
      .get<HomeProjectResponse[]>(this.apiUrl)
      .pipe(
        map((responses) =>
          responses.map((response) =>
            this.mapHomeProjectResponseToProject(response)
          )
        )
      );
  }

  getUniqueCategories(): Observable<string[]> {
    return this.getHomeProjects().pipe(
      map((projects) => {
        const categories = projects
          .map((project) => project.category)
          .filter((category): category is string => !!category); // Filter out undefined/null
        return [...new Set(categories)]; // Get unique categories
      })
    );
  }

  getRatings(): Observable<UserRating[]> {
    return this.http.get<UserRating[]>(this.ratingsUrl);
  }

  private mapHomeProjectResponseToProject(
    response: HomeProjectResponse
  ): Project {
    return {
      id: response.projectId,
      name: response.projectName,
      owner: response.clientName,
      projectType:
        (response.projectType as 'launched' | 'community') || 'launched',
      description: response.projectDescription,
      image: response.projectUrl,
      category: response.category,
      businessField: '',
      location: '',
      purpose: response.projectPurpose as
        | 'invest'
        | 'buy with ownership'
        | 'buy without ownership',
      financialCategory: response.projectFinancialCategory,
      status: response.analyticStatus?.toLowerCase(),
      feasibilityLocation: '',
      linkedin: response.linkedInUrl,
    };
  }
}
