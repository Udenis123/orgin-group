import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
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
    
    // Try to extract message from backend response
    if (error.error && error.error.message) {
      errorMessage = error.error.message;
    } else if (error.error && typeof error.error === 'string') {
      errorMessage = error.error;
    } else if (error.message) {
      errorMessage = error.message;
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
      .post(`${this.apiUrl}/bookmark`, null, {
        params: { userId, projectId },
        headers: this.getHeaders(),
        observe: 'response'
      })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          // Let the component handle status 200 errors
          return this.handleError(error);
        }),
        // Transform successful HTTP response to ApiResponse format
        map((response: any) => {
          if (response.status === 200) {
            // If we have a body with message, use it
            if (response.body && response.body.message) {
              return response.body;
            }
            // Otherwise return default success message
            return {
              status: 200,
              message: 'Project has been successfully bookmarked!',
              data: response.body || null
            };
          }
          return response;
        })
      );
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
