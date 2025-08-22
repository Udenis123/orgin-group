import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { CookieService } from './cookie.service';

export interface ApiResponse {
  status: number;
  message: string;
  data?: any;
}

@Injectable({
  providedIn: 'root',
})
export class BookmarkService {
  private apiUrl = environment.apiUrl + '/client/project';

  constructor(private http: HttpClient, private cookieService: CookieService) {}

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

  bookmarkProject(
    userId: string,
    projectId: string
  ): Observable<ApiResponse> {
    const token = this.cookieService.getCookie('token');
    if (!token) {
      throw new Error('Authentication token not found');
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.post(`${this.apiUrl}/bookmark`, null, {
      headers,
      params: {
        userId,
        projectId,
      },
      observe: 'response'
    }).pipe(
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
}
