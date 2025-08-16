import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private cookieService: CookieService
  ) {}

  getProjectAnalytics(projectId: string): Observable<any> {
    const token = this.cookieService.get('token');
    const userId = this.cookieService.get('userId');

    if (!token || !userId) {
      throw new Error('Authentication data not found');
    }

    return this.http.get<any>(`${this.apiUrl}/client/project/view/analytics`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      params: {
        userId: userId,
        projectId: projectId
      }
    });
  }
}