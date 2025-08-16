import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../environments/environment';

export interface BookmarkedProject {
  projectId: string;
  clientName: string;
  analyticStatus: string;
  projectDescription: string;
  projectUrl: string;
  category: string;
  projectName: string;
  bookmarkedDate: string;
  projectPurpose: string;
}

export interface ApiResponse {
  status: number;
  message: string;
  data?: any;
}

@Injectable({
  providedIn: 'root',
})
export class BookmarkedService {
  private apiUrl = `${environment.apiUrl}/client/project`;

  constructor(private http: HttpClient, private cookieService: CookieService) {}

  private getHeaders(): HttpHeaders {
    const token = this.cookieService.get('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    if (error.status === 200) {
      // Client-side error
      errorMessage = 'bookmark removed successfully';

    } else {
      // Server-side error
      if (error.status === 401) {
        errorMessage = 'Session expired. Please login again';
      } else if (error.error && typeof error.error === 'string') {
        errorMessage = error.error;
      } else if (error.status === 404) {
        errorMessage = 'Project not found';
      } else if (error.status === 403) {
        errorMessage = 'You are not authorized to perform this action';
      }
    }
    return throwError(() => ({ message: errorMessage, status: error.status }));
  }

  getBookmarkedProjects(userId: string): Observable<BookmarkedProject[]> {
    return this.http
      .get<BookmarkedProject[]>(`${this.apiUrl}/bookmark`, {
        params: { userId },
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  bookmarkProject(userId: string, projectId: string): Observable<ApiResponse> {
    return this.http
      .post<ApiResponse>(`${this.apiUrl}/bookmark`, null, {
        params: { userId, projectId },
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  removeBookmark(userId: string, projectId: string): Observable<ApiResponse> {
    return this.http
      .delete<ApiResponse>(`${this.apiUrl}/bookmark/remove`, {
        params: { userId, projectId },
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }
}
